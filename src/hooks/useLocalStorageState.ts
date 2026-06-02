import { useEffect, useState } from "react";
import type { ScoreboardState } from "../types/game";
import { loadState, saveState } from "../utils/storage";

export function useLocalStorageState() {
  const [state, setState] = useState<ScoreboardState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  return [state, setState] as const;
}
