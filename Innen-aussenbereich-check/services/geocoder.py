import time
from typing import Dict, Tuple

import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "grundstueckcheck-mvp/1.0 (kontakt@grundstueckcheck.de)"
REQUEST_TIMEOUT = 10

geocode_cache: Dict[str, Tuple[float, float]] = {}
_last_request_ts = 0.0


class AddressNotFoundError(Exception):
    pass


class ExternalAPIError(Exception):
    pass


def _respect_rate_limit() -> None:
    global _last_request_ts
    elapsed = time.time() - _last_request_ts
    if elapsed < 1.0:
        time.sleep(1.0 - elapsed)
    _last_request_ts = time.time()


def geocode_address(address: str) -> Tuple[float, float]:
    if address in geocode_cache:
        return geocode_cache[address]

    _respect_rate_limit()

    try:
        response = requests.get(
            NOMINATIM_URL,
            params={"q": address, "format": "json", "limit": 1, "countrycodes": "de"},
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise ExternalAPIError("Geocoding-Dienst nicht erreichbar.") from exc

    data = response.json()
    if not data:
        raise AddressNotFoundError("Adresse nicht gefunden.")

    lat = float(data[0]["lat"])
    lon = float(data[0]["lon"])
    geocode_cache[address] = (lat, lon)
    return lat, lon
