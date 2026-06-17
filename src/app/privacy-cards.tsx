"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

const SEES = ["Apstiprātus ierakstus", "Kopējo darba slodzi", "Lomu neatbilstības", "Komandas tendences"];
const NOT_SEES = ["Privātas sarunas", "Ekrāna aktivitāti", "Neapstiprinātos datus", "Personigu saturu"];

export function PrivacyCards() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SEES.length), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Left – what manager sees, animated */}
      <div className="glass rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/70">Ko vadītājs redz</p>
        </div>
        <ul className="space-y-3">
          {SEES.map((item, i) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm transition-all duration-500"
              style={{ opacity: i === active ? 1 : 0.55 }}
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

      {/* Right – what manager doesn't see, blurred */}
      <div className="glass rounded-xl border border-white/[0.07] bg-white/[0.015] p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white/15" />
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">Ko vadītājs neredz</p>
        </div>
        <ul className="space-y-3">
          {NOT_SEES.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
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
