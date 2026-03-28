# Außenbereichs-Cluster: Kannibalisierungs- und Rollenanalyse (28.03.2026)

## 1. Aktuelle Rollen je Seite

### /ratgeber/innenbereich-aussenbereich.html
- **Aktuelle Hauptfunktion:** Einordnungsseite für §34 vs. §35 (Lageklassifikation).
- **Aktuelle Primärintention:** „Liegt mein Grundstück im Innenbereich oder Außenbereich?“
- **Erkennbare Drift-Risiken:**
  - Intro/Kurzantwort gehen direkt in „ob und wie du bauen darfst“; damit Berührung zur Bauzulässigkeitsfrage.
  - FAQ enthält „Darf man im Außenbereich nach §35 BauGB überhaupt bauen?“ und ragt damit in den Kern von `/bauen-im-aussenbereich`.

### /ratgeber/bauen-im-aussenbereich.html
- **Aktuelle Hauptfunktion:** Allgemeiner Zulässigkeitsartikel zu Bauen im Außenbereich (§35-Logik, Belange, Praxisfälle).
- **Aktuelle Primärintention:** „Darf man im Außenbereich bauen?“
- **Erkennbare Drift-Risiken:**
  - Enthält „Was ist der Außenbereich?“ und „Schnelle Einordnung“; kann in Richtung Lage-Einordnung driften.
  - FAQ „Kann man ein bestehendes Gebäude im Außenbereich erweitern?“ berührt teils Nutzung/Bestand-Themen.

### /ratgeber/aussenbereich-dauerhaft-wohnen.html
- **Aktuelle Hauptfunktion:** Allgemeine Rechtslage zu Dauerwohnen im Außenbereich (nicht Spezialfall-Detail).
- **Aktuelle Primärintention:** „Darf man im Außenbereich dauerhaft wohnen?“
- **Erkennbare Drift-Risiken:**
  - Geringes Drift-Risiko: Einordnung, Ausnahmen, Unterlagen, FAQ sind auf Wohnnutzung fokussiert.
  - Verlinkt sauber auf Spezialfall-Seite statt diesen auszubreiten.

---

## 2. Hauptüberschneidungen im Cluster

1. **/innenbereich-aussenbereich ↔ /bauen-im-aussenbereich**
   - **Überschneidung:** Einsteigerfrage zu §35 + erste Bauzulässigkeit.
   - **Warum:** Einordnungsseite beantwortet in FAQ schon die Baufrage; Bauseite erklärt zugleich „Was ist Außenbereich?“
   - **Risikostufe:** **Mittleres Risiko**.

2. **/bauen-im-aussenbereich ↔ /aussenbereich-dauerhaft-wohnen**
   - **Überschneidung:** Gemeinsamer §35-Rahmen und „erlaubt/nicht erlaubt“-Einstieg.
   - **Warum:** Frühe Signale ähneln sich in Problemstellung; Rollen trennen sich erst im Verlauf (Bauen vs. Wohnen).
   - **Risikostufe:** **Niedrig bis mittleres Risiko**.

3. **/innenbereich-aussenbereich ↔ /aussenbereich-dauerhaft-wohnen**
   - **Überschneidung:** Beide erwähnen Außenbereichsstrenge.
   - **Warum:** Themennähe vorhanden, aber Primärfrage klar verschieden (Einordnung vs. Wohnnutzung).
   - **Risikostufe:** **Niedriges Risiko**.

4. **Optional Kontext: /freizeitgrundstueck-dauerhaft-wohnen**
   - **Einordnung:** Spezialfallseite ist inzwischen klar abgegrenzt und entlastet die allgemeine Dauerwohnen-Seite.
   - **Risikostufe ggü. Hauptseiten:** **Kein relevantes Zusatzrisiko** für die 3er-Hauptanalyse.

---

## 3. Wichtigste Kannibalisierungsprobleme

1. **Einordnungsseite beantwortet Bau-Zulässigkeit zu früh/zu direkt**
- Hauptproblemstelle: FAQ auf `/innenbereich-aussenbereich` mit expliziter Baufrage im Außenbereich.
- Effekt: Nutzer- und Google-Signal überschneidet sich mit `/bauen-im-aussenbereich`.

2. **Bauseite enthält zu viel Einordnungs-Onboarding**
- Hauptproblemstelle: frühe Abschnitte „Was ist der Außenbereich?“ + „Schnelle Einordnung“.
- Effekt: Rolle als Zulässigkeitsseite bleibt zwar erkennbar, aber Startintention nähert sich der Einordnungsseite.

3. **Frühe §35-Signale in zwei Seiten sehr nah**
- Hauptproblemstelle: Intro/erste H2 von `/bauen-im-aussenbereich` und `/aussenbereich-dauerhaft-wohnen` starten ähnlich („streng, möglich nur unter Bedingungen“).
- Effekt: moderates SERP-Überschneidungsrisiko bei unscharfen Queries.

---

## 4. Priorisierte nächste Schritte

1. **Zuerst Trennung innenbereich-aussenbereich ↔ bauen-im-aussenbereich nachschärfen**
- Grund: Höchstes reales Risiko im 3er-Set (Einordnung vs. Zulässigkeit vermischt sich in frühen Signalen).

2. **Dann FAQ-Grenzen schärfen (beide Seiten)**
- `/innenbereich-aussenbereich`: FAQ strikt auf Klassifikation/Abgrenzung.
- `/bauen-im-aussenbereich`: FAQ strikt auf Vorhaben-Zulässigkeit im Außenbereich.

3. **Danach Intro- und erste-H2-Signale bei bauen vs. dauerhaft-wohnen feintunen**
- Ziel: früher expliziter Unterschied „Vorhaben bauen“ vs. „Wohnnutzung dauerhaft“.

4. **Interne Linkpfade als Entscheidungsfluss festziehen**
- Pfadlogik: Einordnung (`/innenbereich-aussenbereich`) → Zulässigkeit (`/bauen-im-aussenbereich`) oder Nutzungsfrage (`/aussenbereich-dauerhaft-wohnen`).

5. **Spezialfallseite weiterhin als Spezialfall halten**
- `/freizeitgrundstueck-dauerhaft-wohnen` nicht wieder in allgemeine Außenbereichslogik erweitern.

---

## 5. Scope-Matrix

| URL | Primärfrage | Nicht-Thema | Nächster logischer Cluster-Schritt |
|---|---|---|---|
| `/ratgeber/innenbereich-aussenbereich.html` | Liegt mein Grundstück im Innen- oder Außenbereich? | Vollständige Bauzulässigkeit im Außenbereich; Dauerwohnen im Detail | Bei Außenbereich → `/ratgeber/bauen-im-aussenbereich.html`; bei Wohnnutzungsfrage → `/ratgeber/aussenbereich-dauerhaft-wohnen.html` |
| `/ratgeber/bauen-im-aussenbereich.html` | Darf man im Außenbereich bauen? | Vollständige Lageklassifikation §34/§35; Dauerwohnen als Hauptthema | Bei unklarer Lage → `/ratgeber/innenbereich-aussenbereich.html`; bei Wohnnutzung → `/ratgeber/aussenbereich-dauerhaft-wohnen.html` |
| `/ratgeber/aussenbereich-dauerhaft-wohnen.html` | Darf man im Außenbereich dauerhaft wohnen? | Allgemeine Bauzulässigkeit im Außenbereich; Lageeinordnung als Hauptthema | Bei Spezialfall Wochenendhaus/Freizeitnutzung → `/ratgeber/freizeitgrundstueck-dauerhaft-wohnen.html` |

---

## 6. Kurzfazit

Die drei Hauptseiten sind bereits grundsätzlich sinnvoll getrennt, aber die Trennung ist nicht überall gleich stark.
Am stabilsten wirkt derzeit die Rolle von `/aussenbereich-dauerhaft-wohnen` als Wohnnutzungsseite.
Die größte reale Überschneidung liegt zwischen `/innenbereich-aussenbereich` und `/bauen-im-aussenbereich`.
Hier verschwimmt die Grenze zwischen Lage-Einordnung und Bauzulässigkeit vor allem in frühen Signalen und FAQ.
Zwischen `/bauen-im-aussenbereich` und `/aussenbereich-dauerhaft-wohnen` besteht ein kleineres, aber relevantes Frühsignal-Risiko.
Die Spezialfallseite `/freizeitgrundstueck-dauerhaft-wohnen` entlastet das Cluster aktuell eher, als dass sie es belastet.
Der erste Umbau sollte deshalb die Einordnungsseite und die Bauseite klarer auf ihre Kernfrage festnageln.
Wenn diese Trennung sitzt, reicht bei der Wohnseite meist Feintuning statt größerer Eingriffe.
So bleibt das Cluster nah beieinander, aber funktional eindeutig.
