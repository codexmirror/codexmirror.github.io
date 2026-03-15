from typing import Dict


def _score_building_count_80m(building_count_80m: int) -> float:
    if building_count_80m >= 6:
        return 24
    if building_count_80m >= 3:
        return 14
    if building_count_80m >= 1:
        return 6
    return 0


def _score_building_count_150m(building_count_150m: int) -> float:
    if building_count_150m >= 20:
        return 22
    if building_count_150m >= 12:
        return 15
    if building_count_150m >= 6:
        return 9
    if building_count_150m >= 2:
        return 4
    return 0


def _score_building_count_250m(building_count_250m: int) -> float:
    return min(28, building_count_250m * 0.9)


def _weak_nearby_penalty(
    building_count_80m: int,
    building_count_150m: int,
    building_count_250m: int,
    sector_coverage: int,
    edge_index: float,
    rural_landuse_signal: bool,
) -> float:
    urban_open_space_pattern = (
        sector_coverage >= 6
        and edge_index <= 0.55
        and building_count_150m >= 15
        and building_count_250m >= 40
        and not rural_landuse_signal
    )
    old_town_square_pattern = (
        sector_coverage >= 7
        and edge_index <= 0.45
        and building_count_150m >= 20
        and not rural_landuse_signal
    )

    if building_count_80m >= 3:
        return 0
    if urban_open_space_pattern:
        return 0
    if old_town_square_pattern:
        return 1

    if building_count_80m == 0:
        if building_count_150m >= 12 and building_count_250m >= 30:
            return 2
        return 7

    if building_count_80m <= 2:
        if building_count_150m >= 8:
            return 1
        return 3

    return 0


def compute_score(signals: Dict[str, float | int | bool | None]) -> int:
    building_count_80m = int(signals.get("building_count_80m", 0))
    building_count_150m = int(signals.get("building_count_150m", 0))
    building_count_250m = int(signals["building_count_250m"])
    median_distance = signals["median_distance_m"]
    sector_coverage = int(signals["sector_coverage"])
    building_area_ratio = float(signals["building_area_ratio"])
    road_distance = float(signals["road_distance"])
    edge_index = float(signals["edge_index"])
    rural_landuse_signal = bool(signals["rural_landuse_signal"])

    density_near_score = _score_building_count_80m(building_count_80m)
    density_structure_score = _score_building_count_150m(building_count_150m)
    density_context_score = _score_building_count_250m(building_count_250m)

    if median_distance is None:
        distance_score = 0
    elif median_distance < 40:
        distance_score = 6
    elif median_distance < 80:
        distance_score = 3
    else:
        distance_score = 0

    sector_score = min(20, sector_coverage * 3.5)
    area_score = min(8, building_area_ratio * 80)

    if road_distance < 30:
        road_score = 4
    elif road_distance < 80:
        road_score = 2
    else:
        road_score = 0

    nearby_penalty = _weak_nearby_penalty(
        building_count_80m,
        building_count_150m,
        building_count_250m,
        sector_coverage,
        edge_index,
        rural_landuse_signal,
    )

    edge_penalty = edge_index * 16
    rural_penalty = 18 if rural_landuse_signal else 0

    score = (
        density_near_score
        + density_structure_score
        + density_context_score
        + distance_score
        + sector_score
        + area_score
        + road_score
        - nearby_penalty
        - edge_penalty
        - rural_penalty
    )

    return int(max(0, min(100, round(score))))


def classify_score(
    score: int, signals: Dict[str, float | int | bool | None] | None = None
) -> str:
    if signals:
        building_count_80m = int(signals.get("building_count_80m", 0))
        building_count_150m = int(signals.get("building_count_150m", 0))
        building_count_250m = int(signals["building_count_250m"])
        sector_coverage = int(signals["sector_coverage"])
        edge_index = float(signals["edge_index"])
        rural_landuse_signal = bool(signals["rural_landuse_signal"])

        strong_urban_pattern = (
            building_count_80m >= 4
            and building_count_150m >= 15
            and building_count_250m >= 25
            and sector_coverage >= 6
            and edge_index <= 0.55
            and not rural_landuse_signal
        )
        open_space_inside_settlement = (
            building_count_80m <= 2
            and building_count_150m >= 15
            and building_count_250m >= 40
            and sector_coverage >= 6
            and edge_index <= 0.55
            and not rural_landuse_signal
        )
        old_town_square_pattern = (
            building_count_80m <= 2
            and building_count_150m >= 20
            and building_count_250m >= 45
            and sector_coverage >= 7
            and edge_index <= 0.45
            and not rural_landuse_signal
        )
        loose_village_core = (
            2 <= building_count_80m <= 5
            and 6 <= building_count_150m <= 16
            and 12 <= building_count_250m <= 34
            and 5 <= sector_coverage <= 7
            and 0.42 <= edge_index <= 0.72
            and not strong_urban_pattern
            and not open_space_inside_settlement
            and not old_town_square_pattern
            and not rural_landuse_signal
        )
        weak_settlement_pattern = (
            building_count_80m == 0
            and building_count_150m <= 2
            and building_count_250m <= 5
            and sector_coverage <= 2
            and (edge_index >= 0.75 or rural_landuse_signal)
        )

        if (strong_urban_pattern and score >= 52) or (
            open_space_inside_settlement and score >= 50
        ):
            return "wahrscheinlich_innenbereich"

        if weak_settlement_pattern and not loose_village_core and score < 52:
            return "hinweise_auf_aussenbereich"

        if loose_village_core and score < 45:
            return "grenzfall"

    if score >= 65:
        return "wahrscheinlich_innenbereich"
    if score >= 45:
        return "grenzfall"
    return "hinweise_auf_aussenbereich"
