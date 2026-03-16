# Innenbereich / Außenbereich Check (MVP)

Ein lauffähiger MVP-Prototyp für eine **technische Ersteinschätzung**, ob die Umgebungsbebauung eines Standorts eher für Innenbereich spricht, nicht eindeutig ist oder Hinweise auf Außenbereich vorliegen.

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

- `http://127.0.0.1:8000/` (MVP-Frontend)
- `http://127.0.0.1:8000/docs` (Swagger/OpenAPI)

## API

### Endpoint

- `POST /api/innen-aussen-check`

### Unterstützte Request-Varianten

1. **Adresse** (Geocoding über Nominatim)
2. **Koordinaten** (`lat` + `lon` gemeinsam)

#### Beispiel: Adresse

```bash
curl -X POST http://127.0.0.1:8000/api/innen-aussen-check \
  -H "Content-Type: application/json" \
  -d '{"address": "Pariser Platz 1, Berlin"}'
```

#### Beispiel: Koordinaten

```bash
curl -X POST http://127.0.0.1:8000/api/innen-aussen-check \
  -H "Content-Type: application/json" \
  -d '{"lat": 52.516, "lon": 13.3777}'
```

### Erfolgs-Response (Beispiel)

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
    "building_count_80m": 2,
    "building_count_150m": 11,
    "building_count_250m": 26,
    "near_density_ratio": 0.08,
    "median_distance_m": 54.7,
    "sector_coverage": 6,
    "edge_index": 0.62,
    "half_ring_dominance": 0.79,
    "road_distance": 23.4,
    "building_area_ratio": 0.16,
    "rural_landuse_signal": false
  },
  "explanation": [
    "Im direkten Umfeld sind bereits mehrere Gebäude vorhanden.",
    "Im erweiterten Umfeld ist eine erkennbare Bebauungsstruktur vorhanden."
  ],
  "disclaimer": "Nur eine technische Ersteinschätzung, keine verbindliche rechtliche Einordnung."
}
```

### Fehler-Response

Bei Validierungs- oder Laufzeitfehlern gibt die API ein einheitliches JSON mit `error` zurück, z. B.:

```json
{
  "error": "Ungültige Anfrage: address oder lat/lon ist erforderlich."
}
```

## Heuristik (aktueller Stand)

- Analyse-Radius: **250 m**
- Datenquellen: **Nominatim + Overpass (OSM)**
- Verarbeitete OSM-Datentypen:
  - Gebäude
  - Straßen
  - Landnutzung

### Verwendete Signale

- `building_count_80m`
- `building_count_150m`
- `building_count_250m`
- `near_density_ratio`
- `median_distance_m`
- `sector_coverage`
- `edge_index`
- `half_ring_dominance`
- `road_distance`
- `building_area_ratio` (MVP mit 120 m² Durchschnittsfläche je Gebäude)
- `rural_landuse_signal`

### Klassifikation

- `wahrscheinlich_innenbereich`
- `grenzfall`
- `hinweise_auf_aussenbereich`

Die finale Klasse basiert auf Score-Schwellen und zusätzlichen Musterregeln (z. B. starke urbane Muster, lockerer Dorfkern, Rand-/Übergangsmuster).

## Frontend (MVP)

Unter `/` gibt es ein simples HTML-Frontend mit:

- Adresseingabe
- API-Aufruf auf `/api/innen-aussen-check`
- Anzeige von Klassifikation, Score, Signalen und Erklärung

## Interner Testharness (synthetische Signalprofile)

Zum Nachjustieren der Heuristik ohne Geocoding und Overpass gibt es ein Skript mit festen Signalprofilen:

```bash
python synthetic_signal_harness.py
```

Enthaltene Fallgruppen (u. a.):

- klar urbaner Innenbereich
- Altstadt-/Marktplatzfall
- lockerer Dorfkern
- randnahe Lage
- Randlage mit starkem Kontext
- klarer Außenbereich

Das Skript berechnet pro Fall direkt `score`, `classification` und `explanation` auf Basis der aktuellen Scoring- und Erklärungslogik.

## Grenzen des Tools

- Keine rechtliche Bewertung nach BauGB
- OSM-Daten können unvollständig oder veraltet sein
- Heuristikbasiertes Modell (kein amtliches Entscheidungsverfahren)
- Kein Ersatz für Bauamt, Planer oder juristische Prüfung

## Keine Rechtsberatung

Das Tool liefert ausschließlich eine technische Ersteinschätzung. Es erfolgt keine verbindliche rechtliche Einordnung und keine Rechtsberatung.
