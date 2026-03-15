import math
from typing import Dict, List

from services.osm import RADIUS_METERS, extract_center, run_overpass_query


EXCLUDED_BUILDING_TYPES = {
    "garage",
    "garages",
    "shed",
    "roof",
    "hut",
    "carport",
    "kiosk",
    "container",
    "greenhouse",
    "farm_auxiliary",
}

MERGE_DISTANCE_METERS = 8


def _is_excluded_building_type(element: Dict) -> bool:
    building_type = element.get("tags", {}).get("building")
    if not isinstance(building_type, str):
        return False
    return building_type.strip().lower() in EXCLUDED_BUILDING_TYPES


def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _deduplicate_nearby_centers(
    buildings: List[Dict[str, float]],
    merge_distance_meters: float,
) -> List[Dict[str, float]]:
    deduplicated: List[Dict[str, float]] = []

    for building in buildings:
        is_near_existing = any(
            _haversine_m(
                building["lat"],
                building["lon"],
                existing["lat"],
                existing["lon"],
            )
            < merge_distance_meters
            for existing in deduplicated
        )
        if not is_near_existing:
            deduplicated.append(building)

    return deduplicated


def get_buildings(lat: float, lon: float) -> List[Dict[str, float]]:
    query = f"""
    [out:json][timeout:10];
    (
      way[\"building\"](around:{RADIUS_METERS},{lat},{lon});
      relation[\"building\"](around:{RADIUS_METERS},{lat},{lon});
    );
    out center;
    """
    data = run_overpass_query(lat, lon, query, "buildings")

    filtered_buildings: List[Dict[str, float]] = []
    for element in data.get("elements", []):
        if _is_excluded_building_type(element):
            continue
        center = extract_center(element)
        if center:
            filtered_buildings.append({"lat": center[0], "lon": center[1]})

    # Datenfluss: Rohdaten -> Typ-Filter -> Zentrumsextraktion -> Nahbereichs-Deduplizierung.
    deduplicated_buildings = _deduplicate_nearby_centers(
        filtered_buildings,
        MERGE_DISTANCE_METERS,
    )

    return deduplicated_buildings
