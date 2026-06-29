"use client";

import { motion } from "framer-motion";

const valueCards = [
  {
    title: "Redzi slēptās stundas",
    text: "Uzzini, kur komanda tērē laiku ārpus formālajiem uzdevumiem",
  },
  {
    title: "Samazini lieko slodzi",
    text: "Pamani pārslodzi un pārdali darbu pirms tā kļūst dārga",
  },
  {
    title: "Aprēķini ietaupījumu",
    text: "Izmanto pilota datus, lai saprastu potenciālo finansiālo ieguvumu",
  },
] as const;

export function BusinessValueSection() {
  return (
    <section
      id="biznesa-ieguvums"
      aria-labelledby="business-value-heading"
      className="relative overflow-hidden bg-[#07090c] py-20 md:py-24"
    >
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <motion.div
          className="order-2 grid gap-3 lg:order-1"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.14 } },
          }}
        >
          {valueCards.map((card) => {
            return (
              <motion.article
                key={card.title}
                className="relative overflow-hidden rounded-[10px] border border-white/[0.11] bg-[#080a0d] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:translate-x-1 hover:border-white/[0.2] hover:bg-[#0a0e12] sm:p-6"
                variants={{
                  hidden: { opacity: 0, x: -44, rotateY: -5 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    rotateY: 0,
                    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={{ x: 6, scale: 1.01 }}
              >
                <div className="relative">
                  <h3 className="font-accent text-xl font-bold tracking-[0.014em] text-white [font-synthesis:weight]">
                    {card.title}
                  </h3>
                  <p className="mt-2 font-accent text-sm font-light leading-relaxed tracking-[0.008em] text-white/68 sm:text-base">
                    {card.text}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        <div className="order-1 lg:order-2">
          <h2
            id="business-value-heading"
            className="font-accent text-[clamp(1.75rem,4vw,3rem)] font-bold leading-[1.08] tracking-[0.015em] text-white [font-synthesis:weight]"
          >
            <span className="block whitespace-nowrap">
              Mazāk neredzama darba
            </span>
            <span className="mt-1 block whitespace-nowrap bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Vairāk naudas biznesam
            </span>
          </h2>
          <p className="mt-6 max-w-xl font-accent text-lg font-light leading-relaxed tracking-[0.01em] text-white/78">
            30 dienu pilotā Shadowy parāda, kur pazūd komandas laiks, kur rodas
            pārslodze un cik daudz uzņēmums var potenciāli ietaupīt
          </p>
        </div>
      </div>
    </section>
  );
}
