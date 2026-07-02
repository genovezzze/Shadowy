import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Check,
  Linkedin,
  Mail,
  MessageSquare,
  Phone,
  Rocket,
} from "lucide-react";
import { PilotForm } from "@/app/pilot-form";
import { FaqSection } from "@/components/landing/faq-section";
import { ApplicationProcessSection } from "@/components/landing/application-process-section";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const processSteps = [
  {
    icon: Mail,
    number: "01",
    title: "Saņemam pieteikumu",
    text: "Apstiprinām saņemšanu 1-2 darba dienu laikā",
  },
  {
    icon: Phone,
    number: "02",
    title: "Iepazīšanās zvans",
    text: "20 minūšu zvans, lai saprastu jūsu komandas vajadzības",
  },
  {
    icon: MessageSquare,
    number: "03",
    title: "Saprotam piemērotību",
    text: "Godīgi paskaidrojam, vai Shadowy der jūsu situācijai",
  },
  {
    icon: Rocket,
    number: "04",
    title: "Sākam pilotu",
    text: "Iestatīšana līdz 10 minūtēm. Sāciet tajā pašā dienā",
  },
] as const;

const processTones = [
  {
    circle:
      "border-emerald-300/40 bg-emerald-400/[0.09] text-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.12)]",
    label: "text-emerald-300",
  },
  {
    circle:
      "border-cyan-300/30 bg-cyan-400/[0.09] text-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.1)]",
    label: "text-cyan-300",
  },
  {
    circle:
      "border-sky-300/30 bg-sky-400/[0.09] text-sky-300 shadow-[0_0_28px_rgba(56,189,248,0.1)]",
    label: "text-sky-300",
  },
  {
    circle:
      "border-teal-300/30 bg-teal-400/[0.09] text-teal-300 shadow-[0_0_28px_rgba(45,212,191,0.1)]",
    label: "text-teal-300",
  },
] as const;

const pilotBenefits = [
  "Iestatīšana 10 minūtēs - sāciet tajā pašā dienā",
  "Bez kredītkartes un bez saistībām",
  "Iepazīšanās zvans 20 minūtes - bez spiediena",
  "30 dienu pārskats par komandas slodzi",
  "Pilns atbalsts latviski visā pilota laikā",
] as const;

function DottedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-30"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.07) 0.7px, transparent 0.8px)",
        backgroundSize: "30px 30px",
        maskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
      }}
    />
  );
}

export function ClosingSections() {
  return (
    <>
      <section
        id="legacy-application-process"
        aria-labelledby="after-application-heading"
        className="hidden"
      >
        <DottedBackground />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-48 bottom-[-12rem] size-[430px] rounded-full bg-emerald-400/[0.06] blur-[130px]"
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
          <header className="text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              Process
            </p>
            <h2
              id="after-application-heading"
              className="font-accent text-[clamp(2.2rem,4vw,3.8rem)] font-bold tracking-[0.015em] text-white [font-synthesis:weight]"
            >
              Kas notiek pēc pieteikuma?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-accent text-base font-light leading-relaxed tracking-[0.012em] text-white/62 sm:text-lg">
              Mēs nevēlamies pārsteigt - šeit ir precīzi soļi no pieteikuma līdz
              pilota sākumam
            </p>
          </header>

          <div className="relative mt-14">
            <div
              aria-hidden
              className="absolute left-[12.5%] right-[12.5%] top-10 hidden h-px bg-gradient-to-r from-emerald-300/15 via-cyan-300/35 to-sky-300/15 lg:block"
            />
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                const tone = processTones[index];

                return (
                  <article key={step.number} className="relative text-center">
                    <span
                      className={`relative z-10 mx-auto grid size-20 place-items-center rounded-full border ${tone.circle}`}
                    >
                      <Icon className="size-6" strokeWidth={1.8} aria-hidden />
                    </span>
                    <p
                      className={`mt-7 text-[11px] font-bold uppercase tracking-[0.18em] ${tone.label}`}
                    >
                      Solis {index + 1}
                    </p>
                    <h3 className="mt-3 font-accent text-lg font-bold tracking-[0.02em] text-white">
                      {step.title}
                    </h3>
                    <p className="mx-auto mt-3 max-w-[15rem] font-accent text-sm font-light leading-relaxed tracking-[0.012em] text-white/55">
                      {step.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <ScrollReveal effect="tilt">
        <ApplicationProcessSection />
      </ScrollReveal>

      <ScrollReveal effect="fade" duration={2.2}>
      <section
        id="pilots"
        aria-labelledby="pilot-heading-visible"
        className="relative mx-2 mt-12 overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#07090c] py-8 scroll-mt-24 sm:mx-4 sm:mt-16 sm:rounded-[28px] md:py-10 lg:mx-7"
      >
        <div
          aria-hidden
          className="animate-pilot-grid pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.105) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.105) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            maskImage:
              "radial-gradient(ellipse 95% 90% at 50% 45%, black 0%, rgba(0,0,0,.72) 55%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 95% 90% at 50% 45%, black 0%, rgba(0,0,0,.72) 55%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_78%_at_50%_46%,transparent_20%,rgba(7,9,12,0.28)_68%,rgba(7,9,12,0.82)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-1/4 size-[430px] rounded-full bg-emerald-400/[0.07] blur-[130px]"
        />
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <h2
            id="pilot-heading-visible"
            className="text-balance bg-[linear-gradient(90deg,#f8fafc_0%,#f8fafc_40%,rgba(226,232,240,.78)_70%,rgba(100,116,139,.6)_100%)] bg-clip-text text-center font-accent text-[2rem] font-bold leading-[1.05] tracking-[0.02em] text-transparent [font-synthesis:weight] sm:text-[clamp(2rem,4vw,2.65rem)] lg:whitespace-nowrap"
          >
            Sāciet 30 dienu pilotu bez riska
          </h2>
          <div className="hidden">
            <h2
              id="pilot-heading"
              className="hidden"
            >
              Sāciet 30 dienu pilotu
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-sky-400 bg-clip-text text-transparent">
                bez riska
              </span>
            </h2>
            <p className="mt-4 max-w-xl font-accent text-sm font-light leading-relaxed tracking-[0.025em] text-white/65 sm:text-base">
              Aizpildiet formu - sazināsimies 1-2 darba dienu laikā un
              palīdzēsim uzsākt pilotu jūsu komandā
            </p>

            <ul className="mt-6 space-y-2.5">
              {pilotBenefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 font-accent text-sm font-light leading-relaxed tracking-[0.02em] text-white/70"
                >
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-300">
                    <Check className="size-3" strokeWidth={2.6} aria-hidden />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs tracking-[0.025em] text-white/32">
              Datus var dzēst jebkurā brīdī · GDPR atbilstoši · Serveri ES
              robežās
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-white/[0.1] bg-[#07090c]/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:p-5">
            <h3 className="font-accent text-lg font-bold tracking-[0.035em] text-white">
              Pieteikt pilotu
            </h3>
            <p className="mb-5 mt-1.5 text-sm tracking-[0.02em] text-white/48">
              Atbildēsim{" "}
              <strong className="font-bold text-white/62 [font-synthesis:weight]">
                1-2 darba dienu laikā
              </strong>
            </p>
            <PilotForm />
          </div>

          <p className="mx-auto mt-5 max-w-xl text-center font-accent text-sm font-light leading-relaxed tracking-[0.018em] text-white/48">
            Shadowy ir Ventspils Augstskolas studentu veidots agrīnās stadijas
            projekts. Šobrīd meklējam pirmās komandas{" "}
            <strong className="font-bold text-white/62 [font-synthesis:weight]">
              30 dienu pilotam
            </strong>
            , lai pārbaudītu risinājumu{" "}
            <strong className="font-bold text-white/62 [font-synthesis:weight]">
              reālā darba vidē
            </strong>
            . Jūsu{" "}
            <strong className="font-bold text-white/62 [font-synthesis:weight]">
              atgriezeniskā saite
            </strong>{" "}
            palīdzēs veidot labāku produktu
          </p>

          <div className="hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-35"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.08) 0.7px, transparent 0.8px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div
              aria-hidden
              className="relative size-[330px]"
            >
              <div
                className="absolute inset-0 bg-white"
                style={{
                  maskImage: "url(/shadowy.svg)",
                  WebkitMaskImage: "url(/shadowy.svg)",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              />
            </div>
            <h3 className="hidden">
              Gatavi pārbaudīt Shadowy
              <br />
              savā komandā?
            </h3>
          </div>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal effect="blur">
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="relative mt-12 bg-[#07090c] py-16 scroll-mt-24 sm:mt-16 sm:py-20 md:py-24"
      >
        <DottedBackground />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-6">
          <header className="mb-9 text-center sm:mb-12">
            <h2
              id="faq-heading"
              className="text-balance font-accent text-[2rem] font-bold leading-[1.08] tracking-[0.015em] text-white [font-synthesis:weight] sm:text-[clamp(2.25rem,3.4vw,2.8rem)]"
            >
              Biežāk uzdotie jautājumi
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-accent text-base font-light text-white/55 sm:text-lg">
              Viss, kas jums jāzina par pilotu, datiem un Shadowy darbību
            </p>
          </header>
          <FaqSection />
        </div>
      </section>
      </ScrollReveal>

      <section className="hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_110%_at_50%_110%,rgba(16,185,129,0.16),transparent_70%),radial-gradient(40%_80%_at_100%_0%,rgba(59,130,246,0.12),transparent_75%)]"
        />
        <DottedBackground />

        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center md:py-24">
          <h2 className="font-accent text-[clamp(2.4rem,5vw,4.7rem)] font-bold leading-[1.04] tracking-[0.015em] text-white [font-synthesis:weight]">
            Gatavi pārbaudīt Shadowy
            <br />
            <span className="bg-gradient-to-r from-emerald-300 to-sky-400 bg-clip-text text-transparent">
              savā komandā?
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-accent text-base font-light leading-relaxed text-white/62 sm:text-lg">
            Sāciet ar 30 dienu bezmaksas pilotu vienai komandai. Bez riska, bez
            kredītkartes un bez sarežģītas ieviešanas
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-13 items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold tracking-[0.015em] text-[#06110e] shadow-[0_0_30px_rgba(255,255,255,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_0_38px_rgba(255,255,255,0.2)]"
            >
              Izmēģināt BEZMAKSAS
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
            <a
              href="#pilots"
              className="inline-flex items-center rounded-xl border border-white/[0.11] bg-white/[0.035] px-7 py-3.5 text-sm font-semibold text-white/78 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
            >
              Sazināties
            </a>
          </div>

          <p className="mt-6 text-xs text-white/35">
            Jautājumi?{" "}
            <a
              href="mailto:contact@shadowy.lv"
              className="underline underline-offset-4 transition hover:text-white/65"
            >
              contact@shadowy.lv
            </a>
          </p>
        </div>
      </section>

      <ScrollReveal effect="rise">
      <footer className="relative bg-black">
        <div className="relative mx-auto max-w-6xl px-6 pb-6 pt-9 sm:pt-10">
          <div className="grid gap-8 md:grid-cols-[1.35fr_0.65fr_0.8fr]">
            <div className="max-w-md">
              <Link href="/" className="inline-flex items-center gap-2">
                <Image
                  src="/shadowy.svg"
                  alt=""
                  width={28}
                  height={28}
                  className="size-7"
                />
                <span className="text-lg font-semibold tracking-normal text-white">
                  Shadowy
                </span>
              </Link>
              <p className="mt-3 max-w-sm font-accent text-sm font-light leading-relaxed tracking-[0.018em] text-white/48">
                Padariet neredzamo darbu redzamu - strukturēta darba
                iesniegšana, vadītāja izskatīšana un godīgāka slodzes pārvaldība
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <a
                  href="mailto:contact@shadowy.lv"
                  className="group inline-flex w-fit items-center gap-2.5 text-[13px] text-white/55 transition hover:text-white"
                >
                  <span className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] transition group-hover:border-emerald-300/20 group-hover:text-emerald-300">
                    <Mail className="size-3.5" aria-hidden />
                  </span>
                  contact@shadowy.lv
                </a>
                <a
                  href="https://www.linkedin.com/in/artemijs-lučins/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex w-fit items-center gap-2.5 text-[13px] text-white/55 transition hover:text-white"
                >
                  <span className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] transition group-hover:border-sky-300/20 group-hover:text-sky-300">
                    <Linkedin className="size-3.5" aria-hidden />
                  </span>
                  Artemijs Lučins
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                Produkts
              </h3>
              <nav className="mt-3.5 flex flex-col gap-2.5 text-[13px]">
                <a
                  href="#risinajums"
                  className="w-fit text-white/55 transition hover:text-white"
                >
                  Kā tas darbojas
                </a>
                <a
                  href="#pilots"
                  className="w-fit text-white/55 transition hover:text-white"
                >
                  Pilots
                </a>
                <Link
                  href="/login"
                  className="w-fit text-white/55 transition hover:text-white"
                >
                  Pieslēgties
                </Link>
              </nav>
            </div>

            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                Juridiskā informācija
              </h3>
              <nav className="mt-3.5 flex flex-col gap-2.5 text-[13px]">
                <Link
                  href="/privacy"
                  className="w-fit text-white/55 transition hover:text-white"
                >
                  Privātuma politika
                </Link>
                <Link
                  href="/privacy#terms"
                  className="w-fit text-white/55 transition hover:text-white"
                >
                  Lietošanas noteikumi
                </Link>
              </nav>
            </div>
          </div>

          <div className="mt-9 border-t border-white/[0.07] pt-4 text-[11px] text-white/30">
            © 2026 Shadowy. Visas tiesības aizsargātas
          </div>
        </div>
      </footer>
      </ScrollReveal>
    </>
  );
}
