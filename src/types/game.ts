export type Winner = "bachelor" | "guest" | null;
export type EventPhase = "setup" | "live";

export type Game = {
  id: string;
  guestName: string;
  gameName: string;
  points: number | null;
  winner: Winner;
  revealed: boolean;
};

export type ScoreboardState = {
  phase: EventPhase;
  soundboardEnabled: boolean;
  nextGameCueDurationMs: number;
  nextGameCueHoldMs: number;
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
  openPoints: number;
  totalGames: number;
  totalPoints: number;
  winRateBachelor: number;
  winRateGuest: number;
};

export type SyncStatus = "connecting" | "live" | "offline";
