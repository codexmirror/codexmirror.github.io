from typing import Dict, List


def build_explanations(signals: Dict[str, float | int | bool | None]) -> List[str]:
    lines: List[str] = []

    building_count_80m = int(signals.get("building_count_80m", 0))
    building_count_150m = int(signals.get("building_count_150m", 0))
    building_count_250m = int(signals["building_count_250m"])
    sector_coverage = int(signals["sector_coverage"])
    median_distance = signals["median_distance_m"]
    road_distance = float(signals["road_distance"])
    edge_index = float(signals["edge_index"])
    rural_landuse_signal = bool(signals["rural_landuse_signal"])

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
        and sector_coverage >= 7
        and edge_index <= 0.45
        and building_count_150m >= 20
        and not rural_landuse_signal
    )
    protected_open_space_pattern = urban_open_space_pattern or old_town_square_pattern
    loose_village_core = (
        building_count_80m >= 2
        and building_count_150m >= 6
        and sector_coverage >= 5
        and edge_index <= 0.65
    )

    if building_count_80m >= 6:
        lines.append("Im direkten Umfeld sind bereits viele Gebäude vorhanden.")
    elif building_count_80m >= 3:
        lines.append("Im direkten Umfeld sind bereits mehrere Gebäude vorhanden.")
    elif building_count_80m >= 1:
        lines.append(
            "Im Nahbereich gibt es einzelne Gebäude, die für eine Einbindung sprechen."
        )
    else:
        lines.append("Im direkten Nahbereich ist die Bebauung zurückhaltend.")

    if protected_open_space_pattern:
        lines.append(
            "Die Lage wirkt im Nahbereich offener, bleibt aber in eine zusammenhängende Umgebungsbebauung eingebettet."
        )
    elif building_count_150m >= 15:
        lines.append(
            "Im weiteren Umfeld beginnt eine klare und zusammenhängende Bebauungsstruktur."
        )
    elif building_count_150m >= 6:
        lines.append("Im erweiterten Umfeld ist eine erkennbare Bebauungsstruktur vorhanden.")
    else:
        lines.append("Die Bebauung beginnt erst etwas weiter vom Standort entfernt.")

    if sector_coverage >= 6:
        lines.append("Die Bebauung ist auf mehreren Seiten vorhanden.")
    elif sector_coverage <= 2:
        lines.append("Die Bebauung konzentriert sich eher auf wenige Richtungen.")

    if loose_village_core and not protected_open_space_pattern:
        lines.append("Das Muster passt zu einem lockeren Siedlungskern.")

    if building_count_250m >= 35 and building_count_80m <= 2 and sector_coverage >= 5:
        lines.append(
            "Im direkten Umfeld ist die Bebauung zurückhaltender, im weiteren Umfeld aber klar vorhanden."
        )
    elif building_count_250m <= 8 and building_count_150m <= 4:
        lines.append("Auch im größeren Umfeld ist die Bebauung eher gering ausgeprägt.")

    if rural_landuse_signal:
        lines.append(
            "Die Umgebung zeigt zusätzlich landwirtschaftliche oder naturnahe Nutzungen."
        )

    if (
        median_distance is not None
        and median_distance > 90
        and not protected_open_space_pattern
    ):
        lines.append("Die Gebäudeabstände sind insgesamt eher größer.")

    if road_distance > 120 and not protected_open_space_pattern:
        lines.append("Die Anbindung über nahe Straßen wirkt eher zurückhaltend.")

    if len(lines) < 2:
        lines.append("Die Signale ergeben insgesamt kein eindeutiges Bild.")

    return lines[:4]
