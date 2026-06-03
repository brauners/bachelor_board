import type { ScoreboardState } from "../types/game";
import { normalizeState } from "./state";

const MAX_GAMES = 200;
const allowedWinners = new Set(["bachelor", "guest"]);
const allowedPhases = new Set(["setup", "live"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateGame(value: unknown, index: number) {
  if (!isRecord(value)) {
    throw new Error(`Ungueltiges Spiel an Position ${index + 1}`);
  }

  const { id, guestName, gameName, points, winner, revealed } = value;

  if (typeof id !== "string" || id.trim() === "") {
    throw new Error(`Spiel ${index + 1} hat keine gueltige ID`);
  }

  if (typeof guestName !== "string" || guestName.trim() === "") {
    throw new Error(`Spiel ${index + 1} hat keinen gueltigen Gastnamen`);
  }

  if (typeof gameName !== "string" || gameName.trim() === "") {
    throw new Error(`Spiel ${index + 1} hat keinen gueltigen Spielnamen`);
  }

  if (
    points !== null &&
    (typeof points !== "number" ||
      !Number.isInteger(points) ||
      !Number.isFinite(points) ||
      points < 1 ||
      points > 100)
  ) {
    throw new Error(`Spiel ${index + 1} hat einen ungueltigen Punktewert`);
  }

  if (winner !== null && (typeof winner !== "string" || !allowedWinners.has(winner))) {
    throw new Error(`Spiel ${index + 1} hat einen ungueltigen Gewinner`);
  }

  if (revealed !== undefined && typeof revealed !== "boolean") {
    throw new Error(`Spiel ${index + 1} hat einen ungueltigen Reveal-Status`);
  }
}

export function downloadState(state: ScoreboardState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "schlag-den-junggesellen.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseImportedState(content: string): ScoreboardState {
  const parsed = JSON.parse(content) as unknown;

  if (!isRecord(parsed) || !Array.isArray(parsed.games)) {
    throw new Error("Ungueltige JSON-Datei");
  }

  if (parsed.phase !== undefined && (typeof parsed.phase !== "string" || !allowedPhases.has(parsed.phase))) {
    throw new Error("Ungueltige Event-Phase");
  }

  if (
    parsed.soundboardEnabled !== undefined &&
    typeof parsed.soundboardEnabled !== "boolean"
  ) {
    throw new Error("Ungueltige Soundboard-Konfiguration");
  }

  if (
    parsed.nextGameCueDurationMs !== undefined &&
    (typeof parsed.nextGameCueDurationMs !== "number" ||
      !Number.isFinite(parsed.nextGameCueDurationMs) ||
      parsed.nextGameCueDurationMs < 1500 ||
      parsed.nextGameCueDurationMs > 15000)
  ) {
    throw new Error("Ungueltige Intro-Dauer");
  }

  if (
    parsed.nextGameCueHoldMs !== undefined &&
    (typeof parsed.nextGameCueHoldMs !== "number" ||
      !Number.isFinite(parsed.nextGameCueHoldMs) ||
      parsed.nextGameCueHoldMs < 0 ||
      parsed.nextGameCueHoldMs > 10000)
  ) {
    throw new Error("Ungueltige Haltezeit des Intros");
  }

  if (parsed.games.length > MAX_GAMES) {
    throw new Error(`Zu viele Spiele in der Importdatei. Maximal ${MAX_GAMES} erlaubt.`);
  }

  parsed.games.forEach((game, index) => validateGame(game, index));

  return normalizeState({
    phase: parsed.phase,
    soundboardEnabled: parsed.soundboardEnabled,
    nextGameCueDurationMs: parsed.nextGameCueDurationMs,
    nextGameCueHoldMs: parsed.nextGameCueHoldMs,
    games: parsed.games
  });
}
