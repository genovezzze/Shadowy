import type { Metadata } from "next";
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
import type { MatrixClientRow, MatrixEmployee } from "@/lib/client-matrix";

export const metadata: Metadata = {
  title: "PB Finanses klienta projekts",
  description:
    "Shadowy risinājums grāmatvedības uzņēmumiem - neredzamā darba, komandas slodzes un klientu izmaksu pārskatīšanai vienuviet.",
};

const audiences = [
  "Grāmatvedības ārpakalpojumu uzņēmumi",
  "Pilna servisa finanšu uzņēmumi",
  "Nodokļu un biznesa konsultanti",
  "Uzņēmumi ar lielu klientu portfeli",
  "Finanšu un administrācijas komandas",
  "Komandas ar fiksētu pakalpojumu maksu",
] as const;

const keyFeatures = [
  "Papildu un neredzamā darba fiksēšana",
  "Darba ierakstu sasaiste ar klientiem",
  "Komandas noslodzes pārskats",
  "Klientam veltītā laika analīze",
  "Atkārtojošos procesu identificēšana",
  "Izmaksu aprēķins pēc stundu likmes",
  "Klientu limitu un pārsniegumu kontrole",
  "Vadības analītika vienotā platformā",
] as const;

const projectDetails = [
  {
    title: "Par PB Finanses",
    text: "PB Finanses ir pilna servisa finanšu uzņēmums, kas sniedz grāmatvedības, finanšu plānošanas un biznesa konsultāciju pakalpojumus Latvijas un ārvalstu uzņēmumiem.",
  },
  {
    title: "Uzņēmuma vajadzība",
    text: "Komanda jau iepriekš pētīja “slēpto darbu” - uzdevumus, kurus klients tieši neredz un par kuriem atsevišķi nemaksā, bet kuri ir nepieciešami kvalitatīvam servisam.",
  },
  {
    title: "Ko izstrādājām",
    text: "Shadowy pilotplatformu papildu darba fiksēšanai un analīzei, lai komanda reģistrētu darbu, bet vadība redzētu slodzi, atkārtojošos procesus un klientiem veltīto laiku.",
  },
  {
    title: "Sadarbības sākums",
    text: "Sadarbība sākās pēc iepazīšanās CoLab 2026 biznesa forumā un turpinājās kā pilotprojekts reāla uzņēmuma ikdienas darbā.",
  },
  {
    title: "Projekta formāts",
    text: "Web platforma · Datu analītika · Komandas slodze · Pilotprojekts",
  },
] as const;

const solutionSteps = [
  {
    number: "01",
    title: "Fiksēt darbu",
    text: "Komanda vienuviet reģistrē papildu darbu, pārtraukumus un uzdevumus, kas iepriekš palika ārpus ierastajām atskaitēm.",
  },
  {
    number: "02",
    title: "Strukturēt datus",
    text: "Ieraksti tiek sasaistīti ar klientiem, kategorijām un komandas lomām, lai atsevišķi notikumi kļūtu salīdzināmi.",
  },
  {
    number: "03",
    title: "Ieraudzīt kopsakarības",
    text: "Vadība redz slodzi, atkārtojošos procesus, klientiem veltīto laiku un vietas, kurās rodas neplānotas izmaksas.",
  },
] as const;

const accountingFit = [
  {
    title: "Gatavs pamats grāmatvedības uzņēmumam",
    text: "PB Finanses projektā pārbaudītais process jau aptver klientus, darbiniekus, darba kategorijas, laiku, limitus un izmaksu pārskatus.",
  },
  {
    title: "Pielāgošana jūsu pakalpojumu modelim",
    text: "Varam mainīt darba kategorijas, lomas, limitu loģiku, pārskatus un aprēķinus atbilstoši tam, kā jūsu uzņēmums apkalpo klientus.",
  },
  {
    title: "Integrācijas ar esošajiem procesiem",
    text: "Pēc vajadzības varam pievienot datu importu, automatizētus paziņojumus, vadības atskaites vai savienojumus ar jau izmantotajām sistēmām.",
  },
  {
    title: "Pilotprojekts pirms pilnas ieviešanas",
    text: "Sākam ar konkrētu komandu un izmērāmu problēmu, pārbaudām risinājumu ikdienas darbā un tikai tad vienojamies par nākamajām funkcijām.",
  },
] as const;

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

type ListItem = string | { title: string; text: string };

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
              const itemTitle = typeof item === "string" ? item : item.title;
              const itemText = typeof item === "string" ? null : item.text;

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


export default function PbFinansesCasePage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white font-sans text-black antialiased">
      <LandingNav alwaysLight />

      <main className="overflow-x-hidden pt-28 md:pt-48">
        <section className="mb-0 flex h-auto min-h-0 flex-col overflow-hidden px-4 md:h-[calc(100svh-12rem)] md:min-h-[620px] md:px-8">
          <div className="w-full">
            <ScrollReveal effect="atomsHero" duration={0.8} className="mb-12">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-1.5 text-sm font-bold tracking-tight text-black">
                <Check className="size-4 text-[#2563eb]" aria-hidden />
                Realizēts projekts / Grāmatvedība
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-[1.05] tracking-tight text-black md:text-7xl">
                <AnimatedGradientHeading>Neredzamais darbs kļūst izmērāms</AnimatedGradientHeading>
              </h1>
              <p className="mb-8 text-sm font-semibold leading-relaxed text-black/75 md:text-base">
                <AnimatedGradientHeading>Vienota platforma neredzamā darba, komandas slodzes un klientu izmaksu pārskatīšanai - izstrādāta kopā ar PB Finanses un pielāgojama arī jūsu grāmatvedības uzņēmumam.</AnimatedGradientHeading>
              </p>
              <Link
                href="#gramatvedibai"
                className="inline-flex w-fit rounded-full bg-black px-6 py-3 text-base font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Vai tas der jūsu uzņēmumam?
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

        <ReferenceListSection title="Kam šis risinājums ir piemērots" items={audiences} />
        <ReferenceListSection id="iespejas" title="Galvenās iespējas" items={keyFeatures} />
        <ReferenceListSection id="projekts" title="Par projektu" items={projectDetails} bordered />

        <section className="bg-white px-4 py-8 md:px-8 md:py-12">
          <ScrollReveal effect="fade" duration={1.2} delay={0.2}>
            <div className="relative min-h-[300px] w-full overflow-hidden bg-[#07090a] md:min-h-[560px]">
              <Image
                src="/images/shadowy-dashboard-wide.png"
                alt="Shadowy darba pārskata saskarne"
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </ScrollReveal>
        </section>

        <ReferenceListSection title="Kā risinājums darbojas" items={solutionSteps.map(({ title, text, number }) => ({ title: `${number} - ${title}`, text }))} bordered />
        <ReferenceListSection id="gramatvedibai" title="Pielāgojams tieši jūsu grāmatvedības uzņēmumam" items={accountingFit} bordered />

        <section className="overflow-hidden bg-white px-4 py-20 md:px-8">
          <div className="flex flex-col items-start gap-10 md:flex-row md:gap-20">
            <div className="shrink-0 md:w-1/3">
              <ScrollReveal effect="rise">
                <h2 className="mb-4 text-2xl font-bold leading-tight tracking-tight md:text-[36px]">
                  Klientu un komandas noslodzes matrica
                </h2>
                <p className="max-w-sm text-sm font-semibold leading-relaxed text-black/70 md:text-[15px]">
                  Demonstrācijas dati parāda, kā stundas, izmaksas un klientu limiti kļūst salīdzināmi vienā skatā
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
                    monthLabel="2026. gada augusts"
                    selectedMonth="2026-08"
                    monthOptions={[{ value: "2026-08", label: "2026. gada augusts" }]}
                  />
                  </FitToWidth>
                </Suspense>
              </div>
              <p className="mt-4 text-xs font-medium leading-relaxed text-black/60">
                Visi klientu nosaukumi, stundas, limiti un izmaksas šajā piemērā ir izdomāti un neatspoguļo PB Finanses datus
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="overflow-hidden bg-[#f5f5f5] px-4 py-20 md:px-8 md:py-24">
          <div className="flex flex-col items-start gap-12 lg:flex-row lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:w-1/3 lg:shrink-0">
              <ScrollReveal effect="atomsHero" duration={0.8}>
                <div className="mb-6 inline-flex rounded-full bg-[#eaf3e8] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#4f9148]">
                  Automātiski ģenerēts
                </div>
                <h2 className="mb-6 text-2xl font-bold leading-tight tracking-tight text-black md:text-[36px]">
                  Anonimizēta klienta izmaksu atskaite
                </h2>
                <p className="mb-8 max-w-md text-sm font-semibold leading-relaxed text-black/70 md:text-[15px]">
                  Shadowy automātiski apkopo klientam veltīto laiku, paveiktos darbus un komandas stundas izmaksas. Vadītājs uzreiz redz, cik klients uzņēmumam izmaksā un kāpēc pārsniegts plānotais limits
                </p>

                <AnimatedReportMetrics />

                <div className="mt-8 border-t border-black/10 pt-7">
                  <h3 className="mb-4 text-base font-bold text-black">Ko atskaite parāda</h3>
                  <ul className="space-y-3">
                    {[
                      "kādi darbi klientam tika veikti",
                      "cik laika un naudas patērēts",
                      "kas izraisīja izmaksu pieaugumu",
                      "kurus procesus iespējams automatizēt",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-black/70">
                        <Check className="mt-0.5 size-4 shrink-0 text-[#5b9d53]" aria-hidden />
                        {item}
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
                    <p className="m-0 text-sm font-bold text-white">Klienta A-017 izmaksu pārskats</p>
                    <p className="m-0 mt-1 text-xs font-medium text-white/50">Anonimizēti demonstrācijas dati · 4 lapas</p>
                  </div>
                  <a
                    href="/documents/anonimizets-klienta-izmaksu-parskats.pdf?v=demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform duration-300 hover:scale-[1.02]"
                  >
                    Atvērt pilnā izmērā
                    <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                </div>
                <iframe
                  title="Anonimizēts klienta izmaksu pārskats"
                  src="/documents/anonimizets-klienta-izmaksu-parskats.pdf?v=demo#view=FitH&toolbar=1"
                  className="h-[680px] w-full rounded-[14px] bg-white md:h-[820px]"
                />
              </div>
              <p className="mt-4 text-xs font-medium leading-relaxed text-black/55">
                Pārskats izmanto izdomātu klienta kodu un demonstrācijas vērtības. Tas neatklāj PB Finanses klientus, darbiniekus vai finanšu informāciju
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="overflow-hidden bg-white px-4 py-20 md:px-8">
          <div className="flex flex-col items-start gap-10 border-y border-black/10 py-20 md:flex-row md:gap-20">
            <div className="shrink-0 md:w-1/3">
              <ScrollReveal effect="rise">
                <p className="text-sm font-bold text-black/65">PB Finanses pieredze</p>
              </ScrollReveal>
            </div>
            <ScrollReveal effect="rise" className="md:w-2/3">
              <blockquote className="max-w-4xl text-2xl font-bold leading-tight tracking-tight text-black md:text-[36px]">
                “Shadowy aplikācija šo procesu padara krietni ērtāku un uzreiz sniedz labu analītisko materiālu.”
              </blockquote>
              <div className="mt-8 flex flex-col gap-5 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-bold text-black/75">Agnese Pastare · PB Finanses</span>
                <a
                  href="https://www.linkedin.com/posts/agnese-pastare-85732b58_pb-finanses-lepojas-piedal%C4%ABties-shadowy-pilotprojekt%C4%81-share-7483124194482929664-XxqF/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                >
                  Lasīt pilno ierakstu
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
                Vai Shadowy var palīdzēt arī jūsu grāmatvedības uzņēmumam?
              </h2>
              <p className="mx-auto mb-12 max-w-[760px] text-sm font-semibold leading-relaxed text-white/70 md:text-base">
                Parādīsim jau izstrādāto risinājumu, izrunāsim jūsu procesus un vienosimies, kuras funkcijas izmantot uzreiz un kuras <span className="whitespace-nowrap">pielāgot tieši jums.</span>
              </p>
              <Link
                href="/#pilots"
                className="rounded-full bg-white px-6 py-3 text-base font-bold text-black shadow-xl transition-all duration-300 hover:scale-[1.05] hover:bg-white/90 active:scale-[0.98]"
              >
                Pieteikt sarunu
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter tone="dark" />
    </div>
  );
}
