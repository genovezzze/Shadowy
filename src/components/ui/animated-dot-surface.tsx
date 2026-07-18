"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function AnimatedDotSurface({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let isVisible = false;
    let lastPaint = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      const rows = 38;
      const columns = Math.max(54, Math.ceil(width / 22));
      const centerX = width / 2;
      const horizon = height * 0.2;
      const animatedTime = reducedMotion ? 0 : time;

      for (let row = 0; row < rows; row += 1) {
        const depth = row / (rows - 1);
        const perspectiveDepth = depth * depth;
        const baseY =
          horizon + perspectiveDepth * (height * 0.9 - horizon);
        const spread = width * (0.42 + depth * 0.92);

        for (let column = 0; column < columns; column += 1) {
          const columnProgress = column / (columns - 1) - 0.5;
          const primaryWave = Math.sin(
            column * 0.34 + row * 0.18 + animatedTime * 0.00105,
          );
          const secondaryWave = Math.sin(
            column * 0.13 - row * 0.27 - animatedTime * 0.00065,
          );
          const wave =
            primaryWave * (2 + depth * 11) +
            secondaryWave * (1 + depth * 6);
          const x =
            centerX +
            columnProgress * spread +
            Math.sin(row * 0.2 + animatedTime * 0.00045) * depth * 5;
          const y = baseY + wave;
          const radius = 0.55 + depth * 1.25;
          const alpha = 0.07 + depth * 0.35;

          if (primaryWave > 0.78) {
            context.fillStyle = `rgba(110, 231, 183, ${alpha * 0.72})`;
          } else if (primaryWave < -0.78) {
            context.fillStyle = `rgba(52, 211, 153, ${alpha * 0.52})`;
          } else {
            context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          }

          context.fillRect(x, y, radius, radius);
        }
      }

    };

    const tick = (time: number) => {
      if (!isVisible) return;

      // 30 fps is enough for the subtle background wave and leaves the main
      // thread free for native scrolling, especially on high-DPI phones.
      if (time - lastPaint >= 1000 / 30) {
        draw(time);
        lastPaint = time;
      }
      frame = window.requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion || isVisible) draw(0);
    });

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        window.cancelAnimationFrame(frame);

        if (isVisible) {
          if (reducedMotion) draw(0);
          else frame = window.requestAnimationFrame(tick);
        }
      },
      { rootMargin: "120px 0px" },
    );

    resizeObserver.observe(canvas);
    visibilityObserver.observe(canvas);
    resize();

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 h-[520px] w-full",
        "[mask-image:linear-gradient(to_bottom,transparent_3%,black_18%,black_82%,transparent_100%)]",
        className,
      )}
    />
  );
}
