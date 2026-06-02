import { motion } from "framer-motion";
import type { Game } from "../types/game";

type CurrentGameCardProps = {
  game: Game | null;
};

export function CurrentGameCard({ game }: CurrentGameCardProps) {
  return (
    <motion.section
      layout
      className="rounded-[2rem] border border-white/10 bg-white/8 p-8 text-center shadow-neon backdrop-blur"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-sm uppercase tracking-[0.5em] text-accent-gold">Naechstes Duell</div>
      {game ? (
        <div className="mt-6 space-y-4">
          <div className="font-display text-5xl uppercase text-white sm:text-6xl">
            {game.guestName}
          </div>
          <div className="text-2xl uppercase tracking-[0.4em] text-white/50">gegen</div>
          <div className="font-display text-5xl uppercase text-accent-cyan sm:text-6xl">Marius</div>
          <div className="pt-4 text-3xl font-semibold text-white">{game.gameName}</div>
          <div className="text-lg uppercase tracking-[0.3em] text-white/65">
            {game.points} Punkte
          </div>
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
