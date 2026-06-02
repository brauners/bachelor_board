# Schlag den Marius

Responsive Live-Scoreboard-Webapp fuer einen Junggesellenabschied im Stil einer TV-Gameshow. Die App nutzt ein kleines Realtime-Backend, damit Regie und Gaeste denselben Live-Spielstand sehen.

## Docker Produktion

```bash
docker compose up
```

Danach ist die Anwendung unter `http://localhost:8787` erreichbar.

Wenn sich Source-Code, Build-Logik oder npm-Abhaengigkeiten geaendert haben, starte stattdessen:

```bash
docker compose up --build
```

Wenn neue npm-Abhaengigkeiten dazugekommen sind und noch alte anonyme Volumes herumliegen, nutze:

```bash
docker compose up --build --renew-anon-volumes
```

Das Produktions-Compose startet einen einzelnen Container, der Frontend, API und WebSocket gemeinsam ausliefert. Dieses Setup ist fuer Raspberry Pi und Ansible-Deployment gedacht.

Relevante Produktionsvariablen:

- `ADMIN_KEY`: PIN fuer den Regie-Login
- `APP_PORT`: Host-Port fuer die Anwendung

## Landingpage und Regie

- Die Startseite ist die oeffentliche Landingpage fuer alle.
- Gaeste bleiben einfach dort und sehen den Live-Spielstand.
- Regie loggt sich direkt auf derselben Seite mit der Admin-PIN ein.

## Handy-Zugriff fuer Gaeste

- Oeffne die App auf dem Regie-Laptop.
- Kopiere den angezeigten Gast-Link.
- Wenn du lokal ueber `localhost` arbeitest, muessen Gaeste stattdessen die lokale IP des Laptops im selben WLAN verwenden, zum Beispiel `http://192.168.0.25:8787`.
- Gaeste brauchen keinen Login.
- Schreibzugriffe brauchen eine Admin-Session aus dem Regie-Login.

## Admin-PIN

- Standardwert in Docker Compose: `marius-live`
- Fuer echte Nutzung solltest du den Wert ueberschreiben:

```bash
ADMIN_KEY=dein-geheimer-pin docker compose up
```

## Features

- Live-Scoreboard fuer Marius gegen Gaeste-Team
- Live-Sync zwischen Laptop, TV und Smartphones via WebSocket
- Adminbereich zum Anlegen, Bearbeiten, Loeschen und Werten von Spielen
- Server-Persistenz mit lokalem Browser-Cache
- Import und Export als JSON
- Vollbildmodus fuer TV/Beamer
- Statistik, Count-up-Animationen und Konfetti bei abgeschlossenem Event

## Entwicklung mit Docker

```bash
docker compose -f docker-compose.dev.yml up --build
```

Danach laufen Frontend und Realtime-Server lokal getrennt auf `http://localhost:5173` und `http://localhost:8787`.

## Entwicklung ohne Docker

```bash
npm install
npm run server:dev
npm run dev
```

Frontend und Realtime-Server laufen lokal getrennt auf `5173` und `8787`.

## Produktions-Build

```bash
npm run build
```

Der Dockerfile enthaelt getrennte Stages fuer Dev und eine schlanke Produktionslaufzeit.
