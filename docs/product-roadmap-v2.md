# Produkt-Roadmap V2: Integriertes Grundstücks-Analyse-Tool

## 1. Ziel des Produkts

Der Grundstückscheck soll langfristig zu einem umfassenden Grundstücks-Analyse-Tool weiterentwickelt werden. In der zukünftigen Version werden mehrere Faktoren in einer zusammenhängenden Bewertung kombiniert:

- Innen-/Außenbereich-Analyse
- Bebauungsplan
- Grundstückstyp
- geplante Nutzung
- weitere Standortfaktoren

Das Ziel ist ein integriertes Analyseprodukt, das Nutzern eine fundierte Ersteinschätzung gibt, ob ein Grundstück voraussichtlich bebaubar ist.

## 2. Aktueller Stand (V1)

Aktuell besteht das Projekt aus zwei getrennten Werkzeugen:

- Der Grundstückscheck existiert als eigenes Tool.
- Der Innen-/Außenbereich-Check existiert als separates Tool.
- Beide Tools sind derzeit noch nicht integriert.
- Der aktuelle Schwerpunkt liegt auf Stabilität, Nutzerfreundlichkeit und dem weiteren SEO-Aufbau.

Wichtig ist dabei: Die bestehende Architektur bleibt vorerst bewusst stabil. So erhält Google ausreichend Zeit, die Inhalte zu indexieren und organischen Traffic aufzubauen.

## 3. Strategie

Die Entwicklungsstrategie ist in drei Phasen gegliedert:

### Phase 1: Stabilisieren und optimieren

Die bestehenden Tools werden technisch und inhaltlich stabil gehalten und gezielt verbessert.

### Phase 2: SEO und Reichweite ausbauen

Die Sichtbarkeit wird weiter ausgebaut, um nachhaltigen organischen Traffic zu entwickeln.

### Phase 3: V2 parallel im Hintergrund entwickeln

Parallel zur laufenden Optimierung wird die integrierte V2-Version vorbereitet, ohne die stabile V1-Struktur frühzeitig zu verändern.

## 4. Vision für V2

Geplanter zukünftiger Nutzer-Workflow:

**Startseite**  
→ Nutzer startet den Grundstückscheck

**Schritt 1**  
Adresse eingeben oder Pin auf der Karte setzen

**Schritt 2**  
Automatische Innen-/Außenbereich-Analyse

**Schritt 3**  
Zusatzfragen zum Grundstück:
- Bebauungsplan
- Grundstückstyp
- geplante Nutzung

**Schritt 4**  
Gesamtergebnis mit kombinierter Bewertung

## 5. Kartenintegration

Für V2 ist eine visuelle Kartenfunktion vorgesehen:

- Karte mit MapLibre
- Pin setzen
- Anzeige der Analyse-Radien (80 m / 150 m / 250 m)
- Visualisierung umliegender Gebäude
- visuelle Erklärung der Analyse

## 6. Technische Grundlage (V2)

Geplante technische Basis:

- MapLibre für die Karte
- OpenStreetMap Tiles
- Overpass API für Gebäudedaten
- bestehender Analysealgorithmus als Kernlogik

## 7. Hinweis zur Umsetzung

Diese Roadmap beschreibt eine zukünftige Vision und wird bewusst nicht sofort umgesetzt. Gründe dafür sind:

- bestehende Seiten stabil halten
- SEO nicht gefährden
- Entwicklung schrittweise und kontrolliert vorantreiben
