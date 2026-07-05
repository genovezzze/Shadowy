"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

const shouldLog = [
  "Darbs ārpus pamatlomas",
  "Palīdzība kolēģiem",
  "Informācijas gaidīšana",
  "Atkārtoti jautājumi",
  "Kļūdu labošana",
  "Fokusa pārtraukumi",
  "Steidzami neplānoti uzdevumi",
] as const;

const shouldNotLog = [
  "Katra ikdienas darbība",
  "Katra minūte",
  "Parastais plānotais darbs",
  "Privātas sarunas",
  "Ekrāna aktivitāte",
] as const;

function HatchPattern() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[72px] opacity-30"
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, transparent 0px, transparent 10px, rgba(255,255,255,0.09) 10px, rgba(255,255,255,0.09) 11px)",
        maskImage: "linear-gradient(to bottom, black 0%, rgba(0,0,0,.6) 55%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, rgba(0,0,0,.6) 55%, transparent 100%)",
      }}
    />
  );
}

export function WhatToLogSection() {
  return (
    <section
      aria-labelledby="what-to-log-heading"
      className="relative overflow-hidden bg-[#07090c] py-14 sm:py-16"
    >
      <div className="relative mx-auto max-w-4xl px-5 sm:px-6">
        <div className="mb-8 text-center">
          <h2
            id="what-to-log-heading"
            className="text-balance font-accent text-[1.6rem] font-bold tracking-[0.015em] text-white [font-synthesis:weight] sm:text-[clamp(2.25rem,4vw,3rem)]"
          >
            Kas der fiksēšanai un kas ne?
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-accent text-base font-light leading-relaxed text-white/50 sm:text-lg">
            Shadowy nefiksē visu darbu. Shadowy fiksē situācijas,{" "}
            <strong className="font-medium text-white/68">
              kur pamatdarbs tiek traucēts vai rodas papildu slodze.
            </strong>
          </p>
        </div>

        <motion.div
          className="grid gap-3 sm:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* Jāfiksē */}
          <motion.div
            className="relative overflow-hidden rounded-xl border border-white/[0.18] bg-[#08090a] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.24),0_0_60px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.07)] sm:p-6"
            variants={{
              hidden: { opacity: 0, x: -24 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,255,255,0.04),transparent_70%)]"
            />
            <HatchPattern />
            <div className="relative">
              <p className="mb-5 font-accent text-base font-bold tracking-[0.04em] text-white/55">
                Jāfiksē
              </p>
              <ul className="space-y-4">
                {shouldLog.map((item) => (
                  <li key={item} className="flex items-center gap-3 font-accent text-base font-light text-white/80">
                    <Check className="size-4 shrink-0 text-emerald-300" strokeWidth={2.5} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Nav jāfiksē */}
          <motion.div
            className="relative overflow-hidden rounded-xl border border-white/[0.1] bg-[#08090a] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.02)] sm:p-6"
            variants={{
              hidden: { opacity: 0, x: 24 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <HatchPattern />
            <div className="relative">
              <p className="mb-5 font-accent text-base font-bold tracking-[0.04em] text-white/40">
                Nav jāfiksē
              </p>
              <ul className="space-y-4">
                {shouldNotLog.map((item) => (
                  <li key={item} className="flex items-center gap-3 font-accent text-base font-light text-white/40">
                    <X className="size-4 shrink-0 text-red-400/60" strokeWidth={2} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
