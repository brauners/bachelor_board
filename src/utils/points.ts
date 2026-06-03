import type { Game } from "../types/game";

const FIXED_FIFTEEN_POOL = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 8];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swapIndex] as T;
    next[swapIndex] = current as T;
  }

  return next;
}

export function generatePointsPool(gameCount: number): number[] {
  if (gameCount <= 0) {
    return [];
  }

  if (gameCount === FIXED_FIFTEEN_POOL.length) {
    return [...FIXED_FIFTEEN_POOL];
  }

  const rankValues = [1, 2, 3, 4, 5, 6, 8, 10, 12];
  const pool: number[] = [];

  for (let index = 0; index < gameCount; index += 1) {
    const progress = gameCount === 1 ? 1 : index / (gameCount - 1);
    const curved = Math.pow(progress, 1.8);
    const scaledIndex = Math.round(curved * (rankValues.length - 1));
    pool.push(rankValues[scaledIndex] ?? rankValues[rankValues.length - 1] ?? 1);
  }

  pool.sort((left, right) => left - right);

  for (let index = 1; index < pool.length; index += 1) {
    const previous = pool[index - 1] ?? 1;
    const current = pool[index] ?? previous;
    if (current > previous + 2) {
      pool[index] = previous + 2;
    }
  }

  return pool;
}

export function assignPointsToGames(games: Game[]): Game[] {
  const pointPool = shuffle(generatePointsPool(games.length));

  return games.map((game, index) => ({
    ...game,
    points: pointPool[index] ?? null
  }));
}

export function assignPointsToPendingGames(games: Game[]): Game[] {
  const pendingGames = games.filter((game) => game.points === null);

  if (pendingGames.length === 0) {
    return games;
  }

  const pendingPoints = shuffle(generatePointsPool(pendingGames.length));
  let pendingIndex = 0;

  return games.map((game) => {
    if (game.points !== null) {
      return game;
    }

    const points = pendingPoints[pendingIndex] ?? null;
    pendingIndex += 1;

    return {
      ...game,
      points
    };
  });
}
