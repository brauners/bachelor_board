import type { ScoreStats, ScoreTotals } from "../types/game";

type StatsGridProps = {
  stats: ScoreStats;
  totals: ScoreTotals;
};

export function StatsGrid({ stats, totals }: StatsGridProps) {
  const items = [
    { label: "Siege Marius", value: stats.bachelorWins },
    { label: "Siege Gaeste", value: stats.guestWins },
    { label: "Gesamtpunkte", value: totals.bachelor + totals.guest },
    { label: "Quote Marius", value: `${stats.winRateBachelor.toFixed(0)}%` },
    { label: "Quote Gaeste", value: `${stats.winRateGuest.toFixed(0)}%` },
    { label: "Offene Spiele", value: stats.openGames }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 shadow-neon backdrop-blur"
        >
          <div className="text-xs uppercase tracking-[0.35em] text-white/45">{item.label}</div>
          <div className="mt-3 font-display text-4xl text-white">{item.value}</div>
        </div>
      ))}
    </section>
  );
}
