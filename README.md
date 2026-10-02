# Strong Pro Web

Die Analyse-Features von Strong Pro (Charts, Rekorde, 1RM, Muskel-Heatmap) für den eigenen CSV-Export – lokal im Browser, ohne Server, ohne Konto. Die fertige App ist **eine einzige HTML-Datei**: `StrongPro.html` per Doppelklick öffnen.

## Benutzung

1. In der Strong-App die Daten als CSV exportieren.
2. `StrongPro.html` öffnen → Tab **Übersicht** → CSV per Drag & Drop oder „CSV auswählen“ importieren.
3. Später eine **neuere CSV** importieren: Es werden nur Workouts hinzugefügt, deren Startzeit noch nicht gespeichert ist. Bereits gespeicherte Workouts bleiben unverändert; ein erneuter Import derselben Datei meldet „Keine neuen Workouts“.
4. „Alle Daten löschen“ (Übersicht, unten) entfernt die gespeicherten Daten.

Hinweise:

- Die Daten liegen in `localStorage` des Browsers. Chrome teilt ihn für alle lokalen Dateien, Firefox trennt nach Dateipfad – die Datei daher nicht verschieben. Löscht du Browserdaten, sind auch die Trainingsdaten weg (ein Backup ist nicht eingebaut; die CSV dient als Sicherung).
- Enthält der CSV-Header keine Einheit (altes Format), wird kg angenommen. Eine CSV mit anderer Einheit als die gespeicherten Daten wird abgelehnt.
- Eine Datei, die keine Strong-CSV ist, wird mit Fehlermeldung abgelehnt; gespeicherte Daten bleiben dabei unverändert.

## Features

| Tab | Inhalt |
| --- | --- |
| Übersicht | Workouts, Trainingszeit, Gesamtvolumen, Arbeitssätze, Wochen-Serie, Workouts pro Woche, Trainingskalender, stagnierende Übungen, Jahresrückblick pro Jahr, CSV-Import |
| Verlauf | Alle Workouts (neueste zuerst) mit Sätzen, RPE und Notizen; Suche nach Workout-Name, Übung und Notizen (bei Notiz-Treffern zeigt die Zeile die Notiz); Workout-Detail vergleicht jede Übung mit dem letzten gleichnamigen Workout |
| Übungen | Suche, Diagramm (1RM, Gewicht, Volumen, Wiederholungen; Cardio: Distanz, Dauer) mit Zeitraumfilter, Rekorde, bestes Gewicht pro Wiederholungszahl, Verlauf; bei Übungen mit RPE zusätzlich „Ø RPE“ und (nur bei Kraftübungen) „RPE-1RM“ im Diagramm |
| Rekorde | Die wichtigsten Rekorde aller Übungen, Antippen öffnet die Übung |
| Muskeln | Drehbares anatomisches 3D-Modell (Vorne/Hinten) mit 200+ einzelnen Muskeln, nach Belastung gelb → orange → rot eingefärbt; Details per Darüberfahren/Tippen; Liste mit Sätzen pro Muskel (7, 30, 90 Tage); Antippen eines Muskels zeigt die Sätze pro Woche (12, 26 oder 52 Wochen) mit Zielband und Trendlinie |
| Körper | Ein Profil (Geschlecht, Alter, Größe, Gewicht, Umfänge, Aktivität, optional Ruhepuls und gemessenes Körperfett) liefert live: BMI mit Skala, Körperfett (US-Navy, BMI-Methode) mit ACE-Klassen, Idealgewicht, Magermasse, FFMI, Taille/Größe, Taille/Hüfte, Körperoberfläche; Grundumsatz (3 Formeln), Tagesbedarf, Kalorienziele, Makros, Wasser; Ziel-Planer mit Dauer, Zieldatum, Tagesziel und Gewichtskurve; 1RM-Rechner (Bester Satz aus den Strong-Daten übernehmbar), Herzfrequenzzonen, Pace und Wettkampfprognose. Metrisch/imperial und kcal/kJ umschaltbar; das Profil wird gespeichert |
| Einstellungen | Schalter „Trendlinien“ für alle Diagramme (Standard: an) und Wahl des 3D-Modells männlich/weiblich (Standard: männlich); beides wird gespeichert |

Nicht enthalten: Plate-/Warm-up-Rechner, Verlauf von Körpermaßen, Workout-Templates, Themes.

## Unterstützte CSV-Formate

| | Altes Format | Neues Format |
| --- | --- | --- |
| Trennzeichen | `,` | `;` |
| Spalten | `Date, Workout Name, Duration, Exercise Name, Set Order, Weight, Reps, Distance, Seconds, Notes, Workout Notes, RPE` | `Workout #; Date; Workout Name; Duration (sec); Exercise Name; Set Order; Weight (kg/lb); Reps; RPE; Distance (meters); Seconds; Notes; Workout Notes` |
| Dauer | `42m`, `1h 8m` | Sekunden |
| Einheit | kg (angenommen) | aus `Weight (kg)` bzw. `Weight (lb)` |

Gemeinsam: `Date` (`YYYY-MM-DD HH:mm:ss`) ist die Workout-Startzeit und identifiziert ein Workout. `Set Order`-Zeilen `Rest Timer` werden verworfen, Übungsnamen getrimmt, Distanzen intern in km geführt.

## Berechnungen

- **1RM**: Epley, `Gewicht × (1 + Wdh / 30)`; bei 1 Wiederholung das Gewicht selbst.
- **RPE-1RM**: Epley mit den Wiederholungen in Reserve als Zuschlag, `Gewicht × (1 + (Wdh + 10 − RPE) / 30)`; nur für Sätze mit RPE 6–10, sonst 0. Je Workout zählt der beste Satz, „Ø RPE“ ist der Mittelwert aller Arbeitssätze mit RPE. Beide Kennzahlen erscheinen nur bei Übungen mit RPE-Werten, Workouts ohne RPE fehlen im Diagramm; Rekorde bleiben beim normalen 1RM.
- **Volumen**: `Gewicht × Wdh`. Aufwärmsätze (`W`) und Assisted-Übungen (Gewicht = Gegengewicht) zählen nicht.
- **Übungsart**: Kraft (mit Gewicht), Wiederholungen (Körpergewicht, Assisted), Cardio (kein Gewicht, keine Wdh.).
- **Rekorde**: pro Workout die besten Werte der Arbeitssätze; bei Gleichstand gilt das früheste Datum. Rep-Max-Tabelle: schwerstes Gewicht mit mindestens 1–10 Wiederholungen.
- **Serie**: aufeinanderfolgende Kalenderwochen (Mo–So) mit mindestens einem Workout; die noch leere aktuelle Woche unterbricht sie nicht.
- **Trendlinien** (gestrichelt, orange; im Tab Einstellungen abschaltbar), berechnet über den jeweils sichtbaren Zeitraum:
    - Übungsdiagramme: **Theil-Sen** – Median aller Paar-Steigungen über die echte Zeitachse (Tage). Robust gegen Ausreißer (Bruchpunkt ≈ 29 %), z. B. einzelne leichte Deload-Einheiten, die eine normale Regressionsgerade verziehen würden. Darunter steht die Steigung als „Trend: +1,4 kg pro Monat“.
    - Workouts pro Woche: **kleinste Quadrate**, weil Theil-Sen bei vielen Wochen ohne Training (Nullwerte) auf 0 kollabiert; die Linie wird bei 0 abgeschnitten.
    - Ab zwei Datenpunkten mit verschiedenem Datum; sonst keine Linie.
- **Trainingskalender**: ein Feld pro Tag der letzten 53 Wochen (Mo–So, eine Spalte pro Woche); Farbstufen für 0, 1 und 2+ Workouts; Tage nach heute bleiben leer. Darunter der häufigste Wochentag und die häufigste Startstunde (bei Gleichstand der frühere Wert).
- **Workout-Vergleich**: Vorgänger ist das letzte frühere Workout mit gleichem Namen. Pro Übung mit Arbeitssätzen stehen die Änderungen der Kennzahlen (Kraft: 1RM, Gewicht, Volumen, Wdh.) gegenüber dem Vorgänger; Übungen ohne Arbeitssätze dort sind „Neu“.
- **Stagnierende Übungen**: Kraftübungen mit mindestens 4 Einheiten in den letzten 56 Tagen, deren geschätztes 1RM per Theil-Sen-Trend (siehe Trendlinien) nicht steigt (Steigung ≤ 0); sortiert nach stärkstem Rückgang. Angezeigt werden der Trend pro Monat und wann das beste 1RM erreicht wurde (in Kalendertagen, „heute“, „gestern“, „vor N Tagen“).
- **Jahresrückblick**: pro Kalenderjahr mit Workouts: Workouts, Trainingszeit, Volumen, Arbeitssätze, längste Wochen-Serie innerhalb des Jahres (Wochen mit mindestens einem Workout in diesem Jahr), Top-5-Übungen nach Anzahl Workouts, neue 1RM-Rekorde (Sessions, die alle früheren übertreffen – die erste Session einer Übung zählt nicht), stärkster Monat nach Volumen und häufigster Wochentag.
- **Muskeln**: Zuordnung über Schlüsselwörter im Übungsnamen (`src/core/muscles.ts`); Hauptmuskeln zählen pro Satz 1, Hilfsmuskeln 0,5. Unbekannte Übungen und Cardio zählen nicht.
- **Sätze pro Woche**: gewichtete Arbeitssätze eines Muskels je Kalenderwoche (Mo–So), Zielband 10–20 Sätze (`WEEKLY_SET_TARGET` in `src/core/muscles.ts`); die Trendlinie ist wie bei den Workouts pro Woche eine Regression nach kleinsten Quadraten.
- **3D-Modell**: Die Farbe ist die Belastung relativ zum am stärksten trainierten Muskel im gewählten Zeitraum (`withIntensity`, Skala in `src/core/heat.ts`); nicht trainierte oder von der App nicht erfasste Muskeln bleiben grau. Das Modell ist ein fertiges Anatomie-Modell (GLB, ein Mesh pro Muskel), das mit Three.js gerendert wird (`src/components/bodyScene.ts`). Jeder Modellmuskel wird über seine Trainingsgruppe einer der 16 App-Muskelgruppen zugeordnet (`src/core/anatomy.ts`, z. B. Chest → Brust; Gluteus medius/minimus und TFL → Abduktoren). Ein Test prüft gegen beide mitgelieferten Maps, dass jede Modellgruppe zugeordnet oder bewusst ausgelassen ist (Nacken, Sartorius, Hüftbeuger, Hüftrotatoren, Unterschenkel) und jede App-Muskelgruppe Meshes hat. Ohne WebGL erscheint ein Hinweis, die Liste darunter bleibt nutzbar.
- **Körper-Tab** (`src/core/body/`, intern immer metrisch; leere Felder ergeben „–“ statt Fehlwerten):
    - BMI nach WHO-Klassen, gesunder Bereich 18,5–25, BMI Prime (BMI ÷ 25), Ponderal-Index (kg/m³).
    - Körperfett: US-Navy-Umfangsmethode (Frauen mit Hüfte), BMI-Methode nach Deurenberg; ein gemessener Wert hat Vorrang, sonst Navy vor BMI-Methode. Klassen nach ACE, Idealwert nach Jackson & Pollock (20–55 Jahre, linear interpoliert), „Fett bis zum Idealwert“ = Gewicht × (KFA − Ideal).
    - Idealgewicht nach Robinson, Miller, Devine und Hamwi; Magermasse nach Boer, James und Hume; FFMI aus der Magermasse, normalisiert auf 1,80 m; Körperoberfläche nach Mosteller und Du Bois.
    - Grundumsatz nach Mifflin-St Jeor, revidiertem Harris-Benedict oder Katch-McArdle (braucht Körperfett); Tagesbedarf mit Aktivitätsfaktor 1,2–1,9; 1 kg ≈ 7.700 kcal.
    - Makros: Protein in g/kg, Fett als Kalorienanteil, Kohlenhydrate füllen den Rest; Basis ist die erste Woche des Ziel-Plans, sonst der Tagesbedarf. Wasser 35 ml/kg.
    - Ziel-Planer: konstantes Tempo pro Woche, der Tagesbedarf wird jede Woche für das geplante Gewicht neu berechnet; Warnung unter 1.500 (Männer) bzw. 1.200 kcal (Frauen) und bei einem Ziel-BMI unter 18,5.
    - Training: 1RM nach Epley (wie Strong), Brzycki und Lombardi für 1–30 Wiederholungen; HFmax nach 220 − Alter und Tanaka, Zonen nach Karvonen (ohne Ruhepuls als Anteil der HFmax); Wettkampfprognose nach Riegel (Exponent 1,06).
- **Modell-Lizenz**: Die Modelle in `assets/anatomy/` stammen aus [fitmitwith-anatomy-atlas](https://github.com/slfresh/fitmitwith-anatomy-atlas) (abgeleitet von Z-Anatomy und BodyParts3D) und stehen unter **CC BY-SA 4.0**; sie sind unverändert eingebunden (Details, Commit und SHA-256 in `assets/anatomy/NOTICE.md`). Die App zeigt den Quellenhinweis im Tab Muskeln und in den Einstellungen. Das weibliche Modell ist laut Autor eine illustrative, fachlich nicht geprüfte Variante. Beide Modelle sind in `StrongPro.html` eingebettet (ca. 8 MB Dateigröße); geladen wird nur das gewählte.

## Projektstruktur

```
src/core/         Reine Logik ohne React/DOM, jede Datei mit *.test.ts
  csv.ts            CSV-Parser (Quotes, Zeilenumbrüche, Trennzeichen-Erkennung)
  normalize.ts      Zeilen → WorkoutSet, beide Formate
  library.ts        Import + Merge (Diff pro Workout)
  sets.ts           Übungsart, 1RM, Volumen, Hilfsfunktionen
  stats.ts          Workouts, Verlauf, Rekorde, Übersicht
  calendar.ts       Trainingskalender, häufigster Wochentag/Startstunde
  compare.ts        Vorheriges gleichnamiges Workout, Vergleich pro Übung
  plateau.ts        Stagnierende Übungen
  yearReview.ts     Jahresrückblick
  search.ts         Suche in Workout-Namen, Übungen und Notizen
  muscles.ts        Muskel-Mapping, -Belastung und relative Intensität
  anatomy.ts        Zuordnung Modellmuskel → App-Muskelgruppe; heat.ts: Farbskala
  format.ts         Deutsche Zahlen-, Datums- und Satz-Formatierung
  trend.ts          Trendlinien (Theil-Sen, kleinste Quadrate)
  storage.ts        localStorage-Zugriff (Daten); settings.ts: Einstellungen
  body/             Körper-Tab: BMI, Körperfett, Energie, Ernährung, Planer, Training, Profil, Einheiten
  dates.ts, types.ts
src/components/   Wiederverwendbare UI-Bausteine (Liste, Tab-Bar, Charts, Import)
src/screens/      Ein Screen pro Tab plus Detailansichten
src/styles/       SCSS: Design-Tokens (Apple-Systemfarben, Dark Mode), Mixins, Global
src/App.tsx       Tab-Navigation; src/useLibrary.ts: Laden, Import, Reset; src/useBodyProfile.ts: Körper-Profil
assets/anatomy/   3D-Modelle und Maps (CC BY-SA 4.0, siehe NOTICE.md)
scripts/publish.mjs   Kopiert dist/index.html nach StrongPro.html
```

Die Oberfläche folgt den Apple Human Interface Guidelines (Systemschrift und -farben, Large Titles, Inset-Listen, Segmented Controls, Tab-Bar, Dark Mode).

## Entwicklung

```bash
npm install     # Abhängigkeiten (exakt gepinnt)
npm test        # Vitest, Coverage-Schwelle 100 % für src/core
npm run build   # tsc + Vite (Single-File) → dist/index.html → StrongPro.html
```

Nur nach Code-Änderungen ist ein Build nötig; zur Nutzung reicht `StrongPro.html`. Stack: React 19, TypeScript, SCSS (CSS Modules), Recharts, Three.js, Vite mit `vite-plugin-singlefile`.

## Lizenz

Der Code steht unter der [PolyForm Noncommercial License 1.0.0](LICENSE): Nutzung, Änderung und Weitergabe sind erlaubt, kommerzielle Nutzung nicht. Die 3D-Modelle in `assets/anatomy/` stammen von Dritten und stehen unter CC BY-SA 4.0 (das erlaubt kommerzielle Nutzung), siehe [NOTICE](assets/anatomy/NOTICE.md).
