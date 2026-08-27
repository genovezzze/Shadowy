"use client";

import * as React from "react";

// The mark is sampled onto a GRID x GRID field of cells; every cell the mark
// covers becomes one pixel. 30 is fine enough to read as the logo and coarse
// enough to stay obviously pixelated.
const GRID = 30;
// Alpha above which a sampled cell counts as part of the mark.
const ALPHA_THRESHOLD = 90;

// The pixels fly in once and stay: after the mark has assembled it simply keeps
// turning, so the section always has something alive in it without the shape
// ever breaking up again.
const GATHER = 1800;
// The mark stands still for a beat once it is whole, before anything turns.
const SETTLE = 1600;
// The turn does not snap on at full speed; it winds up over this long, which is
// what makes it read as something being switched on rather than a loop that was
// always running.
const SPIN_RAMP = 1800;
// Milliseconds for one full turn - slow enough to read as drift, not spin.
const REVOLUTION = 26000;

/**
 * How far the mark has turned at `phase`, in radians.
 *
 * Nothing turns until the mark has assembled and held; from there the speed
 * winds up from zero over SPIN_RAMP and then stays constant, so the angle is the
 * area under that speed curve rather than a plain multiplication.
 */
function spinAngle(phase: number) {
  const spinning = phase - GATHER - SETTLE;
  if (spinning <= 0) return 0;

  const speed = (Math.PI * 2) / REVOLUTION;
  if (spinning < SPIN_RAMP) {
    return (speed * spinning * spinning) / (2 * SPIN_RAMP);
  }
  return speed * (spinning - SPIN_RAMP / 2);
}

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type Pixel = {
  /** Cell the pixel belongs to in the assembled mark, in 0..1 of the canvas. */
  targetX: number;
  targetY: number;
  /** Where it sits when the mark is apart, also in 0..1. */
  looseX: number;
  looseY: number;
  /** Keeps each pixel slightly out of step with its neighbours. */
  offset: number;
};

/**
 * The Shadowy mark assembling out of pixels once the intro has cleared, holding
 * still for a beat, then winding up into a slow turn it never leaves.
 *
 * The shape is not hand-authored: the SVG is drawn once to an offscreen canvas
 * and sampled on a grid, so the pixels always match whatever the mark actually
 * is. Under reduced motion it paints the assembled mark once and stops.
 */
export function PixelLogoDissolve({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let pixels: Pixel[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let disposed = false;
    // rAF timestamps are page-relative; the gather has to be measured from the
    // first frame this canvas draws, otherwise a late mount skips it.
    let startTime = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const sample = (image: HTMLImageElement) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = GRID;
      offscreen.height = GRID;
      const offscreenContext = offscreen.getContext("2d");
      if (!offscreenContext) return;

      offscreenContext.drawImage(image, 0, 0, GRID, GRID);
      const { data } = offscreenContext.getImageData(0, 0, GRID, GRID);

      const next: Pixel[] = [];
      for (let row = 0; row < GRID; row += 1) {
        for (let column = 0; column < GRID; column += 1) {
          const alpha = data[(row * GRID + column) * 4 + 3];
          if (alpha < ALPHA_THRESHOLD) continue;

          next.push({
            targetX: (column + 0.5) / GRID,
            targetY: (row + 0.5) / GRID,
            // The loose position is in canvas space, not in the mark's square:
            // scattered pixels spread over the whole width so the effect never
            // outlines a block in the middle of the section.
            looseX: Math.random(),
            looseY: 0.5 + (Math.random() - 0.5) * 0.9,
            offset: Math.random(),
          });
        }
      }
      pixels = next;
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      // The mark is drawn square and centred, so it does not stretch with the
      // canvas the wrapper gives it.
      const size = Math.min(width, height);
      const originX = (width - size) / 2;
      const originY = (height - size) / 2;
      const cell = Math.max(1.5, (size / GRID) * 0.62);

      if (!startTime) startTime = time;
      const phase = reducedMotion ? GATHER : time - startTime;
      const angle = reducedMotion ? 0 : spinAngle(phase);
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      for (const pixel of pixels) {
        // 0 = scattered, 1 = in place.
        let assembly: number;
        // Staggering by offset is what makes the mark gather and shed a few
        // pixels at a time instead of moving as one block.
        const lead = pixel.offset * 400;

        if (phase < GATHER) {
          assembly = easeInOut(
            Math.min(1, Math.max(0, (phase - lead) / (GATHER - 400))),
          );
        } else {
          assembly = 1;
        }

        // The assembled position, turned about the centre of the mark.
        const localX = pixel.targetX - 0.5;
        const localY = pixel.targetY - 0.5;
        const spunX = 0.5 + localX * cos - localY * sin;
        const spunY = 0.5 + localX * sin + localY * cos;

        const looseX = pixel.looseX * width;
        const looseY = pixel.looseY * height;
        const x = looseX + (originX + size * spunX - looseX) * assembly;
        const y = looseY + (originY + size * spunY - looseY) * assembly;

        // Invisible while still adrift, so the pixels appear to arrive out of
        // nothing rather than sliding in from the edges.
        const alpha = Math.pow(assembly, 1.6) * 0.6;
        if (alpha < 0.01) continue;

        context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        context.fillRect(x - cell / 2, y - cell / 2, cell, cell);
      }

      if (!reducedMotion && !disposed) frame = requestAnimationFrame(draw);
    };

    const image = new Image();
    image.src = "/shadowy.svg";

    // Nothing runs while the intro is still over the page: the assembly is the
    // hero's own entrance and would otherwise be spent behind the overlay.
    const begin = () => {
      if (disposed) return;
      if (!image.complete) {
        image.onload = begin;
        return;
      }
      resize();
      sample(image);
      startTime = 0;
      frame = requestAnimationFrame(draw);
    };

    const introDone =
      document.documentElement.dataset.landingIntroComplete === "true";
    if (introDone) {
      begin();
    } else {
      window.addEventListener("shadowy:intro-complete", begin, { once: true });
    }

    const onResize = () => {
      resize();
      if (reducedMotion) draw(0);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("shadowy:intro-complete", begin);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
