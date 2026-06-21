import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  X,
  BarChart3,
  TrendingUp,
  LayoutDashboard,
  Users,
  Settings,
  Zap,
  ShieldCheck,
  Mail,
  Phone,
  MessageSquare,
  Building2,
  BookOpen,
  Headphones,
  FolderKanban,
  UserCheck,
} from "lucide-react";
import { PilotForm } from "./pilot-form";

import { MouseEffects } from "./mouse-effects";
import { HeroTilt } from "./hero-tilt";
import { TiltCard } from "./tilt-card";
import { ScrollRevealInit } from "./scroll-reveal";
import { FaqSection } from "@/components/landing/faq-section";
import { PrivacyCards } from "./privacy-cards";
import { ProblemCards } from "./problem-cards";

export default function HomePage() {
  return (
    <div className="dark relative min-h-screen bg-[#060d1c] text-foreground">
      {/* Fixed dot-grid - painted once, zero scroll cost */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 px-4 pt-3 pb-0 bg-transparent">
        <div
          className="relative mx-auto flex max-w-6xl items-center justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.015] px-4 py-2.5 backdrop-blur-2xl"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 1px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(120% 100% at 50% -40%, hsl(265 70% 55% / 0.18) 0%, transparent 60%)",
            }}
          />
          <a href="#" className="relative flex items-center gap-2.5">
            <img src="/shadowy.svg" alt="Shadowy" width={28} height={28} />
            <span className="text-base font-semibold tracking-tight text-white">Shadowy</span>
          </a>
          <nav className="hidden items-center gap-0.5 md:flex">
            <a href="#ka-tas-darbojas" className="rounded-lg px-3 py-1.5 text-[13px] text-white/80 transition-colors hover:text-white/95">Kā tas darbojas</a>
            <a href="#pilots" className="rounded-lg px-3 py-1.5 text-[13px] text-white/80 transition-colors hover:text-white/95">Pilots</a>
            <a href="#faq" className="rounded-lg px-3 py-1.5 text-[13px] text-white/80 transition-colors hover:text-white/95">FAQ</a>
            <a href="#privatums" className="rounded-lg px-3 py-1.5 text-[13px] text-white/80 transition-colors hover:text-white/95">Privātums</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-[13px] text-white/80 hover:text-white/95 hover:bg-white/[0.06]">
              <Link href="/login">Pieslēgties</Link>
            </Button>
            <Link
              href="#pilots"
              className="glass inline-flex items-center rounded-full border border-white/[0.14] bg-white/[0.06] px-4 py-1.5 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-white/[0.1] hover:border-white/[0.22] active:scale-[0.97]"
            >
              Pieteikt pilotu
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-[-10%] h-[500px] w-[600px] rounded-full bg-[hsl(160_60%_20%_/_0.10)] blur-[130px]" />
          <div className="absolute right-[0%] top-[0%] h-[350px] w-[450px] rounded-full bg-[hsl(220_80%_30%_/_0.07)] blur-[110px]" />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col px-6 py-12 lg:min-h-[calc(100vh-88px)] lg:justify-center lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="max-w-lg">
              <h1 data-reveal="left" data-delay="80" className="font-display font-black text-5xl leading-[1.08] tracking-tight text-white sm:text-6xl">
                Padariet{" "}
                <span className="text-gradient-emerald">neredzamo<br />darbu</span>
                {" "}redzamu.
              </h1>

              <p data-reveal="blur" data-delay="200" className="mt-5 text-[1.05rem] leading-relaxed text-white/85">
                Shadowy palīdz uzņēmumiem pamanīt slēpto darba slodzi, papildu
                pienākumus un darbu ārpus oficiālās lomas -{" "}
                <span className="text-white/95">bez darbinieku novērošanas.</span>
              </p>
              <p data-reveal="blur" data-delay="280" className="mt-3 text-sm leading-relaxed text-white/75">
                Sāciet ar vienu komandu un saņemiet praktisku pārskatu pēc 30 dienām.
              </p>

              <div data-reveal="up" data-delay="300" className="mt-8">
                <Link
                  href="/register"
                  className="glass inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-6 py-3 font-display font-black text-base tracking-tight text-white transition-all duration-150 hover:bg-emerald-400/[0.12] hover:border-emerald-400/35 hover:-translate-y-[1px] active:translate-y-[0.5px]"
                >
                  Izmēģināt bezmaksas
                </Link>
              </div>

              <p data-reveal="up" data-delay="400" className="mt-4 flex items-center gap-1.5 text-xs text-white/70">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                Bez kredītkartes. Bez saistībām. Iestatīšana līdz 10 minūtēm.
              </p>

            </div>

            <div className="relative lg:pl-4 lg:-mt-12">
              <div
                aria-hidden
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: "radial-gradient(ellipse at 50% 60%, hsl(160 84% 35% / 0.15) 0%, transparent 70%)",
                  transform: "scale(1.12)",
                  filter: "blur(28px)",
                }}
              />
              <HeroTilt>
                <DashboardMockup />
              </HeroTilt>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tag strip ────────────────────────────────────────────────── */}
      <div className="mt-6 border-y border-white/[0.1] overflow-hidden py-3">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...Array(2)].flatMap((_, pass) =>
            ["Employee-first", "Bez novērošanas", "30 dienu pilots", "GDPR-draudzīgs", "Darbinieku privātums"].map((t) => (
              <span key={`${pass}-${t}`} className="mx-10 text-[11px] font-semibold uppercase tracking-widest text-white/55">
                {t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── Problem section ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.07]">
        {/* Background */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Dot grid overlay */}
          <div className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Color orbs */}
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[hsl(160_60%_15%_/_0.12)] blur-[140px]" />
          <div className="absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-[hsl(270_60%_20%_/_0.1)] blur-[100px]" />
          <div className="absolute -left-20 bottom-0 h-[350px] w-[450px] rounded-full bg-[hsl(200_70%_20%_/_0.09)] blur-[100px]" />
          {/* Subtle top border glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-28">
          {/* Headline – centered, large */}
          <div className="mb-16 text-center">
            <div data-reveal="up" className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Problēma</span>
            </div>
            <h2 data-reveal="up" data-delay="80" className="font-display font-black text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Darbs, kas notiek,<br />
              <span className="text-gradient-emerald">bet netiek pamanīts.</span>
            </h2>
          </div>

          <ProblemCards />
        </div>
      </section>

      {/* ── Section 01: Employee creates entry ───────────────────────── */}
      <section id="darbiniekiem" className="relative overflow-hidden border-t border-white/[0.06] scroll-mt-24">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-[10%] top-[10%] h-[500px] w-[600px] rounded-full bg-[hsl(160_70%_20%_/_0.10)] blur-[130px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p id="ka-tas-darbojas" data-reveal="up" className="mb-4 scroll-mt-24 text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
                Kā tas darbojas?
              </p>
              <div
                data-reveal="left"
                className="mb-5 inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-4 py-2"
                style={{ boxShadow: "0 0 20px hsl(160 84% 35% / 0.12)" }}
              >
                <span className="font-mono text-sm font-bold text-emerald-400">01</span>
                <div className="h-3.5 w-px bg-emerald-500/30" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">Darbinieks</span>
              </div>
              <h2 data-reveal="up" data-delay="100" className="font-display font-black text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl">
                Darbs, kas parasti<br />
                <span className="text-gradient-emerald">netiek rēķināts.</span>
              </h2>
              <p data-reveal="blur" data-delay="200" className="mt-5 text-base leading-relaxed text-white/85">
                Katrs darbinieks var iesniegt papildu darbu tieši no savas ierīces.
                Ieraksts ir vienkāršs, ātrs un automātiski nonāk pie vadītāja
                apstiprināšanai.
              </p>
              <ul data-reveal="right" data-delay="300" className="mt-6 space-y-3">
                {[
                  "Palīdzība kolēģiem, koordinācija, darbs ārpus lomas",
                  "Brīvs apraksts, laiks un datums",
                  "Darbinieks redz savu ierakstu statusu reāllaikā",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/85">
                    <div className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 scale-110 rounded-3xl blur-3xl"
                style={{ background: "radial-gradient(ellipse at 50% 50%, hsl(160 80% 35% / 0.10) 0%, transparent 70%)" }}
              />
              <div className="animate-float-form">
                <EmployeeFormMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      {/* ── Section 02: Manager reviews ──────────────────────────────── */}
      <section id="vaditajam" className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-[10%] top-[10%] h-[500px] w-[600px] rounded-full bg-[hsl(220_80%_30%_/_0.09)] blur-[130px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="relative order-2 lg:order-1">
              <div
                aria-hidden
                className="absolute inset-0 scale-110 rounded-3xl blur-3xl"
                style={{ background: "radial-gradient(ellipse at 50% 50%, hsl(220 80% 40% / 0.09) 0%, transparent 70%)" }}
              />
              <HeroTilt baseX={3} baseY={9} rangeX={8} rangeY={12} perspective={1200}>
                <ManagerReviewMockup />
              </HeroTilt>
            </div>

            <div className="order-1 lg:order-2">
              <div
                data-reveal="right"
                className="mb-5 inline-flex items-center gap-3 rounded-full border border-blue-500/30 bg-blue-500/8 px-4 py-2"
                style={{ boxShadow: "0 0 20px hsl(220 84% 50% / 0.10)" }}
              >
                <span className="font-mono text-sm font-bold text-blue-400">02</span>
                <div className="h-3.5 w-px bg-blue-500/30" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">Vadītājs</span>
              </div>
              <h2 data-reveal="flip" data-delay="100" className="font-display font-black text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl">
                Skaidra redzamība.<br />
                <span className="text-gradient-emerald">Ātra lēmumu<br />pieņemšana.</span>
              </h2>
              <p data-reveal="blur" data-delay="200" className="mt-5 text-base leading-relaxed text-white/85">
                Vadītājs redz visus komandas ierakstus vienā skatā. Var apstiprināt,
                noraidīt vai atgriezt ar komentāru - viss bez e-pastiem un sanāksmēm.
              </p>
              <ul data-reveal="left" data-delay="300" className="mt-6 space-y-3">
                {[
                  "Visi gaidošie ieraksti vienā sarakstā",
                  "Apstiprināt, noraidīt vai atgriezt ar komentāru",
                  "Apstiprinātie ieraksti veido komandas slodzes profilu",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/85">
                    <div className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      {/* ── Section 03: Insights ─────────────────────────────────────── */}
      <section id="ieskati" className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-[5%] bottom-[10%] h-[400px] w-[500px] rounded-full bg-[hsl(260_60%_25%_/_0.07)] blur-[120px]" />
          <div className="absolute right-[-5%] top-[0%] h-[400px] w-[500px] rounded-full bg-[hsl(160_60%_18%_/_0.09)] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div
                data-reveal="left"
                className="mb-5 inline-flex items-center gap-3 rounded-full border border-purple-500/30 bg-purple-500/8 px-4 py-2"
                style={{ boxShadow: "0 0 20px hsl(270 80% 50% / 0.10)" }}
              >
                <span className="font-mono text-sm font-bold text-purple-400">03</span>
                <div className="h-3.5 w-px bg-purple-500/30" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/80">Ieskati</span>
              </div>
              <h2 data-reveal="scale" data-delay="100" className="font-display font-black text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl">
                Tendences, ko nevar<br />
                <span className="text-gradient-emerald">redzēt kalendārā.</span>
              </h2>
              <p data-reveal="blur" data-delay="200" className="mt-5 text-base leading-relaxed text-white/85">
                Shadowy apkopo apstiprinātos datus un parāda vadītājam, kur ir
                pārslodze, lomu neatbilstības un agrīnais izdegšanas risks -
                automātiski, bez papildu darba.
              </p>
              <ul data-reveal="right" data-delay="300" className="mt-6 space-y-3">
                {[
                  "Pārslodzes signāli par atsevišķiem darbiniekiem",
                  "Lomu neatbilstību atklāšana",
                  "Iknedēļas vadītāja pārskats e-pastā",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/85">
                    <div className="mt-2 h-1 w-1 shrink-0 rounded-full bg-purple-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 scale-110 rounded-3xl blur-3xl"
                style={{ background: "radial-gradient(ellipse at 50% 50%, hsl(260 60% 35% / 0.07) 0%, hsl(160 70% 30% / 0.09) 60%, transparent 80%)" }}
              />
              <HeroTilt baseX={3} baseY={-9} rangeX={8} rangeY={12} perspective={1200}>
                <InsightsMockup />
              </HeroTilt>
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy / trust ──────────────────────────────────────────── */}
      <section id="privatums" className="relative overflow-hidden border-t border-white/[0.1]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[hsl(160_60%_18%_/_0.07)] blur-[130px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <p data-reveal="left" className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Privātums un uzticēšanās</p>
              <h2 data-reveal="flip" data-delay="100" className="mt-2.5 font-display font-black text-3xl tracking-tight text-white sm:text-4xl">
                Kāpēc tas nav<br />novērošanas rīks?
              </h2>
              <p data-reveal="blur" data-delay="200" className="mt-4 text-sm leading-relaxed text-white/75">
                Shadowy neizseko privātas sarunas, ekrāna aktivitāti vai katru klikšķi. Platforma balstās uz darbinieku iesniegtiem un apstiprinātiem ierakstiem, lai palīdzētu saprast slodzi - nevis kontrolēt cilvēkus.
              </p>
              <div data-reveal="up" data-delay="280" className="mt-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-sm text-emerald-300/80">Darbinieks kontrolē savus ierakstus pirms tie nonāk pie vadītāja.</p>
              </div>
              <p data-reveal="up" data-delay="340" className="mt-4 text-[12px] text-white/35">
                GDPR atbilstīgs · Serveri ES robežās · Datus var dzēst jebkurā brīdī
              </p>
            </div>

            <div data-reveal="right" data-delay="100">
              <PrivacyCards />
            </div>
          </div>
        </div>
      </section>

      {/* ── Kam piemērots + Kam nav ───────────────────────────────────── */}
      <section className="relative border-t border-white/[0.1]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-6 lg:grid-cols-2">
            <div
              data-reveal="left"
              data-card-glow
              className="glass rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.02] p-8 sm:p-10"
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Mērķauditorija</p>
              <h2 className="mt-2 font-display font-black text-3xl tracking-tight text-white sm:text-4xl">
                Kam Shadowy ir piemērots?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Īpaši piemērots komandām, kur daudz darba notiek neformāli — palīdzība kolēģiem, koordinācija un papildu pienākumi.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Biroja un administratīvās komandas",
                  "Grāmatvedības komandas",
                  "HR un cilvēkresursu komandas",
                  "Projektu komandas",
                  "Customer support komandas",
                  "Mazas un vidējas komandas (5–50 cilvēki)",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              data-reveal="right"
              data-delay="100"
              className="rounded-2xl border border-white/[0.06] bg-white/[0.008] p-8 sm:p-10"
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Nav paredzēts</p>
              <h2 className="mt-2 font-display font-black text-3xl tracking-tight text-white sm:text-4xl">
                Kam Shadowy nav?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Shadowy ir paredzēts komandām, kuras vēlas labāk saprast reālo darba slodzi — nevis kontrolēt darbiniekus.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Darbinieku izsekošanai",
                  "Ekrāna aktivitātes kontrolei",
                  "Privāto sarunu analīzei",
                  "Mikromenedžmentam",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/55">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                      <X className="h-3 w-3 text-white/35" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Kas notiek pēc pieteikuma ─────────────────────────────────── */}
      <section className="relative border-t border-white/[0.1]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="mb-16 text-center">
            <p data-reveal="up" className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Process</p>
            <h2 data-reveal="scale" data-delay="100" className="mt-2 font-display font-black text-3xl tracking-tight text-white sm:text-4xl">Kas notiek pēc pieteikuma?</h2>
            <p data-reveal="blur" data-delay="200" className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/80">
              Mēs nevēlamies pārsteigt - šeit ir precīzi soļi no pieteikuma līdz pilota sākumam.
            </p>
          </div>

          {/* Circles + connector */}
          <div data-reveal="up" data-delay="150" className="relative mb-14">
            <div
              className="absolute z-0 h-px"
              style={{
                top: "36px",
                left: "calc(100% / 8)",
                right: "calc(100% / 8)",
                background: "linear-gradient(90deg, rgba(52,211,153,0.4), rgba(56,189,248,0.4), rgba(167,139,250,0.4), rgba(251,191,36,0.4))",
              }}
            />
            <div className="grid grid-cols-4">
              {([
                { icon: <Mail className="h-6 w-6" />, bg: "bg-emerald-950/60", border: "border-emerald-500/28", color: "text-emerald-400", ring: "rgba(52,211,153,0.55)", glow: "rgba(52,211,153,0.26)", outer: "rgba(52,211,153,0.10)", delay: "0ms" },
                { icon: <Phone className="h-6 w-6" />, bg: "bg-sky-950/60", border: "border-sky-500/28", color: "text-sky-400", ring: "rgba(56,189,248,0.55)", glow: "rgba(56,189,248,0.26)", outer: "rgba(56,189,248,0.10)", delay: "2250ms" },
                { icon: <MessageSquare className="h-6 w-6" />, bg: "bg-violet-950/60", border: "border-violet-500/28", color: "text-violet-400", ring: "rgba(167,139,250,0.55)", glow: "rgba(167,139,250,0.26)", outer: "rgba(167,139,250,0.10)", delay: "4500ms" },
                { icon: <Zap className="h-6 w-6" />, bg: "bg-amber-950/60", border: "border-amber-500/28", color: "text-amber-400", ring: "rgba(251,191,36,0.55)", glow: "rgba(251,191,36,0.26)", outer: "rgba(251,191,36,0.10)", delay: "6750ms" },
              ] as const).map(({ icon, bg, border, color, ring, glow, outer, delay }, i) => (
                <div key={i} className="flex justify-center">
                  <div
                    className={`step-circle relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full border ${border} ${bg} ${color}`}
                    style={{ '--circle-ring': ring, '--circle-glow': glow, '--circle-outer': outer, '--step-delay': delay } as React.CSSProperties}
                  >
                    {icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
            {([
              { num: "1", color: "text-emerald-400", title: "Saņemam pieteikumu", desc: "Apstiprinām saņemšanu 1–2 darba dienu laikā." },
              { num: "2", color: "text-sky-400", title: "Iepazīšanās zvans", desc: "20 minūšu zvans, lai saprastu jūsu komandas vajadzības." },
              { num: "3", color: "text-violet-400", title: "Saprotam piemērotību", desc: "Godīgi paskaidrojam, vai Shadowy der jūsu situācijai." },
              { num: "4", color: "text-amber-400", title: "Sākam 30 dienu pilotu", desc: "Iestatīšana līdz 10 minūtēm. Sāk darboties tajā pašā dienā." },
            ] as const).map(({ num, color, title, desc }, i) => (
              <div key={num} data-reveal="up" data-delay={`${250 + i * 80}`}>
                <p className={`mb-2 text-[11px] font-bold tracking-[0.18em] uppercase ${color}`}>SOLIS {num}</p>
                <h3 className="text-[15px] font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Early-stage honest block ──────────────────────────────────── */}
      <div className="border-t border-white/[0.1]">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="glass flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.015] p-4">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <span className="text-[9px] text-white/75">i</span>
            </div>
            <p className="text-xs leading-relaxed text-white/70">
              Shadowy ir Ventspils Augstskolas studentu veidots agrīnās stadijas projekts. Šobrīd meklējam pirmās komandas 30 dienu pilotam, lai pārbaudītu risinājumu reālā darba vidē. Jūsu atgriezeniskā saite palīdzēs veidot labāku produktu.
            </p>
          </div>
        </div>
      </div>

      {/* ── Pilot form ───────────────────────────────────────────────── */}
      <section id="pilots" className="relative overflow-hidden border-t border-white/[0.1] scroll-mt-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] h-[700px] w-[800px] rounded-full bg-[hsl(220_80%_30%_/_0.14)] blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-5%] h-[600px] w-[700px] rounded-full bg-[hsl(160_70%_20%_/_0.16)] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-start">

            {/* Left - pitch */}
            <div className="lg:pt-2">
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.13em] text-emerald-300">
                  Atvērts bezmaksas pilots
                </span>
              </div>

              <h2 className="font-display font-black text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl">
                Sāciet 30 dienu pilotu<br />
                <span className="text-gradient-emerald">bez riska.</span>
              </h2>

              <p className="mt-5 text-base leading-relaxed text-white/75">
                Aizpildiet formu - sazināsimies 1–2 darba dienu laikā un palīdzēsim
                uzsākt pilotu jūsu komandā.
              </p>

              <ul className="mt-8 space-y-3.5">
                {([
                  "Iestatīšana 10 minūtēs - sāc tajā pašā dienā",
                  "Bez kredītkartes un bez saistībām",
                  "Iepazīšanās zvans 20 min - bez spiediena",
                  "30 dienu pārskats par komandas slodzi",
                  "Pilns atbalsts latviski visā pilota laikā",
                ] as const).map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-10 border-t border-white/[0.07] pt-7">
                <p className="text-xs leading-relaxed text-white/45">
                  Datus var dzēst jebkurā brīdī. GDPR atbilstīgs.
                  Serveri ES robežās.
                </p>
              </div>
            </div>

            {/* Right - form card */}
            <div
              data-card-glow
              className="glass rounded-2xl border border-emerald-500/20 bg-white/[0.025] p-8 sm:p-10"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px hsl(160 84% 35% / 0.10), 0 0 80px hsl(160 84% 35% / 0.10), 0 32px 80px rgba(0,0,0,0.40)",
              }}
            >
              <h3 className="mb-1 text-lg font-semibold text-white">Pieteikt pilotu</h3>
              <p className="mb-6 text-sm text-white/55">Atbildēsim 1–2 darba dienu laikā.</p>
              <PilotForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section id="faq" className="relative border-t border-white/[0.1] scroll-mt-24">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div data-reveal="up" className="mb-14 text-center">
            <h2 className="font-display font-black text-4xl tracking-tight text-white sm:text-5xl">
              Biežāk uzdotie <span className="text-gradient-emerald">jautājumi</span>
            </h2>
            <p data-reveal="blur" data-delay="120" className="mx-auto mt-4 max-w-none whitespace-nowrap text-base text-white/55">
              Viss, kas jums jāzina par pilotu, datiem un Shadowy darbību.
            </p>
          </div>
          <FaqSection />
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.1]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-[-30%] left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[hsl(160_60%_20%_/_0.12)] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 py-24 text-center">
          <div className="relative mx-auto h-56 w-56 sm:h-72 sm:w-72">
            <div
              aria-hidden
              className="animate-cta-glow-1 absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-violet-500/30 blur-[60px]"
            />
            <div
              aria-hidden
              className="animate-cta-glow-2 absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-emerald-400/25 blur-[60px]"
            />
            <div
              aria-hidden
              className="animate-cta-logo-float absolute inset-0"
              style={{
                maskImage: "linear-gradient(to bottom, black 0%, black 35%, transparent 75%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 35%, transparent 75%)",
              }}
            >
              <div
                aria-hidden
                className="animate-cta-logo-spin absolute inset-0 opacity-90"
                style={{
                  maskImage: "url(/shadowy.svg)",
                  WebkitMaskImage: "url(/shadowy.svg)",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  backgroundSize: "220% 220%",
                  background:
                    "linear-gradient(135deg, hsl(265 75% 68% / 0.85) 0%, hsl(225 80% 60% / 0.55) 45%, hsl(170 80% 50% / 0.55) 75%, hsl(160 84% 45% / 0.65) 100%)",
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 opacity-60 mix-blend-overlay"
                style={{
                  maskImage: "url(/shadowy.svg)",
                  WebkitMaskImage: "url(/shadowy.svg)",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.9), transparent 55%)",
                }}
              />
            </div>
          </div>
          <h2 className="relative z-10 -mt-14 font-display font-black text-3xl tracking-wide text-white sm:text-4xl">
            Gatavi pārbaudīt Shadowy<br />savā komandā?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/85">
            Sāciet ar 30 dienu bezmaksas pilotu vienai komandai. Bez riska,
            bez kredītkartes un bez sarežģītas ieviešanas.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="glass inline-flex items-center gap-2.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-6 py-3 font-display font-black text-base tracking-tight text-white transition-all duration-150 hover:bg-emerald-400/[0.12] hover:border-emerald-400/35 hover:-translate-y-[1px] active:translate-y-[0.5px]"
            >
              Izmēģināt bezmaksas
            </Link>
            <Button asChild size="lg" variant="outline" className="border border-white/[0.11] bg-white/[0.04] text-white/80 hover:bg-white/[0.08] hover:border-white/[0.2] hover:text-white/90">
              <a href="#pilots">Sazināties</a>
            </Button>
          </div>
          <p className="mt-6 text-xs text-white/65">
            Jautājumi?{" "}
            <a href="https://mail.google.com/mail/?view=cm&to=contact@shadowy.lv" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-white/75">
              contact@shadowy.lv
            </a>
          </p>
          <p className="mt-2 text-xs text-white/65">
            <Link href="/privacy" className="underline underline-offset-2 transition-colors hover:text-white/75">
              Privātuma politika un noteikumi
            </Link>
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="relative border-t border-white/[0.06] bg-black/40">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
            <div className="max-w-sm">
              <a href="#" className="flex items-center gap-2.5">
                <img src="/shadowy.svg" alt="Shadowy" width={28} height={28} />
                <span className="text-base font-semibold tracking-tight text-white">Shadowy</span>
              </a>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Padariet neredzamo darbu redzamu - strukturēta darba iesniegšana, vadītāja
                izskatīšana un godīgāka slodzes pārvaldība.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="https://mail.google.com/mail/?view=cm&to=contact@shadowy.lv" target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/60 transition-colors hover:border-white/20 hover:text-white/90"
                >
                  <Mail className="h-4 w-4" />
                </a>
                <a
                  href="https://mail.google.com/mail/?view=cm&to=contact@shadowy.lv" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-white/60 transition-colors hover:text-white/90"
                >
                  contact@shadowy.lv
                </a>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/artemijs-lučins/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/60 transition-colors hover:border-white/20 hover:text-white/90"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/artemijs-lučins/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 transition-colors hover:text-white/90"
                >
                  Artemijs Lučins
                </a>
              </div>
            </div>
            <div className="flex gap-12 sm:gap-16">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
                  Produkts
                </p>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  <li>
                    <a href="#ka-tas-darbojas" className="transition-colors hover:text-white/95">
                      Kā tas darbojas
                    </a>
                  </li>
                  <li>
                    <a href="#pilots" className="transition-colors hover:text-white/95">
                      Pilots
                    </a>
                  </li>
                  <li>
                    <Link href="/login" className="transition-colors hover:text-white/95">
                      Pieslēgties
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
                  Juridiskā informācija
                </p>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  <li>
                    <Link href="/privacy" className="transition-colors hover:text-white/95">
                      Privātuma politika
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy#lietosanas-noteikumi" className="transition-colors hover:text-white/95">
                      Lietošanas noteikumi
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-14 border-t border-white/[0.06] pt-6 text-xs text-white/50">
            © 2026 Shadowy. Visas tiesības aizsargātas.
          </div>
        </div>
      </footer>

      <MouseEffects />
      <ScrollRevealInit />
    </div>
  );
}

/* ── Hero dashboard mockup ───────────────────────────────────────────── */

function DashboardMockup() {
  const entries = [
    { initials: "AK", name: "Anna K.", type: "Palīdzība kolēģim", time: "2h", pending: true },
    { initials: "ID", name: "Ilze D.", type: "Koordinācija", time: "1.5h", pending: true },
    { initials: "RP", name: "Ronalds P.", type: "Darbs ārpus lomas", time: "3h", pending: true },
    { initials: "MB", name: "Mārtiņš B.", type: "Jauno ievadīšana", time: "4h", pending: false },
  ];

  return (
    <div className="relative" data-card-glow>
      <div
        className="rounded-2xl p-px"
        style={{
          background: "linear-gradient(135deg, hsl(160 60% 22% / 0.7), hsl(220 50% 18% / 0.3) 50%, hsl(160 60% 16% / 0.2))",
        }}
      >
        <div className="overflow-hidden rounded-[15px] bg-[#0b1526]">
          <div className="flex items-center gap-3 border-b border-white/[0.1] bg-[#0d1830] px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => <div key={i} className="h-2.5 w-2.5 rounded-full bg-white/8" />)}
            </div>
            <span className="flex-1 text-center font-mono text-[10px] text-white/60">shadowy · vadītāja pārskats</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[8px] font-bold text-emerald-400">MB</div>
          </div>

          <div className="flex">
            <div className="flex flex-col items-center gap-1.5 border-r border-white/5 bg-[#0a1220] px-2.5 py-3">
              {[LayoutDashboard, Users, BarChart3, Settings].map((Icon, i) => (
                <div key={i} className={`flex h-7 w-7 items-center justify-center rounded-md ${i === 0 ? "bg-emerald-500/15 text-emerald-400" : "text-white/55"}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              ))}
            </div>

            <div className="min-w-0 flex-1 space-y-2.5 p-3">
              <div className="flex items-center gap-1.5">
                {["Šī nedēļa", "Visi"].map((f) => (
                  <div key={f} className="flex items-center gap-1 rounded border border-white/8 bg-white/4 px-2 py-1 text-[10px] text-white/70">
                    {f} <span className="opacity-40">▾</span>
                  </div>
                ))}
                <span className="ml-auto text-[10px] text-white/55">4 ieraksti</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/6 px-2.5 py-1.5">
                  <Zap className="h-3 w-3 shrink-0 text-amber-400" />
                  <span className="flex-1 text-[10px] text-amber-300/80">Pārslodzes risks · Ilze D.</span>
                  <span className="rounded border border-amber-500/25 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">Vidējs</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-white/[0.1] bg-white/3 px-2.5 py-1.5">
                  <TrendingUp className="h-3 w-3 shrink-0 text-white/60" />
                  <span className="flex-1 text-[10px] text-white/70">Lomas neatbilstība · Mārtiņš B.</span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-white/60">Pārskatīt</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-white/6" />
                <span className="text-[9px] font-medium uppercase tracking-wider text-white/55">Gaida · 3</span>
                <div className="h-px flex-1 bg-white/6" />
              </div>

              <div className="space-y-px">
                {entries.map((e) => (
                  <div key={e.name} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${e.pending ? "hover:bg-white/4" : "opacity-30"}`}>
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-[8px] font-semibold text-white/85">{e.initials}</div>
                    <span className="w-[64px] shrink-0 truncate text-[10px] font-medium text-white/85">{e.name}</span>
                    <span className="flex-1 truncate text-[10px] text-white/70">{e.type}</span>
                    <span className="shrink-0 text-[10px] text-white/60">{e.time}</span>
                    {e.pending ? (
                      <span className="shrink-0 rounded border border-amber-500/25 bg-amber-500/8 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">Gaida</span>
                    ) : (
                      <span className="shrink-0 rounded border border-emerald-500/25 bg-emerald-500/8 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">Apst.</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Employee entry form mockup ──────────────────────────────────────── */

function EmployeeFormMockup() {
  return (
    <div className="relative" data-card-glow>
      <div
        className="rounded-2xl p-px"
        style={{
          background: "linear-gradient(135deg, hsl(160 70% 22% / 0.7) 0%, hsl(160 50% 12% / 0.15) 100%)",
        }}
      >
        <div className="overflow-hidden rounded-[15px] bg-[#0b1526]">
          <div className="flex items-center gap-3 border-b border-white/[0.1] bg-[#0d1830] px-4 py-2.5">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => <div key={i} className="h-2.5 w-2.5 rounded-full bg-white/8" />)}
            </div>
            <span className="flex-1 text-center font-mono text-[10px] text-white/60">shadowy · jauns ieraksts</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-[8px] font-semibold text-white/75">IK</div>
          </div>

          <div className="space-y-4 p-5">
            <div className="text-sm font-semibold text-white/95">Jauns ieraksts</div>

            <div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/65">Ieraksta veids</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Palīdzība kolēģim", active: true },
                  { label: "Koordinācija", active: false },
                  { label: "Darbs ārpus lomas", active: false },
                  { label: "Jauno ievadīšana", active: false },
                ].map(({ label, active }) => (
                  <div
                    key={label}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                      active
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                        : "border-white/8 bg-white/4 text-white/65"
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-white/65">Apraksts</p>
              <div className="min-h-[68px] rounded-lg border border-white/8 bg-white/4 p-3">
                <p className="text-[11px] leading-relaxed text-white/85">
                  Palīdzēju jaunajam darbiniekam saprast CRM sistēmu un onboardinga
                  procesu. Atbildēju uz jautājumiem par klienta komunikāciju
                  <span className="animate-pulse text-white/65">|</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-white/65">Laiks</p>
                <div className="rounded-lg border border-white/8 bg-white/4 px-3 py-2">
                  <span className="text-[11px] font-medium text-white/80">2 h 30 min</span>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-white/65">Datums</p>
                <div className="rounded-lg border border-white/8 bg-white/4 px-3 py-2">
                  <span className="text-[11px] text-white/80">08.06.2025</span>
                </div>
              </div>
            </div>

            <div
              className="rounded-lg py-2.5 text-center text-[11px] font-semibold text-white"
              style={{
                background: "hsl(160 84% 36%)",
                boxShadow: "0 0 20px hsl(160 84% 36% / 0.28)",
              }}
            >
              Iesniegt ierakstu
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Manager review mockup ───────────────────────────────────────────── */

function ManagerReviewMockup() {
  const entries = [
    { initials: "AK", name: "Anna K.", type: "Palīdzība kolēģim", time: "2h 30min", approved: false, selected: true },
    { initials: "ID", name: "Ilze D.", type: "Koordinācija", time: "1h", approved: false, selected: false },
    { initials: "RP", name: "Ronalds P.", type: "Darbs ārpus lomas", time: "3h", approved: false, selected: false },
    { initials: "MB", name: "Mārtiņš B.", type: "Jauno ievadīšana", time: "4h", approved: true, selected: false },
  ];

  return (
    <div className="relative" data-card-glow>
      <div
        className="rounded-2xl p-px"
        style={{
          background: "linear-gradient(135deg, hsl(220 80% 40% / 0.5) 0%, hsl(160 60% 20% / 0.2) 100%)",
        }}
      >
        <div className="overflow-hidden rounded-[15px] bg-[#0b1526]">
          <div className="flex items-center gap-3 border-b border-white/[0.1] bg-[#0d1830] px-4 py-2.5">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => <div key={i} className="h-2.5 w-2.5 rounded-full bg-white/8" />)}
            </div>
            <span className="flex-1 text-center font-mono text-[10px] text-white/60">shadowy · ierakstu pārskatīšana</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[8px] font-bold text-blue-300">MB</div>
          </div>

          <div className="flex" style={{ minHeight: "272px" }}>
            <div className="w-[42%] flex-shrink-0 border-r border-white/[0.1]">
              <div className="border-b border-white/[0.1] px-3 py-2">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-white/60">Gaidāmie · 3</span>
              </div>
              {entries.map((e) => (
                <div
                  key={e.name}
                  className={`relative flex items-start gap-2 border-b border-white/4 px-3 py-2.5 ${e.selected ? "bg-white/5" : ""} ${e.approved ? "opacity-35" : ""}`}
                >
                  {e.selected && <div className="absolute inset-y-0 left-0 w-0.5 bg-emerald-500" />}
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[8px] font-semibold text-white/85">{e.initials}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium text-white/90">{e.name}</p>
                    <p className="truncate text-[9px] text-white/70">{e.type}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] text-white/60">{e.time}</span>
                      {e.approved ? (
                        <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-1 py-px text-[8px] font-medium text-emerald-400">Apst.</span>
                      ) : (
                        <span className="rounded border border-amber-500/25 bg-amber-500/10 px-1 py-px text-[8px] font-medium text-amber-400">Gaida</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white/75">AK</div>
                  <div>
                    <p className="text-xs font-semibold text-white/95">Anna K.</p>
                    <p className="text-[9px] text-white/70">08.06.2025</p>
                  </div>
                </div>
                <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-400">Gaida</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[9px] font-medium text-emerald-400">Palīdzība kolēģim</span>
                <span className="text-[10px] text-white/65">· 2h 30min</span>
              </div>

              <div className="rounded-lg border border-white/[0.1] bg-white/[0.025] p-3 text-[10px] italic leading-relaxed text-white/80">
                &ldquo;Palīdzēju jaunajam darbiniekam saprast CRM sistēmu un onboardinga procesu...&rdquo;
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <div className="cursor-pointer rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-center text-[10px] font-semibold text-emerald-400">
                  ✓ Apstiprināt
                </div>
                <div className="cursor-pointer rounded-lg border border-red-500/25 bg-red-500/8 py-2 text-center text-[10px] font-semibold text-red-400">
                  ✗ Noraidīt
                </div>
                <div className="cursor-pointer rounded-lg border border-amber-500/20 bg-amber-500/6 py-2 text-center text-[10px] font-semibold text-amber-400">
                  ↩ Atgriezt
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Insights / analytics mockup ─────────────────────────────────────── */

function InsightsMockup() {
  return (
    <div className="relative" data-card-glow>
      <div
        className="rounded-2xl p-px"
        style={{
          background: "linear-gradient(135deg, hsl(260 60% 35% / 0.4) 0%, hsl(160 60% 20% / 0.2) 60%, hsl(220 60% 25% / 0.1) 100%)",
        }}
      >
        <div className="overflow-hidden rounded-[15px] bg-[#0b1526]">
          <div className="flex items-center gap-3 border-b border-white/[0.1] bg-[#0d1830] px-4 py-2.5">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => <div key={i} className="h-2.5 w-2.5 rounded-full bg-white/8" />)}
            </div>
            <span className="flex-1 text-center font-mono text-[10px] text-white/60">shadowy · pārskats</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[8px] font-bold text-purple-300">MB</div>
          </div>

          <div className="flex">
            <div className="flex flex-col items-center gap-1.5 border-r border-white/5 bg-[#0a1220] px-2.5 py-3">
              {[LayoutDashboard, Users, BarChart3, Settings].map((Icon, i) => (
                <div key={i} className={`flex h-7 w-7 items-center justify-center rounded-md ${i === 2 ? "bg-purple-500/15 text-purple-400" : "text-white/55"}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              ))}
            </div>

            <div className="flex-1 space-y-2.5 p-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Gaidāmie", value: "7", cls: "border-amber-500/15 text-amber-400" },
                  { label: "Šī nedēļa", value: "23", cls: "border-emerald-500/15 text-emerald-400" },
                  { label: "Komanda", value: "8", cls: "border-blue-500/15 text-blue-400" },
                ].map(({ label, value, cls }) => (
                  <div key={label} className={`rounded-lg border bg-white/3 p-2 text-center ${cls}`}>
                    <p className="text-base font-bold">{value}</p>
                    <p className="text-[9px] text-white/65">{label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/6 px-2.5 py-1.5">
                  <Zap className="h-3 w-3 shrink-0 text-amber-400" />
                  <span className="flex-1 text-[10px] text-amber-300/80">Pārslodzes risks · Ilze D.</span>
                  <span className="rounded border border-amber-500/25 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">Vidējs</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-white/[0.1] bg-white/3 px-2.5 py-1.5">
                  <TrendingUp className="h-3 w-3 shrink-0 text-white/60" />
                  <span className="flex-1 text-[10px] text-white/70">Lomas neatbilstība · Mārtiņš B.</span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-white/60">Pārskatīt</span>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[9px] font-medium uppercase tracking-wider text-white/55">Nedēļas slodze</p>
                <div className="flex items-end gap-1" style={{ height: "40px" }}>
                  {[
                    { day: "P", pct: 55, hi: false },
                    { day: "O", pct: 30, hi: false },
                    { day: "T", pct: 72, hi: true },
                    { day: "C", pct: 88, hi: true },
                    { day: "Pk", pct: 45, hi: false },
                  ].map(({ day, pct, hi }) => (
                    <div key={day} className="flex flex-1 flex-col items-center gap-0.5">
                      <div
                        className={`w-full rounded-sm ${hi ? "bg-amber-500/35" : "bg-emerald-500/25"}`}
                        style={{ height: `${pct}%` }}
                      />
                      <span className="text-[8px] text-white/55">{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-white/6" />
                <span className="text-[9px] font-medium uppercase tracking-wider text-white/55">Gaida · 3</span>
                <div className="h-px flex-1 bg-white/6" />
              </div>

              <div className="space-y-px">
                {[
                  { initials: "AK", name: "Anna K.", type: "Palīdzība kolēģim", time: "2h", pending: true },
                  { initials: "ID", name: "Ilze D.", type: "Koordinācija", time: "1.5h", pending: true },
                  { initials: "MB", name: "Mārtiņš B.", type: "Jauno ievadīšana", time: "4h", pending: false },
                ].map((e) => (
                  <div key={e.name} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${!e.pending ? "opacity-30" : ""}`}>
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-[8px] font-semibold text-white/85">{e.initials}</div>
                    <span className="w-[60px] shrink-0 truncate text-[10px] font-medium text-white/85">{e.name}</span>
                    <span className="flex-1 truncate text-[10px] text-white/70">{e.type}</span>
                    <span className="shrink-0 text-[10px] text-white/60">{e.time}</span>
                    {e.pending ? (
                      <span className="shrink-0 rounded border border-amber-500/25 bg-amber-500/8 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">Gaida</span>
                    ) : (
                      <span className="shrink-0 rounded border border-emerald-500/25 bg-emerald-500/8 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">Apst.</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

