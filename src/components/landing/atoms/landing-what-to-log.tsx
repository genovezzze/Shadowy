"use client";

import { motion } from "framer-motion";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";

const SHOULD_LOG = [
  "Darbs ārpus pamatlomas",
  "Palīdzība kolēģiem",
  "Informācijas gaidīšana",
  "Atkārtoti jautājumi",
  "Kļūdu labošana",
  "Fokusa pārtraukumi",
  "Steidzami neplānoti uzdevumi",
  "Jauno darbinieku ievadīšana",
  "Koordinācija starp cilvēkiem",
] as const;

const SHOULD_NOT_LOG = [
  "Katra ikdienas darbība",
  "Katra minūte",
  "Parastais plānotais darbs",
  "Privātas sarunas",
  "Ekrāna aktivitāte",
] as const;

export function LandingWhatToLog() {
  return (
    <section
      id="ko-fikset"
      className="relative scroll-mt-20 overflow-hidden bg-[var(--landing-paper)] py-24 md:py-32"
    >
      <div className="w-full px-4 md:px-8">
        <Reveal className="mb-12 max-w-3xl">
          <div className="mb-3 inline-block">
            <SectionBadge>Saturs</SectionBadge>
          </div>
          <h2 className="text-landing-h2 text-black">
            <WaveHeading tone="dark">Ko fiksē Shadowy</WaveHeading>
          </h2>
        </Reveal>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
          }}
          className="flex flex-wrap gap-x-6 gap-y-4 md:gap-x-10 md:gap-y-6"
        >
          {SHOULD_LOG.map((item) => (
            <motion.li
              key={item}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.3 } },
              }}
              className="cursor-default text-lg font-bold tracking-tight text-black/60 transition-colors hover:text-black md:text-xl lg:text-2xl"
            >
              {item}
            </motion.li>
          ))}
        </motion.ul>

        <Reveal className="mt-16">
          {/* The same pill the section itself is labelled with, rather than a
              bare uppercase caption - both are section-level labels, so they
              should not be two different shapes. */}
          <div className="mb-4 inline-block">
            <SectionBadge>Nav jāfiksē</SectionBadge>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {SHOULD_NOT_LOG.map((item) => (
              <li
                key={item}
                className="text-base font-medium text-black/30 line-through decoration-black/20 md:text-lg"
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
