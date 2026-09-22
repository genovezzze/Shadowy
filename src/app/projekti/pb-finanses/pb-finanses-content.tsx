"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedGradientHeading } from "@/components/ui/animated-gradient-heading";
import { LandingNav } from "@/components/landing/atoms/landing-nav";
import { LandingFooter } from "@/components/landing/atoms/landing-footer";
import { ClientEmployeeMatrix } from "@/components/dashboard/client-employee-matrix";
import { FitToWidth } from "@/components/landing/fit-to-width";
import { AnimatedReportMetrics } from "@/components/projects/animated-report-metrics";
import { LocaleProvider, useLocale, type Locale } from "@/components/landing/atoms/i18n";
import type { MatrixClientRow, MatrixEmployee } from "@/lib/client-matrix";

type L = Record<Locale, string>;

const audiences: readonly L[] = [
  { lv: "Grāmatvedības ārpakalpojumu uzņēmumi", en: "Accounting outsourcing firms" },
  { lv: "Pilna servisa finanšu uzņēmumi", en: "Full-service finance firms" },
  { lv: "Nodokļu un biznesa konsultanti", en: "Tax and business consultants" },
  { lv: "Uzņēmumi ar lielu klientu portfeli", en: "Firms with a large client portfolio" },
  { lv: "Finanšu un administrācijas komandas", en: "Finance and administration teams" },
  { lv: "Komandas ar fiksētu pakalpojumu maksu", en: "Teams on a fixed service fee" },
];

const keyFeatures: readonly L[] = [
  { lv: "Papildu un neredzamā darba fiksēšana", en: "Logging extra and invisible work" },
  { lv: "Darba ierakstu sasaiste ar klientiem", en: "Linking work entries to clients" },
  { lv: "Komandas noslodzes pārskats", en: "Team workload overview" },
  { lv: "Klientam veltītā laika analīze", en: "Analysis of time spent per client" },
  { lv: "Atkārtojošos procesu identificēšana", en: "Identifying recurring processes" },
  { lv: "Izmaksu aprēķins pēc stundu likmes", en: "Cost calculation by hourly rate" },
  { lv: "Klientu limitu un pārsniegumu kontrole", en: "Client limit and overrun control" },
  { lv: "Vadības analītika vienotā platformā", en: "Management analytics in one platform" },
];

type TitleText = { title: L; text: L };

const projectDetails: readonly TitleText[] = [
  {
    title: { lv: "Par PB Finanses", en: "About PB Finanses" },
    text: {
      lv: "PB Finanses ir pilna servisa finanšu uzņēmums, kas sniedz grāmatvedības, finanšu plānošanas un biznesa konsultāciju pakalpojumus Latvijas un ārvalstu uzņēmumiem",
      en: "PB Finanses is a full-service finance firm providing accounting, financial planning and business consulting to Latvian and international companies",
    },
  },
  {
    title: { lv: "Uzņēmuma vajadzība", en: "The company's need" },
    text: {
      lv: "Komanda jau iepriekš pētīja “slēpto darbu” - uzdevumus, kurus klients tieši neredz un par kuriem atsevišķi nemaksā, bet kuri ir nepieciešami kvalitatīvam servisam",
      en: "The team had already been studying “hidden work” - tasks the client doesn't directly see and doesn't pay for separately, but which are needed for quality service",
    },
  },
  {
    title: { lv: "Ko izstrādājām", en: "What we built" },
    text: {
      lv: "Shadowy pilotplatformu papildu darba fiksēšanai un analīzei, lai komanda reģistrētu darbu, bet vadība redzētu slodzi, atkārtojošos procesus un klientiem veltīto laiku",
      en: "The Shadowy pilot platform for logging and analysing extra work, so the team records the work while management sees the load, recurring processes and time spent per client",
    },
  },
  {
    title: { lv: "Sadarbības sākums", en: "How it started" },
    text: {
      lv: "Sadarbība sākās pēc iepazīšanās CoLab 2026 biznesa forumā un turpinājās kā pilotprojekts reāla uzņēmuma ikdienas darbā",
      en: "The collaboration began after meeting at the CoLab 2026 business forum and continued as a pilot in a real company's daily work",
    },
  },
  {
    title: { lv: "Projekta formāts", en: "Project format" },
    text: {
      lv: "Web platforma · Datu analītika · Komandas slodze · Pilotprojekts",
      en: "Web platform · Data analytics · Team workload · Pilot project",
    },
  },
];

const solutionSteps = [
  {
    number: "01",
    title: { lv: "Fiksēt darbu", en: "Log the work" } as L,
    text: {
      lv: "Komanda vienuviet reģistrē papildu darbu, pārtraukumus un uzdevumus, kas iepriekš palika ārpus ierastajām atskaitēm",
      en: "The team records extra work, interruptions and tasks that previously fell outside the usual reports, all in one place",
    } as L,
  },
  {
    number: "02",
    title: { lv: "Strukturēt datus", en: "Structure the data" } as L,
    text: {
      lv: "Ieraksti tiek sasaistīti ar klientiem, kategorijām un komandas lomām, lai atsevišķi notikumi kļūtu salīdzināmi",
      en: "Entries are linked to clients, categories and team roles, so individual events become comparable",
    } as L,
  },
  {
    number: "03",
    title: { lv: "Ieraudzīt kopsakarības", en: "See the patterns" } as L,
    text: {
      lv: "Vadība redz slodzi, atkārtojošos procesus, klientiem veltīto laiku un vietas, kurās rodas neplānotas izmaksas",
      en: "Management sees the load, recurring processes, time spent per client and where unplanned costs arise",
    } as L,
  },
];

const accountingFit: readonly TitleText[] = [
  {
    title: { lv: "Gatavs pamats grāmatvedības uzņēmumam", en: "A ready base for an accounting firm" },
    text: {
      lv: "PB Finanses projektā pārbaudītais process jau aptver klientus, darbiniekus, darba kategorijas, laiku, limitus un izmaksu pārskatus",
      en: "The process proven in the PB Finanses project already covers clients, employees, work categories, time, limits and cost reports",
    },
  },
  {
    title: { lv: "Pielāgošana jūsu pakalpojumu modelim", en: "Tailored to your service model" },
    text: {
      lv: "Varam mainīt darba kategorijas, lomas, limitu loģiku, pārskatus un aprēķinus atbilstoši tam, kā jūsu uzņēmums apkalpo klientus",
      en: "We can change work categories, roles, limit logic, reports and calculations to match how your firm serves clients",
    },
  },
  {
    title: { lv: "Integrācijas ar esošajiem procesiem", en: "Integrations with your existing processes" },
    text: {
      lv: "Pēc vajadzības varam pievienot datu importu, automatizētus paziņojumus, vadības atskaites vai savienojumus ar jau izmantotajām sistēmām",
      en: "As needed, we can add data import, automated notifications, management reports or connections to systems you already use",
    },
  },
  {
    title: { lv: "Pilotprojekts pirms pilnas ieviešanas", en: "A pilot before full rollout" },
    text: {
      lv: "Sākam ar konkrētu komandu un izmērāmu problēmu, pārbaudām risinājumu ikdienas darbā un tikai tad vienojamies par nākamajām funkcijām",
      en: "We start with a specific team and a measurable problem, test the solution in daily work, and only then agree on the next features",
    },
  },
];

const T = {
  badge: { lv: "Realizēts projekts / Grāmatvedība", en: "Delivered project / Accounting" },
  h1: { lv: "Neredzamais darbs kļūst izmērāms", en: "Invisible work becomes measurable" },
  intro: {
    lv: "Vienota platforma neredzamā darba, komandas slodzes un klientu izmaksu pārskatīšanai - izstrādāta kopā ar PB Finanses un pielāgojama arī jūsu grāmatvedības uzņēmumam.",
    en: "A single platform for reviewing invisible work, team workload and client cost - built together with PB Finanses and adaptable to your accounting firm too.",
  },
  heroCta: { lv: "Vai tas der jūsu uzņēmumam?", en: "Is it right for your company?" },
  audiencesTitle: { lv: "Kam šis risinājums ir piemērots", en: "Who this solution is for" },
  featuresTitle: { lv: "Galvenās iespējas", en: "Key capabilities" },
  projectTitle: { lv: "Par projektu", en: "About the project" },
  dashboardAlt: { lv: "Shadowy darba pārskata saskarne", en: "Shadowy work overview interface" },
  solutionTitle: { lv: "Kā risinājums darbojas", en: "How the solution works" },
  fitTitle: { lv: "Pielāgojams tieši jūsu grāmatvedības uzņēmumam", en: "Adaptable to your accounting firm" },
  matrixTitle: { lv: "Klientu un komandas noslodzes matrica", en: "Client and team workload matrix" },
  matrixSubtitle: {
    lv: "Demonstrācijas dati parāda, kā stundas, izmaksas un klientu limiti kļūst salīdzināmi vienā skatā",
    en: "Demo data shows how hours, cost and client limits become comparable in a single view",
  },
  matrixNote: {
    lv: "Visi klientu nosaukumi, stundas, limiti un izmaksas šajā piemērā ir izdomāti un neatspoguļo PB Finanses datus",
    en: "All client names, hours, limits and costs in this example are fictional and do not reflect PB Finanses data",
  },
  monthLabel: { lv: "2026. gada augusts", en: "August 2026" },
  autoGenerated: { lv: "Automātiski ģenerēts", en: "Auto-generated" },
  reportTitle: { lv: "Anonimizēta klienta izmaksu atskaite", en: "Anonymised client cost report" },
  reportText: {
    lv: "Shadowy automātiski apkopo klientam veltīto laiku, paveiktos darbus un komandas stundas izmaksas. Vadītājs uzreiz redz, cik klients uzņēmumam izmaksā un kāpēc pārsniegts plānotais limits",
    en: "Shadowy automatically aggregates time spent per client, work done and the cost of team hours. A manager immediately sees what a client costs the firm and why the planned limit was exceeded",
  },
  reportShows: { lv: "Ko atskaite parāda", en: "What the report shows" },
  reportDocTitle: { lv: "Klienta A-017 izmaksu pārskats", en: "Client A-017 cost report" },
  reportDocMeta: { lv: "Anonimizēti demonstrācijas dati · 4 lapas", en: "Anonymised demo data · 4 pages" },
  openFull: { lv: "Atvērt pilnā izmērā", en: "Open full size" },
  reportDocNote: {
    lv: "Pārskats izmanto izdomātu klienta kodu un demonstrācijas vērtības. Tas neatklāj PB Finanses klientus, darbiniekus vai finanšu informāciju",
    en: "The report uses a made-up client code and demo values. It does not reveal PB Finanses clients, employees or financial information",
  },
  experience: { lv: "PB Finanses pieredze", en: "PB Finanses experience" },
  quote: {
    lv: "“Shadowy aplikācija šo procesu padara krietni ērtāku un uzreiz sniedz labu analītisko materiālu.”",
    en: "“The Shadowy app makes this process far more convenient and immediately provides good analytical material.”",
  },
  readFull: { lv: "Lasīt pilno ierakstu", en: "Read the full post" },
  finalHeading: {
    lv: "Vai Shadowy var palīdzēt arī jūsu grāmatvedības uzņēmumam?",
    en: "Can Shadowy help your accounting firm too?",
  },
  finalText: {
    lv: "Parādīsim jau izstrādāto risinājumu, izrunāsim jūsu procesus un vienosimies, kuras funkcijas izmantot uzreiz un kuras",
    en: "We'll show you the solution we've built, talk through your processes and agree which features to use right away and which to",
  },
  finalTextTail: { lv: "pielāgot tieši jums.", en: "tailor specifically to you." },
  finalCta: { lv: "Pieteikt sarunu", en: "Book a conversation" },
  reportListItems: [
    { lv: "kādi darbi klientam tika veikti", en: "what work was done for the client" },
    { lv: "cik laika un naudas patērēts", en: "how much time and money was spent" },
    { lv: "kas izraisīja izmaksu pieaugumu", en: "what drove the cost increase" },
    { lv: "kurus procesus iespējams automatizēt", en: "which processes can be automated" },
  ] as readonly L[],
} as const;

const hourlyRate = 25;

const matrixEmployees: MatrixEmployee[] = [
  { id: "anna", name: "Anna" },
  { id: "janis", name: "Jānis" },
  { id: "elina", name: "Elīna" },
  { id: "martins", name: "Mārtiņš" },
];

const matrixSource = [
  { id: "baltic-trade", clientName: "Baltic Trade SIA", hours: [4.2, 1.6, 3.1, 2.4], total: 11.3, limit: 12 },
  { id: "nordhaus", clientName: "NordHaus SIA", hours: [2.1, 4.8, 3.7, 2.9], total: 13.5, limit: 10 },
  { id: "green-office", clientName: "Green Office SIA", hours: [0.8, 2.3, 1.4, 3.2], total: 7.7, limit: 9 },
  { id: "atlas-studio", clientName: "Atlas Studio SIA", hours: [3.6, 0, 4.5, 2.7], total: 10.8, limit: 8 },
] as const;

const matrixRows: MatrixClientRow[] = matrixSource.map((row) => {
  const totalMinutes = Math.round(row.total * 60);

  return {
    clientId: `name:${row.id}`,
    clientName: row.clientName,
    freeMinutes: row.limit * 60,
    totalMinutes,
    overrunMinutes: Math.max(0, totalMinutes - row.limit * 60),
    monthlyMinutes: [{ month: "2026-08", minutes: totalMinutes }],
    byEmployee: Object.fromEntries(
      matrixEmployees.map((employee, index) => [
        employee.id,
        Math.round(row.hours[index] * 60),
      ]),
    ),
    searchKey: row.clientName.toLocaleLowerCase("lv-LV"),
  };
});

type ListItem = L | { title: L; text: L };

function ReferenceListSection({
  id,
  title,
  items,
  bordered = false,
}: {
  id?: string;
  title: string;
  items: readonly ListItem[];
  bordered?: boolean;
}) {
  const { locale } = useLocale();
  return (
    <section id={id} className="overflow-hidden bg-white px-4 py-20 md:px-8">
      <div className="flex flex-col items-start gap-10 md:flex-row md:gap-20">
        <div className="shrink-0 md:w-1/3">
          <div>
            <h2 className="mb-0 text-2xl font-bold leading-tight tracking-tight text-black md:text-[36px]">
              <AnimatedGradientHeading>{title}</AnimatedGradientHeading>
            </h2>
          </div>
        </div>

        <div className={`md:w-2/3 ${bordered ? "border-t border-black/10" : ""}`}>
          <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
            {items.map((item, index) => {
              const isPlain = "lv" in item;
              const itemTitle = isPlain ? (item as L)[locale] : (item as { title: L }).title[locale];
              const itemText = isPlain ? null : (item as { text: L }).text[locale];

              return (
                <ScrollReveal
                  key={itemTitle}
                  effect="atomsRow"
                  delay={(index % 2) * 0.1 + Math.floor(index / 2) * 0.1}
                  duration={0.8}
                  className="border-b border-black/10 py-6 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0"
                >
                  <h3 className={`${itemText ? "mb-2" : "m-0"} text-[18px] font-bold leading-tight text-black/75 md:text-xl`}>
                    {itemTitle}
                  </h3>
                  {itemText && (
                    <p className="m-0 text-sm font-semibold leading-relaxed text-black/70 md:text-[15px]">
                      {itemText}
                    </p>
                  )}
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PageBody() {
  const { locale } = useLocale();
  return (
    <div className="min-h-screen overflow-x-clip bg-white font-sans text-black antialiased">
      <LandingNav alwaysLight />

      <main className="overflow-x-hidden pt-28 md:pt-48">
        <section className="mb-0 flex h-auto min-h-0 flex-col overflow-hidden px-4 md:h-[calc(100svh-12rem)] md:min-h-[620px] md:px-8">
          <div className="w-full">
            <ScrollReveal effect="atomsHero" duration={0.8} className="mb-12">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-1.5 text-sm font-bold tracking-tight text-black">
                <Check className="size-4 text-[#2563eb]" aria-hidden />
                {T.badge[locale]}
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-[1.05] tracking-tight text-black md:text-7xl">
                <AnimatedGradientHeading>{T.h1[locale]}</AnimatedGradientHeading>
              </h1>
              <p className="mb-8 text-sm font-semibold leading-relaxed text-black/75 md:text-base">
                <AnimatedGradientHeading>{T.intro[locale]}</AnimatedGradientHeading>
              </p>
              <Link
                href="#gramatvedibai"
                className="inline-flex w-fit rounded-full bg-black px-6 py-3 text-base font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {T.heroCta[locale]}
              </Link>
            </ScrollReveal>
          </div>

          <ScrollReveal
            effect="fade"
            duration={1.2}
            delay={0.2}
            className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] aspect-[16/10] w-screen flex-none bg-[#061012] md:aspect-auto md:min-h-0 md:flex-1"
          >
            <Image
              src="/images/shadowyxpb.png"
              alt="Shadowy un PB Finanses kopprojekts"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </ScrollReveal>
        </section>

        <ReferenceListSection title={T.audiencesTitle[locale]} items={audiences} />
        <ReferenceListSection id="iespejas" title={T.featuresTitle[locale]} items={keyFeatures} />
        <ReferenceListSection id="projekts" title={T.projectTitle[locale]} items={projectDetails} bordered />

        <section className="bg-white px-4 py-8 md:px-8 md:py-12">
          <ScrollReveal effect="fade" duration={1.2} delay={0.2}>
            <div className="relative min-h-[300px] w-full overflow-hidden bg-[#07090a] md:min-h-[560px]">
              <Image
                src="/images/shadowy-dashboard-wide.png"
                alt={T.dashboardAlt[locale]}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </ScrollReveal>
        </section>

        <ReferenceListSection
          title={T.solutionTitle[locale]}
          items={solutionSteps.map(({ title, text, number }) => ({
            title: { lv: `${number} - ${title.lv}`, en: `${number} - ${title.en}` } as L,
            text,
          }))}
          bordered
        />
        <ReferenceListSection id="gramatvedibai" title={T.fitTitle[locale]} items={accountingFit} bordered />

        <section className="overflow-hidden bg-white px-4 py-20 md:px-8">
          <div className="flex flex-col items-start gap-10 md:flex-row md:gap-20">
            <div className="shrink-0 md:w-1/3">
              <ScrollReveal effect="rise">
                <h2 className="mb-4 text-2xl font-bold leading-tight tracking-tight md:text-[36px]">
                  {T.matrixTitle[locale]}
                </h2>
                <p className="max-w-sm text-sm font-semibold leading-relaxed text-black/70 md:text-[15px]">
                  {T.matrixSubtitle[locale]}
                </p>
              </ScrollReveal>
            </div>

            <ScrollReveal effect="rise" className="min-w-0 md:w-2/3">
              <div className="slate overflow-hidden rounded-xl bg-background text-foreground shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
                <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-black/5" />}>
                  <FitToWidth>
                  <ClientEmployeeMatrix
                    rows={matrixRows}
                    employees={matrixEmployees}
                    hourlyRateEur={hourlyRate}
                    monthLabel={T.monthLabel[locale]}
                    selectedMonth="2026-08"
                    monthOptions={[{ value: "2026-08", label: T.monthLabel[locale] }]}
                  />
                  </FitToWidth>
                </Suspense>
              </div>
              <p className="mt-4 text-xs font-medium leading-relaxed text-black/60">
                {T.matrixNote[locale]}
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="overflow-hidden bg-[#f5f5f5] px-4 py-20 md:px-8 md:py-24">
          <div className="flex flex-col items-start gap-12 lg:flex-row lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:w-1/3 lg:shrink-0">
              <ScrollReveal effect="atomsHero" duration={0.8}>
                <div className="mb-6 inline-flex rounded-full bg-[#eaf3e8] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#4f9148]">
                  {T.autoGenerated[locale]}
                </div>
                <h2 className="mb-6 text-2xl font-bold leading-tight tracking-tight text-black md:text-[36px]">
                  {T.reportTitle[locale]}
                </h2>
                <p className="mb-8 max-w-md text-sm font-semibold leading-relaxed text-black/70 md:text-[15px]">
                  {T.reportText[locale]}
                </p>

                <AnimatedReportMetrics />

                <div className="mt-8 border-t border-black/10 pt-7">
                  <h3 className="mb-4 text-base font-bold text-black">{T.reportShows[locale]}</h3>
                  <ul className="space-y-3">
                    {T.reportListItems.map((item) => (
                      <li key={item.lv} className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-black/70">
                        <Check className="mt-0.5 size-4 shrink-0 text-[#5b9d53]" aria-hidden />
                        {item[locale]}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal effect="atomsRow" duration={0.8} delay={0.1} className="min-w-0 w-full lg:w-2/3">
              <div className="overflow-hidden rounded-[24px] bg-black p-3 shadow-[0_24px_80px_rgba(0,0,0,0.16)] md:p-4">
                <div className="flex flex-col gap-3 px-2 pb-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="m-0 text-sm font-bold text-white">{T.reportDocTitle[locale]}</p>
                    <p className="m-0 mt-1 text-xs font-medium text-white/50">{T.reportDocMeta[locale]}</p>
                  </div>
                  <a
                    href="/documents/anonimizets-klienta-izmaksu-parskats.pdf?v=demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform duration-300 hover:scale-[1.02]"
                  >
                    {T.openFull[locale]}
                    <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                </div>
                <iframe
                  title={T.reportTitle[locale]}
                  src="/documents/anonimizets-klienta-izmaksu-parskats.pdf?v=demo#view=FitH&toolbar=1"
                  className="h-[680px] w-full rounded-[14px] bg-white md:h-[820px]"
                />
              </div>
              <p className="mt-4 text-xs font-medium leading-relaxed text-black/55">
                {T.reportDocNote[locale]}
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="overflow-hidden bg-white px-4 py-20 md:px-8">
          <div className="flex flex-col items-start gap-10 border-y border-black/10 py-20 md:flex-row md:gap-20">
            <div className="shrink-0 md:w-1/3">
              <ScrollReveal effect="rise">
                <p className="text-sm font-bold text-black/65">{T.experience[locale]}</p>
              </ScrollReveal>
            </div>
            <ScrollReveal effect="rise" className="md:w-2/3">
              <blockquote className="max-w-4xl text-2xl font-bold leading-tight tracking-tight text-black md:text-[36px]">
                {T.quote[locale]}
              </blockquote>
              <div className="mt-8 flex flex-col gap-5 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-bold text-black/75">Agnese Pastare · PB Finanses</span>
                <a
                  href="https://www.linkedin.com/posts/agnese-pastare-85732b58_pb-finanses-lepojas-piedal%C4%ABties-shadowy-pilotprojekt%C4%81-share-7483124194482929664-XxqF/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                >
                  {T.readFull[locale]}
                  <ArrowUpRight className="size-4" aria-hidden />
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="bg-black px-4 pb-32 md:px-8">
          <div className="w-full">
            <div className="flex flex-col items-center border-t border-white/10 py-20 text-center md:p-24">
              <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-white/10">
                <Image src="/shadowy.svg" alt="" width={24} height={24} className="size-6 opacity-70" />
              </div>
              <h2 className="mx-auto mb-8 max-w-[560px] text-2xl font-bold leading-[1.1] tracking-tighter text-white md:text-[36px]">
                {T.finalHeading[locale]}
              </h2>
              <p className="mx-auto mb-12 max-w-[760px] text-sm font-semibold leading-relaxed text-white/70 md:text-base">
                {T.finalText[locale]} <span className="whitespace-nowrap">{T.finalTextTail[locale]}</span>
              </p>
              <Link
                href="/#pilots"
                className="rounded-full bg-white px-6 py-3 text-base font-bold text-black shadow-xl transition-all duration-300 hover:scale-[1.05] hover:bg-white/90 active:scale-[0.98]"
              >
                {T.finalCta[locale]}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter tone="dark" />
    </div>
  );
}

export function PbFinansesContent() {
  return (
    <LocaleProvider>
      <PageBody />
    </LocaleProvider>
  );
}
