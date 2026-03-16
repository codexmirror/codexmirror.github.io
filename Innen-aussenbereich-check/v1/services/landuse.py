from typing import Dict, List

from services.osm import RADIUS_METERS, extract_center, run_overpass_query


def get_landuse(lat: float, lon: float) -> List[Dict[str, str | float]]:
    query = f"""
    [out:json][timeout:10];
    (
      way[\"landuse\"](around:{RADIUS_METERS},{lat},{lon});
    );
    out tags center;
    """
    data = run_overpass_query(lat, lon, query, "landuse")

    landuse_data: List[Dict[str, str | float]] = []
    for element in data.get("elements", []):
        center = extract_center(element)
        if center:
            landuse_data.append(
                {
                    "lat": center[0],
                    "lon": center[1],
                    "landuse": element.get("tags", {}).get("landuse", ""),
                }
            )
    return landuse_data
