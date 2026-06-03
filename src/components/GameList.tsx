import { motion } from "framer-motion";
import type { Game } from "../types/game";
import { GameStatusBadge } from "./GameStatusBadge";

type GameListProps = {
  games: Game[];
};

export function GameList({ games }: GameListProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-neon backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-3xl uppercase text-white">Alle Spiele</h2>
        <div className="text-sm uppercase tracking-[0.3em] text-white/45">{games.length} Duelle</div>
      </div>
      <div className="grid gap-3">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className={[
              "grid gap-3 rounded-2xl border px-4 py-4 md:grid-cols-[auto_1fr_auto_auto]",
              game.winner === "bachelor"
                ? "border-accent-cyan/30 bg-accent-cyan/10"
                : game.winner === "guest"
                  ? "border-accent-coral/30 bg-accent-coral/10"
                  : "border-white/10 bg-stage-900/80"
            ].join(" ")}
          >
            <div className="font-display text-3xl text-accent-gold">
              {game.points === null ? "?" : game.points}
            </div>
            <div>
              <div className="font-semibold text-white">{game.guestName} vs Marius</div>
              <div className="text-white/60">{game.gameName}</div>
            </div>
            <div className="text-sm uppercase tracking-[0.25em] text-white/50">
              Spiel {index + 1}
            </div>
            <GameStatusBadge winner={game.winner} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
