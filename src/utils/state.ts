import type { EventPhase, Game, ScoreboardState } from "../types/game";

function inferPhase(games: Game[]): EventPhase {
  return games.some((game) => game.points !== null || game.winner !== null) ? "live" : "setup";
}

export function normalizeState(state: {
  phase?: unknown;
  soundboardEnabled?: unknown;
  games: Game[];
}): ScoreboardState {
  return {
    phase: state.phase === "live" || state.phase === "setup" ? state.phase : inferPhase(state.games),
    soundboardEnabled: state.soundboardEnabled === false ? false : true,
    games: state.games
  };
}
