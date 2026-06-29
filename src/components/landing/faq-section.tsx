"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { EmphasizedText } from "@/components/landing/emphasized-text";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    question: "Kas ir Shadowy?",
    answer:
      "Shadowy ir darba slodzes pārskatāmības rīks. Darbinieki strukturēti fiksē papildu darbu, vadītāji izvērtē un apstiprina iesniegtos ierakstus, savukārt administratori saņem organizācijas līmeņa pārskatu",
  },
  {
    question: "Cik maksā 30 dienu pilots?",
    answer:
      "30 dienu pilots ir bez maksas un bez kredītkartes. Pēc pieteikuma saņemšanas mēs sazināsimies ar jums, lai precizētu komandas vajadzības un vienotos par pilota uzsākšanu",
  },
  {
    question: "Cik ilgs laiks nepieciešams, lai sāktu?",
    answer:
      "Sākotnējā iestatīšana parasti aizņem līdz 10 minūtēm. Administrators pievieno darbiniekus un vadītājus, pēc tam sistēma ir gatava lietošanai",
  },
  {
    question: "Kā tiek aizsargāti dati?",
    answer:
      "Vadītājiem ir pieejami tikai viņu komandas apstiprinātie ieraksti, bet administratoriem - savas organizācijas dati. Citu organizāciju informācija nav pieejama. Detalizēta informācija ir norādīta privātuma politikā",
  },
  {
    question: "Kas notiek pēc pilota beigām?",
    answer:
      "Pēc pilota beigām jūs varat izvēlēties turpināt vai pārtraukt lietošanu. Pārtraukšanas gadījumā datus iespējams eksportēt, un pēc noteiktā glabāšanas perioda tie tiek dzēsti",
  },
] as const;

const importantFaqPhrases = [
  "strukturēti fiksē papildu darbu",
  "organizācijas līmeņa pārskatu",
  "bez maksas un bez kredītkartes",
  "līdz 10 minūtēm",
  "tikai viņu komandas apstiprinātie ieraksti",
  "Citu organizāciju informācija nav pieejama",
  "turpināt vai pārtraukt lietošanu",
  "datus iespējams eksportēt",
] as const;

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  return (
    <div className="divide-y divide-white/[0.1] border-y border-white/[0.1]">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <article
            key={item.question}
            className="overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex min-h-16 w-full items-center gap-3 py-4 text-left sm:gap-4 sm:py-5"
            >
              <span className="flex-1 font-accent text-[15px] font-bold leading-snug tracking-[0.015em] text-white/88 sm:text-lg">
                {item.question}
              </span>
              <span className="grid size-8 shrink-0 place-items-center text-white/55">
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="pb-5">
                  <p className="max-w-2xl pb-1 font-accent text-sm font-light leading-6 tracking-[0.01em] text-white/62 sm:text-[15px] sm:leading-relaxed">
                    <EmphasizedText
                      text={item.answer}
                      phrases={importantFaqPhrases}
                    />
                  </p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
