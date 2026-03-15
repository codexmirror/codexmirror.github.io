from typing import Dict, List


def build_explanations(signals: Dict[str, float | int | bool | None]) -> List[str]:
    primary: List[str] = []
    secondary: List[str] = []
    tertiary: List[str] = []

    building_count_80m = int(signals.get("building_count_80m", 0))
    building_count_150m = int(signals.get("building_count_150m", 0))
    building_count_250m = int(signals["building_count_250m"])
    near_density_ratio = float(signals.get("near_density_ratio", 0.0))
    sector_coverage = int(signals["sector_coverage"])
    median_distance = signals["median_distance_m"]
    road_distance = float(signals["road_distance"])
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
        and building_count_250m >= 45
        and not rural_landuse_signal
    )
    protected_open_space_pattern = urban_open_space_pattern or old_town_square_pattern
    protected_urban_like_pattern = (
        strong_urban_pattern or urban_open_space_pattern or old_town_square_pattern
    )

    loose_village_core = (
        2 <= building_count_80m <= 5
        and 6 <= building_count_150m <= 16
        and 12 <= building_count_250m <= 34
        and 5 <= sector_coverage <= 7
        and 0.42 <= edge_index <= 0.72
        and 0.58 <= half_ring_dominance <= 0.82
        and not protected_urban_like_pattern
        and not rural_landuse_signal
    )

    def add_unique(bucket: List[str], text: str) -> None:
        if text not in primary and text not in secondary and text not in tertiary:
            bucket.append(text)

    # 1. Wichtigstes Hauptmuster: Nahbereich / Einbindung
    if building_count_80m >= 6:
        add_unique(primary, "Im direkten Umfeld sind bereits viele Gebäude vorhanden.")
    elif building_count_80m >= 3:
        add_unique(primary, "Im direkten Umfeld sind bereits mehrere Gebäude vorhanden.")
    elif building_count_80m >= 1:
        add_unique(
            primary,
            "Im Nahbereich gibt es einzelne Gebäude, die für eine Einbindung sprechen.",
        )
    else:
        add_unique(primary, "Im direkten Nahbereich ist die Bebauung zurückhaltend.")

    # 2. Zweites Hauptmuster: weiteres Umfeld / offene Flächen / Struktur
    if protected_open_space_pattern:
        add_unique(
            primary,
            "Die Lage wirkt im Nahbereich offener, bleibt aber in eine zusammenhängende Umgebungsbebauung eingebettet.",
        )
    elif building_count_150m >= 15:
        add_unique(
            primary,
            "Im weiteren Umfeld beginnt eine klare und zusammenhängende Bebauungsstruktur.",
        )
    elif building_count_150m >= 6:
        add_unique(
            primary,
            "Im erweiterten Umfeld ist eine erkennbare Bebauungsstruktur vorhanden.",
        )
    else:
        add_unique(primary, "Die Bebauung beginnt erst etwas weiter vom Standort entfernt.")

    # 3. Verteilung der Bebauung – sector_coverage und half_ring nicht doppelt erzählen
    if not protected_urban_like_pattern:
        if half_ring_dominance >= 0.86:
            add_unique(
                secondary,
                "Die Umgebungsbebauung liegt weitgehend auf einer Seite.",
            )
        elif half_ring_dominance >= 0.78:
            add_unique(
                secondary,
                "Die Umgebungsbebauung wirkt eher einseitig.",
            )
        elif half_ring_dominance <= 0.58 and sector_coverage >= 6:
            add_unique(
                secondary,
                "Die Bebauung liegt eher rund um den Standort.",
            )
        elif half_ring_dominance <= 0.64 and sector_coverage >= 5:
            add_unique(
                secondary,
                "Die Bebauung umgibt den Standort aus mehreren Richtungen.",
            )
        else:
            if sector_coverage >= 6:
                add_unique(secondary, "Die Bebauung ist auf mehreren Seiten vorhanden.")
            elif sector_coverage <= 2:
                add_unique(
                    secondary,
                    "Die Bebauung konzentriert sich eher auf wenige Richtungen.",
                )
    else:
        if sector_coverage >= 6:
            add_unique(secondary, "Die Bebauung ist auf mehreren Seiten vorhanden.")

    # 4. Spezielles Strukturmuster: lockerer Siedlungskern
    if loose_village_core:
        add_unique(secondary, "Das Muster passt zu einem lockeren Siedlungskern.")

    # 5. Konflikt-/Kontextsatz: wenig nah, aber klarer Kontext außen herum
    if (
        building_count_250m >= 35
        and building_count_80m <= 2
        and sector_coverage >= 5
        and not protected_urban_like_pattern
    ):
        add_unique(
            secondary,
            "Im direkten Umfeld ist die Bebauung zurückhaltender, im weiteren Umfeld aber klar vorhanden.",
        )
    elif building_count_250m <= 8 and building_count_150m <= 4:
        add_unique(
            secondary,
            "Auch im größeren Umfeld ist die Bebauung eher gering ausgeprägt.",
        )

    # 6. near_density_ratio nur bei klaren Mustern ergänzen
    if (
        near_density_ratio < 0.15
        and building_count_250m >= 12
        and building_count_80m <= 2
        and (half_ring_dominance >= 0.68 or sector_coverage <= 4)
        and not protected_urban_like_pattern
        and not loose_village_core
    ):
        add_unique(
            secondary,
            "Die direkte Einbindung ist schwächer als die Umgebungsbebauung.",
        )

    # 7. Gegensignale
    if rural_landuse_signal:
        add_unique(
            tertiary,
            "Die Umgebung zeigt zusätzlich landwirtschaftliche oder naturnahe Nutzungen.",
        )

    if (
        near_density_ratio < 0.1
        and building_count_250m >= 16
        and (half_ring_dominance >= 0.76 or sector_coverage <= 4)
        and not protected_urban_like_pattern
        and not loose_village_core
    ):
        add_unique(tertiary, "Die Lage wirkt eher am Rand der Umgebungsbebauung.")

    if (
        median_distance is not None
        and median_distance > 90
        and not protected_urban_like_pattern
        and building_count_150m < 15
    ):
        add_unique(tertiary, "Die Gebäudeabstände sind insgesamt eher größer.")

    if (
        road_distance > 120
        and not protected_urban_like_pattern
        and building_count_150m < 10
    ):
        add_unique(tertiary, "Die Anbindung über nahe Straßen wirkt eher zurückhaltend.")

    lines = primary + secondary + tertiary

    if len(lines) < 2:
        add_unique(tertiary, "Die Signale ergeben insgesamt kein eindeutiges Bild.")
        lines = primary + secondary + tertiary

    return lines[:4]
