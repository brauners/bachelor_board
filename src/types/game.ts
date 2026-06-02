export type Winner = "bachelor" | "guest" | null;

export type Game = {
  id: string;
  guestName: string;
  gameName: string;
  points: number;
  winner: Winner;
};

export type ScoreboardState = {
  games: Game[];
};

export type ScoreTotals = {
  bachelor: number;
  guest: number;
};

export type ScoreStats = {
  bachelorWins: number;
  guestWins: number;
  openGames: number;
  totalGames: number;
  totalPoints: number;
  winRateBachelor: number;
  winRateGuest: number;
};

export type SyncStatus = "connecting" | "live" | "offline";
