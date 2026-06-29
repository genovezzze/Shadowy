"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Saņemam pieteikumu",
    text: "Apstiprinām pieteikuma saņemšanu 1-2 darba dienu laikā",
  },
  {
    title: "Iepazīšanās zvans",
    text: "20 minūšu zvans, lai saprastu jūsu komandas vajadzības",
  },
  {
    title: "Saprotam piemērotību",
    text: "Godīgi paskaidrojam, vai Shadowy ir piemērots jūsu situācijai",
  },
  {
    title: "Sākam pilotu",
    text: "Iestatīšana aizņem līdz 10 minūtēm. Darbu var sākt tajā pašā dienā",
  },
] as const;

export function ApplicationProcessSection() {
  return (
    <section
      id="pieteikuma-process"
      aria-labelledby="application-process-heading"
      className="relative mt-12 overflow-hidden bg-[#07090c] py-14 sm:mt-16 sm:py-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.07) 0.7px, transparent 0.8px)",
          backgroundSize: "30px 30px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <header className="text-center">
          <h2
            id="application-process-heading"
            className="text-balance font-accent text-[2rem] font-bold leading-[1.08] tracking-[0.015em] text-white [font-synthesis:weight] sm:text-[clamp(2.4rem,4vw,3.7rem)]"
          >
            Kas notiek pēc pieteikuma?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-accent text-base font-light leading-relaxed tracking-[0.015em] text-white/58 sm:text-lg">
            Precīzi soļi no pieteikuma iesniegšanas līdz pilota sākumam
          </p>
        </header>

        <motion.div
          className="mt-9 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
        >
          {steps.map((step) => {
            return (
              <motion.article
                key={step.title}
                className="rounded-xl border border-white/[0.11] bg-white/[0.015] p-5 transition-colors duration-300 hover:border-white/[0.22] hover:bg-white/[0.025] sm:p-7"
                variants={{
                  hidden: { opacity: 0, y: 28, scale: 0.98 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <h3 className="font-accent text-lg font-bold tracking-[0.02em] text-white">
                  {step.title}
                </h3>
                <p className="mt-3 font-accent text-sm font-light leading-relaxed tracking-[0.015em] text-white/60">
                  {step.text}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
