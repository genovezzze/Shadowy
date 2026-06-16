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

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl divide-y divide-white/[0.07]">
      {FAQ_ITEMS.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-display font-black text-base tracking-tight text-white sm:text-lg">
                {item.q}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ease-out ${open ? "max-h-40 pb-5" : "max-h-0"}`}
            >
              <p className="text-sm leading-relaxed text-white/65">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
