"use client";

import * as React from "react";

const WORDMARK = "Shadowy";
const PIXEL_FONTS = [
  "var(--font-pixel-square)",
  "var(--font-pixel-grid)",
  "var(--font-pixel-circle)",
  "var(--font-pixel-triangle)",
  "var(--font-pixel-line)",
] as const;

const FRAME_MS = 50;
const SHINE_STAGGER_MS = 420;
const SHINE_DURATION_MS = 7200;

type PixelBrandProps = {
  variant?: "compact" | "intro";
  iridescent?: boolean;
};

export function PixelBrand({
  variant = "compact",
  iridescent = false,
}: PixelBrandProps) {
  const [elapsed, setElapsed] = React.useState(0);
  const isIntro = variant === "intro";
  const fontCycleMs = isIntro ? 600 : 900;
  const letterStaggerMs = isIntro ? 250 : 375;

  React.useEffect(() => {
    const timer = window.setInterval(
      () => setElapsed((current) => current + FRAME_MS),
      FRAME_MS,
    );

    return () => window.clearInterval(timer);
  }, []);

  return (
    <span
      className={`flex items-center ${isIntro ? "gap-2" : "gap-1.5"}`}
      aria-hidden
    >
      <span
        className={`pixel-brand-logo block shrink-0 bg-white [image-rendering:pixelated] ${
          iridescent ? "pixel-brand-logo-shimmer" : ""
        } ${
          isIntro ? "size-[66px]" : "size-10"
        }`}
        style={
          {
            "--pixel-brand-spin-duration": isIntro ? "4.2s" : "6.3s",
          } as React.CSSProperties
        }
      />
      <span
        className={`pixel-brand-wordmark whitespace-nowrap text-center font-bold leading-none tracking-[-0.05em] ${
          isIntro ? "text-[54px]" : "text-[32px]"
        } text-white ${
          iridescent ? "pixel-brand-wordmark-shimmer" : ""
        }`}
      >
        {[...WORDMARK].map((letter, index) => {
          const waveStep = Math.floor(
            Math.max(0, elapsed - index * letterStaggerMs) / fontCycleMs,
          );

          return (
            <span
              key={`${letter}-${index}`}
              className={`inline-block ${
                iridescent ? "pixel-brand-letter-shimmer" : ""
              }`}
              style={
                {
                  fontFamily:
                    PIXEL_FONTS[(index + waveStep) % PIXEL_FONTS.length],
                  animationDelay: iridescent
                    ? `${(index + 1) * SHINE_STAGGER_MS}ms`
                    : undefined,
                } as React.CSSProperties
              }
            >
              {letter}
            </span>
          );
        })}
      </span>

      <style jsx>{`
        .pixel-brand-logo {
          mask: url("/pixel_logo.png") center / contain no-repeat;
          -webkit-mask: url("/pixel_logo.png") center / contain no-repeat;
          mask-mode: luminance;
          -webkit-mask-mode: luminance;
          animation: pixelBrandSpin var(--pixel-brand-spin-duration) linear
            infinite;
          transform-origin: center;
          will-change: transform;
        }

        .pixel-brand-logo.pixel-brand-logo-shimmer {
          animation:
            pixelBrandSpin var(--pixel-brand-spin-duration) linear infinite,
            pixelBrandLogoShimmer ${SHINE_DURATION_MS}ms ease-in-out
              infinite;
        }

        .pixel-brand-letter-shimmer {
          animation: pixelBrandLetterShimmer ${SHINE_DURATION_MS}ms
            ease-in-out infinite;
        }

        @keyframes pixelBrandSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pixelBrandLogoShimmer {
          0%,
          7%,
          48%,
          100% {
            background-color: #fff;
            filter: brightness(0.72);
            opacity: 0.72;
          }
          18%,
          32% {
            background-color: #fff;
            filter: brightness(1.45) drop-shadow(0 0 7px rgba(255, 255, 255, 0.7));
            opacity: 1;
          }
        }

        @keyframes pixelBrandLetterShimmer {
          0%,
          7%,
          48%,
          100% {
            color: #fff;
            opacity: 0.62;
            filter: brightness(0.82);
            text-shadow: none;
            transform: translateY(0);
          }
          18%,
          32% {
            color: #fff;
            opacity: 1;
            filter: brightness(1.35);
            text-shadow: 0 0 9px rgba(255, 255, 255, 0.42);
            transform: translateY(-1px);
          }
        }
      `}</style>
    </span>
  );
}
