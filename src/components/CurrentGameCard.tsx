import { motion } from "framer-motion";
import type { Game } from "../types/game";

type CurrentGameCardProps = {
  game: Game | null;
};

export function CurrentGameCard({ game }: CurrentGameCardProps) {
  const isRevealed = game?.revealed ?? false;

  return (
    <motion.section
      layout
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-8 text-center shadow-neon backdrop-blur"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-sm uppercase tracking-[0.5em] text-accent-gold">Naechstes Duell</div>
      {game ? (
        <div className="relative mt-6">
          <div
            className={[
              "space-y-4 transition duration-500",
              isRevealed ? "blur-0 opacity-100" : "blur-xl opacity-65 select-none"
            ].join(" ")}
          >
          <div className="font-display text-5xl uppercase text-white sm:text-6xl">
            {game.guestName}
          </div>
          <div className="text-2xl uppercase tracking-[0.4em] text-white/50">gegen</div>
          <div className="font-display text-5xl uppercase text-accent-cyan sm:text-6xl">Marius</div>
          <div className="pt-4 text-3xl font-semibold text-white">{game.gameName}</div>
          {game.points !== null ? (
            <div className="rounded-2xl border border-accent-gold/40 bg-accent-gold/10 px-5 py-4">
              <div className="text-sm uppercase tracking-[0.35em] text-accent-gold/80">
                Dieses Spiel ist
              </div>
              <div className="mt-2 font-display text-5xl uppercase text-accent-gold sm:text-6xl">
                {game.points} Punkte
              </div>
              <div className="mt-1 text-sm uppercase tracking-[0.25em] text-white/60">
                wert
              </div>
            </div>
          ) : (
            <div className="text-lg uppercase tracking-[0.3em] text-white/65">
              Punkte werden vor Showstart ausgelost
            </div>
          )}
          </div>
          {!isRevealed ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-[1.75rem] border border-accent-gold/35 bg-stage-950/82 px-6 py-5 shadow-neon backdrop-blur-md">
                <div className="text-sm uppercase tracking-[0.45em] text-accent-gold/80">
                  Noch nicht revealed
                </div>
                <div className="mt-3 font-display text-3xl uppercase text-white sm:text-4xl">
                  Intro in der Regie starten
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <div className="font-display text-5xl uppercase text-accent-lime sm:text-6xl">
            Finale beendet
          </div>
          <div className="text-xl text-white/70">Alle Duelle wurden entschieden.</div>
        </div>
      )}
    </motion.section>
  );
}
