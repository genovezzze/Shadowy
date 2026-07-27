"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * The line under the hero lockup on phones, typing out what the product
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

// One phrase occupies exactly this long whatever its length: the hold is
// whatever is left of the five seconds after typing and erasing it, so a long
// entry does not quietly stretch its turn past a short one's.
const CYCLE_MS = 5000;
const TYPE_MS = 55;
const ERASE_MS = 26;

export function HeroRotatingTags() {
  const [index, setIndex] = React.useState(0);
  const [typed, setTyped] = React.useState(0);
  const [erasing, setErasing] = React.useState(false);
  const reduceMotion = useReducedMotion();

  const tag = TAGS[index];

  React.useEffect(() => {
    // Typing is motion, and a caret chattering away is exactly what the
    // preference asks us to stop. The phrases still take their turn.
    if (reduceMotion) {
      const timer = window.setInterval(() => {
        if (document.visibilityState !== "visible") return;
        setIndex((current) => (current + 1) % TAGS.length);
      }, CYCLE_MS);

      return () => window.clearInterval(timer);
    }

    const hold = Math.max(
      600,
      CYCLE_MS - tag.length * (TYPE_MS + ERASE_MS),
    );

    const step = () => {
      if (!erasing && typed < tag.length) return setTyped(typed + 1);
      if (!erasing) return setErasing(true);
      if (typed > 0) return setTyped(typed - 1);

      setErasing(false);
      setIndex((current) => (current + 1) % TAGS.length);
    };

    let delay = ERASE_MS;
    if (!erasing) delay = typed < tag.length ? TYPE_MS : hold;

    const timer = window.setTimeout(step, delay);
    return () => window.clearTimeout(timer);
  }, [typed, erasing, index, reduceMotion, tag]);

  return (
    // Fixed height, so a line that is empty between phrases never collapses and
    // shifts the lockup above it. aria-hidden - the h1 already carries this
    // message as a sentence, and a line that retypes itself every five seconds
    // is noise to a screen reader.
    <p
      aria-hidden
      className="mt-3 flex h-6 items-center justify-center whitespace-nowrap font-mono text-[0.82rem] uppercase tracking-[0.18em] text-white/[0.62]"
    >
      <span>{reduceMotion ? tag : tag.slice(0, typed)}</span>
      {!reduceMotion && (
        <span className="animate-hero-caret-blink ml-[0.14em] inline-block h-[0.95em] w-[0.45em] shrink-0 bg-white/50" />
      )}
    </p>
  );
}
