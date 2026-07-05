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
  rotateX: 0,
  filter: "blur(0px)",
} as const;

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.72,
  className,
  effect = "rise",
  disableOnMobile = false,
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
    rise: { opacity: 0, y: 52 },
    focus: { opacity: 0, y: 20, scale: 0.975, filter: "blur(12px)" },
    unfold: { opacity: 0, y: 28, scale: 0.985, rotateX: 5 },
    zoom: { opacity: 0, scale: 0.93 },
    blur: { opacity: 0, y: 22, filter: "blur(14px)" },
    tilt: { opacity: 0, y: 40, rotateX: 7, scale: 0.97 },
    fade: { opacity: 0 },
  } as const;

  const skipAnimation = reduceMotion || (disableOnMobile && isMobile);

  return (
    <motion.div
      className={className}
      initial={skipAnimation ? false : hiddenStates[effect]}
      // When mobile detected after mount, force-snap to visible instantly
      animate={disableOnMobile && isMobile ? visibleState : undefined}
      whileInView={skipAnimation ? undefined : visibleState}
      viewport={skipAnimation ? undefined : { once: false, amount: 0.08 }}
      transition={{
        duration: disableOnMobile && isMobile ? 0 : duration,
        delay: disableOnMobile && isMobile ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
