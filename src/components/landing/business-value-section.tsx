"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CircleDollarSign } from "lucide-react";
import { EmphasizedText } from "@/components/landing/emphasized-text";

const valueCards = [
  {
    title: "Redzi, kur pazūd laiks",
    text: "Uzzini, cik daudz laika aiziet neredzamajā darbā un kādas kategorijas atkārtojas visbiežāk",
  },
  {
    title: "Samazini slēptās izmaksas",
    text: "Pamani, kur rodas lieka slodze un fokusa pārtraukumi, pirms tie kļūst dārgi",
  },
  {
    title: "Uzlabo procesus",
    text: "Saņem konkrētus ieteikumus - kur sakārtot darba sadali, lomas un iekšējos procesus",
  },
] as const;

const importantValuePhrases = [
  "neredzamajā darbā",
  "fokusa pārtraukumi",
  "pirms tie kļūst dārgi",
  "konkrētus ieteikumus",
] as const;

export function BusinessValueSection() {
  return (
    <section
      id="biznesa-ieguvums"
      aria-labelledby="business-value-heading"
      className="relative overflow-hidden bg-[#070809] py-14 sm:py-20 md:py-24"
    >
      <div className="relative mx-auto grid max-w-6xl items-center gap-9 px-5 sm:gap-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <motion.div
          className="order-2 min-w-0 grid gap-3 lg:order-1"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.14 } },
          }}
        >
          {valueCards.map((card) => {
            return (
              <motion.article
                key={card.title}
                className="relative overflow-hidden rounded-[10px] border border-white/[0.11] bg-[#080a0d] bg-cover bg-center p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_14px_40px_rgba(0,0,0,0.18)] transition-colors duration-300 hover:border-white/[0.2] sm:p-6"
                style={{ backgroundImage: "url('/images/cards_back.png?v=3')" }}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 26,
                    scale: 0.965,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={{ y: -4, scale: 1.012 }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-black/20"
                />
                <div className="relative">
                  <h3 className="font-accent text-xl font-bold tracking-[0.014em] text-white [font-synthesis:weight]">
                    {card.title}
                  </h3>
                  <p className="mt-2 font-accent text-sm font-light leading-relaxed tracking-[0.008em] text-white/68 sm:text-base">
                    <EmphasizedText
                      text={card.text}
                      phrases={importantValuePhrases}
                    />
                  </p>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        <div className="order-1 min-w-0 lg:order-2">
          <h2
            id="business-value-heading"
            className="text-balance font-accent text-[2rem] font-bold leading-[1.08] tracking-[0.015em] text-white [font-synthesis:weight] sm:text-[clamp(2.25rem,4vw,3rem)]"
          >
            <span className="block lg:whitespace-nowrap">
              Redzamas izmaksas
            </span>
            <span className="animate-card-heading-gradient mt-1 block bg-clip-text text-transparent lg:whitespace-nowrap">
              Labāki lēmumi
            </span>
          </h2>

          <div
            role="img"
            aria-label="Redzamas izmaksas pārtop labākos lēmumos"
            className="mt-6 flex max-w-xl items-stretch gap-2 sm:gap-3"
          >
            <div
              className="animate-value-card-float relative min-w-0 flex-1 overflow-hidden rounded-xl border border-emerald-400/20 bg-cover bg-center p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-4"
              style={{ backgroundImage: "url('/images/cards_back.png?v=3')" }}
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/20" />
              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <CircleDollarSign className="size-6 shrink-0 text-emerald-300" />
                  <div aria-hidden className="flex h-7 items-end gap-1">
                    <span className="animate-value-bar h-2 w-1.5 origin-bottom rounded-full bg-emerald-400/35" />
                    <span className="animate-value-bar h-4 w-1.5 origin-bottom rounded-full bg-emerald-400/55 [animation-delay:-1.25s]" />
                    <span className="animate-value-bar h-6 w-1.5 origin-bottom rounded-full bg-emerald-300/80 [animation-delay:-2.5s]" />
                  </div>
                </div>
                <p className="mt-3 font-accent text-xs font-semibold text-white/90 sm:text-sm">
                  Redzi, kur pazūd nauda
                </p>
                <p className="mt-1 text-[11px] text-white/55 sm:text-xs">
                  Laiks un izmaksas vienuviet
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center text-emerald-300/70">
              <span className="grid size-7 place-items-center rounded-full border border-emerald-300/20 bg-emerald-400/[0.07] sm:size-8">
                <ArrowRight className="animate-value-arrow size-4" />
              </span>
            </div>

            <div
              className="animate-value-card-float relative min-w-0 flex-1 overflow-hidden rounded-xl border border-emerald-400/20 bg-cover bg-center p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] [animation-delay:-2.2s] sm:p-4"
              style={{ backgroundImage: "url('/images/cards_back.png?v=3')" }}
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/20" />
              <div className="relative">
                <BadgeCheck className="animate-value-check size-6 shrink-0 text-emerald-300" />
                <p className="mt-3 font-accent text-xs font-semibold text-white/90 sm:text-sm">
                  Zini, ko uzlabot
                </p>
                <p className="mt-1 text-[11px] text-white/55 sm:text-xs">
                  Skaidrs nākamais solis
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 max-w-xl font-accent text-base font-light leading-7 tracking-[0.01em] text-white/72 sm:text-lg sm:leading-relaxed sm:text-white/78">
            Ja uzņēmums neredz, kur pazūd darbinieku laiks,{" "}
            <strong className="font-bold text-white/82 [font-synthesis:weight]">
              tas nevar saprast, kur pazūd nauda
            </strong>
            . Shadowy parāda slēptās izmaksas un palīdz saprast, kur var uzlabot procesus
          </p>
        </div>
      </div>
    </section>
  );
}
