"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Kas ir Shadowy?",
    a: "Shadowy ir rīks, kas palīdz padarīt neredzamo darbu redzamu - darbinieki strukturēti pieraksta papildu darbu, vadītāji to izskata un apstiprina, bet administratori redz visas organizācijas pārskatu.",
  },
  {
    q: "Cik maksā 30 dienu pilots?",
    a: "Pilots ir bez maksas un bez kredītkartes. Pieteikuma formā norādiet komandas lielumu, mēs sazināsimies un palīdzēsim uzsākt - bez nekādām saistībām.",
  },
  {
    q: "Cik ilgs laiks nepieciešams, lai sāktu?",
    a: "Lielākā daļa komandu var sākt jau dažu minūšu laikā - administrators pievieno darbiniekus un vadītājus, un sistēma ir gatava lietošanai.",
  },
  {
    q: "Kā tiek aizsargāti dati?",
    a: "Vadītāji redz tikai savas komandas ierakstus, administratori - visus savas organizācijas datus. Citu organizāciju dati nav redzami. Detalizēta informācija ir privātuma politikā.",
  },
  {
    q: "Kas notiek pēc pilota beigām?",
    a: "Jūs varat pārtraukt jebkurā brīdī. Pēc pārtraukšanas dati tiek glabāti līdz 30 dienām, lai varētu pieprasīt eksportu, pēc tam tie tiek dzēsti.",
  },
];

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  return (
    <div data-reveal="up" data-delay="180" className="divide-y divide-white/[0.09] border-t border-white/[0.09]">
      {FAQ_ITEMS.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span
                className="font-display font-bold text-base tracking-tight transition-colors sm:text-lg"
                style={{ color: open ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.88)" }}
              >
                {item.q}
              </span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-white/45"
                style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: `transform 0.4s ${EASE}` }}
              />
            </button>
            <div
              className="grid"
              style={{
                gridTemplateRows: open ? "1fr" : "0fr",
                transition: `grid-template-rows 0.35s ${EASE}`,
              }}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 text-sm leading-relaxed text-white/60 sm:text-[15px]">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
