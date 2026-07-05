"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AnimatedDotSurface } from "@/components/ui/animated-dot-surface";
import { EmphasizedText } from "@/components/landing/emphasized-text";

const solutionCards = [
  {
    number: "01",
    title: "Darbinieks apraksta situāciju",
    description:
      "Darbinieks apraksta saviem vārdiem vai ierunā, kas šodien traucēja pabeigt pamatdarbu vai bija ārpus viņa lomas",
    examples: [
      "Palīdzēju kolēģim",
      "Gaidīju informāciju",
      "Fokuss tika pārtraukts",
      "Darbs ārpus lomas",
    ],
  },
  {
    number: "02",
    title: "AI izveido melnrakstu",
    description:
      "Shadowy AI pats izveido strukturētus melnraksta ierakstus ar kategoriju, laiku un ietekmi uz darbu",
    examples: [
      "Automātiska kategorija",
      "Aptuvenais laiks",
      "Bez garām formām",
    ],
  },
  {
    number: "03",
    title: "Darbinieks apstiprina",
    description:
      "AI neko nesaglabā automātiski - darbinieks pārskata melnrakstus, labo vai dzēš, tad apstiprina",
    examples: [
      "Pilna kontrole",
      "30 sekundes dienā",
      "Dati tikai pēc apstiprinājuma",
    ],
  },
] as const;

const importantSolutionPhrases = [
  "saviem vārdiem",
  "kas šodien traucēja",
  "melnraksta ierakstus",
  "Bez garām formām",
  "neko nesaglabā automātiski",
  "pilna kontrole",
] as const;

export function SolutionSection() {
  return (
    <section
      id="risinajums"
      aria-labelledby="solution-heading"
      className="relative overflow-hidden bg-[#07090c] py-14 scroll-mt-24 sm:mx-4 sm:mt-20 sm:rounded-[32px] sm:border sm:border-white/[0.11] sm:py-24 md:py-32 lg:mx-7 lg:mt-24"
    >
      <div
        aria-hidden
        className="animate-solution-grid pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 88%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="animate-solution-glow-a pointer-events-none absolute -left-52 top-1/4 size-[440px] rounded-full bg-emerald-500/[0.11] blur-[130px] hidden sm:block"
      />
      <div
        aria-hidden
        className="animate-solution-glow-b pointer-events-none absolute -right-48 bottom-0 size-[460px] rounded-full bg-blue-500/[0.11] blur-[140px] hidden sm:block"
      />
      <div
        aria-hidden
        className="animate-solution-glow-c pointer-events-none absolute left-[42%] top-[18%] size-[280px] rounded-full bg-cyan-400/[0.055] blur-[110px] hidden sm:block"
      />
      <AnimatedDotSurface className="top-8 z-0 h-[500px] opacity-90" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <header className="mx-auto max-w-none text-center">
          <h2
            id="solution-heading"
            className="text-balance font-accent text-[2rem] font-bold leading-[1.06] tracking-[0.015em] text-white [font-synthesis:weight] sm:text-[clamp(2.4rem,4.1vw,3.25rem)] lg:whitespace-nowrap"
          >
            Bez garām formām.{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Apraksti, kas traucēja pamatdarbam
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-4xl font-accent text-base font-light leading-7 tracking-[0.01em] text-white/75 sm:text-xl sm:leading-relaxed sm:text-white/85">
            Darbinieks apraksta situāciju saviem vārdiem vai ierunā to
            <br className="hidden sm:block" />
            {" "}<strong className="font-bold text-white/85 [font-synthesis:weight]">
              Shadowy AI pārvērš to strukturētos datos
            </strong>
            {" "}- darbinieks tikai pārskata un apstiprina
          </p>
        </header>

        <motion.div
          className="relative mt-10 flex flex-col items-stretch gap-3 md:mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)_36px_minmax(0,1fr)]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.16 } },
          }}
        >
          {solutionCards.map((card, index) => {
            return (
              <div key={card.number} className="contents">
                <motion.article
                  className="group relative flex min-h-[220px] w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-white/[0.1] bg-[#080c0f] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors duration-300 hover:border-white/[0.16] hover:bg-[#0b1115]"
                  variants={{
                    hidden: { opacity: 0, y: 44, scale: 0.94 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.58,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    },
                  }}
                  whileHover={{ y: -8, scale: 1.015 }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-55 transition-opacity duration-500 group-hover:opacity-80"
                    style={{
                      background:
                        "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
                      backgroundSize: "28px 28px",
                      maskImage:
                        "linear-gradient(to right, black 0%, black 82%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to right, black 0%, black 82%, transparent 100%)",
                    }}
                  />

                  <h3 className="relative mt-2 text-center font-accent text-xl font-bold tracking-[0.018em] text-white [font-synthesis:weight]">
                    {card.title}
                  </h3>
                  <p className="relative mt-2 font-accent text-sm font-light leading-relaxed tracking-[0.01em] text-white/68">
                    <EmphasizedText
                      text={card.description}
                      phrases={importantSolutionPhrases}
                    />
                  </p>

                  <ul className="relative mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                    {card.examples.map((example) => (
                      <li
                        key={example}
                        className="flex items-center gap-2 text-xs leading-relaxed text-white/58"
                      >
                        <span className="size-1 shrink-0 rounded-full bg-emerald-300/80" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>

                {index < solutionCards.length - 1 && (
                  <div
                    aria-hidden
                    className="flex h-9 w-full shrink-0 items-center justify-center text-white lg:h-auto lg:w-9"
                  >
                    <span className="flex size-10 items-center justify-center rounded-full border border-white/[0.16] bg-[#15181d] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_6px_18px_rgba(0,0,0,0.28)]">
                      <ArrowRight className="size-5 rotate-90 lg:rotate-0" strokeWidth={2.4} />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
