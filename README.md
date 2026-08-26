# Poll App

Eine responsive Umfrage-Anwendung zum Erstellen, Teilen und Auswerten von Surveys, umgesetzt mit Angular und Supabase.

## Features

- Erstellen von Umfragen mit bis zu vier Fragen und fünf Antwortmöglichkeiten
- Auswahl zwischen Single- und Multiple-Choice-Fragen
- Übersicht aktiver, bald endender und abgeschlossener Umfragen
- Filterung nach Status und Kategorie
- Live-Auswertung über Supabase Realtime
- Schutz vor mehrfacher Teilnahme im selben Browser
- Gespeicherte und weiterhin sichtbare Antwortauswahl nach der Teilnahme
- Responsive Darstellung für Desktop, Tablet und mobile Geräte

## Lokal starten

1. Repository klonen:

   ```bash
   git clone https://github.com/mlb27/pollapp.git
   ```

2. In den Projektordner wechseln und Abhängigkeiten installieren:

   ```bash
   cd pollapp
   npm install
   ```

3. Entwicklungsserver starten:

   ```bash
   npm start
   ```

4. `http://localhost:4200` im Browser öffnen.

Für einen Produktions-Build kann `npm run build` verwendet werden.

## Datenspeicherung

Umfragen, Fragen und Stimmen werden in Supabase gespeichert. Änderungen an den Stimmen werden über Realtime-Abonnements direkt in der Auswertung aktualisiert. Die Information über eine bereits erfolgte Teilnahme und die dabei gewählten Antworten werden ausschliesslich im LocalStorage des jeweiligen Browsers gespeichert.

## Technologien

- Angular
- TypeScript
- SCSS
- Supabase Database und Realtime
- Reactive Forms

## Projektstruktur

```text
src/app/
|-- layout/       # Gemeinsamer Seiten-Header
|-- pages/        # Home- und Survey-Detailansicht
`-- shared/       # Interfaces, Models, Services und Hilfsfunktionen
```

## Projektkontext

Dieses Projekt wurde im Rahmen der Weiterbildung bei der **Developer Akademie** erstellt.

## Autor

Moritz Böhm
