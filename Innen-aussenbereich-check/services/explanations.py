from typing import Dict, List


def build_explanations(signals: Dict[str, float | int | bool | None]) -> List[str]:
    lines: List[str] = []

    building_count = int(signals["building_count_250m"])
    sector_coverage = int(signals["sector_coverage"])
    median_distance = signals["median_distance_m"]
    road_distance = float(signals["road_distance"])
    edge_index = float(signals["edge_index"])
    rural_landuse_signal = bool(signals["rural_landuse_signal"])

    strong_urban_signals = building_count >= 18 and sector_coverage >= 5

    if building_count >= 20:
        lines.append(
            "Viele Gebäude im Umfeld sprechen eher für eine zusammenhängende Bebauung."
        )
    elif building_count >= 8:
        lines.append("Es gibt eine erkennbare Umgebungsbebauung mit mehreren Anknüpfungspunkten.")
    else:
        lines.append("Die Umgebung wirkt eher aufgelockert und weniger dicht bebaut.")

    if sector_coverage >= 6:
        lines.append("Die Bebauung ist auf mehreren Seiten vorhanden.")
    elif sector_coverage <= 2:
        lines.append(
            "Die Bebauung konzentriert sich eher auf wenige Richtungen, was auf eine mögliche Randlage hinweisen kann."
        )

    if edge_index >= 0.72:
        lines.append(
            "Ein großer Teil der Bebauung liegt in einer Richtung, was ebenfalls auf eine Randlage hindeuten kann."
        )

    if rural_landuse_signal:
        lines.append("Die Umgebung zeigt landwirtschaftliche oder naturnahe Nutzungen als Gegensignal.")

    if median_distance is not None and median_distance > 90:
        if strong_urban_signals:
            lines.append(
                "Einzelne Distanzwerte können bei größeren offenen Flächen im Stadtgebiet höher ausfallen."
            )
        else:
            lines.append(
                "Die Gebäudeabstände sind eher größer, was als Hinweis auf eine aufgelockerte Lage gewertet werden kann."
            )

    if road_distance > 120:
        lines.append(
            "Die Anbindung über nahe Straßen wirkt zurückhaltend und passt eher zu einer weniger eingebundenen Lage."
        )
    elif road_distance < 25 and not strong_urban_signals:
        lines.append("Die Nähe zu Straßen spricht zumindest für eine gewisse Einbindung in die Umgebung.")

    if strong_urban_signals and edge_index < 0.65 and not rural_landuse_signal:
        lines.append("Die Umgebung wirkt insgesamt eher urban geprägt.")

    if len(lines) < 2:
        lines.append("Die Signale ergeben insgesamt kein eindeutiges Bild.")

    return lines[:4]
