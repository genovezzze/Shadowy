"use client";

import { useEffect, useRef } from "react";

interface TiltProps {
  children: React.ReactNode;
  baseX?: number;
  baseY?: number;
  rangeX?: number;
  rangeY?: number;
  perspective?: number;
}

export function HeroTilt({
  children,
  baseX = 3,
  baseY = -9,
  rangeX = 10,
  rangeY = 16,
  perspective = 1400,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    let targetX = 0, targetY = 0;
    let smoothX = 0, smoothY = 0;

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetX = nx * rangeY;
      targetY = -ny * rangeX;
    };

    const tick = () => {
      smoothX += (targetX - smoothX) * 0.05;
      smoothY += (targetY - smoothY) * 0.05;
      if (ref.current) {
        ref.current.style.transform =
          `perspective(${perspective}px) rotateX(${baseX + smoothY}deg) rotateY(${baseY + smoothX}deg)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, [baseX, baseY, rangeX, rangeY, perspective]);

  return (
    <div
      ref={ref}
      style={{
        transform: `perspective(${perspective}px) rotateX(${baseX}deg) rotateY(${baseY}deg)`,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
