# AGENTS.md

Dieses Repository enthält den Ratgeberbereich von grundstueckcheck.de.

Der Ratgeber hilft Nutzern, ihre Grundstückssituation besser einzuordnen
und führt bei Unsicherheit logisch zum Grundstücks-Check.

—

## Zentrale Systemlogik

Die Arbeit im Repository folgt einem festen System:

1. SOP Lite → Inhalt, Denkweise, Sprache  
2. SOP Main → Struktur, SEO, HTML, QA  
3. Repository → bestehende Komponenten und Struktur  

Diese Reihenfolge ist verbindlich.

Im Zweifel gilt:
**Verständlichkeit und Nutzerlogik haben Vorrang vor formaler Perfektion.**

—

## Rolle der Artikel

Ratgeberartikel sind keine reinen Informationsseiten.

Sie funktionieren als **diagnostische Einstiege**:

1. Problem verstehen  
2. typische Fälle erkennen  
3. Entscheidungsfaktoren sichtbar machen  
4. Grenzen pauschaler Antworten zeigen  
5. logisch zur Vorprüfung (Grundstücks-Check) führen  

Der Grundstücks-Check ist der nächste Schritt bei individuellen Fällen,
keine optionale Ergänzung.

—

## Schreiblogik (verbindlich)

Grundprinzip:
**Nutzer denken in konkreten Fragen, nicht in Paragrafen.**

Deshalb gilt:

- konkrete Situationen statt abstrakter Aussagen
- Alltagssprache vor Fachsprache
- Fachbegriffe nur mit direkter Erklärung
- Beispiele und reale Fälle bevorzugen
- keine Behördensprache

Ziel:
Der Nutzer soll sagen können:
**„Das ist genau meine Situation.“**

—

## Pflichtregeln für Inhalte

Jeder Artikel muss:

- eine **klare Nutzerfrage** beantworten
- eine **reale Entscheidungssituation** abbilden
- mindestens einen **konkreten Praxisfall** enthalten
- **Grenzen pauschaler Aussagen** aufzeigen
- logisch zum Grundstücks-Check führen

—

## Verbotene Muster (Hard DON’Ts)

Agents dürfen NICHT:

- abstrakte oder juristisch formulierte Texte schreiben
- Texte wie ein Gutachten oder Gesetzestext formulieren
- Inhalte ohne konkrete Situation oder Beispiel erstellen
- pauschale Sicherheit vermitteln („ist erlaubt“, „geht immer“)
- Bauplanungsrecht und Bauordnungsrecht vermischen
- bestehende Inhalte komplett neu schreiben (statt Patch)
- generische KI-Floskeln verwenden

Wenn ein Text wie von einer Behörde klingt → überarbeiten.

—

## SOP-Verwendung (verbindlich)

### SOP Lite → führend für Inhalte

Die Lite-SOP steuert:
- Nutzerperspektive
- Verständlichkeit
- Struktur aus Sicht des Lesers

### SOP Main → verpflichtend für Kontrolle

Die Main-SOP steuert:
- HTML-Struktur
- interne Verlinkung
- SEO
- Superscripts / Quellen
- QA-Prozess

Beide müssen gemeinsam angewendet werden.

—

## Workflow (verbindlich)

Jeder Artikel folgt diesem Ablauf:

1. Nutzerfrage verstehen  
2. Clusterrolle bestimmen  
3. Draft erstellen oder bestehenden Artikel erweitern  
4. Verständlichkeit und Praxisnähe verbessern  
5. Struktur, Links, Quellen nach SOP Main prüfen  
6. Änderungen minimal und gezielt umsetzen  

Wichtig:
**Keine vollständigen Neuschreibungen bestehender Artikel.**

—

## Interne Verlinkung

- Fokus auf relevante Cluster-Verbindungen
- keine unnötigen Links
- keine Mehrfachverlinkung ohne Mehrwert

Es gelten die Link-Caps aus der SOP Main.

—

## HTML- und CSS-Regeln

Die bestehende Struktur im Repository ist verbindlich.

- vorhandene HTML-Struktur beibehalten
- bestehende Komponenten verwenden
- keine neuen Klassen erfinden
- keine Layoutänderungen ohne Not

Referenz:
`/ratgeber/artikel.css`

→ bestehende Klassen verwenden  [oai_citation:0‡artikel.css](sediment://file_00000000a7f4724398db81fd221ade9e)

—

## Technische Pflichtbestandteile

Jeder Artikel muss enthalten:

- Hero mit Meta-Zeile (Stand + Lesezeit)
- Kurzantwort
- Inhaltsstruktur mit H2
- Praxisbeispiele
- FAQ-Bereich
- Quellenblock
- interne Links

Details sind in der SOP Main definiert  [oai_citation:1‡grundstueckcheck-ratgeber-sop.md](sediment://file_000000004f1c72439a9ab0ce2889d9ff)

—

## Qualitätsziel

Ein guter Artikel:

- beantwortet die Nutzerfrage klar
- zeigt typische Fehler und Grenzfälle
- hilft bei einer echten Entscheidung
- wirkt wie eine Erklärung eines erfahrenen Beraters
- führt logisch zur nächsten sinnvollen Handlung

—

## Priorität bei Konflikten

Wenn Unsicherheiten entstehen:

1. Nutzerverständnis  
2. konkrete Entscheidungshilfe  
3. Cluster-Passung  
4. bestehende Struktur  
5. SEO-Feinoptimierung  

—

## Leitsatz

**Verständlich, konkret und praxisnah schlägt formal perfekt.**

Der Nutzer muss seine Situation erkennen – sonst ist der Artikel nicht gut.