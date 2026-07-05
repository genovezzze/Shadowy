"use client";

import { motion } from "framer-motion";
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
      className="relative overflow-hidden bg-[#07090c] py-14 sm:py-20 md:py-24"
    >
      <div className="relative mx-auto grid max-w-6xl items-center gap-9 px-5 sm:gap-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <motion.div
          className="order-2 grid gap-3 lg:order-1"
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
                className="relative overflow-hidden rounded-[10px] border border-white/[0.11] bg-[#080a0d] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_14px_40px_rgba(0,0,0,0.18)] transition-colors duration-300 hover:border-white/[0.2] hover:bg-[#0a0e12] sm:p-6"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 26,
                    scale: 0.965,
                    filter: "blur(9px)",
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={{ y: -4, scale: 1.012 }}
              >
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

        <div className="order-1 lg:order-2">
          <h2
            id="business-value-heading"
            className="text-balance font-accent text-[2rem] font-bold leading-[1.08] tracking-[0.015em] text-white [font-synthesis:weight] sm:text-[clamp(2.25rem,4vw,3rem)]"
          >
            <span className="block sm:whitespace-nowrap">
              Redzamas izmaksas
            </span>
            <span className="mt-1 block bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent sm:whitespace-nowrap">
              Labāki lēmumi
            </span>
          </h2>
          <p className="mt-5 max-w-xl font-accent text-base font-light leading-7 tracking-[0.01em] text-white/72 sm:mt-6 sm:text-lg sm:leading-relaxed sm:text-white/78">
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
