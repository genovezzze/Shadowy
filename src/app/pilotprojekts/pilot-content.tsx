"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { AnimatedGradientHeading } from "@/components/ui/animated-gradient-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { LandingNav } from "@/components/landing/atoms/landing-nav";
import { LandingFooter } from "@/components/landing/atoms/landing-footer";
import { LocaleProvider, useLocale, type Locale } from "@/components/landing/atoms/i18n";

type L = Record<Locale, string>;
type InfoItem = { title: L; text: L };

const companies: readonly InfoItem[] = [
  {
    title: { lv: "Grāmatvedības biroji ar 3-30 cilvēku komandu", en: "Accounting firms with a team of 3-30" },
    text: {
      lv: "Ārpakalpojuma grāmatvedības un finanšu biroji, kuros vairāki cilvēki strādā ar daudziem klientiem",
      en: "Outsourced accounting and finance offices where several people work across many clients",
    },
  },
  {
    title: { lv: "Biroji ar fiksētu ikmēneša maksu", en: "Firms that charge a fixed monthly fee" },
    text: {
      lv: "Klients maksā vienu summu mēnesī, bet darba apjoms mainās: nepilni dokumenti, labojumi, steidzami jautājumi. Tieši šeit Shadowy parāda patieso pašizmaksu",
      en: "The client pays one amount a month, but the workload changes: incomplete documents, corrections, urgent questions. That is exactly where Shadowy shows the true cost",
    },
  },
  {
    title: { lv: "Vadība, kas grib zināt, kuriem klientiem pārskatīt cenu", en: "Owners who want to know which clients to reprice" },
    text: {
      lv: "Shadowy salīdzina katram klientam veltīto laiku ar iekļauto apjomu un parāda, kuri klienti prasa vairāk, nekā maksā, un kāpēc",
      en: "Shadowy compares the time spent on each client with what the fee covers and shows which clients take more than they pay for, and why",
    },
  },
  {
    title: { lv: "Vadītāji, kuri vēlas lēmumus balstīt datos", en: "Managers who want to base decisions on data" },
    text: {
      lv: "Pilotprojekts ir piemērots komandām, kuras grib saprast cēloņus, nevis uzraudzīt cilvēkus, un ir gatavas kopīgi pārbaudīt risinājumu praksē",
      en: "The pilot suits teams that want to understand causes rather than monitor people, and are ready to test the solution together in practice",
    },
  },
];

const benefits: readonly InfoItem[] = [
  {
    title: { lv: "Jūsu procesiem pielāgota Shadowy vide", en: "A Shadowy setup tailored to your processes" },
    text: {
      lv: "Sagatavosim kategorijas, lomas, klientus vai projektus atbilstoši tam, kā jūsu komanda strādā ikdienā",
      en: "We'll set up categories, roles, clients or projects to match how your team works day to day",
    },
  },
  {
    title: { lv: "Komandas ievadapmācība un atbalsts", en: "Team onboarding and support" },
    text: {
      lv: "Palīdzēsim uzsākt darbu, izskaidrosim vienkāršu fiksēšanas principu un atbildēsim uz jautājumiem pilotprojekta laikā",
      en: "We'll help you get started, explain the simple logging principle and answer questions throughout the pilot",
    },
  },
  {
    title: { lv: "Katra klienta stundas un pašizmaksa", en: "Hours and cost for every client" },
    text: {
      lv: "Redzēsiet, cik laika un naudas aiziet katram klientam, kuri klienti pārsniedz iekļauto laiku un kas rada papildu darbu",
      en: "You'll see how much time and money goes to each client, which clients exceed their included time and what causes the extra work",
    },
  },
  {
    title: { lv: "Noslēguma analīze un praktiski ieteikumi", en: "A closing analysis and practical recommendations" },
    text: {
      lv: "Apkoposim rezultātus, parādīsim būtiskākās tendences un ieteiksim, ko automatizēt, pārplānot vai mērīt turpmāk",
      en: "We'll summarise the results, show the key trends and suggest what to automate, replan or measure going forward",
    },
  },
  {
    title: { lv: "Iespēja ietekmēt produkta attīstību", en: "A chance to shape the product" },
    text: {
      lv: "Jūsu pieredze un atgriezeniskā saite palīdzēs noteikt, kuras funkcijas Shadowy jāpilnveido nākamās",
      en: "Your experience and feedback will help decide which Shadowy features to improve next",
    },
  },
  {
    title: { lv: "Pamats lēmumam par turpmāku ieviešanu", en: "A basis for the rollout decision" },
    text: {
      lv: "Pirms plašākas ieviešanas varēsiet novērtēt risinājuma praktisko vērtību ar savas komandas reāliem procesiem",
      en: "Before a wider rollout you can assess the solution's practical value with your team's real processes",
    },
  },
];

const expectations: readonly InfoItem[] = [
  {
    title: { lv: "Viena atbildīgā kontaktpersona", en: "One responsible contact person" },
    text: {
      lv: "Cilvēks, kurš palīdz saskaņot pilotprojekta mērķi, dalībniekus un īsas regulārās sarunas ar Shadowy komandu",
      en: "Someone who helps align the pilot's goal, participants and short regular check-ins with the Shadowy team",
    },
  },
  {
    title: { lv: "Konkrēta komanda un izmērāma problēma", en: "A specific team and a measurable problem" },
    text: {
      lv: "Kopīgi izvēlēsimies vienu komandu, procesu vai klientu grupu, kurā pilotprojekta rezultātu var skaidri novērtēt",
      en: "Together we'll pick one team, process or client group where the pilot's result can be clearly assessed",
    },
  },
  {
    title: { lv: "Regulāra lietošana pilotprojekta laikā", en: "Regular use during the pilot" },
    text: {
      lv: "Dalībniekiem jābūt gataviem īsi fiksēt būtisko darbu un izmantot platformu saskaņotajā testa periodā",
      en: "Participants should be ready to briefly log the important work and use the platform during the agreed test period",
    },
  },
  {
    title: { lv: "Godīga un konkrēta atgriezeniskā saite", en: "Honest and specific feedback" },
    text: {
      lv: "Sagaidām īsas atsauksmes par to, kas strādā, kas traucē un kas būtu jāpielāgo, lai risinājums dotu lielāku vērtību",
      en: "We expect brief feedback on what works, what gets in the way and what should be adjusted to make the solution more valuable",
    },
  },
];

const steps: readonly InfoItem[] = [
  {
    title: { lv: "01. Iepazīšanās", en: "01. Intro" },
    text: {
      lv: "20 minūšu sarunā izrunājam komandas situāciju un saprotam, vai pilotprojekts jums ir piemērots",
      en: "In a 20-minute conversation we talk through your team's situation and figure out whether the pilot fits",
    },
  },
  {
    title: { lv: "02. Sagatavošana", en: "02. Preparation" },
    text: {
      lv: "Vienojamies par mērķi, dalībniekiem, periodu un pielāgojam Shadowy vidi jūsu procesam",
      en: "We agree on the goal, participants and period, and tailor the Shadowy setup to your process",
    },
  },
  {
    title: { lv: "03. Pilotprojekts", en: "03. Pilot" },
    text: {
      lv: "Komanda izmanto platformu ikdienā, bet mēs sekojam līdzi pieredzei un palīdzam novērst neskaidrības",
      en: "The team uses the platform daily while we follow the experience and help clear up any uncertainties",
    },
  },
  {
    title: { lv: "04. Rezultāti", en: "04. Results" },
    text: {
      lv: "Kopīgi apskatām datus, secinājumus un vienojamies, vai un kā risinājumu attīstīt tālāk",
      en: "Together we review the data and conclusions and agree whether and how to develop the solution further",
    },
  },
];

const T = {
  badge: { lv: "Atvērta pilotprogramma", en: "Open pilot programme" },
  h1: { lv: "30 dienās uzziniet, cik patiesībā izmaksā jūsu klienti", en: "In 30 days, find out what your clients really cost" },
  intro: {
    lv: "Meklējam grāmatvedības birojus, kuri vēlas kopā ar Shadowy pārbaudīt, kuri klienti prasa vairāk laika, nekā par to maksā. Bez maksas un bez kredītkartes",
    en: "We're looking for accounting firms that want to check, together with Shadowy, which clients take more time than they pay for. Free, no credit card",
  },
  heroCta: { lv: "Pieteikt pilotprojektu", en: "Apply for the pilot" },
  heroAlt: { lv: "Shadowy klientu pašizmaksas pārskats", en: "Shadowy client cost overview" },
  dashboardAlt: { lv: "Shadowy vadības pārskats", en: "Shadowy management overview" },
  companiesTitle: { lv: "Kādus uzņēmumus mēs meklējam", en: "What companies we're looking for" },
  benefitsTitle: { lv: "Ko jūs saņemsiet", en: "What you'll get" },
  expectationsTitle: { lv: "Ko mēs sagaidām no jums", en: "What we expect from you" },
  processTitle: { lv: "Kā notiek pilotprojekts", en: "How the pilot works" },
  finalHeading: { lv: "Vai jūsu uzņēmums ir gatavs pilotprojektam?", en: "Is your company ready for a pilot?" },
  finalText: {
    lv: "Atstājiet pieteikumu. Sazināsimies, īsi izrunāsim jūsu situāciju un godīgi pateiksim, vai Shadowy šobrīd var dot praktisku vērtību jūsu komandai",
    en: "Leave an application. We'll get in touch, briefly discuss your situation and tell you honestly whether Shadowy can offer practical value to your team right now",
  },
  finalCta: { lv: "Pieteikt pilotprojektu", en: "Apply for the pilot" },
} as const;

function InfoSection({ title, items, id }: { title: string; items: readonly InfoItem[]; id?: string }) {
  const { locale } = useLocale();
  return (
    <section id={id} className="overflow-hidden bg-white px-4 py-20 md:px-8 md:py-24">
      <div className="flex flex-col items-start gap-10 md:flex-row md:gap-20">
        <div className="shrink-0 md:w-1/3">
          <ScrollReveal effect="rise">
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-black md:text-[36px]">
              <AnimatedGradientHeading>{title}</AnimatedGradientHeading>
            </h2>
          </ScrollReveal>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-1 border-t border-black/10 md:grid-cols-2">
          {items.map((item, index) => (
            <ScrollReveal
              key={item.title.lv}
              effect="atomsRow"
              delay={(index % 2) * 0.08}
              className="border-b border-black/10 py-7 md:pr-10 md:odd:border-r md:even:pl-10"
            >
              <p className="mb-3 text-xs font-bold tabular-nums text-black/35">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mb-2 text-lg font-bold leading-tight text-black md:text-xl">{item.title[locale]}</h3>
              <p className="m-0 text-sm font-semibold leading-relaxed text-black/65 md:text-[15px]">{item.text[locale]}</p>
            </ScrollReveal>
          ))}
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
        <section className="flex h-auto min-h-0 flex-col overflow-hidden px-4 md:h-[calc(100svh-12rem)] md:min-h-[620px] md:px-8">
          <ScrollReveal effect="atomsHero" duration={0.8} className="mb-12">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-1.5 text-sm font-bold text-black">
              <Check className="size-4 text-[#2563eb]" aria-hidden />
              {T.badge[locale]}
            </div>
            <h1 className="mb-6 max-w-6xl text-4xl font-bold leading-[1.02] tracking-tight text-black md:text-7xl">
              <AnimatedGradientHeading>{T.h1[locale]}</AnimatedGradientHeading>
            </h1>
            <p className="mb-8 max-w-3xl text-sm font-semibold leading-relaxed text-black/75 md:text-base">
              {T.intro[locale]}
            </p>
            <Link href="/#pilots" className="inline-flex w-fit items-center gap-2 rounded-full bg-black px-6 py-3 text-base font-bold text-white transition-transform hover:scale-[1.02]">
              {T.heroCta[locale]}
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </ScrollReveal>

          <ScrollReveal effect="fade" duration={1.1} delay={0.15} className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] aspect-[16/10] w-screen flex-none bg-[#07090a] md:aspect-auto md:min-h-0 md:flex-1">
            <Image
              src="/images/shadowy-dashboard-wide.png"
              alt={T.heroAlt[locale]}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </ScrollReveal>
        </section>

        <InfoSection id="uznemumi" title={T.companiesTitle[locale]} items={companies} />
        <InfoSection id="ieguvumi" title={T.benefitsTitle[locale]} items={benefits} />

        <section className="bg-white px-4 py-8 md:px-8 md:py-12">
          <ScrollReveal effect="fade" duration={1}>
            <div className="relative min-h-[300px] w-full overflow-hidden bg-[#07090a] md:min-h-[560px]">
              <Image src="/images/shadowy-dashboard-wide.png" alt={T.dashboardAlt[locale]} fill sizes="100vw" className="object-contain" />
            </div>
          </ScrollReveal>
        </section>

        <InfoSection id="sagaidam" title={T.expectationsTitle[locale]} items={expectations} />
        <InfoSection id="process" title={T.processTitle[locale]} items={steps} />

        <section className="bg-black px-4 pb-32 md:px-8">
          <div className="flex flex-col items-center border-t border-white/10 py-20 text-center md:p-24">
            <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-white/10">
              <Image src="/shadowy.svg" alt="" width={24} height={24} className="size-6 opacity-70" />
            </div>
            <h2 className="mx-auto mb-6 max-w-3xl text-3xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
              {T.finalHeading[locale]}
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-sm font-semibold leading-relaxed text-white/65 md:text-base">
              {T.finalText[locale]}
            </p>
            <Link href="/#pilots" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-bold text-black transition-transform hover:scale-[1.03]">
              {T.finalCta[locale]}
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter tone="dark" />
    </div>
  );
}

export function PilotContent() {
  return (
    <LocaleProvider>
      <PageBody />
    </LocaleProvider>
  );
}
