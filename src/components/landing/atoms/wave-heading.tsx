"use client";

import * as React from "react";
import { motion } from "framer-motion";

// The reference runs each letter through a set of pixel display faces. Those
// are a licensed family the project does not ship, so the wave is carried by
// colour instead: each letter lands from its own hue and settles into the
// heading colour, which reads as the same sweep across the word.
const WAVE_COLORS = [
  "#34a853",
  "#ea4335",
  "#4285f4",
  "#fbbc05",
  "#a142f4",
] as const;

/**
 * Heading that assembles letter by letter when it scrolls into view.
 *
 * The split text is hidden from assistive tech and the whole string is exposed
 * once instead - letter-per-element markup is read out character by character
 * by screen readers otherwise.
 */
export function WaveHeading({
  children,
  className,
  tone = "dark",
}: {
  children: string;
  className?: string;
  /** Colour the letters settle into. `currentColor` cannot be interpolated. */
  tone?: "dark" | "light";
}) {
  const words = React.useMemo(() => children.split(" "), [children]);
  const settled = tone === "light" ? "#ffffff" : "#0a0a0a";
  let index = -1;

  return (
    <span className={className}>
      <span className="sr-only">{children}</span>

      <motion.span
        aria-hidden
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.035 } },
        }}
        // Words stay whole so the heading still wraps between words rather than
        // mid-word once every letter is its own inline box.
        className="inline-flex flex-wrap"
      >
        {words.map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`} className="inline-flex whitespace-pre">
            {[...word].map((letter, letterIndex) => {
              index += 1;
              return (
                <motion.span
                  key={`${letter}-${letterIndex}`}
                  className="inline-block"
                  variants={{
                    // No vertical travel: the letters arrive in place and the
                    // only movement across the word is the stagger itself,
                    // which reads as a sweep to the right.
                    hidden: {
                      opacity: 0,
                      color: WAVE_COLORS[index % WAVE_COLORS.length],
                    },
                    visible: {
                      opacity: 1,
                      color: settled,
                      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  {letter}
                </motion.span>
              );
            })}
            {/* A bare space between flex items collapses to nothing, so the
                separator has to be an item of its own. */}
            {wordIndex < words.length - 1 ? (
              <span className="inline-block whitespace-pre"> </span>
            ) : null}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
