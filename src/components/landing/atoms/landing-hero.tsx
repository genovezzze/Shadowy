"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroVideoBackground } from "@/components/landing/hero-video-background";
import { PixelLogoDissolve } from "@/components/landing/pixel-logo-dissolve";

// How far the backdrop lags the page over one screen of scrolling, as a share
// of the hero's height. The lockup rises with the page as normal; the shot
// trails it, which is what reads as the scene sinking away rather than being
// covered over. At 1 the lag would cancel the scroll outright and hold the shot
// still.
//
// Doing it as a shifted layer rather than position:fixed keeps it inside the
// hero, so the hero's own overflow clips it and it stops costing anything the
// moment the section is scrolled past. A fixed layer escapes that clipping and
// would keep painting behind every section below it.
const PARALLAX_LAG = 0.3;

// The phrase that pixelates, character by character. The reference gives each
// character its own pixel face and cycles the five of them in order, so no two
// neighbours are drawn with the same cell shape.
const PIXEL_PHRASE = "neredzamo darbu";

const PIXEL_FONTS = [
  "var(--font-pixel-square)",
  "var(--font-pixel-grid)",
  "var(--font-pixel-circle)",
  "var(--font-pixel-triangle)",
  "var(--font-pixel-line)",
] as const;

// The wave ticks in whole steps rather than as a smooth fade: the reference
// swaps a character's font outright, so at any frame a character is either the
// real face or the pixel one, never a blend of the two. TICK_MS is how long one
// step of the wave lasts, WAVE_WIDTH how many characters it covers at once.
const TICK_MS = 170;
const WAVE_WIDTH = 4;
// Steps of plain text between passes, as a share of the phrase - kept small so
// the wave re-enters almost as soon as it has left.
const WAVE_GAP = 3;

/**
 * The hero: the headline over the looping video, the page's one sentence under
 * it, and the single call to action.
 *
 * Typography, colours and spacing follow the atoms.technology hero as built:
 * one medium-weight sans headline, the opening word at 80% white, the pixelated
 * phrase at full white and the second line at 60%, a 460px sentence under it
 * and a white pill. The pixel wave is their effect - each character swaps to a
 * pixel face and back as the wave passes over it.
 */
export function LandingHero() {
  const sectionRef = React.useRef<HTMLElement | null>(null);

  // Runs from the moment the hero's top meets the viewport top until its bottom
  // does - one screen of scrolling.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // The layer is taller than the hero and starts hitched above it, so sliding
  // it down by the lag leaves no uncovered strip at either end of the travel.
  const layerHeight = 1 + PARALLAX_LAG;
  const backgroundY = useTransform(scrollYProgress, [0, 1], [
    "0%",
    `${(PARALLAX_LAG / layerHeight) * 100}%`,
  ]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex h-[100dvh] min-h-[640px] flex-col items-center justify-start overflow-hidden bg-[#070809] px-2 pt-[128px] text-center md:px-8 md:pt-56"
    >
      <motion.div
        aria-hidden
        style={{
          y: backgroundY,
          top: `-${PARALLAX_LAG * 100}%`,
          height: `${layerHeight * 100}%`,
        }}
        className="pointer-events-none absolute inset-x-0 -z-10"
      >
        <HeroVideoBackground />
      </motion.div>

      {/* The backdrop's own fade travels with it, so it is out of place once the
          layer has slid. This one is pinned to the section and is what actually
          hands over to the white block below. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-[linear-gradient(to_bottom,transparent_0%,rgba(7,8,9,0.72)_58%,#070809_100%)]"
      />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-1 flex w-full justify-center px-1 md:mb-3 md:px-0">
          <h1 className="mx-auto flex w-full flex-col items-center px-0 text-[32px] font-medium leading-[1.05] tracking-tight text-white md:text-6xl md:leading-[1.1] lg:text-7xl">
            <span className="flex w-full flex-wrap items-center justify-center gap-x-2 md:gap-x-4">
              <span className="opacity-80">Redziet</span>
              <PixelWave text={PIXEL_PHRASE} />
            </span>
            <span className="mt-1 text-[32px] font-medium tracking-tight text-white/60 md:mt-2 md:text-6xl lg:text-7xl">
              un tā patieso cenu
            </span>
          </h1>
        </div>

        <div className="mx-auto mb-3 max-w-[460px] px-6 md:mb-8 md:px-0">
          <p className="text-sm font-medium leading-relaxed text-white/90 md:text-base">
            Redziet neredzamo darbu, fokusa zudumu un to, kuri klienti jūsu
            uzņēmumam izmaksā visdārgāk
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link
            href="#pilots"
            className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-bold text-black transition-all hover:bg-white/90"
          >
            Sākt projektu
          </Link>
        </div>

        {/* The mark, pixel by pixel, filling the empty half of the hero under
            the button. Decorative only - the wordmark is already in the bar. */}
        <PixelLogoDissolve className="pointer-events-none mx-auto mt-6 h-[24vh] max-h-[240px] w-full opacity-90 md:mt-12" />
      </div>
    </section>
  );
}

/**
 * The phrase with the pixel wave running through it.
 *
 * Each character is two stacked copies of itself - the real face and a pixel
 * one - and the wave switches which of them is shown, with no cross-fade: the
 * reference swaps the font outright. The real copy is what sets the box, so the
 * swap never nudges the line.
 */
function PixelWave({ text }: { text: string }) {
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
    <span className="tracking-tighter">
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {characters.map((character, index) => {
          if (character === " ") return <span key={index}> </span>;

          // The head of the wave is at `step`; a character is pixelated while
          // the wave's body is over it.
          const distance = step - index;
          const isPixel = distance >= 0 && distance < WAVE_WIDTH;
          // Every character in the wave gets a different cell shape, and the
          // shape moves on with the wave rather than being fixed per letter.
          const pixelFont = PIXEL_FONTS[(index + step) % PIXEL_FONTS.length];

          return (
            <span key={index} className="relative inline-block">
              <span
                className="inline-block"
                style={{ visibility: isPixel ? "hidden" : "visible" }}
              >
                {character}
              </span>
              {isPixel && (
                <span
                  style={{ fontFamily: pixelFont }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  {character}
                </span>
              )}
            </span>
          );
        })}
      </span>
    </span>
  );
}
