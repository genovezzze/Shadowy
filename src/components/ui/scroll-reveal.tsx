"use client";

import { motion, useReducedMotion } from "framer-motion";
import React, { type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  effect?: "rise" | "focus" | "unfold" | "zoom" | "blur" | "tilt" | "fade";
  disableOnMobile?: boolean;
};

const visibleState = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  filter: "blur(0px)",
} as const;

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.72,
  className,
  effect = "rise",
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const hiddenStates = {
    rise: { opacity: 0, y: 26, filter: "blur(2px)" },
    focus: { opacity: 0, y: 16, scale: 0.988, filter: "blur(3px)" },
    unfold: { opacity: 0, y: 20, scale: 0.992, filter: "blur(2px)" },
    zoom: { opacity: 0, scale: 0.975, filter: "blur(3px)" },
    blur: { opacity: 0, y: 16, filter: "blur(6px)" },
    tilt: { opacity: 0, y: 22, scale: 0.988, filter: "blur(2px)" },
    fade: { opacity: 0, filter: "blur(2px)" },
  } as const;

  const skipAnimation = reduceMotion || isMobile;

  return (
    <motion.div
      className={className}
      initial={skipAnimation ? false : hiddenStates[effect]}
      // Mobile is detected after hydration. Always force hidden SSR content
      // back to its visible state when motion is skipped, otherwise sections
      // that mounted with an initial variant can remain transparent forever.
      animate={skipAnimation ? visibleState : undefined}
      whileInView={skipAnimation ? undefined : visibleState}
      viewport={skipAnimation ? undefined : { once: true, amount: 0.08 }}
      transition={{
        duration: skipAnimation ? 0 : duration,
        delay: skipAnimation ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
