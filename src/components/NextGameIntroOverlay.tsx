import { AnimatePresence, motion } from "framer-motion";
import type { Game } from "../types/game";

type NextGameIntroOverlayProps = {
  introDurationMs: number;
  holdDurationMs: number;
  game: Game | null;
  visible: boolean;
};

export function NextGameIntroOverlay({
  introDurationMs,
  holdDurationMs,
  game,
  visible
}: NextGameIntroOverlayProps) {
  const totalDurationSeconds = (introDurationMs + holdDurationMs) / 1000;
  const revealRatio =
    introDurationMs + holdDurationMs > 0
      ? Math.min(0.92, Math.max(0.6, introDurationMs / (introDurationMs + holdDurationMs * 0.35)))
      : 0.8;

  return (
    <AnimatePresence>
      {visible && game ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-stage-950/92 px-6 text-center backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
        >
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,209,102,0.14),transparent_44%),radial-gradient(circle_at_center,rgba(66,214,255,0.1),transparent_64%)]"
            initial={{ opacity: 0.2, scale: 1.18 }}
            animate={{ opacity: [0.18, 0.34, 0.12], scale: [1.18, 1.04, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: totalDurationSeconds, ease: "easeOut" }}
          />
          <motion.div
            key={`${game.id}-${introDurationMs}-${holdDurationMs}`}
            className="mx-auto flex max-w-5xl flex-col items-center gap-5"
            initial={{ scale: 0.48, opacity: 0, filter: "blur(28px)" }}
            animate={{
              scale: [0.48, 0.7, 0.95, 1.08, 1.08],
              opacity: [0, 0.5, 0.9, 1, 1],
              filter: [
                "blur(30px)",
                "blur(22px)",
                "blur(12px)",
                "blur(0px)",
                "blur(0px)"
              ]
            }}
            exit={{ scale: 1.16, opacity: 0, filter: "blur(8px)" }}
            transition={{
              duration: totalDurationSeconds,
              ease: [0.12, 0.8, 0.18, 1],
              times: [0, revealRatio * 0.36, revealRatio * 0.72, revealRatio, 1]
            }}
          >
            <motion.div
              className="text-sm uppercase tracking-[0.75em] text-accent-gold/80 sm:text-base"
              initial={{ opacity: 0, filter: "blur(14px)" }}
              animate={{
                opacity: [0, 0.22, 0.6, 1, 1],
                filter: [
                  "blur(18px)",
                  "blur(14px)",
                  "blur(8px)",
                  "blur(0px)",
                  "blur(0px)"
                ]
              }}
              transition={{
                duration: totalDurationSeconds,
                times: [0, revealRatio * 0.45, revealRatio * 0.8, revealRatio, 1],
                ease: "easeOut"
              }}
            >
              Naechstes Duell
            </motion.div>
            <motion.div
              className="font-display text-6xl uppercase leading-none text-white sm:text-7xl lg:text-8xl xl:text-[7rem]"
              initial={{ letterSpacing: "0.5em", opacity: 0, filter: "blur(22px)" }}
              animate={{
                letterSpacing: ["0.5em", "0.38em", "0.16em", "0.04em", "0.04em"],
                opacity: [0, 0.36, 0.82, 1, 1],
                filter: [
                  "blur(24px)",
                  "blur(18px)",
                  "blur(10px)",
                  "blur(0px)",
                  "blur(0px)"
                ]
              }}
              transition={{
                duration: totalDurationSeconds,
                times: [0, revealRatio * 0.34, revealRatio * 0.74, revealRatio, 1],
                ease: "easeOut"
              }}
            >
              {game.guestName}
            </motion.div>
            <motion.div
              className="text-xl uppercase tracking-[0.5em] text-white/35 sm:text-2xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: [0, 0, 0.7, 1, 1], y: [12, 8, 3, 0, 0] }}
              transition={{
                duration: totalDurationSeconds,
                times: [0, revealRatio * 0.52, revealRatio * 0.82, revealRatio, 1],
                ease: "easeOut"
              }}
            >
              gegen
            </motion.div>
            <motion.div
              className="font-display text-6xl uppercase leading-none text-accent-cyan sm:text-7xl lg:text-8xl xl:text-[7rem]"
              initial={{ letterSpacing: "0.48em", opacity: 0, filter: "blur(24px)" }}
              animate={{
                letterSpacing: ["0.48em", "0.34em", "0.14em", "0.04em", "0.04em"],
                opacity: [0, 0.3, 0.8, 1, 1],
                filter: [
                  "blur(26px)",
                  "blur(20px)",
                  "blur(10px)",
                  "blur(0px)",
                  "blur(0px)"
                ]
              }}
              transition={{
                duration: totalDurationSeconds,
                times: [0, revealRatio * 0.38, revealRatio * 0.76, revealRatio, 1],
                ease: "easeOut"
              }}
            >
              Marius
            </motion.div>
            <motion.div
              className="mt-3 max-w-4xl text-3xl font-semibold uppercase tracking-[0.12em] text-white sm:text-4xl lg:text-5xl"
              initial={{ opacity: 0, y: 24, filter: "blur(18px)" }}
              animate={{
                opacity: [0, 0.12, 0.58, 1, 1],
                y: [24, 18, 8, 0, 0],
                filter: [
                  "blur(18px)",
                  "blur(14px)",
                  "blur(8px)",
                  "blur(0px)",
                  "blur(0px)"
                ]
              }}
              transition={{
                duration: totalDurationSeconds,
                times: [0, revealRatio * 0.5, revealRatio * 0.84, revealRatio, 1],
                ease: "easeOut"
              }}
            >
              {game.gameName}
            </motion.div>
            {game.points !== null ? (
              <motion.div
                className="mt-4 rounded-[1.75rem] border border-accent-gold/35 bg-accent-gold/10 px-8 py-5"
                initial={{ opacity: 0, scale: 0.9, filter: "blur(14px)" }}
                animate={{
                  opacity: [0, 0, 0.7, 1, 1],
                  scale: [0.9, 0.9, 0.96, 1, 1],
                  filter: [
                    "blur(14px)",
                    "blur(14px)",
                    "blur(8px)",
                    "blur(0px)",
                    "blur(0px)"
                  ]
                }}
                transition={{
                  duration: totalDurationSeconds,
                  times: [0, revealRatio * 0.56, revealRatio * 0.88, revealRatio, 1],
                  ease: "easeOut"
                }}
              >
                <div className="text-sm uppercase tracking-[0.45em] text-accent-gold/75">
                  Wert
                </div>
                <div className="mt-2 font-display text-5xl uppercase text-accent-gold sm:text-6xl">
                  {game.points} Punkte
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
