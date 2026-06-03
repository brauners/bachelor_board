import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminPanel } from "../components/AdminPanel";
import { CurrentGameCard } from "../components/CurrentGameCard";
import { GameList } from "../components/GameList";
import { GuestQrCode } from "../components/GuestQrCode";
import { ScorePanel } from "../components/ScorePanel";
import { StatsGrid } from "../components/StatsGrid";
import { useFullscreen } from "../hooks/useFullscreen";
import { useScoreboard } from "../store/useScoreboard";
import type { ScoreboardState } from "../types/game";
import { downloadState, parseImportedState } from "../utils/importExport";

export function HomePage() {
  const {
    phase,
    games,
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
  } = useScoreboard();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [showAdmin, setShowAdmin] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [loginPin, setLoginPin] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const confettiTriggeredRef = useRef(false);

  const winnerLabel = useMemo(() => {
    if (totals.bachelor === totals.guest) {
      return "Unentschieden";
    }

    return totals.bachelor > totals.guest ? "Marius gewinnt" : "Gaeste gewinnen";
  }, [totals]);

  const guestUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const url = new URL(window.location.href);
    url.search = "";
    return url.toString();
  }, []);

  const isLocalOnlyAddress = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    );
  }, []);

  useEffect(() => {
    if (!eventFinished) {
      confettiTriggeredRef.current = false;
      return;
    }

    if (confettiTriggeredRef.current) {
      return;
    }

    confettiTriggeredRef.current = true;
    void confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.55 }
    });
  }, [eventFinished]);

  const handleImport = async (file: File) => {
    const text = await file.text();

    try {
      const nextState = parseImportedState(text);
      importState(nextState);
      confettiTriggeredRef.current = false;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import fehlgeschlagen";
      window.alert(message);
    }
  };

  const handleDeleteGame = (id: string) => {
    if (window.confirm("Spiel wirklich loeschen?")) {
      deleteGame(id);
    }
  };

  const handleResetAll = () => {
    if (
      window.confirm(
        "Gesamte Veranstaltung wirklich zuruecksetzen? Reihenfolge bleibt erhalten, Punkte und Ergebnisse werden neu vorbereitet."
      )
    ) {
      resetAll();
      confettiTriggeredRef.current = false;
    }
  };

  const handleExport = () => {
    const state: ScoreboardState = { phase, games };
    downloadState(state);
  };

  const handleCopyGuestLink = async () => {
    try {
      await navigator.clipboard.writeText(guestUrl);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      window.alert("Link konnte nicht kopiert werden.");
    }
  };

  const handleLogin = async () => {
    const success = await login(loginPin);
    if (success) {
      setLoginPin("");
      setShowLogin(false);
    }
  };

  const syncLabel =
    syncStatus === "live"
      ? "Live verbunden"
      : syncStatus === "connecting"
        ? "Verbinde..."
        : "Offline";

  const topButtonClass =
    "min-w-[11rem] rounded-full border border-white/15 bg-stage-900/70 px-4 py-2 text-sm uppercase tracking-[0.25em] text-white/80 backdrop-blur-sm transition-colors hover:border-accent-cyan hover:text-accent-cyan";

  return (
    <div className="min-h-screen bg-stage-radial text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.5em] text-accent-gold">
              Live-Scoreboard fuer alle
            </div>
            <h1 className="font-display text-5xl uppercase leading-none sm:text-6xl lg:text-7xl">
              Schlag den Marius
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void toggleFullscreen();
              }}
              className={topButtonClass}
            >
              {isFullscreen ? "Vollbild aus" : "Vollbild"}
            </button>
            <button
              type="button"
              onClick={() => setShowSharePanel((current) => !current)}
              className={topButtonClass}
            >
              {showSharePanel ? "Info ausblenden" : "Handy-Link & QR"}
            </button>
            {!isAdminAuthenticated ? (
              <button
                type="button"
                onClick={() => setShowLogin((current) => !current)}
                className={topButtonClass}
              >
                {showLogin ? "Login schliessen" : "Regie Login"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowAdmin((current) => !current)}
                  className={topButtonClass}
                >
                  {showAdmin ? "Regie ausblenden" : "Regie einblenden"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void logout();
                  }}
                  className={topButtonClass}
                >
                  Abmelden
                </button>
              </>
            )}
          </div>
        </header>

        {showSharePanel || showLogin || isAdminAuthenticated ? (
          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            {showSharePanel ? (
              <motion.div
                layout
                className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-neon backdrop-blur"
              >
                <div className="text-sm uppercase tracking-[0.4em] text-white/50">Handy-Link & QR</div>
                <div className="mt-3 text-lg text-white">
                  Dieselbe Landingpage auf dem Handy oeffnen und der Spielstand aktualisiert sich live.
                </div>
                <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="break-all rounded-2xl border border-white/10 bg-stage-900/80 px-4 py-4 font-mono text-sm text-accent-cyan lg:flex-1">
                    {guestUrl}
                  </div>
                  <GuestQrCode url={guestUrl} />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      void handleCopyGuestLink();
                    }}
                    className="rounded-full bg-accent-cyan px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-stage-950"
                  >
                    {copyState === "copied" ? "Kopiert" : "Link kopieren"}
                  </button>
                </div>
                {isLocalOnlyAddress ? (
                  <p className="mt-4 text-sm text-accent-gold">
                    Fuer andere Geraete im WLAN musst du die App ueber die lokale IP deines Laptops
                    aufrufen, nicht ueber localhost.
                  </p>
                ) : null}
              </motion.div>
            ) : (
              <div />
            )}

            <motion.div
              layout
              className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-neon backdrop-blur"
            >
              <div className="text-sm uppercase tracking-[0.4em] text-white/50">Status</div>
            <div className="mt-3 font-display text-4xl uppercase text-white">{syncLabel}</div>
            <div className="mt-3 text-white/65">
              {syncError ?? "Regie und Gaeste sehen denselben Live-Spielstand."}
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-stage-900/70 px-4 py-3 text-sm text-white/70">
              <span className="font-semibold text-white">
                {phase === "setup" ? "Setup-Modus" : "Live-Modus"}
              </span>
              {" · "}
              {phase === "setup"
                ? "Punkte werden erst beim Event-Start sichtbar."
                : unassignedGames > 0
                  ? `${unassignedGames} neue Spiele haben noch keine Punkte.`
                  : "Alle Punktwerte sind fest zugewiesen."}
            </div>

              {!isAdminAuthenticated && showLogin ? (
                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-stage-900/80 p-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/45">Regie Login</div>
                  <input
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={loginPin}
                    onChange={(event) => setLoginPin(event.target.value)}
                    placeholder="Admin-PIN"
                    className="mt-3 w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-base text-stage-950 caret-stage-950 outline-none transition focus:border-accent-cyan"
                  />
                  {authError ? (
                    <div className="mt-3 text-sm text-accent-coral">{authError}</div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      void handleLogin();
                    }}
                    disabled={authPending || !loginPin.trim()}
                    className="mt-4 rounded-full bg-accent-gold px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-stage-950 disabled:opacity-50"
                  >
                    {authPending ? "Pruefe..." : "Als Regie anmelden"}
                  </button>
                </div>
              ) : null}

              {isAdminAuthenticated ? (
                <div className="mt-6 rounded-[1.5rem] border border-accent-lime/30 bg-accent-lime/10 p-4 text-sm text-accent-lime">
                  Regie ist eingeloggt. Du kannst die Spiele unten verwalten.
                </div>
              ) : null}
            </motion.div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-2">
          <ScorePanel
            label="Marius"
            score={totals.bachelor}
            accent="#42d6ff"
            active={leader === "bachelor"}
          />
          <ScorePanel
            label="Gaeste"
            score={totals.guest}
            accent="#ff6b6b"
            active={leader === "guest"}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <CurrentGameCard game={nextGame} />
          <motion.div
            layout
            className="rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-neon backdrop-blur"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-sm uppercase tracking-[0.4em] text-white/50">Status</div>
            <div className="mt-4 font-display text-4xl uppercase text-white sm:text-5xl">
              {eventFinished ? winnerLabel : "Show laeuft"}
            </div>
            <div className="mt-3 text-white/65">
              {eventFinished
                ? "Alle Spiele sind abgeschlossen. Zeit fuer die Siegerehrung."
                : `${stats.openGames} Spiele sind noch offen.`}
            </div>
            <div className="mt-8">
              <StatsGrid stats={stats} />
            </div>
          </motion.div>
        </section>

        <GameList games={games} />

        {isAdminAuthenticated && showAdmin ? (
          <AdminPanel
            phase={phase}
            games={games}
            unassignedGames={unassignedGames}
            canStartEvent={canStartEvent}
            canAssignPendingPoints={canAssignPendingPoints}
            onAddGame={addGame}
            onUpdateGame={updateGame}
            onDeleteGame={handleDeleteGame}
            onMoveGame={moveGame}
            onShuffleGames={shuffleGames}
            onSetWinner={setWinner}
            onResetResult={resetResult}
            onExport={handleExport}
            onImport={handleImport}
            onResetAll={handleResetAll}
            onStartEvent={() => {
              startEvent();
              confettiTriggeredRef.current = false;
            }}
            onAssignPendingPoints={assignPendingPoints}
          />
        ) : null}
      </div>
    </div>
  );
}
