"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const visibleItems = [
  "Apstiprinātus ierakstus",
  "Kopējo darba slodzi",
  "Lomu neatbilstības",
  "Komandas tendences",
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
      className="relative mx-0 overflow-hidden border-y border-white/[0.07] bg-[#07090c] py-16 scroll-mt-24 sm:mx-4 sm:rounded-[28px] sm:border sm:py-20 md:py-24 lg:mx-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.07) 0.7px, transparent 0.8px)",
          backgroundSize: "30px 30px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <header className="mx-auto max-w-6xl text-center">
          <h2
            id="privacy-trust-heading"
            className="text-balance bg-[linear-gradient(90deg,#f8fafc_0%,#f8fafc_38%,rgba(226,232,240,.8)_68%,rgba(100,116,139,.58)_100%)] bg-clip-text font-accent text-[2rem] font-bold leading-[1.06] tracking-[0.015em] text-transparent [font-synthesis:weight] sm:text-[clamp(2.4rem,4vw,3.75rem)] lg:whitespace-nowrap"
          >
            Nav uzraudzība.
            <span className="mt-1 block lg:ml-2 lg:mt-0 lg:inline">
              Tikai redzams ieguldījums
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl font-accent text-base font-light leading-relaxed tracking-[0.012em] text-white/68 sm:text-lg">
            Shadowy{" "}
            <strong className="font-bold text-white/82 [font-synthesis:weight]">
              neseko privātām sarunām, ekrāna aktivitātei vai katram klikšķim
            </strong>
            . Platforma balstās uz{" "}
            <strong className="font-bold text-white/82 [font-synthesis:weight]">
              darbinieku iesniegtiem un vadītāja apstiprinātiem ierakstiem
            </strong>
          </p>
        </header>

        <motion.div
          className="mx-auto mt-12 grid max-w-5xl gap-5 [perspective:1200px] md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.16 } },
          }}
        >
          <motion.article
            className="rounded-2xl border border-white/[0.1] bg-black/10 px-5 py-6 sm:px-9 sm:py-8"
            variants={{
              hidden: {
                opacity: 0,
                y: 32,
                scale: 0.96,
                rotateX: 6,
                filter: "blur(10px)",
              },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                filter: "blur(0px)",
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            whileHover={{ y: -6 }}
          >
            <h3 className="font-accent text-xl font-bold tracking-[0.02em] text-white">
              Ko vadītājs redz
            </h3>
            <ul className="mt-4 space-y-2 font-accent text-base font-medium leading-relaxed tracking-[0.012em] text-white/78 sm:text-lg">
              {visibleItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.article>

          <motion.article
            className="rounded-2xl border border-white/[0.1] bg-black/10 px-5 py-6 sm:px-9 sm:py-8"
            variants={{
              hidden: {
                opacity: 0,
                y: 32,
                scale: 0.96,
                rotateX: 6,
                filter: "blur(10px)",
              },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                filter: "blur(0px)",
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            whileHover={{ y: -6 }}
          >
            <h3 className="font-accent text-xl font-bold tracking-[0.02em] text-white">
              Ko vadītājs neredz
            </h3>
            <ul className="mt-4 space-y-2 font-accent text-base font-medium leading-relaxed tracking-[0.012em] text-white/62 sm:text-lg">
              {hiddenItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.article>
        </motion.div>

        <div className="mx-auto mt-5 flex max-w-5xl flex-col items-center justify-between gap-4 border-t border-white/[0.08] px-1 pt-5 sm:flex-row">
          <div className="flex items-center gap-3 text-emerald-200">
            <ShieldCheck className="size-5 shrink-0" aria-hidden />
            <p className="font-accent text-sm font-medium tracking-[0.012em] sm:text-base">
              Darbinieks pats kontrolē, ko iesniedz
            </p>
          </div>
          <p className="text-center text-xs font-medium tracking-[0.01em] text-white/35 sm:text-right">
            GDPR atbilstoši · Serveri ES robežās · Datus var dzēst jebkurā brīdī
          </p>
        </div>
      </div>
    </section>
  );
}
