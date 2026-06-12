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
} from "lucide-react";
import { PilotForm } from "./pilot-form";

import { MouseEffects } from "./mouse-effects";
import { HeroTilt } from "./hero-tilt";
import { TiltCard } from "./tilt-card";
import { ScrollRevealInit } from "./scroll-reveal";

export default function HomePage() {
  return (
    <div className="dark relative min-h-screen bg-[#060d1c] text-foreground">
      {/* Fixed dot-grid — painted once, zero scroll cost */}
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
            <a href="#ka-tas-darbojas" className="rounded-lg px-3 py-1.5 text-[13px] text-white/45 transition-colors hover:text-white/80">Kā tas darbojas</a>
            <a href="#pilots" className="rounded-lg px-3 py-1.5 text-[13px] text-white/45 transition-colors hover:text-white/80">Pilots</a>
            <a href="#privatums" className="rounded-lg px-3 py-1.5 text-[13px] text-white/45 transition-colors hover:text-white/80">Privātums</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-[13px] text-white/45 hover:text-white/80 hover:bg-white/[0.06]">
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

              <p data-reveal="blur" data-delay="200" className="mt-5 text-[1.05rem] leading-relaxed text-white/55">
                Shadowy palīdz uzņēmumiem pamanīt slēpto darba slodzi, papildu
                pienākumus un darbu ārpus oficiālās lomas -{" "}
                <span className="text-white/80">bez darbinieku novērošanas.</span>
              </p>
              <p data-reveal="blur" data-delay="280" className="mt-3 text-sm leading-relaxed text-white/40">
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

              <p data-reveal="up" data-delay="400" className="mt-4 flex items-center gap-1.5 text-xs text-white/35">
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
              <span key={`${pass}-${t}`} className="mx-10 text-[11px] font-semibold uppercase tracking-widest text-white/20">
                {t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── Problem section ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.1]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-5%] top-[-10%] h-[500px] w-[600px] rounded-full bg-[hsl(160_45%_15%_/_0.08)] blur-[120px]" />
          <div className="absolute left-[-5%] bottom-0 h-[350px] w-[500px] rounded-full bg-[hsl(220_60%_20%_/_0.06)] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="mb-10">
            <p data-reveal="up" className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Problēma</p>
            <h2 data-reveal="left" data-delay="80" className="mt-3 font-display font-black text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl">
              Darbs, kas notiek,<br />
              <span className="text-gradient-emerald">bet netiek pamanīts.</span>
            </h2>
          </div>

          <div className="grid gap-3 lg:grid-cols-[3fr_2fr]">
            {/* Large featured card */}
            <div
              data-reveal="up"
              data-delay="100"
              className="glass relative flex min-h-[340px] flex-col overflow-hidden rounded-2xl border border-emerald-500/[0.14] bg-gradient-to-br from-emerald-950/30 via-transparent to-transparent p-8"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(circle, hsl(160 70% 45% / 0.10) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                  maskImage: "radial-gradient(ellipse 80% 80% at 60% 40%, black 30%, transparent 100%)",
                }}
              />
              <span aria-hidden className="pointer-events-none absolute -right-3 -top-8 select-none font-serif text-[200px] leading-none text-emerald-400/[0.055]">
                &ldquo;
              </span>
              <div className="relative flex flex-1 flex-col">
                <p className="text-2xl font-medium leading-snug text-white/70 sm:text-[1.65rem]">
                  Kolēģi regulāri palīdz viens otram, bet tas nekur netiek fiksēts.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/35">
                  Katras nedēļas slēptais darbs, kas nekad neparādās nekādos datos.
                </p>
                <div className="mt-auto pt-8 flex items-center gap-3">
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-400/80">
                    Koordinācija
                  </span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-[11px] text-white/20">No. 01</span>
                </div>
              </div>
            </div>

            {/* Three compact cards */}
            <div className="grid gap-3">
              {([
                { text: "Jaunie darbinieki tiek ievadīti neformāli, bez redzamas slodzes.", tag: "Onboarding", cls: "border-sky-500/[0.14] bg-sky-500/[0.03]", tagCls: "border-sky-500/25 bg-sky-500/10 text-sky-400/70" },
                { text: "Daļa cilvēku uzņemas vairāk, nekā paredz viņu loma.", tag: "Pārslodze", cls: "border-amber-500/[0.14] bg-amber-500/[0.03]", tagCls: "border-amber-500/25 bg-amber-500/10 text-amber-400/70" },
                { text: "Vadītājs redz rezultātu, bet neredz slēpto darbu aiz tā.", tag: "Redzamība", cls: "border-violet-500/[0.14] bg-violet-500/[0.03]", tagCls: "border-violet-500/25 bg-violet-500/10 text-violet-400/70" },
              ] as const).map(({ text, tag, cls, tagCls }, i) => (
                <div
                  key={tag}
                  data-reveal="right"
                  data-delay={`${120 + i * 70}`}
                  className={`glass flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 hover:brightness-[1.15] ${cls}`}
                >
                  <p className="text-[14px] font-medium leading-relaxed text-white/55">{text}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${tagCls}`}>{tag}</span>
                    <span className="font-mono text-[10px] text-white/15">0{i + 2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-reveal="up" data-delay="400" className="mt-8">
            <Button asChild size="lg" variant="outline" className="border border-white/[0.11] bg-white/[0.04] text-white/65 hover:bg-white/[0.08] hover:border-white/[0.2] hover:text-white/90">
              <a href="#pilots">Pārbaudīt komandā <ArrowRight className="ml-1.5 h-4 w-4" /></a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Signs you need Shadowy ───────────────────────────────────── */}
      <section className="relative border-t border-white/[0.1]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <p data-reveal="up" className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Atpazīstiet sevi?</p>
            <h2 data-reveal="scale" data-delay="100" className="mt-2 font-display font-black text-3xl tracking-tight text-white sm:text-4xl">
              Shadowy var būt noderīgs, ja...
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {([
              { text: "Komandā bieži saka \"es ātri palīdzēšu\"", sub: "bet neviens nezina, cik tas maksā laika" },
              { text: "Papildu darbs netiek iekļauts KPI vai atzinībā", sub: "neformālais ieguldījums paliek neredzams" },
              { text: "Grūti saprast, kurš ir pārslogots", sub: "pirms tas kļūst par problēmu" },
              { text: "Darbinieki dara darbu ārpus amata apraksta", sub: "bet tas nekur nav fiksēts" },
              { text: "Bonusus un atzinību grūti pamatot ar datiem", sub: "lēmumi balstās uz sajūtu, ne faktiem" },
              { text: "Onboarding process nav redzams kā slodze", sub: "bet kāds to dara katru reizi no jauna" },
            ] as const).map(({ text, sub }, i) => (
              <div
                key={text}
                data-reveal="up"
                data-delay={`${(i % 3) * 80}`}
                data-card-glow
                className="card-wave glass rounded-xl border border-white/[0.07] bg-white/[0.015] p-5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.03]"
                style={{ '--card-delay': `${i * 2000}ms`, animationDelay: `${i * 2000}ms` } as React.CSSProperties}
              >
                <p className="text-sm font-medium leading-snug text-white/70">{text}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/30">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kā tas darbojas ──────────────────────────────────────────── */}
      <section id="ka-tas-darbojas" className="relative border-t border-white/[0.1]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="mb-16 text-center">
            <p data-reveal="up" className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Vienkārši. Pārredzami.</p>
            <h2 data-reveal="scale" data-delay="100" className="mt-2 font-display font-black text-3xl tracking-tight text-white sm:text-4xl">Kā tas darbojas?</h2>
          </div>

          {/* Circles + connector line */}
          <div data-reveal="up" data-delay="150" className="relative mb-14">
            <div
              className="absolute z-0 h-px"
              style={{
                top: "36px",
                left: "calc(100% / 6)",
                right: "calc(100% / 6)",
                background: "linear-gradient(90deg, rgba(52,211,153,0.45) 0%, rgba(56,189,248,0.45) 50%, rgba(167,139,250,0.45) 100%)",
              }}
            />
            <div className="grid grid-cols-3">
              {([
                { icon: <Zap className="h-7 w-7" />, bg: "bg-emerald-950/60", border: "border-emerald-500/30", color: "text-emerald-400", ring: "rgba(52,211,153,0.55)", glow: "rgba(52,211,153,0.28)", outer: "rgba(52,211,153,0.10)", delay: "0ms" },
                { icon: <CheckCircle2 className="h-7 w-7" />, bg: "bg-sky-950/60", border: "border-sky-500/30", color: "text-sky-400", ring: "rgba(56,189,248,0.55)", glow: "rgba(56,189,248,0.28)", outer: "rgba(56,189,248,0.10)", delay: "3000ms" },
                { icon: <BarChart3 className="h-7 w-7" />, bg: "bg-violet-950/60", border: "border-violet-500/30", color: "text-violet-400", ring: "rgba(167,139,250,0.55)", glow: "rgba(167,139,250,0.28)", outer: "rgba(167,139,250,0.10)", delay: "6000ms" },
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
          <div className="grid gap-10 text-center sm:grid-cols-3">
            {([
              { num: "1", color: "text-emerald-400", title: "Darbinieks pieraksta papildu darbu", desc: "Darbinieks īsi atzīmē palīdzību kolēģiem, koordināciju, onboarding vai darbu ārpus oficiālās lomas." },
              { num: "2", color: "text-sky-400", title: "Vadītājs apstiprina ierakstus", desc: "Vadītājs redz iesniegtos ierakstus, var tos apstiprināt, noraidīt vai atgriezt ar komentāru." },
              { num: "3", color: "text-violet-400", title: "Shadowy sagatavo pārskatu", desc: "Platforma apkopo tendences, role gaps, pārslodzes signālus un praktiskus ieteikumus vadītājam." },
            ] as const).map(({ num, color, title, desc }, i) => (
              <div key={num} data-reveal="up" data-delay={`${250 + i * 100}`}>
                <p className={`mb-3 text-[11px] font-bold tracking-[0.18em] uppercase ${color}`}>SOLIS {num}</p>
                <h3 className="text-[17px] font-semibold leading-snug text-white">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/40">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 01: Employee creates entry ───────────────────────── */}
      <section id="darbiniekiem" className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-[10%] top-[10%] h-[500px] w-[600px] rounded-full bg-[hsl(160_70%_20%_/_0.10)] blur-[130px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div
                data-reveal="left"
                className="mb-5 inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-4 py-2"
                style={{ boxShadow: "0 0 20px hsl(160 84% 35% / 0.12)" }}
              >
                <span className="font-mono text-sm font-bold text-emerald-400">01</span>
                <div className="h-3.5 w-px bg-emerald-500/30" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Darbinieks</span>
              </div>
              <h2 data-reveal="up" data-delay="100" className="font-display font-black text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl">
                Darbs, kas parasti<br />
                <span className="text-gradient-emerald">netiek rēķināts.</span>
              </h2>
              <p data-reveal="blur" data-delay="200" className="mt-5 text-base leading-relaxed text-white/50">
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
                  <li key={item} className="flex items-start gap-3 text-sm text-white/55">
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
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Vadītājs</span>
              </div>
              <h2 data-reveal="flip" data-delay="100" className="font-display font-black text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl">
                Skaidra redzamība.<br />
                <span className="text-gradient-emerald">Ātra lēmumu<br />pieņemšana.</span>
              </h2>
              <p data-reveal="blur" data-delay="200" className="mt-5 text-base leading-relaxed text-white/50">
                Vadītājs redz visus komandas ierakstus vienā skatā. Var apstiprināt,
                noraidīt vai atgriezt ar komentāru - viss bez e-pastiem un sanāksmēm.
              </p>
              <ul data-reveal="left" data-delay="300" className="mt-6 space-y-3">
                {[
                  "Visi gaidošie ieraksti vienā sarakstā",
                  "Apstiprināt, noraidīt vai atgriezt ar komentāru",
                  "Apstiprinātie ieraksti veido komandas slodzes profilu",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/55">
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
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Ieskati</span>
              </div>
              <h2 data-reveal="scale" data-delay="100" className="font-display font-black text-4xl leading-[1.1] tracking-tight text-white sm:text-5xl">
                Tendences, ko nevar<br />
                <span className="text-gradient-emerald">redzēt kalendārā.</span>
              </h2>
              <p data-reveal="blur" data-delay="200" className="mt-5 text-base leading-relaxed text-white/50">
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
                  <li key={item} className="flex items-start gap-3 text-sm text-white/55">
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

      {/* ── Pilot report preview ─────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.1]">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-[-10%] h-[400px] w-[600px] rounded-full bg-[hsl(160_70%_20%_/_0.09)] blur-[120px]" />
          <div className="absolute right-[5%] bottom-[-10%] h-[300px] w-[400px] rounded-full bg-[hsl(220_80%_30%_/_0.07)] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
            <div>
              <p data-reveal="up" className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">30 dienu pilots</p>
              <h2 data-reveal="scale" data-delay="100" className="mt-2 font-display font-black text-3xl tracking-tight text-white sm:text-4xl">
                Ko uzņēmums saņem<br />pēc 30 dienām?
              </h2>
              <p data-reveal="blur" data-delay="200" className="mt-4 text-sm leading-relaxed text-white/45">
                Pilota beigās uzņēmums saņem praktisku pārskatu, kas palīdz saprast, kur komandā rodas slēptā slodze un kā darba sadali var padarīt taisnīgāku.
              </p>
              <ul data-reveal="right" data-delay="300" className="mt-6 space-y-2.5">
                {[
                  "Komandas slodzes pārskats",
                  "Biežākie papildu darba veidi",
                  "Darbs ārpus oficiālās lomas",
                  "Role gaps",
                  "Pārslodzes signāli",
                  "Ieteikumi vadītājam",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-white/55">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <div data-reveal="up" data-delay="400" className="mt-8">
                <a
                  href="#pilots"
                  className="glass inline-flex items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.06] px-8 py-[17px] font-display font-black text-[15px] tracking-tight text-white transition-all duration-150 hover:bg-white/[0.1] hover:border-white/[0.22] hover:-translate-y-[1px] active:translate-y-[0.5px]"
                >
                  Pieteikt pilotu
                </a>
              </div>
            </div>
            <div data-reveal="right" data-delay="150">
              <PilotReportMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Bez Shadowy / Ar Shadowy ─────────────────────────────────── */}
      <section className="relative border-t border-white/[0.1]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-12 text-center">
            <p data-reveal="up" className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Salīdzinājums</p>
            <h2 data-reveal="scale" data-delay="100" className="mt-2 font-display font-black text-3xl tracking-tight text-white sm:text-4xl">
              Bez Shadowy un ar Shadowy
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div data-reveal="left" data-delay="100" className="glass rounded-2xl border border-white/[0.07] bg-white/[0.015] p-7">
              <p className="mb-5 text-xs font-bold uppercase tracking-wider text-white/20">Bez Shadowy</p>
              <ul className="space-y-3.5">
                {[
                  "Papildu darbs paliek tikai sarunās",
                  "Vadītājs redz tikai gala rezultātu",
                  "Pārslodze kļūst redzama pārāk vēlu",
                  "Atzinība balstās uz sajūtu",
                  "Role gaps netiek pamanīti",
                  "Onboarding slodze ir neredzama",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/30">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/15" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal="right" data-delay="100" className="glass rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-7">
              <p className="mb-5 text-xs font-bold uppercase tracking-wider text-emerald-400/60">Ar Shadowy</p>
              <ul className="space-y-3.5">
                {[
                  "Papildu darbs tiek fiksēts un apstiprināts",
                  "Vadītājs redz reālo slodzi katram darbiniekam",
                  "Pārslodzes signāli parādās agrīni",
                  "Lēmumi par atzinību balstās uz datiem",
                  "Role gaps kļūst redzami un adresējami",
                  "Onboarding ieguldījums ir izmērāms",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy / trust ──────────────────────────────────────────── */}
      <section id="privatums" className="relative overflow-hidden border-t border-white/[0.1]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(160_60%_18%_/_0.07)] blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
            <div>
              <p data-reveal="left" className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
                Privātums un uzticēšanās
              </p>
              <h2 data-reveal="flip" data-delay="100" className="mt-2.5 font-display font-black text-3xl tracking-tight text-white sm:text-4xl">
                Kāpēc tas nav<br />novērošanas rīks?
              </h2>
              <p data-reveal="blur" data-delay="200" className="mt-4 text-sm leading-relaxed text-white/45">
                Shadowy neizseko privātas sarunas, ekrāna aktivitāti vai katru
                klikšķi. Platforma balstās uz darbinieku iesniegtiem un apstiprinātiem
                ierakstiem, lai palīdzētu saprast slodzi - nevis kontrolēt cilvēkus.
              </p>
              <div data-card-glow className="mt-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-sm text-emerald-300/80">
                  Darbinieks kontrolē savus ierakstus pirms tie nonāk pie vadītāja.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TiltCard className="glass rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400/70">
                  Ko vadītājs redz
                </p>
                <ul className="space-y-3">
                  {PRIVACY_SEES.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span className="leading-snug text-white/55">{item}</span>
                    </li>
                  ))}
                </ul>
              </TiltCard>
              <TiltCard className="glass rounded-xl border border-white/[0.07] bg-white/[0.015] p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-white/20">
                  Ko vadītājs neredz
                </p>
                <ul className="space-y-3">
                  {PRIVACY_NOT_SEES.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/20" />
                      <span className="leading-snug text-white/30">{item}</span>
                    </li>
                  ))}
                </ul>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* ── Kāpēc uzņēmumam vērtīgi ─────────────────────────────────── */}
      <section className="relative border-t border-white/[0.1]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12">
            <p data-reveal="up" className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Biznesa vērtība</p>
            <h2 data-reveal="flip" data-delay="100" className="mt-2 font-display font-black text-3xl tracking-tight text-white sm:text-4xl">Kāpēc uzņēmumam tas ir vērtīgi?</h2>
            <p data-reveal="blur" data-delay="200" className="mt-3 max-w-2xl text-sm leading-relaxed text-white/45">
              Shadowy palīdz vadītājiem redzēt to, kas parasti pazūd starp kalendāriem, uzdevumu sarakstiem un amata aprakstiem.
            </p>
          </div>
          <div data-reveal="up" data-delay="200" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {([
              { title: "Agrāk pamanīt pārslodzi", desc: "Signāli parādās pirms darbinieks atnāk ar problēmu." },
              { title: "Taisnīgāk sadalīt darbu", desc: "Skaidrs priekšstats par to, kurš faktiski dara ko un cik daudz." },
              { title: "Saprast darbu ārpus amata apraksta", desc: "Redzamība uz koordināciju, palīdzību un neformālajiem pienākumiem." },
              { title: "Labāki lēmumi par atzinību", desc: "Bonusi un uzslavas balstoties uz reālu ieguldījumu, ne tikai formāliem KPI." },
              { title: "Samazināt haosu komandā", desc: "Izprast, kuri procesi rada slēpto slodzi un kur ir jāmaina organizācija." },
              { title: "Pamanīt role gaps", desc: "Atklāt, kur komandas locekļi sistemātiski strādā ārpus savas lomas." },
            ] as const).map(({ title, desc }) => (
              <div key={title} className="glass rounded-xl border border-white/[0.07] bg-white/[0.015] p-5 transition-colors duration-200 hover:border-white/[0.12] hover:bg-white/[0.03]">
                <div className="mb-2 h-1 w-6 rounded-full bg-emerald-500/40" />
                <p className="text-sm font-semibold text-white/80">{title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/40">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kam piemērots + Kam nav ───────────────────────────────────── */}
      <section className="relative border-t border-white/[0.1]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p data-reveal="left" className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Mērķauditorija</p>
              <h2 data-reveal="up" data-delay="100" className="mt-2 font-display font-black text-2xl tracking-tight text-white sm:text-3xl">Kam Shadowy ir piemērots?</h2>
              <p data-reveal="blur" data-delay="200" className="mt-3 text-sm leading-relaxed text-white/45">
                Īpaši piemērots komandām, kur daudz darba notiek neformāli: palīdzība kolēģiem, koordinācija, klientu jautājumi, onboardings un papildu pienākumi.
              </p>
              <ul data-reveal="right" data-delay="280" className="mt-5 space-y-2">
                {[
                  "Biroja un administratīvās komandas",
                  "Grāmatvedības komandas",
                  "HR un cilvēkresursu komandas",
                  "Projektu komandas",
                  "Customer support komandas",
                  "Mazas un vidējas komandas (5–50 cilvēki)",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/55">
                    <Check className="h-3 w-3 shrink-0 text-emerald-400/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p data-reveal="right" className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Nav paredzēts</p>
              <h2 data-reveal="up" data-delay="100" className="mt-2 font-display font-black text-2xl tracking-tight text-white sm:text-3xl">Kam Shadowy nav?</h2>
              <p data-reveal="blur" data-delay="200" className="mt-3 text-sm leading-relaxed text-white/45">
                Shadowy ir paredzēts komandām, kuras vēlas labāk saprast reālo darba slodzi - nevis kontrolēt darbiniekus.
              </p>
              <ul data-reveal="left" data-delay="280" className="mt-5 space-y-2">
                {[
                  "Darbinieku izsekošanai",
                  "Ekrāna aktivitātes kontrolei",
                  "Privāto sarunu analīzei",
                  "Mikromenedžmentam",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/35">
                    <X className="h-3 w-3 shrink-0 text-white/20" />
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
            <p data-reveal="blur" data-delay="200" className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/45">
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
                <p className="mt-2 text-sm leading-relaxed text-white/40">{desc}</p>
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
              <span className="text-[9px] text-white/40">i</span>
            </div>
            <p className="text-xs leading-relaxed text-white/35">
              Shadowy ir Ventspils Augstskolas studentu veidots agrīnās stadijas projekts. Šobrīd meklējam pirmās komandas 30 dienu pilotam, lai pārbaudītu risinājumu reālā darba vidē. Jūsu atgriezeniskā saite palīdzēs veidot labāku produktu.
            </p>
          </div>
        </div>
      </div>

      {/* ── Pilot form ───────────────────────────────────────────────── */}
      <section id="pilots" className="relative overflow-hidden border-t border-white/[0.1]">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] h-[500px] w-[600px] rounded-full bg-[hsl(220_80%_30%_/_0.12)] blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-5%] h-[400px] w-[500px] rounded-full bg-[hsl(160_60%_20%_/_0.10)] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-24">
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
              Pieteikties
            </p>
            <h2 className="mt-2.5 font-display font-black text-3xl tracking-tight text-white sm:text-4xl">
              Pieteikt 30 dienu pilotu.
            </h2>
            <p className="mt-2 font-display font-light text-xl text-white/40 sm:text-2xl">
              Sāciet bez riska, bez kredītkartes.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/45">
              Aizpildiet formu - sazināsimies ar jums tuvāko dienu laikā un
              palīdzēsim uzsākt pilotu jūsu komandā.
            </p>
          </div>
          <PilotForm />
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
              className="absolute inset-0"
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
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/50">
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
            <Button asChild size="lg" variant="outline" className="border border-white/[0.11] bg-white/[0.04] text-white/65 hover:bg-white/[0.08] hover:border-white/[0.2] hover:text-white/90">
              <a href="#pilots">Sazināties</a>
            </Button>
          </div>
          <p className="mt-6 text-xs text-white/30">
            Jautājumi?{" "}
            <a href="mailto:artemijlucin@gmail.com" className="underline underline-offset-2 transition-colors hover:text-white/60">
              artemijlucin@gmail.com
            </a>
          </p>
        </div>
      </section>


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
    <div className="relative">
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
            <span className="flex-1 text-center font-mono text-[10px] text-white/25">shadowy · vadītāja pārskats</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[8px] font-bold text-emerald-400">MB</div>
          </div>

          <div className="flex">
            <div className="flex flex-col items-center gap-1.5 border-r border-white/5 bg-[#0a1220] px-2.5 py-3">
              {[LayoutDashboard, Users, BarChart3, Settings].map((Icon, i) => (
                <div key={i} className={`flex h-7 w-7 items-center justify-center rounded-md ${i === 0 ? "bg-emerald-500/15 text-emerald-400" : "text-white/20"}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              ))}
            </div>

            <div className="min-w-0 flex-1 space-y-2.5 p-3">
              <div className="flex items-center gap-1.5">
                {["Šī nedēļa", "Visi"].map((f) => (
                  <div key={f} className="flex items-center gap-1 rounded border border-white/8 bg-white/4 px-2 py-1 text-[10px] text-white/35">
                    {f} <span className="opacity-40">▾</span>
                  </div>
                ))}
                <span className="ml-auto text-[10px] text-white/20">4 ieraksti</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/6 px-2.5 py-1.5">
                  <Zap className="h-3 w-3 shrink-0 text-amber-400" />
                  <span className="flex-1 text-[10px] text-amber-300/80">Pārslodzes risks · Ilze D.</span>
                  <span className="rounded border border-amber-500/25 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">Vidējs</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-white/[0.1] bg-white/3 px-2.5 py-1.5">
                  <TrendingUp className="h-3 w-3 shrink-0 text-white/25" />
                  <span className="flex-1 text-[10px] text-white/35">Lomas neatbilstība · Mārtiņš B.</span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-white/25">Pārskatīt</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-white/6" />
                <span className="text-[9px] font-medium uppercase tracking-wider text-white/20">Gaida · 3</span>
                <div className="h-px flex-1 bg-white/6" />
              </div>

              <div className="space-y-px">
                {entries.map((e) => (
                  <div key={e.name} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${e.pending ? "hover:bg-white/4" : "opacity-30"}`}>
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-[8px] font-semibold text-white/50">{e.initials}</div>
                    <span className="w-[64px] shrink-0 truncate text-[10px] font-medium text-white/70">{e.name}</span>
                    <span className="flex-1 truncate text-[10px] text-white/35">{e.type}</span>
                    <span className="shrink-0 text-[10px] text-white/25">{e.time}</span>
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
    <div className="relative">
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
            <span className="flex-1 text-center font-mono text-[10px] text-white/25">shadowy · jauns ieraksts</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-[8px] font-semibold text-white/40">IK</div>
          </div>

          <div className="space-y-4 p-5">
            <div className="text-sm font-semibold text-white/80">Jauns ieraksts</div>

            <div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/30">Ieraksta veids</p>
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
                        : "border-white/8 bg-white/4 text-white/30"
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-white/30">Apraksts</p>
              <div className="min-h-[68px] rounded-lg border border-white/8 bg-white/4 p-3">
                <p className="text-[11px] leading-relaxed text-white/50">
                  Palīdzēju jaunajam darbiniekam saprast CRM sistēmu un onboardinga
                  procesu. Atbildēju uz jautājumiem par klienta komunikāciju
                  <span className="animate-pulse text-white/30">|</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-white/30">Laiks</p>
                <div className="rounded-lg border border-white/8 bg-white/4 px-3 py-2">
                  <span className="text-[11px] font-medium text-white/65">2 h 30 min</span>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-white/30">Datums</p>
                <div className="rounded-lg border border-white/8 bg-white/4 px-3 py-2">
                  <span className="text-[11px] text-white/65">08.06.2025</span>
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
    <div className="relative">
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
            <span className="flex-1 text-center font-mono text-[10px] text-white/25">shadowy · ierakstu pārskatīšana</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[8px] font-bold text-blue-300">MB</div>
          </div>

          <div className="flex" style={{ minHeight: "272px" }}>
            <div className="w-[42%] flex-shrink-0 border-r border-white/[0.1]">
              <div className="border-b border-white/[0.1] px-3 py-2">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-white/25">Gaidāmie · 3</span>
              </div>
              {entries.map((e) => (
                <div
                  key={e.name}
                  className={`relative flex items-start gap-2 border-b border-white/4 px-3 py-2.5 ${e.selected ? "bg-white/5" : ""} ${e.approved ? "opacity-35" : ""}`}
                >
                  {e.selected && <div className="absolute inset-y-0 left-0 w-0.5 bg-emerald-500" />}
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[8px] font-semibold text-white/50">{e.initials}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium text-white/75">{e.name}</p>
                    <p className="truncate text-[9px] text-white/35">{e.type}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] text-white/25">{e.time}</span>
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
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white/60">AK</div>
                  <div>
                    <p className="text-xs font-semibold text-white/80">Anna K.</p>
                    <p className="text-[9px] text-white/35">08.06.2025</p>
                  </div>
                </div>
                <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-400">Gaida</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[9px] font-medium text-emerald-400">Palīdzība kolēģim</span>
                <span className="text-[10px] text-white/30">· 2h 30min</span>
              </div>

              <div className="rounded-lg border border-white/[0.1] bg-white/[0.025] p-3 text-[10px] italic leading-relaxed text-white/45">
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
    <div className="relative">
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
            <span className="flex-1 text-center font-mono text-[10px] text-white/25">shadowy · pārskats</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[8px] font-bold text-purple-300">MB</div>
          </div>

          <div className="flex">
            <div className="flex flex-col items-center gap-1.5 border-r border-white/5 bg-[#0a1220] px-2.5 py-3">
              {[LayoutDashboard, Users, BarChart3, Settings].map((Icon, i) => (
                <div key={i} className={`flex h-7 w-7 items-center justify-center rounded-md ${i === 2 ? "bg-purple-500/15 text-purple-400" : "text-white/20"}`}>
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
                    <p className="text-[9px] text-white/30">{label}</p>
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
                  <TrendingUp className="h-3 w-3 shrink-0 text-white/25" />
                  <span className="flex-1 text-[10px] text-white/35">Lomas neatbilstība · Mārtiņš B.</span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-white/25">Pārskatīt</span>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[9px] font-medium uppercase tracking-wider text-white/20">Nedēļas slodze</p>
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
                      <span className="text-[8px] text-white/20">{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-white/6" />
                <span className="text-[9px] font-medium uppercase tracking-wider text-white/20">Gaida · 3</span>
                <div className="h-px flex-1 bg-white/6" />
              </div>

              <div className="space-y-px">
                {[
                  { initials: "AK", name: "Anna K.", type: "Palīdzība kolēģim", time: "2h", pending: true },
                  { initials: "ID", name: "Ilze D.", type: "Koordinācija", time: "1.5h", pending: true },
                  { initials: "MB", name: "Mārtiņš B.", type: "Jauno ievadīšana", time: "4h", pending: false },
                ].map((e) => (
                  <div key={e.name} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${!e.pending ? "opacity-30" : ""}`}>
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-[8px] font-semibold text-white/50">{e.initials}</div>
                    <span className="w-[60px] shrink-0 truncate text-[10px] font-medium text-white/70">{e.name}</span>
                    <span className="flex-1 truncate text-[10px] text-white/35">{e.type}</span>
                    <span className="shrink-0 text-[10px] text-white/25">{e.time}</span>
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

/* ── Pilot report mockup ─────────────────────────────────────────────── */

function PilotReportMockup() {
  const breakdown = [
    { type: "Palīdzība kolēģiem", hours: 8, pct: 44 },
    { type: "Koordinācija", hours: 6, pct: 33 },
    { type: "Onboarding", hours: 4, pct: 22 },
  ];
  return (
    <div className="glass overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.1] bg-[#07101e] px-5 py-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/25">Shadowy · 30 dienu pilot atskaite</p>
          <p className="mt-0.5 text-xs text-white/40">Uzņēmums XYZ · 01.05–31.05.2025</p>
        </div>
        <span className="rounded border border-emerald-500/25 bg-emerald-500/8 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-400">Gatavs</span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 divide-x divide-white/6 border-b border-white/[0.1]">
        {([
          { label: "Papildu darbs", value: "18h", color: "text-emerald-400" },
          { label: "Role gaps", value: "3", color: "text-amber-400" },
          { label: "Pārslodzes signāli", value: "2", color: "text-red-400" },
        ] as const).map(({ label, value, color }) => (
          <div key={label} className="px-5 py-4 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="mt-0.5 text-[10px] text-white/35">{label}</p>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="px-5 py-4">
        <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-white/25">Biežākie papildu darba veidi</p>
        <div className="space-y-2.5">
          {breakdown.map(({ type, hours, pct }) => (
            <div key={type}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-white/55">{type}</span>
                <span className="font-mono text-white/35">{hours}h</span>
              </div>
              <div className="h-1 w-full rounded-full bg-white/[0.05]">
                <div className="h-1 rounded-full bg-emerald-500/50" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="border-t border-white/[0.1] bg-amber-500/[0.04] px-5 py-4">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-wider text-amber-400/60">Ieteikums vadītājam</p>
        <p className="text-xs leading-relaxed text-white/45">Pārskatīt Mārtiņa B. uzdevumu sadali - 40% darba laika tiek pavadīts ārpus amata apraksta.</p>
      </div>
    </div>
  );
}

/* ── Static data ─────────────────────────────────────────────────────── */

const PRIVACY_SEES = ["Apstiprātus ierakstus", "Kopējo darba slodzi", "Lomu neatbilstības", "Komandas tendences"];
const PRIVACY_NOT_SEES = ["Privātas sarunas", "Ekrāna aktivitāti", "Neapstiprinātus datus", "Personīgu saturu"];
