# Innenbereich / Außenbereich Check (MVP)

Ein lauffähiger MVP-Prototyp für eine technische Ersteinschätzung zur Frage, ob die Umgebungsbebauung einer Adresse eher für Innenbereich spricht, nicht eindeutig ist oder Hinweise auf Außenbereich vorliegen.

> **Wichtig:** Das Tool trifft keine rechtliche Entscheidung und ersetzt keine Rechtsberatung.

## Installation

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Start

```bash
uvicorn app:app --reload
```

Danach im Browser öffnen:

- `http://127.0.0.1:8000/` (Frontend)
- `http://127.0.0.1:8000/docs` (API-Dokumentation)

## Beispiel Request

```bash
curl -X POST http://127.0.0.1:8000/api/innen-aussen-check \
  -H "Content-Type: application/json" \
  -d '{"address": "Pariser Platz 1, Berlin"}'
```

## Beispiel Response

```json
{
  "query": {
    "address": "Pariser Platz 1, Berlin",
    "lat": 52.516,
    "lon": 13.3777
  },
  "classification": "grenzfall",
  "score": 58,
  "signals": {
    "building_count_250m": 12,
    "median_distance_m": 47,
    "sector_coverage": 5,
    "edge_index": 0.42,
    "road_distance": 18,
    "building_area_ratio": 0.12,
    "rural_landuse_signal": true
  },
  "explanation": [
    "Es gibt eine erkennbare Umgebungsbebauung, aber nicht sehr dicht.",
    "Die Bebauung liegt auf mehreren Seiten des Standorts.",
    "Die Umgebung zeigt landwirtschaftliche oder naturnahe Nutzungen."
  ],
  "disclaimer": "Nur eine technische Ersteinschätzung, keine verbindliche rechtliche Einordnung."
}
```

## Heuristik (MVP)

- Radius für Analyse: **250 m**
- Datenquellen: **Nominatim + Overpass (OSM)**
- Features:
  - `building_count_250m`
  - `median_distance_m`
  - `sector_coverage`
  - `edge_index`
  - `road_distance`
  - `building_area_ratio` (MVP mit 120 m² Durchschnittsfläche)
  - `rural_landuse_signal`
- Ergebnis:
  - `wahrscheinlich_innenbereich` (Score ≥ 65)
  - `grenzfall` (45–64)
  - `hinweise_auf_aussenbereich` (< 45)

## Grenzen des Tools

- Keine rechtliche Bewertung nach BauGB.
- OSM-Daten können unvollständig oder veraltet sein.
- Die Analyse nutzt nur einfache Heuristiken.
- Kein Ersatz für Bauamt, Planer oder juristische Prüfung.

## Keine Rechtsberatung

Das Tool liefert ausschließlich eine technische Ersteinschätzung. Es erfolgt keine verbindliche rechtliche Einordnung und keine Rechtsberatung.
