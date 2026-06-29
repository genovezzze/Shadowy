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
      className="relative mt-16 overflow-hidden bg-[#07090c] py-16"
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
            className="font-accent text-[clamp(2.1rem,4vw,3.7rem)] font-bold tracking-[0.02em] text-white [font-synthesis:weight]"
          >
            Kas notiek pēc pieteikuma?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-accent text-base font-light leading-relaxed tracking-[0.015em] text-white/58 sm:text-lg">
            Precīzi soļi no pieteikuma iesniegšanas līdz pilota sākumam
          </p>
        </header>

        <motion.div
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.25 }}
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
                className="rounded-lg border border-white/[0.11] bg-transparent p-7 transition-colors duration-300 hover:border-white/[0.22] hover:bg-white/[0.015]"
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
