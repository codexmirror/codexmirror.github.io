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
        and building_count_250m >= 45
        and not rural_landuse_signal
    )

    if building_count_80m >= 3:
        return 0
    if old_town_square_pattern:
        return 1
    if urban_open_space_pattern:
        return 0

    if building_count_80m == 0:
        if building_count_150m >= 12 and building_count_250m >= 30:
            return 2
        return 7

    if building_count_80m <= 2:
        if building_count_150m >= 8:
            return 1
        return 3

    return 0


def _half_ring_penalty(
    half_ring_dominance: float,
    near_density_ratio: float,
    strong_urban_pattern: bool,
    urban_open_space_pattern: bool,
    old_town_square_pattern: bool,
    loose_village_core: bool,
) -> float:
    if half_ring_dominance >= 0.9:
        base_penalty = 8.0
    elif half_ring_dominance >= 0.82:
        base_penalty = 5.0
    elif half_ring_dominance >= 0.75:
        base_penalty = 2.5
    elif half_ring_dominance <= 0.62:
        return -1.0
    else:
        return 0.0

    if strong_urban_pattern or urban_open_space_pattern or old_town_square_pattern:
        return min(base_penalty, 2.0)

    if not loose_village_core:
        if half_ring_dominance >= 0.82 and near_density_ratio < 0.14:
            base_penalty += 0.8
        if half_ring_dominance >= 0.9 and near_density_ratio < 0.1:
            base_penalty += 0.7

    return base_penalty


def _near_density_adjustment(
    near_density_ratio: float,
    half_ring_dominance: float,
    rural_landuse_signal: bool,
    strong_urban_pattern: bool,
    urban_open_space_pattern: bool,
    old_town_square_pattern: bool,
    loose_village_core: bool,
) -> float:
    protected_urban_like_pattern = (
        strong_urban_pattern or urban_open_space_pattern or old_town_square_pattern
    )

    if near_density_ratio < 0.08:
        adjustment = 2.5
    elif near_density_ratio < 0.12:
        adjustment = 1.8
    elif near_density_ratio < 0.18:
        adjustment = 1.0
    elif near_density_ratio >= 0.34:
        adjustment = -0.8
    elif near_density_ratio >= 0.26:
        adjustment = -0.3
    else:
        adjustment = 0.0

    if protected_urban_like_pattern:
        return max(-0.8, min(adjustment, 1.0))

    if loose_village_core:
        return max(-0.8, min(adjustment, 0.8))

    if near_density_ratio < 0.16 and half_ring_dominance >= 0.72:
        adjustment += 1.6
        if near_density_ratio < 0.12 and half_ring_dominance >= 0.8:
            adjustment += 0.9
        if near_density_ratio < 0.1 and half_ring_dominance >= 0.86:
            adjustment += 0.7

    if rural_landuse_signal and near_density_ratio < 0.16 and half_ring_dominance >= 0.72:
        adjustment += 1.4
        if near_density_ratio < 0.12 and half_ring_dominance >= 0.8:
            adjustment += 1.0

    return adjustment


def compute_score(signals: Dict[str, float | int | bool | None]) -> int:
    building_count_80m = int(signals.get("building_count_80m", 0))
    building_count_150m = int(signals.get("building_count_150m", 0))
    building_count_250m = int(signals["building_count_250m"])
    near_density_ratio = float(signals.get("near_density_ratio", 0.0))
    median_distance = signals["median_distance_m"]
    sector_coverage = int(signals["sector_coverage"])
    building_area_ratio = float(signals["building_area_ratio"])
    road_distance = float(signals["road_distance"])
    edge_index = float(signals["edge_index"])
    half_ring_dominance = float(signals.get("half_ring_dominance", 1.0))
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

    strong_urban_pattern = (
        building_count_80m >= 4
        and building_count_150m >= 15
        and building_count_250m >= 25
        and sector_coverage >= 6
        and edge_index <= 0.55
        and not rural_landuse_signal
    )
    urban_open_space_pattern = (
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
        and 0.58 <= half_ring_dominance <= 0.82
        and not strong_urban_pattern
        and not urban_open_space_pattern
        and not old_town_square_pattern
        and not rural_landuse_signal
    )

    nearby_penalty = _weak_nearby_penalty(
        building_count_80m,
        building_count_150m,
        building_count_250m,
        sector_coverage,
        edge_index,
        rural_landuse_signal,
    )

    near_density_adjustment = _near_density_adjustment(
        near_density_ratio,
        half_ring_dominance,
        rural_landuse_signal,
        strong_urban_pattern,
        urban_open_space_pattern,
        old_town_square_pattern,
        loose_village_core,
    )

    edge_penalty = edge_index * 16
    half_ring_penalty = _half_ring_penalty(
        half_ring_dominance,
        near_density_ratio,
        strong_urban_pattern,
        urban_open_space_pattern,
        old_town_square_pattern,
        loose_village_core,
    )
    rural_penalty = 8 if rural_landuse_signal else 0

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
        - half_ring_penalty
        - rural_penalty
        - near_density_adjustment
    )

    return int(max(0, min(100, round(score))))


def classify_score(
    score: int, signals: Dict[str, float | int | bool | None] | None = None
) -> str:
    if signals:
        building_count_80m = int(signals.get("building_count_80m", 0))
        building_count_150m = int(signals.get("building_count_150m", 0))
        building_count_250m = int(signals["building_count_250m"])
        near_density_ratio = float(signals.get("near_density_ratio", 0.0))
        sector_coverage = int(signals["sector_coverage"])
        edge_index = float(signals["edge_index"])
        half_ring_dominance = float(signals.get("half_ring_dominance", 1.0))
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
            and 0.58 <= half_ring_dominance <= 0.82
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
        protected_urban_like_pattern = (
            strong_urban_pattern or open_space_inside_settlement or old_town_square_pattern
        )
        edge_transition_pattern = (
            building_count_80m <= 2
            and near_density_ratio < 0.16
            and building_count_150m >= 12
            and (
                building_count_250m >= 28
                or (building_count_250m >= 24 and near_density_ratio < 0.12)
            )
            and (half_ring_dominance >= 0.78 or edge_index >= 0.68)
            and not protected_urban_like_pattern
            and not loose_village_core
        )

        if (strong_urban_pattern and score >= 52) or (
            open_space_inside_settlement and score >= 50
        ):
            return "wahrscheinlich_innenbereich"

        if weak_settlement_pattern and not loose_village_core and score < 52:
            return "hinweise_auf_aussenbereich"

        if loose_village_core and score < 45:
            return "grenzfall"

        if edge_transition_pattern and score >= 65:
            return "grenzfall"

    if score >= 65:
        return "wahrscheinlich_innenbereich"
    if score >= 45:
        return "grenzfall"
    return "hinweise_auf_aussenbereich"
