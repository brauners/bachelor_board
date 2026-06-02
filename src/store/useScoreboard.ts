import { useMemo } from "react";
import type { Game, ScoreboardState, Winner } from "../types/game";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { calculateStats, calculateTotals, getLeader, getNextOpenGame } from "../utils/scoring";
import { sampleGames } from "../utils/sampleGames";

type GameInput = Pick<Game, "guestName" | "gameName" | "points">;

export function useScoreboard() {
  const [state, setState] = useLocalStorageState();

  const totals = useMemo(() => calculateTotals(state.games), [state.games]);
  const stats = useMemo(() => calculateStats(state.games), [state.games]);
  const nextGame = useMemo(() => getNextOpenGame(state.games), [state.games]);
  const leader = useMemo(() => getLeader(totals), [totals]);
  const eventFinished = stats.totalGames > 0 && stats.openGames === 0;

  const updateGames = (updater: (games: Game[]) => Game[]) => {
    setState((current: ScoreboardState) => ({
      games: updater(current.games)
    }));
  };

  const addGame = (input: GameInput) => {
    updateGames((games) => [
      ...games,
      {
        id: crypto.randomUUID(),
        guestName: input.guestName,
        gameName: input.gameName,
        points: input.points,
        winner: null
      }
    ]);
  };

  const updateGame = (id: string, input: GameInput) => {
    updateGames((games) =>
      games.map((game) =>
        game.id === id
          ? {
              ...game,
              guestName: input.guestName,
              gameName: input.gameName,
              points: input.points
            }
          : game
      )
    );
  };

  const deleteGame = (id: string) => {
    updateGames((games) => games.filter((game) => game.id !== id));
  };

  const moveGame = (id: string, direction: "up" | "down") => {
    updateGames((games) => {
      const currentIndex = games.findIndex((game) => game.id === id);

      if (currentIndex === -1) {
        return games;
      }

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= games.length) {
        return games;
      }

      const nextGames = [...games];
      const [movedGame] = nextGames.splice(currentIndex, 1);
      if (!movedGame) {
        return games;
      }
      nextGames.splice(targetIndex, 0, movedGame);
      return nextGames;
    });
  };

  const setWinner = (id: string, winner: Exclude<Winner, null>) => {
    updateGames((games) =>
      games.map((game) => (game.id === id ? { ...game, winner } : game))
    );
  };

  const resetResult = (id: string) => {
    updateGames((games) =>
      games.map((game) => (game.id === id ? { ...game, winner: null } : game))
    );
  };

  const importState = (nextState: ScoreboardState) => {
    setState(nextState);
  };

  const resetAll = () => {
    setState({ games: sampleGames });
  };

  return {
    games: state.games,
    totals,
    stats,
    nextGame,
    leader,
    eventFinished,
    addGame,
    updateGame,
    deleteGame,
    moveGame,
    setWinner,
    resetResult,
    importState,
    resetAll
  };
}
