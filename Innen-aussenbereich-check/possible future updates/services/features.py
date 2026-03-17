import math
import statistics
from typing import Dict, List

from services.osm import RADIUS_METERS
from services.settlement import distance_to_settlement_edge, point_inside_settlement


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _sector_index(lat: float, lon: float, b_lat: float, b_lon: float) -> int:
    dx = b_lon - lon
    dy = b_lat - lat
    angle_deg = (math.degrees(math.atan2(dy, dx)) + 360) % 360
    return int(math.floor(angle_deg / 45))


def compute_features(
    lat: float,
    lon: float,
    buildings: List[Dict[str, float]],
    roads: List[Dict[str, float]],
    landuse: List[Dict[str, str | float]],
) -> Dict[str, float | int | bool | None]:
    building_distances = [
        (building, haversine_m(lat, lon, building["lat"], building["lon"]))
        for building in buildings
    ]

    building_count_80m = sum(1 for _, distance in building_distances if distance <= 80)
    building_count_150m = sum(1 for _, distance in building_distances if distance <= 150)

    buildings_250m = [
        (building, distance)
        for building, distance in building_distances
        if distance <= 250
    ]
    building_count_250m = len(buildings_250m)
    near_density_ratio = round(building_count_80m / max(1, building_count_250m), 2)

    if building_count_250m == 0:
        median_distance = None
        sector_coverage = 0
        edge_index = 1.0
        half_ring_dominance = 1.0
    else:
        distances_250m = [distance for _, distance in buildings_250m]
        median_distance = round(statistics.median(distances_250m), 1)

        sectors = [0] * 8
        for building, _ in buildings_250m:
            sectors[_sector_index(lat, lon, building["lat"], building["lon"])] += 1

        sector_coverage = sum(1 for value in sectors if value > 0)
        edge_index = max(sectors) / building_count_250m
        max_half_ring_sum = max(
            sum(sectors[(start + offset) % 8] for offset in range(4))
            for start in range(8)
        )
        half_ring_dominance = max_half_ring_sum / building_count_250m

    if roads:
        road_distance = round(
            min(haversine_m(lat, lon, r["lat"], r["lon"]) for r in roads), 1
        )
    else:
        road_distance = 9999.0

    radius_area = math.pi * (RADIUS_METERS**2)
    building_area_ratio = (building_count_250m * 120) / radius_area

    rural_types = {"farmland", "meadow", "forest", "orchard"}
    rural_count = sum(1 for item in landuse if item.get("landuse") in rural_types)
    rural_landuse_signal = rural_count >= 2

    inside_settlement = None
    distance_to_settlement_edge_m = None
    try:
        inside_settlement = point_inside_settlement(lat, lon)
        distance_to_settlement_edge_m = distance_to_settlement_edge(lat, lon)
    except Exception:
        inside_settlement = None
        distance_to_settlement_edge_m = None

    return {
        "building_count_80m": building_count_80m,
        "building_count_150m": building_count_150m,
        "building_count_250m": building_count_250m,
        "near_density_ratio": near_density_ratio,
        "median_distance_m": median_distance,
        "sector_coverage": sector_coverage,
        "edge_index": round(edge_index, 2),
        "half_ring_dominance": round(half_ring_dominance, 2),
        "road_distance": road_distance,
        "building_area_ratio": round(building_area_ratio, 2),
        "rural_landuse_signal": rural_landuse_signal,
        "inside_settlement": inside_settlement,
        "distance_to_settlement_edge_m": distance_to_settlement_edge_m,
    }