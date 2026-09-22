"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { HeroVideoBackground } from "@/components/landing/hero-video-background";
import { cn } from "@/lib/utils";
import { LandingHeroTrust } from "@/components/landing/atoms/landing-hero-trust";
import { PixelWaveText } from "@/components/landing/atoms/pixel-wave-text";
import { useLocale } from "@/components/landing/atoms/i18n";
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
// The wordmark never sits fully lit or fully still: the letters rest grey and a
// bright band travels across them without pause. HERO_SHINE_BAND is how many
// neighbouring letters are lit at once, HERO_SHINE_STEP_MS how long the band
// dwells on each step before advancing. The band wraps continuously, so there
// is no gap where every letter is grey at the same time.
const HERO_SHINE_BAND = 3;
const HERO_SHINE_STEP_MS = 340;
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
  const { locale, t } = useLocale();
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

  // The copy rises and fades as the page scrolls: while the backdrop lags and
  // sinks, the lockup lifts away faster than the scroll, so scrolling down reads
  // as everything lifting up and out of the hero.
  const contentY = useTransform(scrollYProgress, [0, 1], ["0px", "-96px"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // The mark no longer reacts to clicks - the tap-to-play lit state was removed,
  // so it always renders in its resting look. Kept as a constant so the resting
  // branches below read the same as before.
  const isLogoSpinning = false;

  // The resting transition curve for the mark and the wordmark.
  const lockupEasing =
    "[transition-duration:900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]";

  // The head of the travelling shine band, advanced from the same frame timer as
  // the pixel-face cycling. The band wraps over the whole lockup - the mark is
  // unit 0 and the wordmark letters are units 1..n - so the mark shimmers in
  // turn with the letters rather than pulsing on its own.
  const shineHead = Math.floor(pixelElapsed / HERO_SHINE_STEP_MS);
  const lockupUnits = HERO_WORDMARK.length + 1;
  const isUnitLit = (unitIndex: number) => {
    const distance =
      ((unitIndex - shineHead) % lockupUnits + lockupUnits) % lockupUnits;
    return distance < HERO_SHINE_BAND;
  };
  const logoLit = isUnitLit(0);

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
      className="relative isolate flex h-auto min-h-0 items-start justify-center overflow-hidden bg-[#070809] px-5 pb-20 pt-[16vh] sm:h-[100dvh] sm:items-center sm:px-6 sm:py-24"
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
          its own width instead of stretching across the section. Rises and
          fades on scroll via the parallax transforms above. */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto w-full min-w-0 max-w-3xl motion-reduce:!translate-y-0 motion-reduce:!opacity-100"
      >
        <AnimatedGroup
          variants={transitionVariants}
          className="mx-auto flex w-full min-w-0 max-w-4xl flex-col items-center text-center font-accent font-light"
        >
          {/* The whole lockup is the target - mark and wordmark alike - and it
              is sized to its content rather than to the column, so a click far
              out in the empty row cannot set it off.

              Left decorative rather than promoted to a button: the spin carries
              no information and leads nowhere, so announcing it to screen
              readers or spending a tab stop on it would be noise. It stays a
              pointer-only flourish. */}
          <div
            className="mx-auto flex w-fit max-w-full items-center justify-center gap-[calc(var(--lockup-cap)*0.3)] [--lockup-cap:2rem] min-[400px]:[--lockup-cap:2.2rem] sm:[--lockup-cap:3.4rem] lg:[--lockup-cap:4rem]"
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
                style={{
                  ...logoMaskStyle,
                  filter: logoLit
                    ? "brightness(1.5) drop-shadow(0 0 8px rgba(255, 255, 255, 0.75))"
                    : "brightness(0.72)",
                  transition: "filter 300ms ease-out",
                }}
                className={cn(
                  "absolute inset-0 bg-white",
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
                {[...HERO_WORDMARK].map((letter, index) => {
                  // The mark is unit 0, so this letter is unit index + 1 - lit
                  // while the travelling band passes over it.
                  const lit = isUnitLit(index + 1);

                  return (
                    <span
                      key={`${letter}-${index}`}
                      className={cn(
                        "inline-block transition-[color,text-shadow,transform] duration-300 ease-out motion-reduce:transform-none",
                        lit ? "-translate-y-px text-white" : "text-white/45",
                      )}
                      style={{
                        textShadow: lit
                          ? "0 0 10px rgba(255, 255, 255, 0.5)"
                          : "none",
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
                  );
                })}
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

          {/* `text-balance` evens out the two lines. The key phrases carry the
              intro's pixel wave so they read as the emphasis of the sentence. */}
          <p className="mx-auto mt-4 max-w-[350px] text-balance text-center text-[clamp(0.95rem,4.2vw,1.1rem)] font-light leading-[1.5] tracking-[0.005em] text-white/[0.63] sm:max-w-2xl sm:text-2xl lg:mt-5 lg:text-[1.75rem] lg:leading-[1.5]">
            {locale === "lv" ? (
              <>
                Komandu slodzes pārskatāmības platforma: redziet{" "}
                <PixelWaveText text="neredzamo darbu" className="text-white/90" />, patieso{" "}
                <PixelWaveText text="noslodzi" className="text-white/90" /> un{" "}
                <PixelWaveText text="dārgākos klientus" className="text-white/90" />
              </>
            ) : (
              t("hero.subtitle")
            )}
          </p>

          <LandingHeroTrust className="mt-5 sm:mt-6" />

          <Link
            href="#pilots"
            className="mx-auto mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-white/90 sm:mt-8 sm:px-7 sm:py-3 sm:text-base"
          >
            {t("hero.cta")}
          </Link>

        </AnimatedGroup>
      </motion.div>

    </section>
  );
}
