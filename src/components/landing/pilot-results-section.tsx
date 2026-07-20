"use client";

import { motion } from "framer-motion";
import { Clock, DollarSign, RefreshCw, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className="relative overflow-hidden bg-[#070809] py-12 sm:py-20"
    >
      <div className="relative mx-auto grid max-w-[1320px] items-center gap-10 px-5 sm:px-6 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)] lg:justify-center lg:gap-5 lg:px-12 xl:grid-cols-[460px_680px] xl:px-16">
        <div className="min-w-0 w-full max-w-[460px] text-left lg:justify-self-end">
          <h2
            id="pilot-results-heading"
            className="text-balance font-accent text-[2rem] font-bold leading-[1.08] tracking-[0.015em] text-white [font-synthesis:weight] sm:text-[clamp(2.35rem,4vw,3.5rem)]"
          >
            Ko jūs redzēsiet pēc pilota?
          </h2>
          <p className="mt-5 font-accent text-base font-light leading-relaxed text-white/55 sm:text-lg">
            Pēc pilota uzņēmums saņem konkrētus datus, nevis vispārīgus secinājumus
          </p>
        </div>

        <motion.div
          className="relative min-w-0 grid w-full max-w-[680px] gap-7 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 lg:justify-self-start lg:gap-x-14 lg:gap-y-20 lg:py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-6 left-[18px] top-6 w-px bg-gradient-to-b from-emerald-400/10 via-emerald-300/55 to-emerald-400/10 sm:hidden"
          />

          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden size-full lg:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pilot-result-path" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.22" />
                <stop offset="50%" stopColor="#5eead4" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.28" />
              </linearGradient>
            </defs>
            <path
              d="M 23 13 C 52 13, 48 34, 77 34 C 49 34, 51 66, 23 66 C 52 66, 48 88, 77 88"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1.8"
              vectorEffect="non-scaling-stroke"
            />
            <motion.path
              className="animate-pilot-path-flow"
              d="M 23 13 C 52 13, 48 34, 77 34 C 49 34, 51 66, 23 66 C 52 66, 48 88, 77 88"
              fill="none"
              stroke="url(#pilot-result-path)"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: {
                  pathLength: 1,
                  opacity: 1,
                  transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            />
            <circle
              className="animate-pilot-path-dot"
              r="1.25"
              fill="#6ee7b7"
              stroke="#d1fae5"
              strokeWidth="0.45"
              vectorEffect="non-scaling-stroke"
            >
              <animateMotion
                dur="12s"
                repeatCount="indefinite"
                path="M 23 13 C 52 13, 48 34, 77 34 C 49 34, 51 66, 23 66 C 52 66, 48 88, 77 88"
              />
            </circle>
          </svg>

          {results.map((result, i) => {
            const Icon = result.icon;
            return (
              <div
                key={result.title}
                className={cn(
                  i === 0 && "lg:-translate-y-14",
                  i === 1 && "lg:translate-y-4",
                  i === 2 && "lg:-translate-y-4",
                  i === 3 && "lg:translate-y-14",
                )}
              >
                <motion.article
                  className="relative z-10 flex min-h-[140px] flex-col gap-2.5 overflow-hidden rounded-[12px] border border-emerald-300/[0.15] bg-[#080b0e] bg-cover bg-center p-3.5 shadow-[0_18px_45px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-emerald-300/30 sm:h-full sm:min-h-[145px] sm:p-3.5"
                  style={{ backgroundImage: "url('/images/cards_back.webp?v=3')" }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/25" />
                  <div
                    aria-hidden
                    className="animate-pilot-card-sheen pointer-events-none absolute -inset-y-8 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-emerald-200/10 to-transparent opacity-0"
                    style={{ animationDelay: `${i * 2.8}s` }}
                  />
                  <div className="relative flex items-center gap-2.5">
                    <span
                      className="animate-pilot-step-icon grid size-7 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50"
                      style={{ animationDelay: `${i * 2.8}s` }}
                    >
                      <Icon className="size-3.5" strokeWidth={1.6} aria-hidden />
                    </span>
                    <span className="font-mono text-[11px] text-white/20">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="relative font-accent text-[15px] font-bold tracking-[0.015em] text-white [font-synthesis:weight] sm:text-base">
                    {result.title}
                  </h3>
                  <p className="relative font-accent text-[13px] font-light leading-relaxed text-white/60">
                    {result.text}
                  </p>
                </motion.article>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
