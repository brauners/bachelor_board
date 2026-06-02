import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminPanel } from "../components/AdminPanel";
import { CurrentGameCard } from "../components/CurrentGameCard";
import { GameList } from "../components/GameList";
import { ScorePanel } from "../components/ScorePanel";
import { StatsGrid } from "../components/StatsGrid";
import { useFullscreen } from "../hooks/useFullscreen";
import { useScoreboard } from "../store/useScoreboard";
import type { ScoreboardState } from "../types/game";
import { downloadState, parseImportedState } from "../utils/importExport";

export function HomePage() {
  const {
    games,
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
  } = useScoreboard();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [showAdmin, setShowAdmin] = useState(true);
  const confettiTriggeredRef = useRef(false);
  const winnerLabel = useMemo(() => {
    if (totals.bachelor === totals.guest) {
      return "Unentschieden";
    }

    return totals.bachelor > totals.guest ? "Marius gewinnt" : "Gaeste gewinnen";
  }, [totals]);

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
    if (window.confirm("Gesamte Veranstaltung wirklich zuruecksetzen?")) {
      resetAll();
      confettiTriggeredRef.current = false;
    }
  };

  const handleExport = () => {
    const state: ScoreboardState = { games };
    downloadState(state);
  };

  return (
    <div className="min-h-screen bg-stage-radial text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.5em] text-accent-gold">Schlag den Star Vibes</div>
            <h1 className="font-display text-5xl uppercase leading-none sm:text-6xl lg:text-7xl">
              Schlag den Marius
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAdmin((current) => !current)}
              className="rounded-full border border-white/15 px-4 py-2 text-sm uppercase tracking-[0.25em] text-white/80"
            >
              {showAdmin ? "Regie ausblenden" : "Regie einblenden"}
            </button>
          </div>
        </header>

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
              <StatsGrid stats={stats} totals={totals} />
            </div>
          </motion.div>
        </section>

        <GameList games={games} />

        {showAdmin ? (
          <AdminPanel
            games={games}
            onAddGame={addGame}
            onUpdateGame={updateGame}
            onDeleteGame={handleDeleteGame}
            onMoveGame={moveGame}
            onSetWinner={setWinner}
            onResetResult={resetResult}
            onExport={handleExport}
            onImport={handleImport}
            onResetAll={handleResetAll}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => {
              void toggleFullscreen();
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
