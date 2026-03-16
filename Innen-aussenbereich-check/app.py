from pathlib import Path
import logging

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from services.buildings import get_buildings
from services.explanations import build_explanations
from services.features import compute_features
from services.geocoder import AddressNotFoundError, ExternalAPIError, geocode_address
from services.landuse import get_landuse
from services.roads import get_roads
from services.scoring import classify_score, compute_score

logger = logging.getLogger(__name__)

app = FastAPI(title="Innenbereich/Außenbereich MVP")

static_dir = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=static_dir), name="static")


class CheckRequest(BaseModel):
    address: str | None = None
    lat: float | None = Field(default=None, ge=-90, le=90)
    lon: float | None = Field(default=None, ge=-180, le=180)


@app.get("/")
def read_index() -> FileResponse:
    return FileResponse(static_dir / "index.html")


@app.post("/api/innen-aussen-check")
def innen_aussen_check(payload: CheckRequest):
    try:
        has_lat = payload.lat is not None
        has_lon = payload.lon is not None

        if has_lat != has_lon:
            raise HTTPException(
                status_code=400,
                detail="Ungültige Anfrage: lat und lon müssen gemeinsam übergeben werden.",
            )

        if has_lat and has_lon:
            lat = payload.lat
            lon = payload.lon
            address = (payload.address or "").strip() or "Koordinatenpunkt"
        else:
            address = (payload.address or "").strip()
            if not address:
                raise HTTPException(
                    status_code=400,
                    detail="Ungültige Anfrage: address oder lat/lon ist erforderlich.",
                )
            lat, lon = geocode_address(address)

        buildings = get_buildings(lat, lon)
        roads = get_roads(lat, lon)
        landuse = get_landuse(lat, lon)

        signals = compute_features(lat, lon, buildings, roads, landuse)
        score = compute_score(signals)
        classification = classify_score(score, signals)
        explanation = build_explanations(signals)

        return {
            "query": {
                "address": address,
                "lat": lat,
                "lon": lon,
            },
            "classification": classification,
            "score": score,
            "signals": signals,
            "explanation": explanation,
            "disclaimer": "Nur eine technische Ersteinschätzung, keine verbindliche rechtliche Einordnung.",
        }
    except AddressNotFoundError as err:
        raise HTTPException(status_code=404, detail=str(err)) from err
    except ExternalAPIError as err:
        raise HTTPException(status_code=502, detail=str(err)) from err
    except HTTPException:
        raise
    except Exception as err:
        logger.exception("Unerwarteter Fehler bei der Analyse")
        raise HTTPException(status_code=500, detail="Interner Fehler bei der Analyse.") from err


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})