"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  effect?: "rise" | "left" | "right" | "zoom" | "blur" | "tilt" | "fade";
};

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.72,
  className,
  effect = "rise",
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();
  const hiddenStates = {
    rise: { opacity: 0, y: 52 },
    left: { opacity: 0, x: -64 },
    right: { opacity: 0, x: 64 },
    zoom: { opacity: 0, scale: 0.93 },
    blur: { opacity: 0, y: 22, filter: "blur(14px)" },
    tilt: { opacity: 0, y: 40, rotateX: 7, scale: 0.97 },
    fade: { opacity: 0 },
  } as const;

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : hiddenStates[effect]}
      whileInView={
        reduceMotion
          ? undefined
          : {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotateX: 0,
              filter: "blur(0px)",
            }
      }
      viewport={{ once: false, amount: 0.08 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
