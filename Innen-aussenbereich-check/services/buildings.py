from typing import Dict, List

from services.osm import RADIUS_METERS, extract_center, run_overpass_query


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
        center = extract_center(element)
        if center:
            buildings.append({"lat": center[0], "lon": center[1]})
    return buildings
