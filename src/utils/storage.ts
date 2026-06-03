import type { ScoreboardState } from "../types/game";
import { sampleGames } from "./sampleGames";
import { normalizeState } from "./state";

export const STORAGE_KEY = "bachelor-board-state";

const fallbackState: ScoreboardState = {
  phase: "setup",
  soundboardEnabled: true,
  games: sampleGames
};

export function loadState(): ScoreboardState {
  if (typeof window === "undefined") {
    return fallbackState;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return fallbackState;
  }

  try {
    const parsed = JSON.parse(stored) as ScoreboardState;
    if (!Array.isArray(parsed.games)) {
      return fallbackState;
    }

    return normalizeState(parsed);
  } catch {
    return fallbackState;
  }
}

export function saveState(state: ScoreboardState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
