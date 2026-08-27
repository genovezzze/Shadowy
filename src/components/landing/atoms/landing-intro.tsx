"use client";

import * as React from "react";
import { motion } from "framer-motion";

const WORDMARK = "Shadowy";
const FONT_FAMILIES = [
  "Geist Pixel Square",
  "Geist Pixel Grid",
  "Geist Pixel Circle",
  "Geist Pixel Triangle",
  "Geist Pixel Line",
] as const;

const FRAME_MS = 50;
const FONT_CYCLE_MS = 600;
const LETTER_STAGGER_MS = 250;
const ENTER_DURATION_MS = 3300;
const EXIT_DURATION_MS = 3300;

function fontIndexForCharacter(characterIndex: number, elapsed: number) {
  const waveStep = Math.floor(
    Math.max(0, elapsed - characterIndex * LETTER_STAGGER_MS) /
      FONT_CYCLE_MS,
  );

  return (characterIndex + waveStep) % FONT_FAMILIES.length;
}

export function LandingIntro() {
  const [fontsReady, setFontsReady] = React.useState(false);
  const [visible, setVisible] = React.useState(true);
  const [isExiting, setIsExiting] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    delete document.documentElement.dataset.landingIntroComplete;

    let cancelled = false;
    const fontLoads = FONT_FAMILIES.map((family) =>
      document.fonts.load(`400 54px "${family}"`, WORDMARK),
    );
    void Promise.all(fontLoads).then(() => {
      if (!cancelled) setFontsReady(true);
    });

    return () => {
      cancelled = true;
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  React.useEffect(() => {
    if (!fontsReady) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      const reducedTimer = window.setTimeout(() => setVisible(false), 500);
      return () => window.clearTimeout(reducedTimer);
    }

    const waveTimer = window.setInterval(
      () => setElapsed((current) => current + FRAME_MS),
      FRAME_MS,
    );
    const exitTimer = window.setTimeout(
      () => setIsExiting(true),
      ENTER_DURATION_MS,
    );
    const removeTimer = window.setTimeout(
      () => setVisible(false),
      ENTER_DURATION_MS + EXIT_DURATION_MS,
    );

    return () => {
      window.clearInterval(waveTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [fontsReady]);

  React.useEffect(() => {
    if (!visible) {
      document.body.style.overflow = "";
      document.documentElement.dataset.landingIntroComplete = "true";
      window.dispatchEvent(new Event("shadowy:intro-complete"));
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Shadowy tiek ielādēts"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={
        isExiting
          ? { duration: 0.8, delay: 2.5, ease: "easeInOut" }
          : { duration: 0 }
      }
      className={`fixed inset-0 z-[10000] h-[100dvh] overflow-hidden bg-white ${
        isExiting ? "pointer-events-none" : ""
      }`}
    >
      <span
        aria-hidden
        className={`absolute left-1/2 top-[40%] flex -translate-x-1/2 -translate-y-1/2 select-none items-center gap-2.5 md:top-1/2 md:gap-3.5 ${
          fontsReady ? "visible" : "invisible"
        }`}
      >
        <span
          className={`landing-intro-logo-spin block size-[30px] shrink-0 md:size-[46px] ${
            fontsReady ? "landing-intro-logo-spin--active" : ""
          }`}
        >
          <span
            className={`landing-intro-logo block size-full ${
              fontsReady
                ? isExiting
                  ? "landing-intro-logo--out"
                  : "landing-intro-logo--in"
                : ""
            }`}
          />
        </span>

        <span
          className={`landing-intro-wordmark text-center text-[32px] font-bold leading-none tracking-[-0.05em] md:text-[54px] ${
            fontsReady
              ? isExiting
                ? "landing-intro-wordmark--out"
                : "landing-intro-wordmark--in"
              : ""
          }`}
        >
          {[...WORDMARK].map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="inline-block"
              style={{
                fontFamily:
                  FONT_FAMILIES[fontIndexForCharacter(index, elapsed)],
              }}
            >
              {letter}
            </span>
          ))}
        </span>
      </span>

      <style jsx global>{`
        @font-face {
          font-family: "Geist Pixel Square";
          src: url("/fonts/GeistPixel-Square.woff2") format("woff2");
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }

        @font-face {
          font-family: "Geist Pixel Grid";
          src: url("/fonts/GeistPixel-Grid.woff2") format("woff2");
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }

        @font-face {
          font-family: "Geist Pixel Circle";
          src: url("/fonts/GeistPixel-Circle.woff2") format("woff2");
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }

        @font-face {
          font-family: "Geist Pixel Triangle";
          src: url("/fonts/GeistPixel-Triangle.woff2") format("woff2");
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }

        @font-face {
          font-family: "Geist Pixel Line";
          src: url("/fonts/GeistPixel-Line.woff2") format("woff2");
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }

        @keyframes landingIntroRevealIn {
          from {
            background-position: 100% 0;
          }
          to {
            background-position: 0% 0;
          }
        }

        @keyframes landingIntroRevealOut {
          from {
            background-position: 0% 0;
          }
          to {
            background-position: 100% 0;
          }
        }

        @keyframes landingIntroLogoSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .landing-intro-logo-spin {
          transform: rotate(0deg);
          transform-origin: center;
          will-change: transform;
        }

        .landing-intro-logo-spin--active {
          animation: landingIntroLogoSpin 4.2s linear infinite;
        }

        .landing-intro-wordmark {
          background-size: 300% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .landing-intro-logo {
          background-size: 300% 100%;
          mask: url("/images/story/Black-pixel.png") center / contain no-repeat;
          -webkit-mask: url("/images/story/Black-pixel.png") center / contain
            no-repeat;
          image-rendering: pixelated;
        }

        .landing-intro-wordmark--in,
        .landing-intro-logo--in {
          background-image: linear-gradient(
            90deg,
            #000 0%,
            #000 46%,
            #4caf50 47.5%,
            #ff4081 49%,
            #288cff 50.5%,
            #ffc107 52%,
            transparent 54%,
            transparent 100%
          );
          background-position: 100% 0;
        }

        .landing-intro-logo--in {
          animation: landingIntroRevealIn 2.5s cubic-bezier(0.2, 0, 0, 1)
            0.1s forwards;
        }

        .landing-intro-wordmark--in {
          animation: landingIntroRevealIn 2.5s cubic-bezier(0.2, 0, 0, 1)
            0.1s forwards;
        }

        .landing-intro-wordmark--out,
        .landing-intro-logo--out {
          background-image: linear-gradient(
            90deg,
            #000 0%,
            #000 46%,
            #ffc107 47.5%,
            #288cff 49%,
            #ff4081 50.5%,
            #4caf50 52%,
            transparent 54%,
            transparent 100%
          );
          background-position: 0% 0;
        }

        .landing-intro-wordmark--out {
          animation: landingIntroRevealOut 2.5s cubic-bezier(0.2, 0, 0, 1)
            0.5s forwards;
        }

        .landing-intro-logo--out {
          animation: landingIntroRevealOut 2.5s cubic-bezier(0.2, 0, 0, 1)
            0.5s forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-intro-wordmark {
            animation: none;
            background: #000;
            background-clip: text;
            -webkit-background-clip: text;
          }

          .landing-intro-logo {
            animation: none;
            background: #000;
          }

          .landing-intro-logo-spin {
            animation: none;
          }
        }
      `}</style>
    </motion.div>
  );
}
