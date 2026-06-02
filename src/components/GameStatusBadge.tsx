import type { Winner } from "../types/game";

type GameStatusBadgeProps = {
  winner: Winner;
};

export function GameStatusBadge({ winner }: GameStatusBadgeProps) {
  if (winner === "bachelor") {
    return (
      <span className="rounded-full border border-accent-cyan/40 bg-accent-cyan/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-accent-cyan">
        Marius
      </span>
    );
  }

  if (winner === "guest") {
    return (
      <span className="rounded-full border border-accent-coral/40 bg-accent-coral/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-accent-coral">
        Gast
      </span>
    );
  }

  return (
    <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/65">
      Offen
    </span>
  );
}
