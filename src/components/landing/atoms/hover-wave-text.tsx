"use client";

import * as React from "react";

// The reference runs through three distinct stops: green, pink and blue.
// Interpolating between the stops keeps that full gradient across labels of
// every length instead of collapsing short labels into one or two colours.
const WAVE_COLORS = [
  [91, 157, 83],
  [235, 70, 116],
  [61, 123, 242],
] as const;

function waveColor(index: number, total: number) {
  const progress = total > 1 ? index / (total - 1) : 0;
  const segment = Math.min(Math.floor(progress * 2), 1);
  const localProgress = progress * 2 - segment;
  const from = WAVE_COLORS[segment];
  const to = WAVE_COLORS[segment + 1];
  const channel = (i: number) =>
    Math.round(from[i] + (to[i] - from[i]) * localProgress);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

/**
 * Splits text into letters that take their colour on the parent's hover, each
 * one a beat later than the last.
 *
 * Driven by `group-hover` and per-letter `transition-delay` rather than by
 * state, so the whole effect is CSS - nothing re-renders on pointer move. The
 * split text is hidden from assistive tech and the plain string exposed once,
 * since letter-per-element markup is otherwise read out character by character.
 *
 * The nearest ancestor with the `group` class is what triggers it.
 */
export function HoverWaveText({
  text,
  stagger = 28,
}: {
  text: string;
  /** Milliseconds between one letter lighting up and the next. */
  stagger?: number;
}) {
  const letters = [...text];

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {letters.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="transition-colors duration-300 ease-out group-hover:text-[color:var(--wave)]"
            style={
              {
                "--wave": waveColor(index, letters.length),
                transitionDelay: `${index * stagger}ms`,
              } as React.CSSProperties
            }
          >
            {letter}
          </span>
        ))}
      </span>
    </>
  );
}
