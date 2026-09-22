"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";

// Sparse faces (line, triangle) on the outer letters, dense (square, grid,
// circle) in the middle, so the centre of the word doesn't read hollow.
const PIXEL_FONTS = [
  "var(--font-pixel-line)",
  "var(--font-pixel-triangle)",
  "var(--font-pixel-square)",
  "var(--font-pixel-grid)",
  "var(--font-pixel-circle)",
] as const;
const WORDMARK = "Shadowy";

const SPRING = { stiffness: 80, damping: 20, mass: 0.6 };

/**
 * The closing scene: dark hills (back13) with the reddish foliage (back14) in
 * front and the pixel "Shadowy" between them. On scroll the layers parallax at
 * different speeds and the wordmark rises and settles — the atoms.technology
 * sign-off, on spring physics.
 */
export function LandingClosing() {
  const ref = React.useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  // Continuously cycles each letter's pixel face, so the wordmark keeps shifting
  // and shimmering instead of sitting still.
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => setTick((t) => t + 1), 620);
    return () => window.clearInterval(timer);
  }, [reduce]);

  // 0 as the section's top reaches the viewport bottom, 1 as its bottom leaves
  // the top — the whole pass of the section through the screen.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const hillsY = useSpring(useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]), SPRING);
  const foliageY = useSpring(useTransform(scrollYProgress, [0, 1], ["10%", "-6%"]), SPRING);

  // The wordmark reveals as the section climbs into view (progress ~0.15→0.5).
  const textOpacity = useTransform(scrollYProgress, [0.12, 0.32, 0.55], [0, 0.7, 1]);
  const textScale = useSpring(useTransform(scrollYProgress, [0.12, 0.55], [0.86, 1]), SPRING);
  const textY = useSpring(useTransform(scrollYProgress, [0.12, 0.55], [44, 0]), SPRING);

  return (
    <section ref={ref} className="relative hidden w-full overflow-hidden bg-black sm:block">
      <div className="relative mx-auto aspect-[1962/801] w-full">
        {/* Hills — slower, drifting layer, at the back */}
        <motion.div className="absolute inset-0 z-0" style={reduce ? undefined : { y: hillsY }}>
          <Image src="/images/back13.png" alt="" aria-hidden fill sizes="100vw" className="scale-[1.14] object-cover" />
        </motion.div>

        {/* Wordmark sits BETWEEN the layers, so the foliage in front covers its
            lower edge and the letters rise out of the treetops, like the ref. */}
        <motion.div
          className="absolute inset-x-0 top-[43%] z-10 flex justify-center px-4"
          style={reduce ? undefined : { opacity: textOpacity, scale: textScale, y: textY }}
        >
          <span
            aria-label={WORDMARK}
            className="select-none text-[clamp(3rem,15.5vw,12rem)] font-normal leading-none tracking-[0.015em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]"
          >
            {[...WORDMARK].map((letter, index) => (
              <span key={index} aria-hidden style={{ fontFamily: PIXEL_FONTS[(index + tick) % PIXEL_FONTS.length] }}>
                {letter}
              </span>
            ))}
          </span>
        </motion.div>

        {/* Foliage — foreground layer, in front of the wordmark so it covers it */}
        <motion.div className="absolute inset-0 z-20" style={reduce ? undefined : { y: foliageY }}>
          <Image src="/images/back14.png" alt="" aria-hidden fill sizes="100vw" className="scale-[1.14] object-cover" />
        </motion.div>

        {/* Top fade into the page above, bottom fade into the black footer. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-30 h-1/2 bg-gradient-to-b from-black via-black/80 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-1/5 bg-gradient-to-t from-black to-transparent" />
      </div>
    </section>
  );
}
