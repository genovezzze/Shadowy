"use client";

import { useEffect } from "react";

export function MouseEffects() {
  useEffect(() => {
    let prevCard: HTMLElement | null = null;

    const onMove = (e: MouseEvent) => {
      const card = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-card-glow]");

      if (prevCard && prevCard !== card) {
        prevCard.style.setProperty("--glow-opacity", "0");
      }
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
        card.style.setProperty("--glow-opacity", "1");
      }
      prevCard = card ?? null;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}
