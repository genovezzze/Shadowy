"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";
import { useLocale, type Locale } from "@/components/landing/atoms/i18n";

type L = Record<Locale, string>;

const SHOULD_LOG: readonly L[] = [
  { lv: "Darbs ārpus pamatlomas", en: "Work outside your core role" },
  { lv: "Palīdzība kolēģiem", en: "Helping colleagues" },
  { lv: "Informācijas gaidīšana", en: "Waiting for information" },
  { lv: "Atkārtoti jautājumi", en: "Repeated questions" },
  { lv: "Kļūdu labošana", en: "Fixing errors" },
  { lv: "Fokusa pārtraukumi", en: "Focus interruptions" },
  { lv: "Steidzami neplānoti uzdevumi", en: "Urgent unplanned tasks" },
  { lv: "Jauno darbinieku ievadīšana", en: "Onboarding new hires" },
  { lv: "Koordinācija starp cilvēkiem", en: "Coordination between people" },
];

/**
 * The same idea in one industry's own words.
 *
 * The general list above is deliberately generic, which makes it easy to read
 * and easy to dismiss - an accountant does not think in "informācijas
 * gaidīšana", they think in missing source documents. This block shows what the
 * categories look like once they are written for a real company, and says
 * plainly that they are built per company rather than shipped as a fixed list.
 */
const ACCOUNTING_EXAMPLE: readonly L[] = [
  { lv: "Klienta dokumentu gaidīšana", en: "Waiting for client documents" },
  { lv: "Trūkstošu attaisnojuma dokumentu pieprasīšana", en: "Chasing missing supporting documents" },
  { lv: "Labojumi klienta iesniegtajos datos", en: "Corrections to data the client submitted" },
  { lv: "Klienta atkārtoti jautājumi", en: "The client's repeated questions" },
  { lv: "Konsultācijas ārpus līguma apjoma", en: "Advice beyond the contract scope" },
  { lv: "Steidzami pieprasījumi pirms termiņa", en: "Urgent requests before a deadline" },
  { lv: "Saziņa ar VID", en: "Dealing with the tax authority" },
  { lv: "Bankas izrakstu sakārtošana", en: "Sorting out bank statements" },
  { lv: "Gada pārskata papildu darbi", en: "Extra work on the annual report" },
];

const SHOULD_NOT_LOG: readonly L[] = [
  { lv: "Katra ikdienas darbība", en: "Every routine action" },
  { lv: "Katra minūte", en: "Every minute" },
  { lv: "Parastais plānotais darbs", en: "Ordinary planned work" },
  { lv: "Privātas sarunas", en: "Private conversations" },
  { lv: "Ekrāna aktivitāte", en: "Screen activity" },
];

export function LandingWhatToLog() {
  const { locale, t } = useLocale();
  const [isExampleOpen, setExampleOpen] = React.useState(false);

  return (
    <section
      id="ko-fikset"
      className="relative scroll-mt-20 overflow-hidden bg-[var(--landing-paper)] py-16 md:py-32"
    >
      <div className="w-full px-4 md:px-8">
        <Reveal className="mb-8 max-w-3xl md:mb-12">
          <div className="mb-3 inline-block">
            <SectionBadge>{t("whatToLog.badge")}</SectionBadge>
          </div>
          <h2 className="text-landing-h2 text-black">
            <WaveHeading tone="dark">{t("whatToLog.heading")}</WaveHeading>
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
              key={item.lv}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.3 } },
              }}
              className="cursor-default text-lg font-bold tracking-tight text-black/60 transition-colors hover:text-black md:text-xl lg:text-2xl"
            >
              {item[locale]}
            </motion.li>
          ))}
        </motion.ul>

        <Reveal className="mt-10 md:mt-16">
          {/* Folded away behind its own label: the example is here to be opened
              by someone who wants it, and left alone it would read as a second
              list competing with the one above rather than an illustration of
              it. The badge is the control, so the closed state adds one line
              rather than a block. */}
          <button
            type="button"
            onClick={() => setExampleOpen((open) => !open)}
            aria-expanded={isExampleOpen}
            aria-controls="accounting-example"
            className="group inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/5 py-1 pl-4 pr-3 text-sm font-semibold text-black transition-colors hover:bg-black/10"
          >
            {t("whatToLog.example")}
            <motion.span
              animate={{ rotate: isExampleOpen ? 180 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="shrink-0 text-black/40"
              aria-hidden
            >
              <ChevronDown className="size-4" />
            </motion.span>
          </button>

          <motion.div
            id="accounting-example"
            initial={false}
            animate={{
              height: isExampleOpen ? "auto" : 0,
              opacity: isExampleOpen ? 1 : 0,
            }}
            transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
            aria-hidden={!isExampleOpen}
          >
            {/* Set a step below the general list - it is an illustration of that
                list, not a second one competing with it. */}
            <ul className="flex flex-wrap gap-x-6 gap-y-3 pt-6 md:gap-x-8">
              {ACCOUNTING_EXAMPLE.map((item) => (
                <li
                  key={item.lv}
                  className="cursor-default text-base font-bold tracking-tight text-black/45 transition-colors hover:text-black/80 md:text-lg"
                >
                  {item[locale]}
                </li>
              ))}
            </ul>
            <p className="mt-5 max-w-2xl text-sm font-semibold leading-relaxed text-black/60 md:text-base">
              {t("whatToLog.exampleNote")}
            </p>
          </motion.div>
        </Reveal>

        <Reveal className="mt-10 md:mt-16">
          {/* The same pill the section itself is labelled with, rather than a
              bare uppercase caption - both are section-level labels, so they
              should not be two different shapes. */}
          <div className="mb-4 inline-block">
            <SectionBadge>{t("whatToLog.notNeeded")}</SectionBadge>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {SHOULD_NOT_LOG.map((item) => (
              <li
                key={item.lv}
                className="text-base font-medium text-black/30 line-through decoration-black/20 md:text-lg"
              >
                {item[locale]}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
