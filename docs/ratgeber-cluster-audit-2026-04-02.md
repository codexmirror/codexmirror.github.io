# SEO-Cluster-Audit Ratgeber (Stand: 2026-04-02)

## Methodik
- Analysiert wurden alle HTML-Seiten unter `ratgeber/*.html` (Hub + 14 Artikel).
- Signale: `<title>`, `<h1>`, `<h2>`, interne Links (`<a href>`), Hub-Cards inkl. `data-topic`.
- Fokus: entscheidungsnahe Nutzerfragen („Darf ich…?“, Kauf-/Bau-Risiken, Vorprüfung vor Notartermin) und Tool-Übergänge.

## 1) Bestand: Hub + Artikel

### Hub
- `/ratgeber/index.html` (Ratgeber-Übersicht mit Themenkarten + Tool-Teaser)

### Artikelbestand (14)
- `/ratgeber/ist-mein-grundstueck-bebaubar.html`
- `/ratgeber/innenbereich-aussenbereich.html`
- `/ratgeber/grundstueck-ohne-bebauungsplan.html`
- `/ratgeber/bebauungsplan-verstehen.html`
- `/ratgeber/bauen-im-aussenbereich.html`
- `/ratgeber/aussenbereich-dauerhaft-wohnen.html`
- `/ratgeber/freizeitgrundstueck-dauerhaft-wohnen.html`
- `/ratgeber/waldgrundstueck-bebauen.html`
- `/ratgeber/hinterliegergrundstueck-bebauen.html`
- `/ratgeber/grundstueck-nicht-erschlossen.html`
- `/ratgeber/bauvoranfrage.html`
- `/ratgeber/grundstueck-kaufen-checkliste-bebaubarkeit.html`
- `/ratgeber/bauluecke-kaufen-checkliste.html`
- `/ratgeber/waldgrundstueck-kaufen-checkliste.html`

## 2) Abgeleitete Hauptkeywords (aus Titles/H1/Hub-Card-Themen)

1. grundstück bebaubar / bebaubarkeit prüfen
2. innenbereich außenbereich / §34 §35
3. grundstück ohne bebauungsplan bauen
4. bebauungsplan verstehen
5. bauen im außenbereich
6. im außenbereich dauerhaft wohnen
7. freizeitgrundstück / wochenendhaus dauerhaft wohnen
8. waldgrundstück bebauen / kaufen
9. hinterliegergrundstück bebauen
10. grundstück nicht erschlossen
11. bauvoranfrage kosten ablauf
12. grundstück kaufen checkliste / notartermin
13. baulücke kaufen checkliste

## 3) Bestehende Clusterlogik

### Cluster A: Grundsatz-Bebaubarkeit (Pillar-nahe)
- Ist mein Grundstück bebaubar?
- Innenbereich vs. Außenbereich
- Grundstück ohne Bebauungsplan
- Bebauungsplan verstehen

### Cluster B: Problemfälle „Darf ich bauen/wohnen?“
- Bauen im Außenbereich
- Dauerhaft wohnen im Außenbereich
- Freizeitgrundstück dauerhaft bewohnen
- Waldgrundstück bebauen
- Hinterliegergrundstück bebauen

### Cluster C: Kaufentscheidung / Risikoprüfung
- Grundstück kaufen (Notartermin-Check)
- Baulücke kaufen (10-Punkte)
- Waldgrundstück kaufen (10-Punkte)
- Grundstück nicht erschlossen

### Cluster D: Prozess / Absicherung
- Bauvoranfrage (Ablauf, Kosten, Einsatz)

## 4) Long-Tail-Muster & Suchintention

### Stark abgedeckte Longtails
- „Ist mein Grundstück bebaubar?“ → Prüfen/Einschätzen
- „Darf man im Außenbereich bauen?“ → Problemorientiert
- „Grundstück ohne Bebauungsplan: darf ich bauen?“ → Problemorientiert
- „Bebauungsplan verstehen: was darf ich bauen?“ → Informativ + Prüfen
- „Grundstück nicht erschlossen: Kosten/Risiken“ → Prüfen + Kaufentscheidung
- „Bauvoranfrage: Ablauf/Kosten/sinnvoll?“ → Prozessbezogen
- „Baulücke kaufen Checkliste“ / „Waldgrundstück kaufen Checkliste“ → Prüfen/Kaufentscheidung

### Unterrepräsentierte (naheliegende) Longtails
- „Darf ich ein Tiny House auf meinem Grundstück aufstellen?“
- „Darf ich ein Mobilheim/Containerhaus dauerhaft bewohnen?“
- „Kann ich ein Grundstück ohne gesicherte Zufahrt kaufen/bebauen?“
- „Grunddienstbarkeit/Wegerecht: reicht das fürs Bauen?“
- „Teilung vom Grundstück: darf ich den hinteren Teil bebauen?“
- „Bauen in 2. Reihe ohne Bebauungsplan“
- „Bauvorbescheid wie lange gültig?“
- „Erschließungskosten nachträglich: wer zahlt?“
- „Außenbereich: Umnutzung Scheune/Stall zu Wohnhaus?“
- „Grenzabstand/Nachbarzustimmung: wann kritisch vor Kauf?“

## 5) Interne Verlinkungsstruktur (Kurzbefund)

### Zentrale Knoten (hohe interne Verlinkung)
- `ist-mein-grundstueck-bebaubar.html`
- `innenbereich-aussenbereich.html`
- `bauvoranfrage.html`
- `bauen-im-aussenbereich.html`

### Schwächer eingebundene Seiten
- `waldgrundstueck-bebauen.html` (deutlich niedriger eingehend als Core-Seiten)
- `grundstueck-kaufen-checkliste-bebaubarkeit.html`
- `grundstueck-ohne-bebauungsplan.html`

### Muster
- Hub verlinkt breit auf alle Kernartikel.
- Viele Artikel führen auf Startseite (`/`) als Grundstücks-Check-CTA.
- Kontextuelle Deep-Links zwischen verwandten Problemartikeln sind teils vorhanden, aber nicht flächendeckend (v. a. zwischen Erschließung ↔ Hinterlieger ↔ Grundstück ohne B-Plan).

## 6) Kannibalisierungsrisiken

### Fall 1: `bauen-im-aussenbereich` vs `aussenbereich-dauerhaft-wohnen`
- Überschneidung: Außenbereich + §35 + Zulässigkeit.
- Risiko: **mittel**.
- Schnitt empfohlen:
  - `bauen-im-aussenbereich` = bauliche Vorhaben allgemein (inkl. Neubaukonstellationen, öffentliche Belange).
  - `aussenbereich-dauerhaft-wohnen` = Wohnnutzung/Bestand/Umnutzung als Spezialfall.

### Fall 2: `aussenbereich-dauerhaft-wohnen` vs `freizeitgrundstueck-dauerhaft-wohnen`
- Überschneidung: „dauerhaft wohnen“ + Außenbereich-Logik.
- Risiko: **hoch**.
- Schnitt empfohlen:
  - Allgemeine Rechtslogik bleibt im Außenbereich-Artikel.
  - Freizeitgrundstück-Artikel konsequent als Sonderfall (Wochenendhaussatzung, Hauptwohnsitz-Falle, Nutzungsänderung).

### Fall 3: `grundstueck-kaufen-checkliste-bebaubarkeit` vs `bauluecke-kaufen-checkliste`
- Überschneidung: Kaufprüfung + Notartermin + Risiken.
- Risiko: **mittel**.
- Schnitt empfohlen:
  - Generalistische Kaufprüfung als Master-Check.
  - Baulücke-Seite mit klaren Spezialrisiken (2. Reihe, Leitungen, Nachverdichtung, Zufahrten).

### Fall 4: `ist-mein-grundstueck-bebaubar` vs `grundstueck-ohne-bebauungsplan`
- Überschneidung: Vorprüfung Bebaubarkeit.
- Risiko: **mittel**.
- Schnitt empfohlen:
  - Bebaubar-Artikel = Diagnose-Einstieg (Entscheidungsbaum).
  - Ohne-B-Plan = nur Sonderkonstellation „kein Plan vorhanden“ + nächste Amtsschritte.

## 7) Cluster-Lücken (entscheidungsnah priorisiert)

### 1. Tiny House / Mobilheim auf Grundstück zulässig?
- Nutzerfrage: klar
- Entscheidungsrelevanz: hoch
- Tool-Fit: hoch
- Conversion: hoch
- Warum: sehr konkrete „Darf ich…?“-Frage mit hoher Fehlannahmenquote.

### 2. Grundstück ohne gesicherte Zufahrt kaufen/bebauen
- Nutzerfrage: klar
- Entscheidungsrelevanz: hoch
- Tool-Fit: hoch
- Conversion: hoch
- Warum: harter Dealbreaker vor Kauf, stark verwandt mit Hinterliegerfällen.

### 3. Grundstück teilen und hinteren Teil bebauen
- Nutzerfrage: klar
- Entscheidungsrelevanz: hoch
- Tool-Fit: hoch
- Conversion: hoch
- Warum: klassische Verdichtungssituation mit hoher Unsicherheit.

### 4. Wegerecht/Grunddienstbarkeit: reicht das für Baugenehmigung?
- Nutzerfrage: klar
- Entscheidungsrelevanz: hoch
- Tool-Fit: hoch
- Conversion: hoch
- Warum: juristisch-praktischer Engpass zwischen Kauf und Genehmigung.

### 5. Scheune/Stall im Außenbereich zu Wohnraum umnutzen
- Nutzerfrage: klar
- Entscheidungsrelevanz: hoch
- Tool-Fit: mittel-hoch
- Conversion: hoch
- Warum: häufige Praxisidee, hohe Ablehnungsrisiken.

### 6. Erschließungskosten nachträglich nach Kauf
- Nutzerfrage: klar
- Entscheidungsrelevanz: hoch
- Tool-Fit: mittel
- Conversion: mittel-hoch
- Warum: finanzieller Schockpunkt in Kaufentscheidungen.

### 7. Bauvorbescheid: Dauer, Verbindlichkeit, Gültigkeit
- Nutzerfrage: klar
- Entscheidungsrelevanz: mittel-hoch
- Tool-Fit: mittel
- Conversion: mittel
- Warum: Prozesssicherheit vor Kaufentscheidung.

### 8. Grenzabstand/Nachbarbebauung vor Kauf prüfen
- Nutzerfrage: klar
- Entscheidungsrelevanz: mittel-hoch
- Tool-Fit: mittel-hoch
- Conversion: mittel-hoch
- Warum: häufiger Planungsstopp erst spät erkannt.

### 9. Außenbereich geerbtes Grundstück: Neubau vs. Ersatzbau
- Nutzerfrage: klar
- Entscheidungsrelevanz: mittel-hoch
- Tool-Fit: mittel
- Conversion: mittel
- Warum: viele Nutzer kommen mit Bestand/Erbe statt Neukauf.

### 10. Grundstück mit Altbestand: Abriss + Neubau möglich?
- Nutzerfrage: klar
- Entscheidungsrelevanz: hoch
- Tool-Fit: hoch
- Conversion: hoch
- Warum: zentrale Ja/Nein-Frage vor Kauf und Finanzierung.

## 8) Priorisierte Ausbau-Empfehlung (Top 10)

### High Impact (sofort umsetzen)
1. Tiny House/Mobilheim: dauerhaftes Wohnen & Baurecht auf eigenem Grundstück
2. Grundstück ohne gesicherte Zufahrt: kaufen oder lassen?
3. Grundstück teilen & zweite Reihe bebauen: wann realistisch?

### Danach
4. Wegerecht/Grunddienstbarkeit und Baugenehmigung
5. Altbestand abreißen und neu bauen: was ist zulässig?
6. Scheune/Stall zu Wohnhaus im Außenbereich umnutzen
7. Erschließungskosten nachträglich: Risiko vor Kauf richtig einschätzen
8. Bauvorbescheid: Verbindlichkeit, Fristen, typische Fehler
9. Grenzabstände/Nachbarzustimmung als Kaufkriterium
10. Geerbtes Außenbereichsgrundstück: Wohnnutzung legalisieren oder nicht?

## 9) Strategische Einschätzung

### 5 Rückgrat-Keywords (aktueller Bestand)
1. Ist mein Grundstück bebaubar
2. Innenbereich vs Außenbereich
3. Grundstück ohne Bebauungsplan bauen
4. Grundstück kaufen Checkliste (Notartermin)
5. Grundstück nicht erschlossen

### 5 strategisch wichtigste Lücken
1. Tiny House/Mobilheim zulässig?
2. Gesicherte Zufahrt / Wegerecht als Bauvoraussetzung
3. Grundstücksteilung + zweite Reihe
4. Abriss/Neubau bei Altbestand
5. Umnutzung im Außenbereich (Scheune/Stall)

### Themen mit stärkstem Tool-Zug zum Grundstücks-Check
- Alle Fälle ohne klare Ja/Nein-Antwort trotz hoher Kauf-/Bau-Relevanz:
  - Innen-/Außenbereich-Grenzfälle
  - fehlende Erschließung/Zufahrt
  - keine oder unklare Planlage
  - Sondernutzungen (Tiny House, Wochenendhaus, Umnutzung)
- Diese Themen erzeugen hohen Entscheidungsdruck vor Kauf/Planung und profitieren am stärksten von strukturierter Vorprüfung.
