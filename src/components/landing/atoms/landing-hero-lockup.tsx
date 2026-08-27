"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { HeroVideoBackground } from "@/components/landing/hero-video-background";
import { cn } from "@/lib/utils";
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

  // Clicking the mark plays the spin once. Hovering only offers it - a pointer
  // resting on the lockup no longer sets anything in motion.
  const [isLogoSpinning, setIsLogoSpinning] = React.useState(false);

  const playLogoSpin = React.useCallback(() => {
    // The rotation is motion-safe only, so under reduced motion no
    // animationiteration would ever arrive to end it and the mark would sit in
    // its played state for good. Leave it alone instead.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setIsLogoSpinning(true);
  }, []);

  const settleLogoSpin = React.useCallback(
    (event: React.AnimationEvent<HTMLElement>) => {
      // Animation events bubble: the mark's own shimmer would otherwise settle
      // the spin early. Only the wrapper's own rotation counts - so this lands
      // exactly on a completed 360 and the mark always stops upright.
      if (event.target !== event.currentTarget) return;
      setIsLogoSpinning(false);
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
      maskImage: "url('/shadowy.svg')",
      WebkitMaskImage: "url('/shadowy.svg')",
      maskSize: "contain",
      WebkitMaskSize: "contain",
      maskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
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
            className="mx-auto flex w-fit cursor-pointer items-center justify-center gap-3 sm:gap-5 lg:gap-6"
          >
            <span
              aria-hidden
              onAnimationIteration={settleLogoSpin}
              className={cn(
                "relative block size-8 shrink-0 sm:size-[3.75rem] lg:size-[4.25rem]",
                isLogoSpinning &&
                  "motion-safe:animate-[spin_2.6s_linear_infinite]",
              )}
            >
              {/* Both layers are the logo shape punched out of a solid fill,
                  cross-faded while it plays - you cannot transition a flat
                  colour into an animated gradient. */}
              <span
                style={logoMaskStyle}
                className={cn(
                  "absolute inset-0 bg-white transition-opacity",
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

            {/* Driven by the spin state, so the wordmark holds its lit look
                until the mark finishes its turn and then eases back over the
                same curve - the two land together. */}
            <span
              className={cn(
                "relative inline-block font-display text-[clamp(1.8rem,8vw,2.1rem)] font-medium leading-none tracking-[-0.022em] transition-transform motion-reduce:transform-none sm:text-[4rem] lg:text-[4.6rem]",
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
                Shadowy
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
                Shadowy
              </span>
            </span>
          </div>

          <h1 className="mx-auto mt-4 max-w-[350px] text-balance text-center text-[clamp(0.95rem,4.2vw,1.1rem)] font-light leading-[1.5] tracking-[0.005em] text-white/[0.63] sm:max-w-3xl sm:text-2xl lg:mt-5 lg:text-[1.75rem] lg:leading-[1.5]">
            {/* Inline on phones so the sentence wraps to fit the screen, and
                broken at the comma from sm up, where the intended two lines
                fit. */}
            <span className="sm:block">Redziet neredzamo darbu, fokusa zudumu un to,</span>{" "}
            <span className="sm:block">kuri klienti jūsu uzņēmumam izmaksā visdārgāk</span>
          </h1>

          {/* Outside the lockup's click target, so pressing the CTA never also
              fires the logo spin. */}
          <Link
            href="#pilots"
            className="mx-auto mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-white/90 sm:mt-10 sm:px-7 sm:py-3 sm:text-base"
          >
            Sākt projektu
            <ArrowUpRight className="size-4 sm:size-[18px]" aria-hidden />
          </Link>

        </AnimatedGroup>
      </div>
    </section>
  );
}
