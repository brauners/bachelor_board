# Schlag den Marius

Responsive Live-Scoreboard-Webapp fuer einen Mariusabschied im Stil einer TV-Gameshow. Die App speichert alle Daten lokal im Browser via `localStorage` und laeuft komplett ohne Backend.

## Start mit Docker

```bash
docker compose up
```

Danach ist die Anwendung unter `http://localhost:5173` erreichbar.

Der Dev-Server ist absichtlich nur lokal erreichbar. In Docker wird der Port explizit an `127.0.0.1` gebunden.

## Features

- Live-Scoreboard fuer Marius gegen Gaeste-Team
- Adminbereich zum Anlegen, Bearbeiten, Loeschen und Werten von Spielen
- Persistenz per `localStorage`
- Import und Export als JSON
- Vollbildmodus fuer TV/Beamer
- Statistik, Count-up-Animationen und Konfetti bei abgeschlossenem Event

## Entwicklung ohne Docker

```bash
npm install
npm run dev
```

## Produktions-Build

```bash
npm run build
```

Der Dockerfile enthaelt zusaetzlich einen `build`- und `preview`-Stage fuer Produktions-Builds.
