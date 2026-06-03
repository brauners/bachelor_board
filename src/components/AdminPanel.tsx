import type { FormEvent } from "react";
import { useRef, useState } from "react";
import type { Game } from "../types/game";

type GameDraft = {
  guestName: string;
  gameName: string;
  points: string;
};

type AdminPanelProps = {
  phase: "setup" | "live";
  soundboardEnabled: boolean;
  games: Game[];
  unassignedGames: number;
  canStartEvent: boolean;
  canAssignPendingPoints: boolean;
  onAddGame: (draft: { guestName: string; gameName: string; points: number | null }) => void;
  onUpdateGame: (id: string, draft: { guestName: string; gameName: string; points: number | null }) => void;
  onDeleteGame: (id: string) => void;
  onMoveGame: (id: string, direction: "up" | "down") => void;
  onShuffleGames: () => void;
  onSetWinner: (id: string, winner: "bachelor" | "guest") => void;
  onResetResult: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onResetAll: () => void;
  onStartEvent: () => void;
  onAssignPendingPoints: () => void;
  onSetSoundboardEnabled: (enabled: boolean) => void;
};

const emptyDraft: GameDraft = {
  guestName: "",
  gameName: "",
  points: ""
};

export function AdminPanel({
  phase,
  soundboardEnabled,
  games,
  unassignedGames,
  canStartEvent,
  canAssignPendingPoints,
  onAddGame,
  onUpdateGame,
  onDeleteGame,
  onMoveGame,
  onShuffleGames,
  onSetWinner,
  onResetResult,
  onExport,
  onImport,
  onResetAll,
  onStartEvent,
  onAssignPendingPoints,
  onSetSoundboardEnabled
}: AdminPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [draft, setDraft] = useState<GameDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const payload = {
      guestName: draft.guestName.trim(),
      gameName: draft.gameName.trim(),
      points: draft.points.trim() === "" ? null : Number(draft.points)
    };

    if (!payload.guestName || !payload.gameName) {
      setErrorMessage("Gastname und Spielname sind erforderlich.");
      return;
    }

    if (payload.points !== null && (!Number.isInteger(payload.points) || payload.points < 1)) {
      setErrorMessage("Punkte muessen leer bleiben oder als ganze Zahl ab 1 gesetzt werden.");
      return;
    }

    if (editingId) {
      onUpdateGame(editingId, payload);
      setEditingId(null);
    } else {
      onAddGame(payload);
    }

    setDraft(emptyDraft);
    setErrorMessage(null);
  };

  const startEdit = (game: Game) => {
    setEditingId(game.id);
    setDraft({
      guestName: game.guestName,
      gameName: game.gameName,
      points: game.points === null ? "" : String(game.points)
    });
    setErrorMessage(null);
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="relative z-20 rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-neon backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-3xl uppercase text-white">Regie</h2>
          <p className="text-white/60">Spiele pflegen, Reihenfolge steuern und Punkte auslosen.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onStartEvent}
            disabled={!canStartEvent}
            className="rounded-full bg-accent-cyan px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-stage-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Event starten
          </button>
          <button
            type="button"
            onClick={onAssignPendingPoints}
            disabled={!canAssignPendingPoints}
            className="rounded-full border border-accent-gold/50 bg-accent-gold/10 px-4 py-2 text-sm uppercase tracking-[0.2em] text-accent-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Neue Spiele bepunkten
          </button>
          <button
            type="button"
            onClick={onShuffleGames}
            disabled={games.length < 2}
            className="rounded-full border border-white/15 px-4 py-2 text-sm uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reihenfolge mischen
          </button>
          <button
            type="button"
            onClick={() => onSetSoundboardEnabled(!soundboardEnabled)}
            className={[
              "rounded-full px-4 py-2 text-sm uppercase tracking-[0.2em]",
              soundboardEnabled
                ? "border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan"
                : "border border-accent-coral/40 bg-accent-coral/10 text-accent-coral"
            ].join(" ")}
          >
            {soundboardEnabled ? "Soundboard aktiv" : "Soundboard gesperrt"}
          </button>
          <button
            type="button"
            onClick={onExport}
            className="rounded-full bg-accent-gold px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-stage-950"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={triggerImport}
            className="rounded-full border border-white/15 px-4 py-2 text-sm uppercase tracking-[0.2em] text-white"
          >
            Import JSON
          </button>
          <button
            type="button"
            onClick={onResetAll}
            className="rounded-full border border-accent-coral/40 bg-accent-coral/10 px-4 py-2 text-sm uppercase tracking-[0.2em] text-accent-coral"
          >
            Event reset
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onImport(file);
              }
              event.target.value = "";
            }}
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 mt-6 rounded-[1.5rem] border border-white/10 bg-stage-900/70 p-4"
      >
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="text"
            autoComplete="off"
            value={draft.guestName}
            onChange={(event) => {
              setDraft((current) => ({ ...current, guestName: event.target.value }));
              setErrorMessage(null);
            }}
            placeholder="Gastname"
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none ring-0 transition focus:border-accent-cyan"
          />
          <input
            type="text"
            autoComplete="off"
            value={draft.gameName}
            onChange={(event) => {
              setDraft((current) => ({ ...current, gameName: event.target.value }));
              setErrorMessage(null);
            }}
            placeholder="Spielname"
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none ring-0 transition focus:border-accent-cyan"
          />
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={draft.points}
            onChange={(event) => {
              setDraft((current) => ({ ...current, points: event.target.value }));
              setErrorMessage(null);
            }}
            placeholder="Punkte optional"
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none ring-0 transition focus:border-accent-cyan"
          />
          <button
            type="submit"
            className="rounded-xl bg-accent-cyan px-4 py-3 font-semibold uppercase tracking-[0.2em] text-stage-950"
          >
            {editingId ? "Spiel speichern" : "Spiel hinzufuegen"}
          </button>
        </div>
        <p className="mt-3 text-sm text-white/50">
          {phase === "setup"
            ? "Punkte werden standardmaessig beim Event-Start zufaellig verteilt. Du kannst sie hier aber auch manuell setzen."
            : "Neue Spiele bleiben zunaechst ohne Punkte, bis du sie explizit bepunkten laesst. Manuelle Punkte sind jederzeit moeglich."}
        </p>
        {errorMessage ? (
          <p className="mt-3 text-sm text-accent-coral">{errorMessage}</p>
        ) : null}
      </form>

      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-stage-900/60 p-4 text-sm text-white/70">
        <div className="text-xs uppercase tracking-[0.3em] text-white/45">Event-Modus</div>
        <div className="mt-2 font-display text-2xl uppercase text-white">
          {phase === "setup" ? "Setup" : "Live"}
        </div>
        <div className="mt-2">
          {phase === "setup"
            ? "Reihenfolge und Spiele koennen frei bearbeitet werden. Beim Start werden alle Punkte einmalig ausgelost."
            : unassignedGames > 0
              ? `${unassignedGames} neue Spiele warten noch auf eine Punktezuweisung.`
              : "Alle sichtbaren Punkte sind fix und bleiben auch bei Umordnungen erhalten."}
        </div>
        <div className="mt-2">
          Soundboard: {soundboardEnabled ? "freigegeben" : "gesperrt"}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {games.map((game, index) => (
          <div
            key={game.id}
            className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-stage-900/70 p-4 xl:grid-cols-[1fr_auto]"
          >
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">Spiel {index + 1}</div>
              <div className="mt-1 font-display text-3xl uppercase text-white">
                {game.guestName} vs Marius
              </div>
              <div className="mt-1 text-white/65">
                {game.gameName} ·{" "}
                {game.points === null ? "Punkte noch offen" : `${game.points} Punkte`}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSetWinner(game.id, "bachelor")}
                  disabled={game.points === null}
                  aria-pressed={game.winner === "bachelor"}
                  className={[
                    "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-35",
                    game.winner === "bachelor"
                      ? "border-2 border-accent-cyan bg-accent-cyan text-stage-950"
                      : "border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan"
                  ].join(" ")}
                >
                  {game.winner === "bachelor" ? "✓ Marius gewinnt" : "Marius gewinnt"}
                </button>
                <button
                  type="button"
                  onClick={() => onSetWinner(game.id, "guest")}
                  disabled={game.points === null}
                  aria-pressed={game.winner === "guest"}
                  className={[
                    "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-35",
                    game.winner === "guest"
                      ? "border-2 border-accent-coral bg-accent-coral text-white"
                      : "border border-accent-coral/30 bg-accent-coral/10 text-accent-coral"
                  ].join(" ")}
                >
                  {game.winner === "guest" ? "✓ Gast gewinnt" : "Gast gewinnt"}
                </button>
                <button
                  type="button"
                  onClick={() => onResetResult(game.id)}
                  disabled={game.winner === null}
                  className={[
                    "rounded-full px-3 py-2 text-xs uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-35",
                    game.winner === null
                      ? "border border-white/10 text-white/45"
                      : "border border-white/20 bg-white/10 text-white/80"
                  ].join(" ")}
                >
                  Ergebnis zuruecksetzen
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-2 xl:justify-end">
              <button
                type="button"
                onClick={() => startEdit(game)}
                className="rounded-full border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white"
              >
                Bearbeiten
              </button>
              <button
                type="button"
                onClick={() => onMoveGame(game.id, "up")}
                disabled={index === 0}
                className="rounded-full border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                Nach oben
              </button>
              <button
                type="button"
                onClick={() => onMoveGame(game.id, "down")}
                disabled={index === games.length - 1}
                className="rounded-full border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                Nach unten
              </button>
              <button
                type="button"
                onClick={() => onDeleteGame(game.id)}
                className="rounded-full border border-accent-coral/40 bg-accent-coral/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-accent-coral"
              >
                Loeschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
