import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { AnimatedGradientHeading } from "@/components/ui/animated-gradient-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { LandingNav } from "@/components/landing/atoms/landing-nav";
import { LandingFooter } from "@/components/landing/atoms/landing-footer";

export const metadata: Metadata = {
  title: "Shadowy pilotprojekts",
  description:
    "Uzziniet, kādiem uzņēmumiem paredzēts Shadowy pilotprojekts, ko saņemsiet un ko sagaidām no pilotprojekta dalībniekiem.",
};

type InfoItem = { title: string; text: string };

const companies: InfoItem[] = [
  {
    title: "Pakalpojumu uzņēmumi ar 5-50 cilvēku komandu",
    text: "Īpaši noderīgi grāmatvedības, finanšu, konsultāciju, aģentūru un citu profesionālo pakalpojumu komandām.",
  },
  {
    title: "Komandas, kurās daļa darba paliek neredzama",
    text: "Meklējam uzņēmumus, kuros papildu uzdevumi, pārtraukumi, klientu pieprasījumi vai iekšējie darbi neparādās ierastajās atskaitēs.",
  },
  {
    title: "Uzņēmumi ar klientiem, projektiem vai fiksētu pakalpojumu maksu",
    text: "Shadowy palīdz salīdzināt ieguldīto laiku, komandas slodzi un faktisko darba pašizmaksu pa klientiem vai projektiem.",
  },
  {
    title: "Vadītāji, kuri vēlas lēmumus balstīt datos",
    text: "Pilotprojekts ir piemērots komandām, kuras grib saprast cēloņus, nevis uzraudzīt cilvēkus, un ir gatavas kopīgi pārbaudīt risinājumu praksē.",
  },
] as const;

const benefits: InfoItem[] = [
  {
    title: "Jūsu procesiem pielāgota Shadowy vide",
    text: "Sagatavosim kategorijas, lomas, klientus vai projektus atbilstoši tam, kā jūsu komanda strādā ikdienā.",
  },
  {
    title: "Komandas ievadapmācība un atbalsts",
    text: "Palīdzēsim uzsākt darbu, izskaidrosim vienkāršu fiksēšanas principu un atbildēsim uz jautājumiem pilotprojekta laikā.",
  },
  {
    title: "Skaidrs slodzes un neredzamā darba pārskats",
    text: "Redzēsiet, kur rodas papildu darbs, kuri procesi atkārtojas un kam komanda patiesībā velta savu laiku.",
  },
  {
    title: "Noslēguma analīze un praktiski ieteikumi",
    text: "Apkoposim rezultātus, parādīsim būtiskākās tendences un ieteiksim, ko automatizēt, pārplānot vai mērīt turpmāk.",
  },
  {
    title: "Iespēja ietekmēt produkta attīstību",
    text: "Jūsu pieredze un atgriezeniskā saite palīdzēs noteikt, kuras funkcijas Shadowy jāpilnveido nākamās.",
  },
  {
    title: "Pamats lēmumam par turpmāku ieviešanu",
    text: "Pirms plašākas ieviešanas varēsiet novērtēt risinājuma praktisko vērtību ar savas komandas reāliem procesiem.",
  },
] as const;

const expectations: InfoItem[] = [
  {
    title: "Viena atbildīgā kontaktpersona",
    text: "Cilvēks, kurš palīdz saskaņot pilotprojekta mērķi, dalībniekus un īsas regulārās sarunas ar Shadowy komandu.",
  },
  {
    title: "Konkrēta komanda un izmērāma problēma",
    text: "Kopīgi izvēlēsimies vienu komandu, procesu vai klientu grupu, kurā pilotprojekta rezultātu var skaidri novērtēt.",
  },
  {
    title: "Regulāra lietošana pilotprojekta laikā",
    text: "Dalībniekiem jābūt gataviem īsi fiksēt būtisko darbu un izmantot platformu saskaņotajā testa periodā.",
  },
  {
    title: "Godīga un konkrēta atgriezeniskā saite",
    text: "Sagaidām īsas atsauksmes par to, kas strādā, kas traucē un kas būtu jāpielāgo, lai risinājums dotu lielāku vērtību.",
  },
] as const;

const steps: InfoItem[] = [
  { title: "01 - Iepazīšanās", text: "20 minūšu sarunā izrunājam komandas situāciju un saprotam, vai pilotprojekts jums ir piemērots." },
  { title: "02 - Sagatavošana", text: "Vienojamies par mērķi, dalībniekiem, periodu un pielāgojam Shadowy vidi jūsu procesam." },
  { title: "03 - Pilotprojekts", text: "Komanda izmanto platformu ikdienā, bet mēs sekojam līdzi pieredzei un palīdzam novērst neskaidrības." },
  { title: "04 - Rezultāti", text: "Kopīgi apskatām datus, secinājumus un vienojamies, vai un kā risinājumu attīstīt tālāk." },
] as const;

function InfoSection({ title, items, id }: { title: string; items: readonly InfoItem[]; id?: string }) {
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
              key={item.title}
              effect="atomsRow"
              delay={(index % 2) * 0.08}
              className="border-b border-black/10 py-7 md:pr-10 md:odd:border-r md:even:pl-10"
            >
              <p className="mb-3 text-xs font-bold tabular-nums text-black/35">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mb-2 text-lg font-bold leading-tight text-black md:text-xl">{item.title}</h3>
              <p className="m-0 text-sm font-semibold leading-relaxed text-black/65 md:text-[15px]">{item.text}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PilotProjectPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white font-sans text-black antialiased">
      <LandingNav alwaysLight />

      <main className="overflow-x-hidden pt-28 md:pt-48">
        <section className="flex h-auto min-h-0 flex-col overflow-hidden px-4 md:h-[calc(100svh-12rem)] md:min-h-[620px] md:px-8">
          <ScrollReveal effect="atomsHero" duration={0.8} className="mb-12">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-1.5 text-sm font-bold text-black">
              <Check className="size-4 text-[#2563eb]" aria-hidden />
              Atvērta pilotprogramma
            </div>
            <h1 className="mb-6 max-w-6xl text-4xl font-bold leading-[1.02] tracking-tight text-black md:text-7xl">
              <AnimatedGradientHeading>Padariet savas komandas neredzamo darbu izmērāmu</AnimatedGradientHeading>
            </h1>
            <p className="mb-8 max-w-3xl text-sm font-semibold leading-relaxed text-black/75 md:text-base">
              Meklējam uzņēmumus, kuri vēlas kopā ar Shadowy pārbaudīt praktisku risinājumu komandas slodzes, papildu darba un izmaksu analīzei
            </p>
            <Link href="/#pilots" className="inline-flex w-fit items-center gap-2 rounded-full bg-black px-6 py-3 text-base font-bold text-white transition-transform hover:scale-[1.02]">
              Pieteikt pilotprojektu
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </ScrollReveal>

          <ScrollReveal effect="fade" duration={1.1} delay={0.15} className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] aspect-[16/10] w-screen flex-none bg-[#07090a] md:aspect-auto md:min-h-0 md:flex-1">
            <Image
              src="/images/shadowy-dashboard-wide.png"
              alt="Shadowy komandas analītikas platforma"
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </ScrollReveal>
        </section>

        <InfoSection id="uznemumi" title="Kādus uzņēmumus mēs meklējam" items={companies} />
        <InfoSection id="ieguvumi" title="Ko jūs saņemsiet" items={benefits} />

        <section className="bg-white px-4 py-8 md:px-8 md:py-12">
          <ScrollReveal effect="fade" duration={1}>
            <div className="relative min-h-[300px] w-full overflow-hidden bg-[#07090a] md:min-h-[560px]">
              <Image src="/images/shadowy-dashboard-wide.png" alt="Shadowy vadības pārskats" fill sizes="100vw" className="object-contain" />
            </div>
          </ScrollReveal>
        </section>

        <InfoSection id="sagaidam" title="Ko mēs sagaidām no jums" items={expectations} />
        <InfoSection id="process" title="Kā notiek pilotprojekts" items={steps} />

        <section className="bg-black px-4 pb-32 md:px-8">
          <div className="flex flex-col items-center border-t border-white/10 py-20 text-center md:p-24">
            <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-white/10">
              <Image src="/shadowy.svg" alt="" width={24} height={24} className="size-6 opacity-70" />
            </div>
            <h2 className="mx-auto mb-6 max-w-3xl text-3xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
              Vai jūsu uzņēmums ir gatavs pilotprojektam?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-sm font-semibold leading-relaxed text-white/65 md:text-base">
              Atstājiet pieteikumu. Sazināsimies, īsi izrunāsim jūsu situāciju un godīgi pateiksim, vai Shadowy šobrīd var dot praktisku vērtību jūsu komandai
            </p>
            <Link href="/#pilots" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-bold text-black transition-transform hover:scale-[1.03]">
              Pieteikt pilotprojektu
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter tone="dark" />
    </div>
  );
}
