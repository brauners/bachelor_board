import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Game, ScoreboardState, SyncStatus, Winner } from "../types/game";
import { createId } from "../utils/id";
import { assignPointsToPendingGames } from "../utils/points";
import { calculateStats, calculateTotals, getLeader, getNextOpenGame } from "../utils/scoring";
import { normalizeState } from "../utils/state";
import { loadState, saveState } from "../utils/storage";

type GameInput = Pick<Game, "guestName" | "gameName" | "points">;
type SyncDiagnostics = {
  clockOffsetMs: number | null;
  rttMs: number | null;
  updatedAt: number | null;
};

const SESSION_STORAGE_KEY = "bachelor-board-admin-token";
const REALTIME_PORT = import.meta.env.VITE_REALTIME_PORT ?? "8787";
const SERVER_TIME_HEADER = "X-Server-Time";

function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return `http://127.0.0.1:${REALTIME_PORT}`;
  }

  return `${window.location.protocol}//${window.location.hostname}:${REALTIME_PORT}`;
}

function getWebSocketUrl() {
  if (typeof window === "undefined") {
    return `ws://127.0.0.1:${REALTIME_PORT}/ws`;
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.hostname}:${REALTIME_PORT}/ws`;
}

export function useScoreboard() {
  const [state, setState] = useState<ScoreboardState>(() => loadState());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("connecting");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authPending, setAuthPending] = useState(false);
  const [syncDiagnostics, setSyncDiagnostics] = useState<SyncDiagnostics>({
    clockOffsetMs: null,
    rttMs: null,
    updatedAt: null
  });
  const reconnectTimerRef = useRef<number | null>(null);
  const offlineTimerRef = useRef<number | null>(null);
  const hasConnectedRef = useRef(false);
  const tokenRef = useRef(adminToken);
  const changeOriginRef = useRef<"idle" | "local" | "remote">("idle");
  const stateRef = useRef(state);
  const serverClockOffsetRef = useRef(0);
  const apiBaseUrl = getApiBaseUrl();

  const totals = useMemo(() => calculateTotals(state.games), [state.games]);
  const stats = useMemo(() => calculateStats(state.games), [state.games]);
  const nextGame = useMemo(() => getNextOpenGame(state.games), [state.games]);
  const leader = useMemo(() => getLeader(totals), [totals]);
  const eventFinished = stats.totalGames > 0 && stats.openGames === 0;
  const isAdminAuthenticated = adminToken.trim().length > 0;
  const unassignedGames = useMemo(
    () => state.games.filter((game) => game.points === null).length,
    [state.games]
  );
  const canStartEvent = state.phase === "setup" && state.games.length > 0;
  const canAssignPendingPoints = state.phase === "live" && unassignedGames > 0;

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    tokenRef.current = adminToken;
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, adminToken);
  }, [adminToken]);

  const pushState = useCallback(
    async (nextState: ScoreboardState) => {
      try {
        const requestStartedAt = Date.now();
        const response = await fetch(`${apiBaseUrl}/api/state`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenRef.current}`
          },
          body: JSON.stringify(nextState)
        });
        const responseReceivedAt = Date.now();

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Admin-Session ist abgelaufen. Bitte neu einloggen.");
          }

          throw new Error("Server konnte den Spielstand nicht speichern.");
        }

        const serverTimeHeader = response.headers.get(SERVER_TIME_HEADER);
        if (serverTimeHeader) {
          const serverTime = Number(serverTimeHeader);
          if (Number.isFinite(serverTime)) {
            const rttMs = responseReceivedAt - requestStartedAt;
            serverClockOffsetRef.current = serverTime - (requestStartedAt + responseReceivedAt) / 2;
            setSyncDiagnostics({
              clockOffsetMs: serverClockOffsetRef.current,
              rttMs,
              updatedAt: responseReceivedAt
            });
          }
        }

        setSyncError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Synchronisierung fehlgeschlagen.";
        setSyncError(message);
        if (message === "Admin-Session ist abgelaufen. Bitte neu einloggen.") {
          setAdminToken("");
          setAuthError(message);
        } else {
          setSyncStatus("offline");
        }
      }
    },
    [apiBaseUrl]
  );

  const pullState = useCallback(async () => {
    const requestStartedAt = Date.now();
    const response = await fetch(`${apiBaseUrl}/api/state`);
    const responseReceivedAt = Date.now();

    if (!response.ok) {
      throw new Error("Serverzustand konnte nicht geladen werden.");
    }

    const serverTimeHeader = response.headers.get(SERVER_TIME_HEADER);
    if (serverTimeHeader) {
      const serverTime = Number(serverTimeHeader);
      if (Number.isFinite(serverTime)) {
        const rttMs = responseReceivedAt - requestStartedAt;
        serverClockOffsetRef.current = serverTime - (requestStartedAt + responseReceivedAt) / 2;
        setSyncDiagnostics({
          clockOffsetMs: serverClockOffsetRef.current,
          rttMs,
          updatedAt: responseReceivedAt
        });
      }
    }

    const nextState = normalizeState((await response.json()) as ScoreboardState);

    if (!Array.isArray(nextState.games)) {
      throw new Error("Serverzustand ist ungueltig.");
    }

    return nextState;
  }, [apiBaseUrl]);

  const verifySession = useCallback(async () => {
    if (!tokenRef.current) {
      return false;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/session`, {
        headers: {
          Authorization: `Bearer ${tokenRef.current}`
        }
      });

      if (!response.ok) {
        return false;
      }

      const payload = (await response.json()) as { authenticated?: boolean };
      return Boolean(payload.authenticated);
    } catch {
      return false;
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    saveState(state);

    if (changeOriginRef.current === "local") {
      void pushState(state);
    }

    changeOriginRef.current = "idle";
  }, [pushState, state]);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const nextState = await pullState();
        if (!cancelled) {
          changeOriginRef.current = "remote";
          setState(nextState);
          setSyncError(null);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Serverzustand konnte nicht geladen werden.";
          setSyncError(message);
        }
      }

      if (!cancelled && tokenRef.current) {
        const sessionValid = await verifySession();
        if (!cancelled && !sessionValid) {
          setAdminToken("");
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, [pullState, verifySession]);

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      try {
        const nextState = await pullState();
        if (JSON.stringify(stateRef.current) !== JSON.stringify(nextState)) {
          changeOriginRef.current = "remote";
          setState(nextState);
        }
        setSyncError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Serverzustand konnte nicht geladen werden.";
        setSyncError(message);
      }
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pullState]);

  useEffect(() => {
    let active = true;
    let socket: WebSocket | null = null;

    const connect = () => {
      if (!active) {
        return;
      }

      setSyncStatus(hasConnectedRef.current ? "live" : "connecting");
      socket = new WebSocket(getWebSocketUrl());

      socket.addEventListener("open", () => {
        if (!active) {
          return;
        }

        hasConnectedRef.current = true;
        if (offlineTimerRef.current !== null) {
          window.clearTimeout(offlineTimerRef.current);
          offlineTimerRef.current = null;
        }
        setSyncStatus("live");
        setSyncError(null);
      });

      socket.addEventListener("message", (event) => {
        if (!active) {
          return;
        }

        try {
          const payload = JSON.parse(event.data) as {
            type?: string;
            state?: ScoreboardState;
            playAt?: number;
          };

          if (payload.type === "state" && payload.state && Array.isArray(payload.state.games)) {
            changeOriginRef.current = "remote";
            setState(normalizeState(payload.state));
          }

          if (payload.type === "victory_audio" && typeof payload.playAt === "number") {
            const delayMs = Math.max(
              0,
              payload.playAt - (Date.now() + serverClockOffsetRef.current)
            );

            window.dispatchEvent(
              new CustomEvent("bachelor-board:victory-audio", {
                detail: {
                  delayMs
                }
              })
            );
          }
        } catch {
          setSyncError("Echtzeitdaten konnten nicht verarbeitet werden.");
        }
      });

      socket.addEventListener("close", () => {
        if (!active) {
          return;
        }

        if (offlineTimerRef.current !== null) {
          window.clearTimeout(offlineTimerRef.current);
        }
        offlineTimerRef.current = window.setTimeout(() => {
          if (active) {
            setSyncStatus("offline");
          }
        }, 3500);
        reconnectTimerRef.current = window.setTimeout(connect, 2000);
      });

      socket.addEventListener("error", () => {
        socket?.close();
      });
    };

    connect();

    return () => {
      active = false;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      if (offlineTimerRef.current !== null) {
        window.clearTimeout(offlineTimerRef.current);
      }
      socket?.close();
    };
  }, []);

  const login = useCallback(
    async (pin: string) => {
      setAuthPending(true);
      setAuthError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ pin })
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Login fehlgeschlagen.");
        }

        const payload = (await response.json()) as { token: string };
        setAdminToken(payload.token);
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login fehlgeschlagen.";
        setAuthError(message);
        return false;
      } finally {
        setAuthPending(false);
      }
    },
    [apiBaseUrl]
  );

  const logout = useCallback(async () => {
    if (tokenRef.current) {
      try {
        await fetch(`${apiBaseUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        });
      } catch {
        // Ignore logout transport failures.
      }
    }

    setAdminToken("");
    setAuthError(null);
  }, [apiBaseUrl]);

  const updateGames = (updater: (games: Game[]) => Game[]) => {
    changeOriginRef.current = "local";
    setState((current) => ({
      ...current,
      games: updater(current.games)
    }));
  };

  const addGame = (input: GameInput) => {
    updateGames((games) => [
      ...games,
      {
        id: createId(),
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

  const shuffleGames = () => {
    updateGames((games) => {
      const nextGames = [...games];

      for (let index = nextGames.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        const current = nextGames[index];
        nextGames[index] = nextGames[swapIndex] as Game;
        nextGames[swapIndex] = current as Game;
      }

      return nextGames;
    });
  };

  const setWinner = (id: string, winner: Exclude<Winner, null>) => {
    updateGames((games) =>
      games.map((game) =>
        game.id === id && game.points !== null ? { ...game, winner } : game
      )
    );
  };

  const resetResult = (id: string) => {
    updateGames((games) =>
      games.map((game) => (game.id === id ? { ...game, winner: null } : game))
    );
  };

  const importState = (nextState: ScoreboardState) => {
    changeOriginRef.current = "local";
    setState({
      phase: nextState.phase,
      games: nextState.games
    });
  };

  const resetAll = () => {
    changeOriginRef.current = "local";
    setState((current) => ({
      phase: "setup",
      games: current.games.map((game) => ({
        ...game,
        points: null,
        winner: null
      }))
    }));
  };

  const startEvent = () => {
    changeOriginRef.current = "local";
    setState((current) => ({
      phase: "live",
      games: assignPointsToPendingGames(
        current.games.map((game) => ({
          ...game,
          winner: null
        }))
      )
    }));
  };

  const assignPendingPoints = () => {
    changeOriginRef.current = "local";
    setState((current) => ({
      ...current,
      games: assignPointsToPendingGames(current.games)
    }));
  };

  return {
    phase: state.phase,
    games: state.games,
    totals,
    stats,
    nextGame,
    leader,
    eventFinished,
    syncStatus,
    syncError,
    isAdminAuthenticated,
    authError,
    authPending,
    syncDiagnostics,
    unassignedGames,
    canStartEvent,
    canAssignPendingPoints,
    login,
    logout,
    addGame,
    updateGame,
    deleteGame,
    moveGame,
    shuffleGames,
    setWinner,
    resetResult,
    importState,
    resetAll,
    startEvent,
    assignPendingPoints
  };
}
