"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Both files are served with a one-year immutable cache, so bump ?v= whenever
// the source clip is re-encoded - otherwise returning visitors keep the old one.
const POSTER_SRC = "/videos/hero-poster.webp?v=3";
const VIDEO_SRC = "/videos/hero.mp4?v=3";

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

/**
 * Decorative looping background for the hero.
 *
 * The poster is the only thing that renders on first paint, so the LCP is a
 * 31 KB image and never the video. The <video> element itself is mounted after
 * hydration goes idle, and only when the visitor's setup makes it a reasonable
 * thing to download at all - reduced motion, Save-Data and 2G connections keep
 * the static poster. Playback pauses whenever the hero scrolls out of view so a
 * long landing page does not decode video the whole way down.
 *
 * The blur is baked into the encoded file rather than applied as a CSS filter -
 * blurring a playing full-screen video costs GPU work on every frame, and the
 * softened footage also compresses several times smaller.
 *
 * The file is self-hosted (no YouTube/Vimeo embed), so no third-party cookies,
 * requests or tracking are involved in showing it.
 */
export function HeroVideoBackground() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const connection = (
      navigator as Navigator & { connection?: NetworkInformation }
    ).connection;

    if (connection?.saveData) return;
    if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) {
      return;
    }

    const start = () => setShouldLoad(true);

    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback?.(handle);
    }

    const timer = window.setTimeout(start, 800);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // React sets `muted` as a property, which can land after the element is
    // live; without this Chrome occasionally refuses the autoplay.
    video.muted = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {
            // Autoplay can still be refused (e.g. iOS low power mode) - the
            // poster stays visible, which is a perfectly fine hero.
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.02 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#070809]"
    >
      <Image
        src={POSTER_SRC}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {shouldLoad && (
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          disablePictureInPicture
          onPlaying={() => setIsPlaying(true)}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-1000",
            isPlaying ? "opacity-100" : "opacity-0",
          )}
        />
      )}

      {/* Legibility: flat dim, a darker vignette around the centred lockup and
          a fade into the page background so the next section blends in.
          Tuned for the bright, high-key office footage - the two layers leave
          ~30% of the frame showing behind the lockup and ~12% at the edges,
          which keeps the white text well clear of the contrast floor while the
          shot stays visible instead of being crushed to black. */}
      <div className="absolute inset-0 bg-[#05070a]/55" />
      <div className="absolute inset-0 bg-[radial-gradient(85%_65%_at_50%_45%,rgba(5,7,10,0.33)_0%,rgba(5,7,10,0.55)_60%,rgba(5,7,10,0.73)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(to_bottom,transparent_0%,rgba(7,8,9,0.72)_58%,#070809_100%)]" />
    </div>
  );
}
