"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { cn } from "@/lib/utils";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";

const FAQ_ITEMS = [
  {
    question: "Kas ir neredzamais darbs?",
    answer:
      "Neredzamais darbs ir viss tas, ko darbinieks dara papildus saviem darba līgumā noteiktajiem pienākumiem - vai kas pārtrauc viņa fokusu un traucē pamatdarbam. Piemēram: palīdzība kolēģiem, jauno darbinieku ievadīšana, atkārtotu jautājumu atbildēšana, informācijas gaidīšana, koordinācija starp cilvēkiem, steidzami uzdevumi ārpus lomas. Katrs šāds gadījums atsevišķi šķiet mazs, bet kopā tie katru mēnesi izmaksā uzņēmumam reālu naudu - un neviens to neredz.",
  },
  {
    question: "Kas ir Shadowy?",
    answer:
      "Shadowy ir darba slodzes pārskatāmības rīks. Darbinieki strukturēti fiksē papildu darbu, vadītāji izvērtē un apstiprina iesniegtos ierakstus, savukārt administratori saņem organizācijas līmeņa pārskatu.",
  },
  {
    question: "Cik maksā 30 dienu pilots?",
    answer:
      "30 dienu pilots ir bez maksas un bez kredītkartes. Pēc pieteikuma saņemšanas mēs sazināsimies ar jums, lai precizētu komandas vajadzības un vienotos par pilota uzsākšanu.",
  },
  {
    question: "Cik ilgs laiks nepieciešams, lai sāktu?",
    answer:
      "Sākotnējā iestatīšana parasti aizņem līdz 10 minūtēm. Administrators pievieno darbiniekus un vadītājus, pēc tam sistēma ir gatava lietošanai.",
  },
  {
    question: "Kā tiek aizsargāti dati?",
    answer:
      "Vadītājiem ir pieejami tikai viņu komandas apstiprinātie ieraksti, bet administratoriem - savas organizācijas dati. Citu organizāciju informācija nav pieejama. Detalizēta informācija ir norādīta privātuma politikā.",
  },
  {
    question: "Kas notiek pēc pilota beigām?",
    answer:
      "Pēc pilota beigām jūs varat izvēlēties turpināt vai pārtraukt lietošanu. Pārtraukšanas gadījumā datus iespējams eksportēt, un pēc noteiktā glabāšanas perioda tie tiek dzēsti.",
  },
  {
    question: "Vai darbiniekiem jāfiksē visas darbības?",
    answer:
      "Nē. Shadowy nav paredzēts visu ikdienas darbību fiksēšanai. Darbinieks fiksē tikai situācijas, kas bija ārpus pamatdarba, radīja papildu slodzi vai traucēja paveikt plānoto darbu. Parastais ikdienas darbs nav jāfiksē.",
  },
  {
    question: "Kāpēc darbiniekam būtu to jāaizpilda?",
    answer:
      "Lai redzētu, kas viņam traucē strādāt efektīvāk: atkārtoti jautājumi, gaidīšana, neskaidras atbildības, palīdzība citiem vai steidzami neplānoti uzdevumi. Mērķis ir uzlabot procesus, nevis kontrolēt cilvēku.",
  },
  {
    question: "Vai šo var izmantot pret darbinieku?",
    answer:
      "Nē. Shadowy ir procesu pārskatāmības rīks. Dati jāizmanto, lai saprastu slēpto slodzi un uzlabotu darbu, nevis sodītu vai salīdzinātu darbiniekus. Darbinieks pats kontrolē, ko iesniedz.",
  },
  {
    question: "Vai AI saglabā ierakstus automātiski?",
    answer:
      "Nē. AI izveido tikai melnrakstus. Darbinieks pats pārskata, labo un apstiprina ierakstus pirms saglabāšanas. Nekas netiek saglabāts bez darbinieka apstiprinājuma.",
  },
] as const;

export function LandingFaq() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative scroll-mt-20 overflow-hidden bg-[var(--landing-night)] py-24 md:py-32"
    >
      <div className="relative z-10 w-full px-4 md:px-8">
        <div className="flex w-full flex-col items-start gap-12 lg:flex-row lg:justify-between">
          <Reveal className="w-full lg:w-[40%] xl:w-[35%]">
            <div className="mb-3 inline-block">
              <SectionBadge tone="dark">FAQ</SectionBadge>
            </div>
            <h2 className="text-landing-h2 mb-6 text-white">
              <WaveHeading tone="light">Biežāk uzdotie jautājumi</WaveHeading>
            </h2>
            <p className="text-sm font-medium leading-relaxed text-white/50 md:text-base">
              Ja neatrodat atbildi, uzdodiet jautājumu pieteikuma formā - mēs
              atbildēsim godīgi, arī tad, ja Shadowy jūsu situācijai neder
            </p>
          </Reveal>

          <div className="flex w-full flex-col gap-3 lg:ml-auto lg:w-[55%] xl:w-[50%]">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={item.question}
                  className={cn(
                    "w-full overflow-hidden rounded-xl transition-all duration-500",
                    isOpen
                      ? "bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                      : "bg-white/5 hover:bg-white/[0.08]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
                  >
                    <h3 className="text-[15px] font-medium leading-tight text-white md:text-[17px]">
                      {item.question}
                    </h3>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="shrink-0 text-white/50"
                      aria-hidden
                    >
                      <ChevronDown className="size-5" />
                    </motion.span>
                  </button>

                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                    aria-hidden={!isOpen}
                  >
                    <p className="px-5 pb-5 pt-0 text-sm font-medium leading-relaxed text-white/60 md:px-6 md:pb-6 md:text-base">
                      {item.answer}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
