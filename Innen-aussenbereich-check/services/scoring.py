from typing import Dict


def compute_score(signals: Dict[str, float | int | bool | None]) -> int:
    building_count = int(signals["building_count_250m"])
    median_distance = signals["median_distance_m"]
    sector_coverage = int(signals["sector_coverage"])
    building_area_ratio = float(signals["building_area_ratio"])
    road_distance = float(signals["road_distance"])
    edge_index = float(signals["edge_index"])
    rural_landuse_signal = bool(signals["rural_landuse_signal"])

    density_score = min(55, building_count * 2.8)

    if median_distance is None:
        distance_score = 0
    elif median_distance < 40:
        distance_score = 8
    elif median_distance < 80:
        distance_score = 4
    else:
        distance_score = 0

    sector_score = min(24, sector_coverage * 4)
    area_score = min(10, building_area_ratio * 100)

    if road_distance < 30:
        road_score = 5
    elif road_distance < 80:
        road_score = 2
    else:
        road_score = 0

    edge_penalty = edge_index * 20
    rural_penalty = 20 if rural_landuse_signal else 0

    score = (
        density_score
        + distance_score
        + sector_score
        + area_score
        + road_score
        - edge_penalty
        - rural_penalty
    )

    return int(max(0, min(100, round(score))))


def classify_score(
    score: int, signals: Dict[str, float | int | bool | None] | None = None
) -> str:
    if signals:
        building_count = int(signals["building_count_250m"])
        sector_coverage = int(signals["sector_coverage"])
        edge_index = float(signals["edge_index"])
        rural_landuse_signal = bool(signals["rural_landuse_signal"])

        strong_urban_pattern = (
            building_count >= 22
            and sector_coverage >= 6
            and edge_index <= 0.55
            and not rural_landuse_signal
        )
        weak_settlement_pattern = (
            building_count <= 4
            and sector_coverage <= 2
            and (edge_index >= 0.75 or rural_landuse_signal)
        )

        if strong_urban_pattern and score >= 52:
            return "wahrscheinlich_innenbereich"
        if weak_settlement_pattern and score < 52:
            return "hinweise_auf_aussenbereich"

    if score >= 65:
        return "wahrscheinlich_innenbereich"
    if score >= 45:
        return "grenzfall"
    return "hinweise_auf_aussenbereich"
