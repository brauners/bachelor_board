import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Game } from "../types/game";

type GameDraft = {
  guestName: string;
  gameName: string;
  points: string;
};

type AdminPanelProps = {
  games: Game[];
  onAddGame: (draft: { guestName: string; gameName: string; points: number }) => void;
  onUpdateGame: (id: string, draft: { guestName: string; gameName: string; points: number }) => void;
  onDeleteGame: (id: string) => void;
  onMoveGame: (id: string, direction: "up" | "down") => void;
  onSetWinner: (id: string, winner: "bachelor" | "guest") => void;
  onResetResult: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onResetAll: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
};

const emptyDraft: GameDraft = {
  guestName: "",
  gameName: "",
  points: "1"
};

export function AdminPanel({
  games,
  onAddGame,
  onUpdateGame,
  onDeleteGame,
  onMoveGame,
  onSetWinner,
  onResetResult,
  onExport,
  onImport,
  onResetAll,
  isFullscreen,
  onToggleFullscreen
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
      points: Number(draft.points)
    };

    if (!payload.guestName || !payload.gameName) {
      setErrorMessage("Gastname und Spielname sind erforderlich.");
      return;
    }

    if (!Number.isInteger(payload.points) || payload.points < 1) {
      setErrorMessage("Bitte einen gueltigen Punktewert ab 1 eingeben.");
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
      points: String(game.points)
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
          <p className="text-white/60">Spiele pflegen, Punkte vergeben und Event steuern.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="rounded-full border border-white/15 px-4 py-2 text-sm uppercase tracking-[0.2em] text-white transition hover:border-accent-cyan hover:text-accent-cyan"
          >
            {isFullscreen ? "Vollbild aus" : "Vollbild"}
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
            value={draft.points}
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            onChange={(event) => {
              setDraft((current) => ({ ...current, points: event.target.value }));
              setErrorMessage(null);
            }}
            placeholder="Punkte"
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none ring-0 transition focus:border-accent-cyan"
          />
          <button
            type="submit"
            className="rounded-xl bg-accent-cyan px-4 py-3 font-semibold uppercase tracking-[0.2em] text-stage-950"
          >
            {editingId ? "Spiel speichern" : "Spiel hinzufuegen"}
          </button>
        </div>
        {errorMessage ? (
          <p className="mt-3 text-sm text-accent-coral">{errorMessage}</p>
        ) : null}
      </form>

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
                {game.gameName} · {game.points} Punkte
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSetWinner(game.id, "bachelor")}
                  className="rounded-full bg-accent-cyan px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stage-950"
                >
                  Marius gewinnt
                </button>
                <button
                  type="button"
                  onClick={() => onSetWinner(game.id, "guest")}
                  className="rounded-full bg-accent-coral px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                >
                  Gast gewinnt
                </button>
                <button
                  type="button"
                  onClick={() => onResetResult(game.id)}
                  className="rounded-full border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/75"
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
