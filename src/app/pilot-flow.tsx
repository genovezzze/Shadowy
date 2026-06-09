"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Eye,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

const STEPS: {
  Icon: LucideIcon;
  step: string;
  title: string;
  text: string;
  example: string;
  circle: string;
  glow: string;
  icon: string;
  label: string;
}[] = [
  {
    Icon: BarChart3,
    step: "01",
    title: "Reālā slodze",
    text: "Skaidrs priekšstats par komandas faktisko darba apjomu, ne tikai kalendāru.",
    example: "Māris: 34 h/ned. dokumentācija + 8 h kolēģu palīdzība",
    circle: "border-emerald-500/40 bg-emerald-500/10",
    glow: "0 0 22px hsl(160 84% 35% / 0.25)",
    icon: "text-emerald-400",
    label: "text-emerald-400",
  },
  {
    Icon: Eye,
    step: "02",
    title: "Neformālais darbs",
    text: "Redzamība uz palīdzību kolēģiem, koordināciju un neplānotiem uzdevumiem.",
    example: "Palīdzēja 3 kolēģiem → neformālais darbs: 6 h/ned.",
    circle: "border-sky-500/40 bg-sky-500/10",
    glow: "0 0 22px hsl(200 84% 40% / 0.25)",
    icon: "text-sky-400",
    label: "text-sky-400",
  },
  {
    Icon: AlertTriangle,
    step: "03",
    title: "Pārslodzes signāli",
    text: "Pirmie brīdinājumi, kad darbinieka slodze pārsniedz komandas vidējo rādītāju.",
    example: "⚠ Marta slodze pārsniedz vidējo par 40%",
    circle: "border-violet-500/40 bg-violet-500/10",
    glow: "0 0 22px hsl(270 60% 50% / 0.25)",
    icon: "text-violet-400",
    label: "text-violet-400",
  },
  {
    Icon: TrendingUp,
    step: "04",
    title: "Vadītāja pārskats",
    text: "Kopsavilkums ar tendencēm un ieteikumiem darba sadales uzlabošanai.",
    example: "Ieteikums: pārdalīt 2 uzdevumus → slodze izlīdzinās",
    circle: "border-emerald-500/40 bg-emerald-500/10",
    glow: "0 0 22px hsl(160 84% 35% / 0.25)",
    icon: "text-emerald-400",
    label: "text-emerald-400",
  },
];

export function PilotFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8">
        {STEPS.map(({ Icon, step, circle, glow, icon, label, title, text, example }, i) => {
          const delay = i * 160;
          const lineDelay = i * 160 + 80;
          return (
            <div
              key={step}
              data-card-glow
              className="relative flex flex-col items-center text-center rounded-2xl p-2"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(28px)",
                transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
              }}
            >
              {/* Left connector line */}
              {i > 0 && (
                <div
                  className="absolute top-[34px] left-0 right-1/2 h-px bg-white/12 origin-right"
                  style={{
                    transform: visible ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "right",
                    transition: `transform 0.5s ease ${lineDelay}ms`,
                  }}
                />
              )}
              {/* Right connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className="absolute top-[34px] left-1/2 right-0 h-px bg-white/12 origin-left"
                  style={{
                    transform: visible ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                    transition: `transform 0.5s ease ${lineDelay}ms`,
                  }}
                />
              )}
              {/* Chevron */}
              {i < STEPS.length - 1 && (
                <ChevronRight
                  className="absolute top-[26px] -right-4 z-20 h-4 w-4 text-white/20"
                  style={{
                    opacity: visible ? 1 : 0,
                    transition: `opacity 0.4s ease ${delay + 260}ms`,
                  }}
                />
              )}

              {/* Circle */}
              <div
                className={`relative z-10 flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 ${circle} backdrop-blur-sm transition-transform duration-300 hover:scale-110`}
                style={{
                  boxShadow: glow,
                  transform: visible ? "scale(1)" : "scale(0.7)",
                  transition: `transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay + 60}ms`,
                }}
              >
                <Icon className={`h-6 w-6 ${icon}`} />
              </div>

              <p className={`mt-3 text-[10px] font-bold uppercase tracking-[0.2em] ${label}`}>
                STEP {step}
              </p>
              <h3 className="mt-5 text-base font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/40">{text}</p>

              {/* Example card */}
              <div
                className="mt-5 w-full rounded-xl border border-white/6 bg-white/[0.025] px-3.5 py-3 text-[11px] italic text-white/30 leading-relaxed"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(10px)",
                  transition: `opacity 0.5s ease ${delay + 300}ms, transform 0.5s ease ${delay + 300}ms`,
                }}
              >
                {example}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-3">
        {STEPS.map(({ Icon, step, circle, glow, icon, label, title, text, example }, i) => (
          <div
            key={step}
            data-card-glow
            className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.55s ease ${i * 100}ms, transform 0.55s ease ${i * 100}ms`,
            }}
          >
            <div
              className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-full border ${circle}`}
              style={{ boxShadow: glow }}
            >
              <Icon className={`h-5 w-5 ${icon}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${label}`}>STEP {step}</p>
              <p className="mt-0.5 font-semibold text-white/85">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/40">{text}</p>
              <p className="mt-2 text-[11px] italic text-white/25">{example}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
