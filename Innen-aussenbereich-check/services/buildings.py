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


def _is_excluded_building_type(element: Dict) -> bool:
    building_type = element.get("tags", {}).get("building")
    if not isinstance(building_type, str):
        return False
    return building_type.strip().lower() in EXCLUDED_BUILDING_TYPES


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

    buildings: List[Dict[str, float]] = []
    for element in data.get("elements", []):
        if _is_excluded_building_type(element):
            continue
        center = extract_center(element)
        if center:
            buildings.append({"lat": center[0], "lon": center[1]})
    return buildings
