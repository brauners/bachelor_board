# Schlag den Marius

Responsive Live-Scoreboard-Webapp fuer einen Junggesellenabschied im Stil einer TV-Gameshow. Die App nutzt ein kleines Realtime-Backend, damit Regie und Gaeste denselben Live-Spielstand sehen.

## Start mit Docker

```bash
docker compose up
```

Danach ist die Anwendung unter `http://localhost:5173` erreichbar.

Wenn neue npm-Abhaengigkeiten dazugekommen sind, starte stattdessen:

```bash
docker compose up --build --renew-anon-volumes
```

Der Realtime-Server ist zusaetzlich auf Port `8787` erreichbar und wird von Browsern direkt fuer Live-Sync genutzt.

## Landingpage und Regie

- Die Startseite ist die oeffentliche Landingpage fuer alle.
- Gaeste bleiben einfach dort und sehen den Live-Spielstand.
- Regie loggt sich direkt auf derselben Seite mit der Admin-PIN ein.

## Handy-Zugriff fuer Gaeste

- Oeffne die App auf dem Regie-Laptop.
- Kopiere den angezeigten Gast-Link.
- Wenn du lokal ueber `localhost` arbeitest, muessen Gaeste stattdessen die lokale IP des Laptops im selben WLAN verwenden, zum Beispiel `http://192.168.0.25:5173`.
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

Der Dockerfile enthaelt zusaetzlich einen `build`- und `preview`-Stage fuer Produktions-Builds.
