"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal, SectionBadge } from "@/components/landing/atoms/landing-primitives";
import { useLocale, type Locale } from "@/components/landing/atoms/i18n";
import { cn } from "@/lib/utils";

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

function Chips({ items, locale, tone = "default" }: { items: readonly L[]; locale: Locale; tone?: "default" | "muted" | "struck" }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item.lv}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[15px] leading-snug",
            tone === "default" && "bg-[#f1f1f1] text-black/80",
            tone === "muted" && "bg-[#f1f1f1] text-black/55",
            tone === "struck" && "bg-[#f1f1f1] text-black/35 line-through decoration-black/25",
          )}
        >
          {item[locale]}
        </li>
      ))}
    </ul>
  );
}

function Card({ title, marker = "grey", children }: { title: string; marker?: "grey" | "blue"; children: React.ReactNode }) {
  return (
    <article className="relative flex h-full flex-col gap-6 rounded-2xl bg-white p-6 md:p-8">
      <span
        aria-hidden
        className={cn(
          "absolute right-6 top-6 size-3 [clip-path:polygon(0_0,100%_0,100%_100%)] md:right-8 md:top-8",
          marker === "blue" ? "bg-[#2563eb]" : "bg-black/40",
        )}
      />
      <h3 className="max-w-[85%] text-[1.6rem] leading-[1.15] text-black">{title}</h3>
      {children}
    </article>
  );
}

/**
 * What a firm logs, as the atoms.technology card grid: one white card per
 * group of work inside the grey panel, the work types as soft chips, and the
 * "your own categories" card marked blue as the answer.
 */
export function LandingWhatToLog() {
  const { locale, t } = useLocale();
  const [teamOpen, setTeamOpen] = React.useState(false);

  return (
    <section id="ko-fikset" className="relative scroll-mt-20 bg-[var(--landing-paper)] px-3 py-8 md:px-6 md:py-12">
      <div className="rounded-[28px] bg-[#f1f1f1] p-6 md:p-10 xl:p-14">
        <Reveal className="mb-8 max-w-3xl md:mb-12">
          <div className="mb-3 inline-block">
            <SectionBadge>{t("whatToLog.badge")}</SectionBadge>
          </div>
          <h2 className="text-landing-h2 text-black">{t("whatToLog.heading")}</h2>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <Card title={t("whatToLog.routine")}>
              <Chips items={ROUTINE_WORK} locale={locale} />
            </Card>
          </Reveal>
          <Reveal delay={0.05}>
            <Card title={t("whatToLog.extra")}>
              <Chips items={EXTRA_WORK} locale={locale} />
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card title={t("whatToLog.custom")} marker="blue">
              <p className="text-[15px] leading-relaxed text-black/55">{t("whatToLog.exampleNote")}</p>
              <div>
                <button
                  type="button"
                  onClick={() => setTeamOpen((open) => !open)}
                  aria-expanded={teamOpen}
                  aria-controls="team-work"
                  className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/85"
                >
                  {t("whatToLog.example")}
                  <ChevronDown className={cn("size-4 transition-transform duration-300", teamOpen && "rotate-180")} aria-hidden />
                </button>
                <motion.div
                  id="team-work"
                  initial={false}
                  animate={{ height: teamOpen ? "auto" : 0, opacity: teamOpen ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden"
                  aria-hidden={!teamOpen}
                >
                  <div className="pt-5">
                    <Chips items={TEAM_WORK} locale={locale} tone="muted" />
                  </div>
                </motion.div>
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.15}>
            <Card title={t("whatToLog.notNeeded")}>
              <Chips items={SHOULD_NOT_LOG} locale={locale} tone="struck" />
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
