"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// The same pixel faces the intro and the hero wordmark cycle through, so the
// effect on a keyword reads as the same family.
const PIXEL_FONTS = [
  "var(--font-pixel-square)",
  "var(--font-pixel-grid)",
  "var(--font-pixel-circle)",
  "var(--font-pixel-triangle)",
  "var(--font-pixel-line)",
] as const;

const TICK_MS = 170;
const WAVE_WIDTH = 4;
const WAVE_GAP = 3;

/**
 * A keyword with the intro's pixel wave running through it: a band travels the
 * word, swapping each letter to a pixel face and back — no cross-fade, the real
 * copy sets the box so the swap never nudges the line.
 */
export function PixelWaveText({ text, className }: { text: string; className?: string }) {
  const characters = React.useMemo(() => [...text], [text]);
  const steps = characters.length + WAVE_WIDTH + WAVE_GAP;
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setStep((current) => (current + 1) % steps),
      TICK_MS,
    );
    return () => window.clearInterval(timer);
  }, [steps]);

  return (
    <span className={cn("whitespace-nowrap", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {characters.map((character, index) => {
          if (character === " ") return <span key={index}> </span>;
          const distance = step - index;
          const isPixel = distance >= 0 && distance < WAVE_WIDTH;
          const pixelFont = PIXEL_FONTS[(index + step) % PIXEL_FONTS.length];
          return (
            <span key={index} className="relative inline-block">
              <span className="inline-block" style={{ visibility: isPixel ? "hidden" : "visible" }}>
                {character}
              </span>
              {isPixel && <PixelGlyph character={character} font={pixelFont} />}
            </span>
          );
        })}
      </span>
    </span>
  );
}

/**
 * The pixel letter over the real one, stretched to exactly the real letter's
 * width. Pixel faces are monospaced, so a wide "m" left gaps on both sides and
 * a narrow "i" crowded its neighbours; matching the width keeps the word tight.
 */
function PixelGlyph({ character, font }: { character: string; font: string }) {
  const boxRef = React.useRef<HTMLSpanElement>(null);
  const glyphRef = React.useRef<HTMLSpanElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useLayoutEffect(() => {
    const box = boxRef.current?.offsetWidth ?? 0;
    const glyph = glyphRef.current?.offsetWidth ?? 0;
    if (box > 0 && glyph > 0) setScale(box / glyph);
  }, [character, font]);

  return (
    <span
      ref={boxRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
    >
      <span
        ref={glyphRef}
        className="inline-block whitespace-nowrap"
        style={{ fontFamily: font, transform: `scaleX(${scale})`, transformOrigin: "center" }}
      >
        {character}
      </span>
    </span>
  );
}
