"use client";

import { useEffect, useRef, useState } from "react";

const MESSAGES = [
  { at: 0.55, text: "Dati rāda to, ko cilvēki palaiž garām 📊" },
  { at: 0.70, text: "Forma aizpildās 2 minūtēs. Pārbaudīts." },
  { at: 0.85, text: "Pieteikšanās ir bezmaksas. Patiešām! 🎉" },
  { at: 0.95, text: "Sazināsimies divu darba dienu laikā." },
];

function GhostSVG({ blinking }: { blinking: boolean }) {
  return (
    <svg viewBox="0 0 50 70" width="54" height="70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M25 4C12 4 4 13 4 26L4 57Q7 51 10.5 57Q14 63 17.5 57Q21 51 25 54Q29 51 32.5 57Q36 63 39.5 57Q43 51 46 57L46 26C46 13 38 4 25 4Z"
        fill="white"
        fillOpacity="0.94"
      />
      <ellipse cx="17.5" cy="27" rx="4.5" ry={blinking ? 0.7 : 5.5} fill="#0b1526" />
      <ellipse cx="32.5" cy="27" rx="4.5" ry={blinking ? 0.7 : 5.5} fill="#0b1526" />
      {!blinking && <circle cx="19.5" cy="25" r="1.5" fill="white" fillOpacity="0.65" />}
      {!blinking && <circle cx="34.5" cy="25" r="1.5" fill="white" fillOpacity="0.65" />}
      <ellipse cx="10" cy="34" rx="4" ry="2.5" fill="#fda4af" fillOpacity="0.18" />
      <ellipse cx="40" cy="34" rx="4" ry="2.5" fill="#fda4af" fillOpacity="0.18" />
    </svg>
  );
}

export function GhostMascot() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only appear after user has scrolled 55% of the page
    const check = () => {
      const progress = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      if (progress >= 0.55 && !visible) {
        setVisible(true);
        setBubbleOpen(true);
        bubbleTimer.current = setTimeout(() => setBubbleOpen(false), 4000);
        window.removeEventListener("scroll", check);
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const progress = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      let newIdx = 0;
      for (let i = MESSAGES.length - 1; i >= 0; i--) {
        if (progress >= MESSAGES[i].at) { newIdx = i; break; }
      }
      setMsgIdx(prev => {
        if (prev !== newIdx) {
          setBubbleOpen(true);
          if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
          bubbleTimer.current = setTimeout(() => setBubbleOpen(false), 3500);
        }
        return newIdx;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 130);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  if (!visible || dismissed) return null;

  return (
    <div
      className={`fixed bottom-6 right-5 z-50 hidden flex-col items-end gap-2 sm:flex transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {/* Speech bubble */}
      <div
        className={`relative max-w-[190px] rounded-2xl border border-white/10 bg-[#0c1628]/95 px-3.5 py-2.5 text-[11px] leading-relaxed text-white/65 shadow-xl backdrop-blur-md transition-all duration-300 ${
          bubbleOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-2 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {MESSAGES[msgIdx].text}
        <div className="absolute -bottom-[5px] right-8 h-2.5 w-2.5 rotate-45 border-b border-r border-white/10 bg-[#0c1628]" />
      </div>

      {/* Ghost + dismiss */}
      <div className="group relative flex flex-col items-end">
        <button
          onClick={() => setDismissed(true)}
          className="absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-white/15 text-[9px] text-white/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-white/25 hover:text-white/80"
          aria-label="Aizvērt"
        >
          ×
        </button>

        <div
          className="animate-ghost-float cursor-pointer select-none"
          onClick={() => setBubbleOpen(v => !v)}
          style={{
            filter: "drop-shadow(0 0 14px rgba(255,255,255,0.14)) drop-shadow(0 6px 20px rgba(0,0,0,0.45))",
          }}
        >
          <GhostSVG blinking={blinking} />
        </div>
      </div>
    </div>
  );
}
