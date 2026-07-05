"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EmphasizedText } from "@/components/landing/emphasized-text";

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

const importantProcessPhrases = [
  "1-2 darba dienu laikā",
  "20 minūšu zvans",
  "vai Shadowy ir piemērots",
  "līdz 10 minūtēm",
  "tajā pašā dienā",
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
          <p className="mx-auto mt-4 max-w-2xl text-balance font-accent text-sm font-light leading-relaxed tracking-[0.015em] text-white/58 sm:text-lg">
            Precīzi soļi no pieteikuma iesniegšanas līdz pilota sākumam
          </p>
        </header>

        <motion.div
          className="mt-10 flex flex-col gap-3 sm:mt-14 lg:flex-row lg:items-stretch lg:gap-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.14 } },
          }}
        >
          {steps.map((step, i) => (
            <React.Fragment key={step.title}>
              {/* Card */}
              <motion.article
                className="group relative flex-1 overflow-hidden rounded-xl border border-white/[0.11] bg-white/[0.018] p-5 transition-colors duration-300 hover:border-white/[0.2] hover:bg-white/[0.03] sm:p-6"
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Step number badge */}
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-full border border-white/[0.16] bg-white/[0.06] font-accent text-xs font-bold tabular-nums text-white/60">
                    {i + 1}
                  </span>
                  <div className="h-px flex-1 bg-white/[0.07]" />
                </div>

                <h3 className="font-accent text-base font-bold tracking-[0.02em] text-white sm:text-lg">
                  {step.title}
                </h3>
                <p className="mt-2.5 font-accent text-sm font-light leading-relaxed tracking-[0.015em] text-white/55">
                  <EmphasizedText
                    text={step.text}
                    phrases={importantProcessPhrases}
                  />
                </p>
              </motion.article>

              {/* Arrow between steps */}
              {i < steps.length - 1 && (
                <motion.div
                  className="hidden shrink-0 lg:flex lg:items-center lg:justify-center lg:px-1"
                  variants={{
                    hidden: { opacity: 0, x: -8 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.35, ease: "easeOut" },
                    },
                  }}
                >
                  <ArrowRight
                    className="size-4 text-white/20"
                    strokeWidth={2}
                    aria-hidden
                  />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
