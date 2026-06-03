import type { Game, ScoreStats, ScoreTotals } from "../types/game";

export function calculateTotals(games: Game[]): ScoreTotals {
  return games.reduce<ScoreTotals>(
    (totals, game) => {
      if (game.points === null) {
        return totals;
      }

      if (game.winner === "bachelor") {
        totals.bachelor += game.points;
      }

      if (game.winner === "guest") {
        totals.guest += game.points;
      }

      return totals;
    },
    { bachelor: 0, guest: 0 }
  );
}

export function calculateStats(games: Game[]): ScoreStats {
  const bachelorWins = games.filter((game) => game.winner === "bachelor").length;
  const guestWins = games.filter((game) => game.winner === "guest").length;
  const openGames = games.filter((game) => game.winner === null).length;
  const openPoints = games.reduce(
    (sum, game) => sum + (game.winner === null ? (game.points ?? 0) : 0),
    0
  );
  const totalGames = games.length;
  const totalPoints = games.reduce((sum, game) => sum + (game.points ?? 0), 0);
  const finishedGames = bachelorWins + guestWins;

  return {
    bachelorWins,
    guestWins,
    openGames,
    openPoints,
    totalGames,
    totalPoints,
    winRateBachelor: finishedGames ? (bachelorWins / finishedGames) * 100 : 0,
    winRateGuest: finishedGames ? (guestWins / finishedGames) * 100 : 0
  };
}

export function getNextOpenGame(games: Game[]): Game | null {
  return games.find((game) => game.winner === null) ?? null;
}

export function getLeader(totals: ScoreTotals): "bachelor" | "guest" | "tie" {
  if (totals.bachelor > totals.guest) {
    return "bachelor";
  }

  if (totals.guest > totals.bachelor) {
    return "guest";
  }

  return "tie";
}
