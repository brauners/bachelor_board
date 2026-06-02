import { motion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";

type ScorePanelProps = {
  label: string;
  score: number;
  accent: string;
  active: boolean;
};

export function ScorePanel({ label, score, accent, active }: ScorePanelProps) {
  return (
    <motion.div
      layout
      className={[
        "rounded-[2rem] border px-6 py-6 shadow-neon backdrop-blur",
        active ? "animate-pulseLead border-white/40 bg-white/12" : "border-white/10 bg-white/6"
      ].join(" ")}
      style={{ boxShadow: `0 0 40px ${accent}25` }}
    >
      <div className="text-sm uppercase tracking-[0.5em] text-white/55">{label}</div>
      <div className="mt-3 font-display text-6xl uppercase leading-none sm:text-7xl lg:text-8xl">
        <span style={{ color: accent }}>
          <AnimatedNumber value={score} />
        </span>
      </div>
    </motion.div>
  );
}
