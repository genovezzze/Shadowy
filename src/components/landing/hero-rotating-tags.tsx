"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * The line under the hero lockup on phones, cycling through what the product
 * surfaces. Phones are the one layout where the h1 is hidden at the top of the
 * page - it is repeated as plain text under the device mockup instead - so
 * without this the lockup sits alone above a full screen of empty footage.
 *
 * Every phrase but the last is copy the landing already uses further down, so
 * the hero names the same things the sections go on to explain.
 */
const TAGS = [
  "Neredzamais darbs",
  "Fokusa zudums",
  "Slēptās izmaksas",
  "Papildu pienākumi",
  "Klientu patiesā cena",
];

const INTERVAL_MS = 5000;

export function HeroRotatingTags() {
  const [index, setIndex] = React.useState(0);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      // A backgrounded tab keeps firing intervals. Swapping a line nobody can
      // see is pure work, and the visitor returns mid-cycle either way.
      if (document.visibilityState !== "visible") return;
      setIndex((current) => (current + 1) % TAGS.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    // Fixed height and an absolutely placed span: the outgoing and incoming
    // phrases overlap during the swap, so neither the lockup above nor the
    // hero's own centring ever shifts by a pixel.
    // aria-hidden - the h1 already carries this message as a sentence, and a
    // line that rewrites itself every five seconds is noise to a screen reader.
    <p
      aria-hidden
      className="relative mx-auto mt-3 h-6 overflow-hidden text-center"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={TAGS[index]}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 9 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -9 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap text-[0.95rem] font-light tracking-[0.06em] text-white/[0.62]"
        >
          {TAGS[index]}
        </motion.span>
      </AnimatePresence>
    </p>
  );
}
