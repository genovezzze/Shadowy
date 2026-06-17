"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

const CARDS = [
  {
    n: "01",
    text: "Kolēģi regulāri palīdz viens otram, bet tas nekur netiek fiksēts.",
    sub: "Katras nedēļas slēptais darbs, kas nekad neparādās nekādos datos.",
    tag: "Koordinācija",
    glow: "160 70% 40%",
    tagCls: "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400/80",
  },
  {
    n: "02",
    text: "Jaunie darbinieki tiek ievadīti neformāli, bez redzamas slodzes.",
    sub: "Kāds to dara katru reizi no jauna, bet tas nekur nav redzams.",
    tag: "Onboarding",
    glow: "200 80% 55%",
    tagCls: "border-sky-500/30 bg-sky-500/[0.08] text-sky-400/80",
  },
  {
    n: "03",
    text: "Vadītājs redz rezultātu, bet neredz slēpto darbu aiz tā.",
    sub: "Daļa cilvēku uzņemas vairāk, nekā paredz viņu loma.",
    tag: "Redzamība",
    glow: "270 80% 65%",
    tagCls: "border-violet-500/30 bg-violet-500/[0.08] text-violet-400/80",
  },
] as const;

const DURATION = 3200;

export function ProblemCards() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (paused) { setProgress(0); return; }
    setProgress(0);
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const pct = Math.min((now - start) / DURATION, 1);
      setProgress(pct);
      if (pct < 1) { raf = requestAnimationFrame(tick); }
      else { setActive((i) => (i + 1) % CARDS.length); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused]);

  return (
    <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-stretch">
      {CARDS.map((card, i) => {
        const isActive = active === i;
        return (
          <>
            <div
              key={card.n}
              className="glass flex flex-1 flex-col rounded-2xl border"
              style={{
                padding: "2rem",
                minHeight: "340px",
                borderColor: isActive ? `hsl(${card.glow} / 0.4)` : "rgba(255,255,255,0.07)",
                boxShadow: isActive
                  ? `0 0 50px hsl(${card.glow} / 0.2), 0 12px 40px rgba(0,0,0,0.5)`
                  : "0 2px 12px rgba(0,0,0,0.2)",
                transform: isActive ? "translateY(-10px) scale(1.02)" : "translateY(0) scale(1)",
                transition: "border-color 0.8s ease, box-shadow 0.8s ease, transform 0.8s ease",
                cursor: "pointer",
              }}
              onMouseEnter={() => { setPaused(true); setActive(i); }}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Top accent + progress bar */}
              <div className="mb-6 h-[2px] w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  style={{
                    height: "100%",
                    width: isActive ? `${progress * 100}%` : "0%",
                    background: `linear-gradient(90deg, hsl(${card.glow}), hsl(${card.glow} / 0.4))`,
                    transition: isActive ? "none" : "width 0.6s ease",
                    borderRadius: "9999px",
                  }}
                />
              </div>

              {/* Number */}
              <span
                className="font-mono text-[13px] font-bold"
                style={{
                  color: isActive ? `hsl(${card.glow})` : "rgba(255,255,255,0.25)",
                  transition: "color 0.8s ease",
                }}
              >
                {card.n}
              </span>

              {/* Main text */}
              <p
                className="mt-5 font-display font-bold leading-tight tracking-tight"
                style={{
                  fontSize: "clamp(1.15rem, 2vw, 1.45rem)",
                  color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                  transform: isActive ? "translateY(0)" : "translateY(6px)",
                  transition: "color 0.8s ease, transform 0.8s ease",
                }}
              >
                {card.text}
              </p>

              {/* Sub text */}
              <p
                className="mt-4 text-[15px] leading-relaxed"
                style={{
                  color: isActive ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.22)",
                  transform: isActive ? "translateY(0)" : "translateY(6px)",
                  transition: "color 0.8s ease, transform 0.8s ease, opacity 0.8s ease",
                  transitionDelay: isActive ? "0.05s" : "0s",
                }}
              >
                {card.sub}
              </p>

              {/* Tag */}
              <div className="mt-auto pt-8">
                <span
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest ${card.tagCls}`}
                  style={{
                    opacity: isActive ? 1 : 0.4,
                    transition: "opacity 0.8s ease",
                  }}
                >
                  {card.tag}
                </span>
              </div>
            </div>

            {i < CARDS.length - 1 && (
              <div key={`arrow-${i}`} className="flex shrink-0 items-center justify-center">
                <ArrowRight
                  className="h-6 w-6 rotate-90 sm:rotate-0"
                  style={{
                    color: active === i ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.12)",
                    transition: "color 0.8s ease",
                  }}
                />
              </div>
            )}
          </>
        );
      })}
    </div>
  );
}
