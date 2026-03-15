from typing import Any, Dict, Tuple

import requests

from services.geocoder import ExternalAPIError

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
RADIUS_METERS = 250
REQUEST_TIMEOUT = 10

overpass_cache: Dict[Tuple[float, float, int, str], Dict[str, Any]] = {}


def run_overpass_query(lat: float, lon: float, query: str, query_type: str) -> Dict[str, Any]:
    cache_key = (round(lat, 6), round(lon, 6), RADIUS_METERS, query_type)
    if cache_key in overpass_cache:
        return overpass_cache[cache_key]

    for attempt in range(2):
        try:
            response = requests.post(
                OVERPASS_URL,
                data=query,
                timeout=REQUEST_TIMEOUT,
                headers={"User-Agent": "grundstueckcheck-mvp/1.0 (kontakt@grundstueckcheck.de)"},
            )
            response.raise_for_status()
            data = response.json()
            overpass_cache[cache_key] = data
            return data
        except requests.Timeout as exc:
            if attempt == 1:
                raise ExternalAPIError("Overpass-Timeout bei externer Datenabfrage.") from exc
        except requests.RequestException as exc:
            raise ExternalAPIError("Overpass-Dienst nicht erreichbar.") from exc
        except ValueError as exc:
            raise ExternalAPIError("Ungültige Antwort von Overpass.") from exc

    raise ExternalAPIError("Overpass-Dienstfehler.")


def extract_center(element: Dict[str, Any]) -> Tuple[float, float] | None:
    if "center" in element:
        return float(element["center"]["lat"]), float(element["center"]["lon"])
    if "lat" in element and "lon" in element:
        return float(element["lat"]), float(element["lon"])
    return None
