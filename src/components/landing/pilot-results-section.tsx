"use client";

import { motion } from "framer-motion";
import { Clock, DollarSign, RefreshCw, Wrench } from "lucide-react";

const results = [
  {
    icon: Clock,
    title: "Slēptās darba stundas",
    text: "Cik daudz laika aizgāja papildu darbā, gaidīšanā un pārtraukumos.",
  },
  {
    icon: DollarSign,
    title: "Aptuvenās izmaksas",
    text: "Cik šis darbs varētu izmaksāt komandai mēnesī vai gadā.",
  },
  {
    icon: RefreshCw,
    title: "Atkārtotās problēmas",
    text: "Kas visbiežāk traucē pamatdarbam un atkārtojas komandā.",
  },
  {
    icon: Wrench,
    title: "Procesu ieteikumi",
    text: "2-3 konkrēti uzlabojumi, ko var ieviest komandā uzreiz pēc pilota.",
  },
] as const;

export function PilotResultsSection() {
  return (
    <section
      aria-labelledby="pilot-results-heading"
      className="relative overflow-hidden bg-[#07090c] py-12 sm:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-48 top-1/2 size-[360px] -translate-y-1/2 rounded-full bg-emerald-500/[0.06] blur-[120px] hidden sm:block"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="pilot-results-heading"
            className="text-balance font-accent text-[2rem] font-bold leading-[1.08] tracking-[0.015em] text-white [font-synthesis:weight] sm:text-[clamp(2rem,3.5vw,2.75rem)]"
          >
            Ko jūs redzēsiet pēc pilota?
          </h2>
          <p className="mx-auto mt-4 font-accent text-base font-light leading-relaxed text-white/50 sm:text-lg">
            Pēc pilota uzņēmums saņem konkrētus datus, nevis vispārīgus secinājumus
          </p>
        </div>

        <motion.div
          className="mt-10 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {results.map((result, i) => {
            const Icon = result.icon;
            return (
              <motion.article
                key={result.title}
                className="relative flex flex-col gap-4 overflow-hidden rounded-[12px] border border-white/[0.09] bg-[#080b0e] p-5 transition-colors hover:border-white/[0.16]"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50">
                    <Icon className="size-4" strokeWidth={1.6} aria-hidden />
                  </span>
                  <span className="font-mono text-[11px] text-white/20">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-accent text-base font-bold tracking-[0.015em] text-white [font-synthesis:weight]">
                  {result.title}
                </h3>
                <p className="font-accent text-sm font-light leading-relaxed text-white/50">
                  {result.text}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
