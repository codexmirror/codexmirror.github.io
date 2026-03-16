"""Kleiner interner Testharness für synthetische Signalprofile.

Ziel:
- Heuristikverhalten ohne Geocoding/Overpass schnell prüfen.
- Fallgruppen dokumentieren und beim Nachjustieren reproduzierbar vergleichen.

Aufruf:
    python synthetic_signal_harness.py
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from typing import Dict, List

from services.explanations import build_explanations
from services.scoring import classify_score, compute_score

Signals = Dict[str, float | int | bool | None]


@dataclass(frozen=True)
class SyntheticCase:
    group: str
    label: str
    signals: Signals
    note: str
    expected_classification: str | None = None
    expected_score_range: tuple[int, int] | None = None


CASES: List[SyntheticCase] = [
    SyntheticCase(
        group="Klar urbaner Innenbereich",
        label="Dichte Blockrandlage",
        note="Sollte stabil als Innenbereich laufen.",
        expected_classification="wahrscheinlich_innenbereich",
        expected_score_range=(85, 100),
        signals={
            "building_count_80m": 9,
            "building_count_150m": 26,
            "building_count_250m": 58,
            "near_density_ratio": 0.36,
            "median_distance_m": 23,
            "sector_coverage": 8,
            "building_area_ratio": 0.26,
            "road_distance": 9,
            "edge_index": 0.33,
            "half_ring_dominance": 0.56,
            "rural_landuse_signal": False,
        },
    ),
    SyntheticCase(
        group="Altstadt-/Marktplatzfall",
        label="Freier Platz mit dichter Randbebauung",
        note="Wenig im 80m-Ring, aber klar eingebettete Altstadtstruktur.",
        expected_classification="wahrscheinlich_innenbereich",
        expected_score_range=(70, 95),
        signals={
            "building_count_80m": 1,
            "building_count_150m": 24,
            "building_count_250m": 54,
            "near_density_ratio": 0.09,
            "median_distance_m": 58,
            "sector_coverage": 8,
            "building_area_ratio": 0.19,
            "road_distance": 14,
            "edge_index": 0.39,
            "half_ring_dominance": 0.62,
            "rural_landuse_signal": False,
        },
    ),
    SyntheticCase(
        group="Lockerer Dorfkern",
        label="Ortskern mit gemischter Dichte",
        note="Typischer Dorfkern, sollte nicht vorschnell außen sein.",
        expected_classification="wahrscheinlich_innenbereich",
        expected_score_range=(60, 85),
        signals={
            "building_count_80m": 3,
            "building_count_150m": 11,
            "building_count_250m": 24,
            "near_density_ratio": 0.18,
            "median_distance_m": 47,
            "sector_coverage": 6,
            "building_area_ratio": 0.14,
            "road_distance": 24,
            "edge_index": 0.58,
            "half_ring_dominance": 0.74,
            "rural_landuse_signal": False,
        },
    ),
    SyntheticCase(
        group="Randnahe Lage im Ort",
        label="Siedlungsrand mit einseitiger Einbindung",
        note="Grenzbereich: genug Kontext, aber schwacher Nahbereich.",
        expected_classification="grenzfall",
        expected_score_range=(45, 65),
        signals={
            "building_count_80m": 1,
            "building_count_150m": 13,
            "building_count_250m": 31,
            "near_density_ratio": 0.11,
            "median_distance_m": 74,
            "sector_coverage": 5,
            "building_area_ratio": 0.11,
            "road_distance": 38,
            "edge_index": 0.69,
            "half_ring_dominance": 0.86,
            "rural_landuse_signal": False,
        },
    ),
    SyntheticCase(
        group="Randlage mit starkem Kontext",
        label="Übergang mit starkem 250m-Kontext",
        note="Schwacher Nahbereich trotz starkem Kontext sollte nicht vorschnell innen sein.",
        expected_classification="grenzfall",
        expected_score_range=(50, 70),
        signals={
            "building_count_80m": 1,
            "building_count_150m": 24,
            "building_count_250m": 27,
            "near_density_ratio": 0.07,
            "median_distance_m": 90,
            "sector_coverage": 7,
            "building_area_ratio": 0.15,
            "road_distance": 65,
            "edge_index": 0.79,
            "half_ring_dominance": 0.73,
            "rural_landuse_signal": False,
        },
    ),
    SyntheticCase(
        group="Übergangslage Siedlung/Freiraum",
        label="Zwischen Bebauung und Feldkante",
        note="Sollte oft grenzwertig oder außen-nah ausfallen.",
        expected_classification="hinweise_auf_aussenbereich",
        expected_score_range=(0, 40),
        signals={
            "building_count_80m": 0,
            "building_count_150m": 7,
            "building_count_250m": 18,
            "near_density_ratio": 0.06,
            "median_distance_m": 96,
            "sector_coverage": 4,
            "building_area_ratio": 0.07,
            "road_distance": 88,
            "edge_index": 0.77,
            "half_ring_dominance": 0.91,
            "rural_landuse_signal": True,
        },
    ),
    SyntheticCase(
        group="Klarer Außenbereich",
        label="Einzellage im Freiraum",
        note="Deutliches Außenbereichsmuster.",
        expected_classification="hinweise_auf_aussenbereich",
        expected_score_range=(0, 25),
        signals={
            "building_count_80m": 0,
            "building_count_150m": 1,
            "building_count_250m": 4,
            "near_density_ratio": 0.02,
            "median_distance_m": 170,
            "sector_coverage": 1,
            "building_area_ratio": 0.03,
            "road_distance": 210,
            "edge_index": 0.93,
            "half_ring_dominance": 0.97,
            "rural_landuse_signal": True,
        },
    ),
]


def _is_borderline(score: int) -> bool:
    return 43 <= score <= 47 or 63 <= score <= 67


def _evaluate_case(case: SyntheticCase, score: int, classification: str) -> tuple[str, list[str]]:
    reasons: list[str] = []

    if case.expected_classification is not None and classification != case.expected_classification:
        reasons.append(
            "Klassifikation abweichend "
            f"(erwartet: {case.expected_classification}, erhalten: {classification})"
        )

    if case.expected_score_range is not None:
        min_score, max_score = case.expected_score_range
        if not (min_score <= score <= max_score):
            reasons.append(
                "Score außerhalb Range "
                f"(erwartet: {min_score}-{max_score}, erhalten: {score})"
            )

    has_expectations = (
        case.expected_classification is not None or case.expected_score_range is not None
    )

    if reasons:
        return "FAIL", reasons
    if has_expectations:
        return "PASS", []
    return "INFO", []


def main() -> None:
    print("=== Synthetischer Signalharness (ohne externe APIs) ===")

    status_counter: Counter[str] = Counter()
    failed_cases: list[str] = []
    group_counter: Counter[tuple[str, str]] = Counter()

    for idx, case in enumerate(CASES, start=1):
        score = compute_score(case.signals)
        classification = classify_score(score, case.signals)
        explanations = build_explanations(case.signals)

        result, reasons = _evaluate_case(case, score, classification)
        status_counter[result] += 1
        group_counter[(case.group, result)] += 1

        if result == "FAIL":
            failed_cases.append(f"{idx}. {case.label}")

        borderline_tag = " | Grenzwertig" if _is_borderline(score) else ""

        print(f"\n{idx}. [{case.group}] {case.label}")
        print(f"   Erwartung: {case.note}")
        print(f"   Ergebnis: {result}{borderline_tag}")
        print(f"   Score: {score} | Klassifikation: {classification}")

        if case.expected_classification is not None:
            print(f"   Erwartete Klassifikation: {case.expected_classification}")
        if case.expected_score_range is not None:
            min_score, max_score = case.expected_score_range
            print(f"   Erwartete Score-Range: {min_score}-{max_score}")
        if reasons:
            print("   Abweichungen:")
            for reason in reasons:
                print(f"     ! {reason}")

        print("   Signale:")
        for key in sorted(case.signals):
            print(f"     - {key}: {case.signals[key]}")

        print("   Erklärungen:")
        for line in explanations:
            print(f"     • {line}")

    print("\n=== Summary / Scoreboard ===")
    print(f"Fälle gesamt: {len(CASES)}")
    print(f"PASS: {status_counter['PASS']}")
    print(f"FAIL: {status_counter['FAIL']}")
    print(f"INFO (ohne Erwartungsdefinition): {status_counter['INFO']}")

    if failed_cases:
        print("\nFAIL-Fälle:")
        for case_label in failed_cases:
            print(f" - {case_label}")

    print("\nPASS/FAIL je Fallgruppe:")
    for group in sorted({case.group for case in CASES}):
        group_pass = group_counter[(group, "PASS")]
        group_fail = group_counter[(group, "FAIL")]
        group_info = group_counter[(group, "INFO")]
        print(f" - {group}: PASS={group_pass}, FAIL={group_fail}, INFO={group_info}")


if __name__ == "__main__":
    main()
