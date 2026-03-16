from typing import Dict, List

from services.osm import RADIUS_METERS, extract_center, run_overpass_query


def get_roads(lat: float, lon: float) -> List[Dict[str, float]]:
    query = f"""
    [out:json][timeout:10];
    (
      way[\"highway\"~\"residential|tertiary|secondary|primary|living_street|unclassified\"](around:{RADIUS_METERS},{lat},{lon});
    );
    out center;
    """
    data = run_overpass_query(lat, lon, query, "roads")

    roads: List[Dict[str, float]] = []
    for element in data.get("elements", []):
        center = extract_center(element)
        if center:
            roads.append({"lat": center[0], "lon": center[1]})
    return roads
