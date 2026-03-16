from typing import Any, Dict, Tuple
import time

import requests

from services.geocoder import ExternalAPIError

OVERPASS_URLS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.openstreetmap.fr/api/interpreter",
]

RADIUS_METERS = 250
REQUEST_TIMEOUT = 10
REQUEST_HEADERS = {
    "User-Agent": "grundstueckcheck-mvp/1.0 (kontakt@grundstueckcheck.de)"
}

overpass_cache: Dict[Tuple[float, float, int, str], Dict[str, Any]] = {}


def run_overpass_query(lat: float, lon: float, query: str, query_type: str) -> Dict[str, Any]:
    cache_key = (round(lat, 6), round(lon, 6), RADIUS_METERS, query_type)
    if cache_key in overpass_cache:
        return overpass_cache[cache_key]

    last_timeout = False
    last_error: Exception | None = None

    for index, overpass_url in enumerate(OVERPASS_URLS):
        try:
            response = requests.post(
                overpass_url,
                data=query,
                timeout=REQUEST_TIMEOUT,
                headers=REQUEST_HEADERS,
            )
            response.raise_for_status()
            data = response.json()
            overpass_cache[cache_key] = data
            return data

        except requests.Timeout as exc:
            last_timeout = True
            last_error = exc

        except requests.RequestException as exc:
            last_error = exc

        except ValueError as exc:
            # Antwort kam zurück, war aber kein gültiges JSON.
            # Dann lohnt sich der nächste Mirror ebenfalls.
            last_error = exc

        # Kleiner Abstand vor dem nächsten Mirror, aber nur wenn noch einer folgt.
        if index < len(OVERPASS_URLS) - 1:
            time.sleep(0.6)

    if last_timeout:
        raise ExternalAPIError("Overpass-Timeout bei externer Datenabfrage.") from last_error

    if isinstance(last_error, ValueError):
        raise ExternalAPIError("Ungültige Antwort von Overpass.") from last_error

    raise ExternalAPIError("Overpass-Dienst nicht erreichbar.") from last_error


def extract_center(element: Dict[str, Any]) -> Tuple[float, float] | None:
    if "center" in element:
        return float(element["center"]["lat"]), float(element["center"]["lon"])
    if "lat" in element and "lon" in element:
        return float(element["lat"]), float(element["lon"])
    return None