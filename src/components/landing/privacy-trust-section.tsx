"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

const visibleItems = [
  "Apstiprinātus ierakstus",
  "Kopējo darba slodzi",
  "Atkārtojošās problēmas",
  "Kur rodas lieka slodze",
] as const;

const hiddenItems = [
  "Privātas sarunas",
  "Ekrāna aktivitāti",
  "Katru klikšķi",
  "Personīgos failus",
] as const;

export function PrivacyTrustSection() {
  return (
    <section
      id="privatums"
      aria-labelledby="privacy-trust-heading"
      className="relative py-10 scroll-mt-24 sm:py-12"
    >
      <div className="relative mx-auto max-w-5xl px-5 sm:px-6">
        <header className="text-center">
          <h2
            id="privacy-trust-heading"
            className="text-balance font-accent text-[1.6rem] font-bold leading-[1.1] tracking-[0.015em] text-white [font-synthesis:weight] sm:text-[clamp(1.9rem,2.6vw,2.4rem)]"
          >
            Nav kontroles rīks.{" "}
            <span className="text-white/45">Tas ir par procesu uzlabošanu</span>
          </h2>

          <p className="mx-auto mt-3 max-w-3xl text-balance font-accent text-[0.9rem] font-light leading-6 tracking-[0.012em] text-white/60 sm:text-[0.95rem] sm:leading-[1.55]">
            Shadowy neskatās, cik ilgi cilvēks sēž pie datora.{" "}
            <strong className="font-semibold text-white/80 [font-synthesis:weight]">
              Mēs nesekojam katrai darbībai un neveidojam darbinieku reitingu.
            </strong>
          </p>
        </header>

        {/* One panel split down the middle, rather than two separate boxes -
            the pair is a single comparison, and as separate cards the short
            lists left each box looking unfinished. */}
        <motion.div
          className="mt-6 grid grid-cols-1 overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.012] sm:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="border-b border-white/[0.08] px-5 py-5 sm:border-b-0 sm:border-r sm:px-6">
            <div className="flex items-center gap-2.5">
              <Eye className="size-4 shrink-0 text-white/70" aria-hidden />
              <h3 className="font-accent text-sm font-bold tracking-[0.02em] text-white">
                Ko vadītājs redz
              </h3>
            </div>
            <ul className="mt-3.5 space-y-2">
              {visibleItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 font-accent text-sm font-light leading-6 text-white/75"
                >
                  <span
                    aria-hidden
                    className="mt-[9px] size-1 shrink-0 rounded-full bg-white/50"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <div className="flex items-center gap-2.5">
              <EyeOff className="size-4 shrink-0 text-white/35" aria-hidden />
              <h3 className="font-accent text-sm font-bold tracking-[0.02em] text-white/45">
                Ko vadītājs neredz
              </h3>
            </div>
            <ul className="mt-3.5 space-y-2">
              {hiddenItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 font-accent text-sm font-light leading-6 text-white/35"
                >
                  <span
                    aria-hidden
                    className="mt-[9px] size-1 shrink-0 rounded-full bg-white/20"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Trust strip lives inside the panel so the section reads as one
              object instead of a box with a caption floating under it. */}
          <div className="flex flex-col gap-2 border-t border-white/[0.08] bg-white/[0.015] px-5 py-3.5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2.5 text-white/65">
              <ShieldCheck className="size-4 shrink-0" aria-hidden />
              <p className="font-accent text-[0.8rem] font-medium tracking-[0.012em]">
                Darbinieks pats kontrolē, ko iesniedz un ko apstiprina
              </p>
            </div>
            <p className="text-[0.75rem] font-medium tracking-[0.01em] text-white/35">
              GDPR atbilstoši · Serveri Eiropas Savienībā · Datus var dzēst
              jebkurā brīdī
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
