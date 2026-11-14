"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { WaveHeading } from "@/components/landing/atoms/wave-heading";
import { useLocale, type Locale } from "@/components/landing/atoms/i18n";

type L = Record<Locale, string>;

// A client's cost is the routine work plus the extra work, so both are shown:
// the routine list first (what the fee is meant to cover), then what a client
// adds on top of it.
const ROUTINE_WORK: readonly L[] = [
  { lv: "Primāro dokumentu grāmatošana", en: "Posting source documents" },
  { lv: "Bankas un kases operācijas", en: "Bank and cash transactions" },
  { lv: "Algu aprēķini", en: "Payroll" },
  { lv: "PVN un citas VID deklarācijas", en: "VAT and other tax returns" },
  { lv: "Rēķinu izrakstīšana", en: "Issuing invoices" },
  { lv: "Debitori un kreditori", en: "Receivables and payables" },
  { lv: "Gada pārskats", en: "Annual report" },
  { lv: "Saziņa ar klientu", en: "Talking to the client" },
];

const EXTRA_WORK: readonly L[] = [
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

/**
 * Work inside the team that is not any one client's but still costs hours.
 * Folded away below the client list: it matters for workload, but the page
 * leads with what a client costs.
 */
const TEAM_WORK: readonly L[] = [
  { lv: "Palīdzība kolēģiem", en: "Helping colleagues" },
  { lv: "Jauno darbinieku ievadīšana", en: "Onboarding new hires" },
  { lv: "Darbs ārpus savas lomas", en: "Work outside your own role" },
  { lv: "Koordinācija starp cilvēkiem", en: "Coordination between people" },
  { lv: "Kļūdu labošana pēc kolēģa", en: "Fixing a colleague's errors" },
];

const SHOULD_NOT_LOG: readonly L[] = [
  { lv: "Katra ikdienas darbība", en: "Every routine action" },
  { lv: "Katra minūte", en: "Every minute" },
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
          className="flex flex-col gap-8 md:gap-10"
        >
          {[
            { label: t("whatToLog.routine"), items: ROUTINE_WORK },
            { label: t("whatToLog.extra"), items: EXTRA_WORK },
          ].map((group, groupIndex) => (
            <li key={group.label}>
              <p className="mb-3 text-sm font-semibold text-black/60 md:mb-4 md:text-base">{group.label}</p>
              <ul className="flex flex-wrap gap-x-6 gap-y-4 md:gap-x-10 md:gap-y-6">
                {group.items.map((item) => (
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
                {/* Closes the last group: the lists are a starting point, and
                    each firm's categories are set up with it during the pilot. */}
                {groupIndex === 1 ? (
                  <motion.li
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { duration: 0.3 } },
                    }}
                    className="cursor-default rounded-full border border-dashed border-black/25 px-4 py-0.5 text-lg font-bold tracking-tight text-black/60 md:text-xl lg:text-2xl"
                  >
                    {t("whatToLog.custom")}
                  </motion.li>
                ) : null}
              </ul>
            </li>
          ))}
        </motion.ul>

        <p className="mt-6 max-w-2xl text-sm font-semibold leading-relaxed text-black/60 md:mt-8 md:text-base">
          {t("whatToLog.exampleNote")}
        </p>

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
              className="shrink-0 text-black/60"
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
              {TEAM_WORK.map((item) => (
                <li
                  key={item.lv}
                  className="cursor-default text-base font-bold tracking-tight text-black/60 transition-colors hover:text-black/80 md:text-lg"
                >
                  {item[locale]}
                </li>
              ))}
            </ul>
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
