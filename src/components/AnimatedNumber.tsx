import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect } from "react";

type AnimatedNumberProps = {
  value: number;
};

export function AnimatedNumber({ value }: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);
  const rounded = useTransform(() => Math.round(motionValue.get()));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.6,
      ease: "easeOut"
    });

    return () => controls.stop();
  }, [motionValue, value]);

  return <motion.span>{rounded}</motion.span>;
}
