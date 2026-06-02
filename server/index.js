import crypto from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import express from "express";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.PORT ?? "8787");
const STATE_FILE = process.env.STATE_FILE ?? path.resolve("server-data/state.json");
const DEFAULT_STATE_FILE =
  process.env.DEFAULT_STATE_FILE ?? path.resolve("shared/default-state.json");
const ADMIN_KEY = process.env.ADMIN_KEY ?? "";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const CLIENT_DIST_DIR = process.env.CLIENT_DIST_DIR ?? path.resolve("dist");

const clients = new Set();
const sessions = new Map();

function isRecord(value) {
  return typeof value === "object" && value !== null;
}

function validateState(state) {
  if (!isRecord(state) || !Array.isArray(state.games)) {
    throw new Error("Invalid state payload");
  }

  if (state.games.length > 200) {
    throw new Error("Too many games");
  }

  for (const [index, game] of state.games.entries()) {
    if (!isRecord(game)) {
      throw new Error(`Invalid game at position ${index + 1}`);
    }

    const { id, guestName, gameName, points, winner } = game;

    if (typeof id !== "string" || id.trim() === "") {
      throw new Error(`Invalid id at position ${index + 1}`);
    }

    if (typeof guestName !== "string" || guestName.trim() === "") {
      throw new Error(`Invalid guest name at position ${index + 1}`);
    }

    if (typeof gameName !== "string" || gameName.trim() === "") {
      throw new Error(`Invalid game name at position ${index + 1}`);
    }

    if (!Number.isInteger(points) || points < 1 || points > 100) {
      throw new Error(`Invalid points at position ${index + 1}`);
    }

    if (winner !== null && winner !== "bachelor" && winner !== "guest") {
      throw new Error(`Invalid winner at position ${index + 1}`);
    }
  }
}

async function ensureParentDirectory(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function loadJson(filePath) {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content);
}

let currentState = null;

async function persistState(state) {
  await ensureParentDirectory(STATE_FILE);
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

async function loadInitialState() {
  try {
    const persistedState = await loadJson(STATE_FILE);
    validateState(persistedState);
    currentState = persistedState;
    return;
  } catch {
    const defaultState = await loadJson(DEFAULT_STATE_FILE);
    validateState(defaultState);
    currentState = defaultState;
    await persistState(currentState);
  }
}

function cleanupExpiredSessions() {
  const now = Date.now();

  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

function createSession() {
  const token = crypto.randomUUID();
  sessions.set(token, {
    role: "admin",
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return token;
}

function getSessionFromRequest(request) {
  cleanupExpiredSessions();
  const authorization = request.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return sessions.get(token) ?? null;
}

function requireAdmin(request, response, next) {
  const session = getSessionFromRequest(request);

  if (!session) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

function broadcastState() {
  const message = JSON.stringify({ type: "state", state: currentState });

  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

const app = express();
app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  next();
});
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/state", (_request, response) => {
  response.json(currentState);
});

app.post("/api/auth/login", (request, response) => {
  const body = request.body;

  if (!isRecord(body) || typeof body.pin !== "string") {
    response.status(400).json({ error: "PIN fehlt." });
    return;
  }

  if (!ADMIN_KEY || body.pin !== ADMIN_KEY) {
    response.status(401).json({ error: "PIN ist ungueltig." });
    return;
  }

  const token = createSession();
  response.json({
    token,
    role: "admin",
    expiresInMs: SESSION_TTL_MS
  });
});

app.get("/api/auth/session", (request, response) => {
  const session = getSessionFromRequest(request);
  response.json({ authenticated: Boolean(session) });
});

app.post("/api/auth/logout", (request, response) => {
  const authorization = request.header("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim();
    sessions.delete(token);
  }

  response.status(204).end();
});

app.put("/api/state", requireAdmin, async (request, response) => {
  try {
    validateState(request.body);
    currentState = request.body;
    await persistState(currentState);
    broadcastState();
    response.json(currentState);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save state";
    response.status(400).json({ error: message });
  }
});

if (existsSync(CLIENT_DIST_DIR)) {
  app.use(express.static(CLIENT_DIST_DIR));

  app.get("/{*any}", (request, response, next) => {
    if (request.path.startsWith("/api/")) {
      next();
      return;
    }

    response.sendFile(path.join(CLIENT_DIST_DIR, "index.html"));
  });
}

const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket) => {
  clients.add(socket);
  socket.send(JSON.stringify({ type: "state", state: currentState }));
  socket.on("close", () => {
    clients.delete(socket);
  });
});

await loadInitialState();

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Realtime server listening on ${PORT}`);
});
