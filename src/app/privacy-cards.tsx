"use client";

import { useState, useEffect, useRef, MouseEvent } from "react";
import { Check, X, ShieldCheck, EyeOff } from "lucide-react";

const SEES = ["Apstiprātus ierakstus", "Kopējo darba slodzi", "Lomu neatbilstības", "Komandas tendences"];
const NOT_SEES = ["Privātas sarunas", "Ekrāna aktivitāti", "Neapstiprinātos datus", "Personigu saturu"];

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export function PrivacyCards() {
  const [active, setActive] = useState(0);
  const seesRef = useRef<HTMLDivElement>(null);
  const notSeesRef = useRef<HTMLDivElement>(null);
  const [notSeesHover, setNotSeesHover] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SEES.length), 1600);
    return () => clearInterval(id);
  }, []);

  const onSpotlightMove = (ref: typeof seesRef) => (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Left – what manager sees, animated, spotlight on hover */}
      <div
        ref={seesRef}
        onMouseMove={onSpotlightMove(seesRef)}
        className="group relative overflow-hidden rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5"
        style={{ transition: `border-color 0.5s ${EASE}, transform 0.5s ${EASE}` }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(280px circle at var(--spot-x, 50%) var(--spot-y, 50%), hsl(160 80% 40% / 0.16), transparent 70%)" }}
        />
        <div className="relative mb-4 flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/70">Ko vadītājs redz</p>
        </div>
        <ul className="relative space-y-3">
          {SEES.map((item, i) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm transition-all duration-500"
              style={{ opacity: i === active ? 1 : 0.55, transitionTimingFunction: EASE }}
            >
              <div
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all duration-500"
                style={i === active ? { background: "rgba(52,211,153,0.2)", boxShadow: "0 0 8px rgba(52,211,153,0.5)" } : {}}
              >
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span className={`leading-snug transition-all duration-500 ${i === active ? "text-white font-medium" : "text-white/75"}`}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right – what manager doesn't see, blurred until hovered (visual metaphor for privacy) */}
      <div
        ref={notSeesRef}
        onMouseMove={onSpotlightMove(notSeesRef)}
        onMouseEnter={() => setNotSeesHover(true)}
        onMouseLeave={() => setNotSeesHover(false)}
        className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.015] p-5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(280px circle at var(--spot-x, 50%) var(--spot-y, 50%), hsl(0 0% 70% / 0.06), transparent 70%)" }}
        />
        <div className="relative mb-4 flex items-center gap-2">
          <EyeOff className="h-3.5 w-3.5 text-white/35" />
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">Ko vadītājs neredz</p>
        </div>
        <ul className="relative space-y-3">
          {NOT_SEES.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm transition-all duration-500"
              style={{
                filter: notSeesHover ? "blur(0px)" : "blur(2.5px)",
                transitionTimingFunction: EASE,
              }}
            >
              <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/30" />
              <span className="leading-snug text-white/55">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
