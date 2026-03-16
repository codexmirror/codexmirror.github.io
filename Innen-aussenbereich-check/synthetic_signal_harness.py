"""Kleiner interner Testharness für synthetische Signalprofile.

Ziel:
- Heuristikverhalten ohne Geocoding/Overpass schnell prüfen.
- Fallgruppen dokumentieren und beim Nachjustieren reproduzierbar vergleichen.

Aufruf:
    python synthetic_signal_harness.py
"""

from __future__ import annotations

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


CASES: List[SyntheticCase] = [
    SyntheticCase(
        group="Klar urbaner Innenbereich",
        label="Dichte Blockrandlage",
        note="Sollte stabil als Innenbereich laufen.",
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
        group="Übergangslage Siedlung/Freiraum",
        label="Zwischen Bebauung und Feldkante",
        note="Sollte oft grenzwertig oder außen-nah ausfallen.",
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


def main() -> None:
    print("=== Synthetischer Signalharness (ohne externe APIs) ===")

    for idx, case in enumerate(CASES, start=1):
        score = compute_score(case.signals)
        classification = classify_score(score, case.signals)
        explanations = build_explanations(case.signals)

        status = "AUFFÄLLIG/GRENZWERTIG" if _is_borderline(score) else "ok"

        print(f"\n{idx}. [{case.group}] {case.label}")
        print(f"   Erwartung: {case.note}")
        print(f"   Score: {score} | Klassifikation: {classification} | Status: {status}")
        print("   Signale:")
        for key in sorted(case.signals):
            print(f"     - {key}: {case.signals[key]}")

        print("   Erklärungen:")
        for line in explanations:
            print(f"     • {line}")


if __name__ == "__main__":
    main()
