"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { HeroVideoBackground } from "@/components/landing/hero-video-background";
import { cn } from "@/lib/utils";
import { LandingHeroTrust } from "@/components/landing/atoms/landing-hero-trust";
import type { Variants } from "framer-motion";

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
const HERO_WORDMARK = "Shadowy";
const HERO_SHINE_STAGGER_MS = 420;
const HERO_PIXEL_FRAME_MS = 50;
const HERO_PIXEL_CYCLE_MS = 600;
const HERO_PIXEL_STAGGER_MS = 250;
const HERO_PIXEL_FONTS = [
  "var(--font-pixel-square)",
  "var(--font-pixel-grid)",
  "var(--font-pixel-circle)",
  "var(--font-pixel-triangle)",
  "var(--font-pixel-line)",
] as const;
// How long the mark stays lit after a click - long enough for the staggered
// per-letter shine to run the length of the wordmark before it eases back.
const LOGO_LIT_MS = 1800;

const transitionVariants: { item: Variants } = {
  item: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", bounce: 0.3, duration: 1.5 },
    },
  },
};

/**
 * The desktop hero: the Shadowy mark and wordmark over the looping video, with
 * the page's one sentence under it.
 *
 * This is the original lockup hero. The pixel-wave hero modelled on
 * atoms.technology took its place on phones, where the lockup left the screen
 * mostly empty; from md up the lockup is still what the page opens with.
 */
export function LandingHeroLockup() {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const [pixelElapsed, setPixelElapsed] = React.useState(0);

  React.useEffect(() => {
    const timer = window.setInterval(
      () => setPixelElapsed((current) => current + HERO_PIXEL_FRAME_MS),
      HERO_PIXEL_FRAME_MS,
    );

    return () => window.clearInterval(timer);
  }, []);
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

  // Clicking the mark plays its lit state once - the colour shimmer on the mark
  // and the pixel pass over the wordmark. The mark itself no longer rotates.
  const [isLogoSpinning, setIsLogoSpinning] = React.useState(false);
  const settleTimer = React.useRef<number | null>(null);

  // The played state used to be ended by the rotation reaching a completed 360,
  // which is what kept the mark from stopping mid-turn. With no rotation left to
  // wait on, a timer ends it instead: long enough for the 500ms transition in
  // and the 900ms settle out to read as one gesture.
  const playLogoSpin = React.useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    setIsLogoSpinning(true);
    settleTimer.current = window.setTimeout(() => {
      setIsLogoSpinning(false);
      settleTimer.current = null;
    }, LOGO_LIT_MS);
  }, []);

  React.useEffect(
    () => () => {
      if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    },
    [],
  );

  // Settling is given a longer, softer curve than starting - a symmetric ease
  // reads abrupt on the way out. Shared by the mark and the wordmark so the two
  // still finish together.
  const lockupEasing = isLogoSpinning
    ? "duration-500 ease-out"
    : "[transition-duration:900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]";

  // Overrides only the duration of the shared shimmer class, so the lockup can
  // run fast without speeding up section headings that use the same class.
  const shimmerSpeed: React.CSSProperties = { animationDuration: "1.3s" };

  const logoMaskStyle = React.useMemo<React.CSSProperties>(
    () => ({
      maskImage: "url('/pixel_logo.png')",
      WebkitMaskImage: "url('/pixel_logo.png')",
      // A bitmap on black rather than a shape on transparency, so luminance is
      // the mode that reads it, and `pixelated` below keeps the cells hard
      // instead of smoothing them away at hero size.
      maskMode: "luminance",
      maskSize: "contain",
      WebkitMaskSize: "contain",
      maskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
      imageRendering: "pixelated",
    }),
    [],
  );

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex h-[100dvh] min-h-[640px] items-center justify-center overflow-hidden bg-[#070809] px-5 pb-16 pt-28 sm:min-h-0 sm:px-6 sm:py-24"
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

      {/* Sized to its content rather than to the column, so the lockup keeps
          its own width instead of stretching across the section. */}
      <div className="relative z-10 mx-auto w-fit max-w-full">
        <AnimatedGroup
          variants={transitionVariants}
          className="mx-auto flex w-full max-w-4xl flex-col items-stretch text-center font-accent font-light"
        >
          {/* The whole lockup is the target - mark and wordmark alike - and it
              is sized to its content rather than to the column, so a click far
              out in the empty row cannot set it off.

              Left decorative rather than promoted to a button: the spin carries
              no information and leads nowhere, so announcing it to screen
              readers or spending a tab stop on it would be noise. It stays a
              pointer-only flourish. */}
          <div
            onClick={playLogoSpin}
            className="mx-auto flex w-fit cursor-pointer items-center justify-center gap-[calc(var(--lockup-cap)*0.3)] [--lockup-cap:2.1rem] sm:[--lockup-cap:2.888rem] lg:[--lockup-cap:3.321rem]"
          >
            <span
              aria-hidden
              className={cn(
                "relative -mr-[calc(var(--lockup-cap)*0.1428)] block size-[calc(var(--lockup-cap)*1.25/0.8309)] shrink-0",
              )}
            >
              {/* Both layers are the logo shape punched out of a solid fill,
                  cross-faded while it plays - you cannot transition a flat
                  colour into an animated gradient. */}
              <span
                style={logoMaskStyle}
                className={cn(
                  "hero-lockup-logo-shine absolute inset-0 bg-white transition-opacity",
                  lockupEasing,
                  isLogoSpinning ? "opacity-0" : "opacity-100",
                )}
              />
              <span
                style={{ ...logoMaskStyle, ...shimmerSpeed }}
                className={cn(
                  "animate-solution-heading-green absolute inset-0 transition-opacity",
                  lockupEasing,
                  isLogoSpinning ? "opacity-100" : "opacity-0",
                )}
              />
            </span>

            {/* Driven by the lit state, so the wordmark holds its look for as
                long as the mark does and the two ease back together.

                `--lockup-cap` on the row is the height the capitals stand at,
                and both halves are derived from it so they cannot drift apart.
                Its values put the wordmark back on the sizes it had before the
                lockup was tied together: 4rem, and 4.6rem at lg.

                The divisor is 0.722 because that is the cap height every
                GeistPixel face reports (722/1000 em); `items-center` on the row
                then lines the two up, since with `leading-none` the cap band
                sits within half a percent of the text box centre. Keep
                `leading-none`, or the divisor stops describing anything.

                The mark multiplies that by two factors. 1.25 is the optical
                correction: matched exactly to the cap height a round mark
                measures equal but reads small, because the letters hold their
                full width along the cap line while the disc only touches it at
                a point. That is the number to nudge if the balance looks off.

                The row's `gap` is the visible one: the mark carries a negative
                right margin of cap*0.1428, which is exactly the empty margin
                pixel_logo.png keeps at its own edge (ink 124..1139 of 1254
                across), so the box edge now sits on the artwork rather than out
                in its padding.

                0.8309 is not a judgement call - it is how much of pixel_logo.png
                its artwork actually covers vertically (ink 105..1146 of 1254),
                and the box is divided by it so the visible mark lands where the
                optical factor asks. Swap the mask image and this has to be
                re-measured with it.

                The letters set their own pixel face inline, so `font-display`
                is only what they fall back to before those faces load - but it
                has to be named, because the lockup sits inside a `font-accent`
                group whose variable registers a 300 face alone, and `font-bold`
                against that would be synthesised rather than drawn. */}
            <span
              className={cn(
                "relative inline-block font-display text-[calc(var(--lockup-cap)/0.722)] font-bold leading-none tracking-[-0.05em] transition-transform motion-reduce:transform-none",
                lockupEasing,
                isLogoSpinning ? "scale-[1.06]" : "scale-100",
              )}
            >
              <span
                className={cn(
                  "text-white transition-opacity",
                  lockupEasing,
                  isLogoSpinning ? "opacity-0" : "opacity-100",
                )}
              >
                {[...HERO_WORDMARK].map((letter, index) => (
                  <span
                    key={`${letter}-${index}`}
                    className="hero-lockup-letter-shine inline-block"
                    style={{
                      animationDelay: `${(index + 1) * HERO_SHINE_STAGGER_MS}ms`,
                      fontFamily:
                        HERO_PIXEL_FONTS[
                          (index +
                            Math.floor(
                              Math.max(
                                0,
                                pixelElapsed - index * HERO_PIXEL_STAGGER_MS,
                              ) / HERO_PIXEL_CYCLE_MS,
                            )) %
                            HERO_PIXEL_FONTS.length
                        ],
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
              <span
                aria-hidden
                style={shimmerSpeed}
                className={cn(
                  "animate-solution-heading-green absolute inset-0 bg-clip-text text-transparent transition-opacity",
                  lockupEasing,
                  isLogoSpinning ? "opacity-100" : "opacity-0",
                )}
              >
                {[...HERO_WORDMARK].map((letter, index) => (
                  <span
                    key={`${letter}-${index}`}
                    className="inline-block"
                    style={{
                      fontFamily:
                        HERO_PIXEL_FONTS[
                          (index +
                            Math.floor(
                              Math.max(
                                0,
                                pixelElapsed - index * HERO_PIXEL_STAGGER_MS,
                              ) / HERO_PIXEL_CYCLE_MS,
                            )) %
                            HERO_PIXEL_FONTS.length
                        ],
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </span>
          </div>

          <p className="mx-auto mt-4 max-w-[350px] text-balance text-center text-[clamp(0.95rem,4.2vw,1.1rem)] font-light leading-[1.5] tracking-[0.005em] text-white/[0.63] sm:max-w-3xl sm:text-2xl lg:mt-5 lg:text-[1.75rem] lg:leading-[1.5]">
            {/* Inline on phones so the sentence wraps to fit the screen, and
                broken at the comma from sm up, where the intended two lines
                fit. */}
            <span className="sm:block">Redziet neredzamo darbu, fokusa zudumu un to,</span>{" "}
            <span className="sm:block">kuri klienti jūsu uzņēmumam izmaksā visdārgāk</span>
          </p>

          {/* Outside the lockup's click target, so pressing the CTA never also
              fires the logo spin. */}
          <Link
            href="#pilots"
            className="mx-auto mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-white/90 sm:mt-10 sm:px-7 sm:py-3 sm:text-base"
          >
            Sākt projektu
          </Link>

          <LandingHeroTrust className="mt-5 sm:mt-6" />

        </AnimatedGroup>
      </div>

      <style jsx>{`
        .hero-lockup-logo-shine {
          animation: heroLockupLogoShine 7.2s ease-in-out infinite;
          will-change: filter;
        }

        .hero-lockup-letter-shine {
          animation: heroLockupLetterShine 7.2s ease-in-out infinite;
          will-change: opacity, filter, transform;
        }

        @keyframes heroLockupLogoShine {
          0%,
          7%,
          48%,
          100% {
            filter: brightness(0.72);
          }
          18%,
          32% {
            filter: brightness(1.45)
              drop-shadow(0 0 7px rgba(255, 255, 255, 0.7));
          }
        }

        @keyframes heroLockupLetterShine {
          0%,
          7%,
          48%,
          100% {
            opacity: 0.62;
            filter: brightness(0.82);
            text-shadow: none;
            transform: translateY(0);
          }
          18%,
          32% {
            opacity: 1;
            filter: brightness(1.35);
            text-shadow: 0 0 9px rgba(255, 255, 255, 0.42);
            transform: translateY(-1px);
          }
        }
      `}</style>
    </section>
  );
}
