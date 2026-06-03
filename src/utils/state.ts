import type { EventPhase, Game, ScoreboardState } from "../types/game";

function inferPhase(games: Game[]): EventPhase {
  return games.some((game) => game.points !== null || game.winner !== null) ? "live" : "setup";
}

export function normalizeState(state: {
  phase?: unknown;
  soundboardEnabled?: unknown;
  nextGameCueDurationMs?: unknown;
  nextGameCueHoldMs?: unknown;
  games: Game[];
}): ScoreboardState {
  const nextGameCueDurationMs =
    typeof state.nextGameCueDurationMs === "number" &&
    Number.isFinite(state.nextGameCueDurationMs) &&
    state.nextGameCueDurationMs >= 1500 &&
    state.nextGameCueDurationMs <= 15000
      ? Math.round(state.nextGameCueDurationMs)
      : 4500;
  const nextGameCueHoldMs =
    typeof state.nextGameCueHoldMs === "number" &&
    Number.isFinite(state.nextGameCueHoldMs) &&
    state.nextGameCueHoldMs >= 0 &&
    state.nextGameCueHoldMs <= 10000
      ? Math.round(state.nextGameCueHoldMs)
      : 1500;

  return {
    phase: state.phase === "live" || state.phase === "setup" ? state.phase : inferPhase(state.games),
    soundboardEnabled: state.soundboardEnabled === false ? false : true,
    nextGameCueDurationMs,
    nextGameCueHoldMs,
    games: state.games.map((game) => ({
      ...game,
      revealed: game.revealed === true
    }))
  };
}
