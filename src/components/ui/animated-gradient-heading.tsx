"use client";

import { motion, useReducedMotion } from "framer-motion";
import * as React from "react";

/** The word-by-word colour sweep used on the Atoms industry pages. */
export function AnimatedGradientHeading({ children }: { children: string }) {
  const [visible, setVisible] = React.useState(false);
  const reduceMotion = useReducedMotion();
  const parts = children.split(/(\s+)/);
  let wordIndex = 0;

  return (
    <motion.span
      className="inline"
      viewport={{ once: true, margin: "-100px" }}
      onViewportEnter={() => setVisible(true)}
    >
      {parts.map((part, index) => {
        if (/\s+/.test(part)) return part;
        const delay = wordIndex++ * 0.15;

        return (
          <span
            key={`${part}-${index}`}
            className={
              reduceMotion
                ? "atoms-gradient-text-reveal is-static"
                : visible
                  ? "atoms-gradient-text-reveal is-visible"
                  : "atoms-gradient-text-reveal"
            }
            style={{ animationDelay: `${delay}s` }}
          >
            {part}
          </span>
        );
      })}
    </motion.span>
  );
}
