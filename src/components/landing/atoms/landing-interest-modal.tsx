"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

// The popup is tied to a place on the page rather than to a stopwatch: it opens
// when the reader reaches the outcomes section, which is the point where the
// offer makes sense. Same trigger on phones and on desktop.
const TRIGGER_SELECTOR = "#ieguvumi";
// A short beat after the section comes into view, so the popup does not land on
// top of the heading the reader has just arrived at.
const OPEN_DELAY_MS = 1200;

export function LandingInterestModal() {
  const [open, setOpen] = React.useState(false);
  const dialogRef = React.useRef<HTMLElement>(null);
  // Once shown, it stays shown for the rest of the session - scrolling back up
  // and down again must not bring it back.
  const shown = React.useRef(false);

  React.useEffect(() => {
    let timer: number | undefined;
    let observer: IntersectionObserver | undefined;

    const watchTrigger = () => {
      const target = document.querySelector(TRIGGER_SELECTOR);
      if (!target) return;

      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          if (shown.current) return;
          shown.current = true;
          observer?.disconnect();
          timer = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
        },
        // A fifth of the section on screen is enough to count as arrived.
        { threshold: 0.2 },
      );
      observer.observe(target);
    };

    if (document.documentElement.dataset.landingIntroComplete === "true") {
      watchTrigger();
    } else {
      window.addEventListener("shadowy:intro-complete", watchTrigger, {
        once: true,
      });
    }

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      observer?.disconnect();
      window.removeEventListener("shadowy:intro-complete", watchTrigger);
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the dialog, not the close button. Moving focus onto a control is
    // what drew the browser's focus ring around the cross the moment the modal
    // opened - a heavy outline the design never asked for. The panel takes the
    // focus instead, so Escape and the tab order still start inside the modal
    // while nothing is highlighted.
    dialogRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  // A fixed overlay is positioned against the nearest transformed ancestor, not
  // the viewport, and the landing page has several - which is what pushed the
  // card off centre. Mounting it on the body takes it out of that chain.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const overlay = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Aizvērt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-xl"
          />

          <motion.section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="interest-modal-title"
            tabIndex={-1}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border-none bg-white/[0.08] text-white shadow-[0_20px_100px_rgba(0,0,0,0.5)] outline-none backdrop-blur-[40px]"
          >
            <div className="relative min-h-[500px]">
              <div className="absolute left-6 right-6 top-6 z-50 flex items-center justify-between">
                <div className="size-10" aria-hidden="true" />
                <button
                  type="button"
                  aria-label="Aizvērt"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer rounded-full bg-white/5 p-2.5 text-white/40 outline-none transition-all hover:bg-white/10 hover:text-white focus-visible:ring-1 focus-visible:ring-white/40 active:scale-95"
                >
                  <X className="size-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="relative flex h-full min-h-[500px] w-full flex-col justify-between overflow-hidden p-6 md:p-12">
                <div className="z-10 max-w-lg space-y-4 pr-10 pt-4 md:pr-0">
                  <h2
                    id="interest-modal-title"
                    className="m-0 text-3xl font-bold leading-[1.1] tracking-tighter text-white md:text-5xl"
                  >
                    Ieinteresēja? Atstājiet pieteikumu
                  </h2>
                  <p className="m-0 max-w-sm text-base font-normal leading-tight text-white/40 md:text-lg">
                    Pastāstiet īsi par savu komandu - mēs ar jums sazināsimies un
                    vienosimies par sarunu
                  </p>
                </div>

                <div className="z-10 pb-4">
                  <a
                    href="#pilots"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-12 items-center justify-center rounded-full border-none bg-white px-8 text-sm font-bold text-black transition-all hover:bg-white/90 active:scale-95"
                  >
                    Atstāt pieteikumu
                  </a>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 0.9, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                  // Sat on negative offsets before, which pushed it past the card's
                  // edges - and the card clips (`overflow-hidden` carries the
                  // rounded corners), so the island lost its right side and
                  // bottom. Pulled back inside the bounds so the whole cut-out
                  // shows; `object-contain` was never the thing cropping it.
                  className="pointer-events-none absolute bottom-4 right-4 aspect-square w-[70%] select-none md:w-[56%]"
                >
                  <Image
                    src="/images/Blue-Tree-Flowers-Transparent.svg"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 460px, 75vw"
                    // SVG never goes through the image optimiser: Next refuses
                    // it unless `dangerouslyAllowSVG` is on site-wide.
                    unoptimized
                    className="object-contain"
                  />
                </motion.div>
              </div>
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(overlay, document.body);
}
