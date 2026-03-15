from typing import Dict, List


def build_explanations(signals: Dict[str, float | int | bool | None]) -> List[str]:
    lines: List[str] = []

    building_count = int(signals["building_count_250m"])
    sector_coverage = int(signals["sector_coverage"])
    median_distance = signals["median_distance_m"]
    road_distance = float(signals["road_distance"])

    if building_count >= 15:
        lines.append("Viele Gebäude im direkten Umfeld sprechen eher für eine zusammenhängende Bebauung.")
    elif building_count >= 6:
        lines.append("Es gibt eine erkennbare Umgebungsbebauung, aber nicht sehr dicht.")
    else:
        lines.append("Die Umgebung wirkt eher aufgelockert und weniger dicht bebaut.")

    if sector_coverage >= 6:
        lines.append("Die Bebauung liegt auf mehreren Seiten des Standorts.")
    elif sector_coverage <= 2:
        lines.append("Die Bebauung konzentriert sich eher auf eine Seite, was auf eine mögliche Randlage hinweist.")

    if median_distance is not None and median_distance > 80:
        lines.append("Die nächsten Gebäude liegen relativ weit entfernt.")

    if road_distance < 30:
        lines.append("Die Lage ist nah an relevanten Straßen, was eher für eine eingebundene Lage spricht.")
    elif road_distance > 80:
        lines.append("Die Lage ist relativ weit von relevanten Straßen entfernt.")

    if bool(signals["rural_landuse_signal"]):
        lines.append("Die Umgebung zeigt landwirtschaftliche oder naturnahe Nutzungen.")

    if len(lines) < 2:
        lines.append("Die Signale ergeben insgesamt kein eindeutiges Bild.")

    return lines[:4]
