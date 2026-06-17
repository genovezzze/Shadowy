import Image from "next/image";
import { Check, TriangleAlert } from "lucide-react";

/* ─── Speech bubble ──────────────────────────────────────────────── */

function Bubble({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute max-w-[130px] rounded-2xl px-3 py-2 text-[12px] font-medium leading-snug text-white ${className}`}
      style={{
        background: "rgba(8, 13, 30, 0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.13)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Photo card ─────────────────────────────────────────────────── */

function PhotoCard({
  num,
  title,
  accent,
  imageSrc,
  children,
}: {
  num: number;
  title: string;
  accent: string;
  imageSrc: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative shrink-0 snap-center overflow-hidden rounded-2xl border border-white/[0.1] lg:shrink"
      style={{
        width: "clamp(240px, 22vw, 295px)",
        height: "clamp(420px, 50vw, 510px)",
      }}
    >
      {/* Photo fills entire card */}
      <Image
        src={imageSrc}
        alt={title}
        fill
        className="object-cover object-top"
        sizes="295px"
      />

      {/* Gradient: transparent top, heavy dark bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,8,22,0.12) 0%, rgba(5,8,22,0.0) 18%, rgba(5,8,22,0.35) 62%, rgba(5,8,22,0.94) 86%, rgba(5,8,22,1.0) 100%)",
        }}
      />

      {/* Bubbles — positioned relative to card root */}
      {children}

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 text-center">
        <p
          className="font-display text-4xl font-black leading-none"
          style={{ color: accent }}
        >
          {num}
        </p>
        <p className="mt-2 text-[15px] font-bold text-white">{title}</p>
      </div>
    </div>
  );
}

/* ─── UI card (no photo) ─────────────────────────────────────────── */

function UICard({
  num,
  title,
  accent,
  bg,
  borderColor,
  children,
}: {
  num: number;
  title: string;
  accent: string;
  bg: string;
  borderColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex shrink-0 snap-center flex-col overflow-hidden rounded-2xl border lg:shrink"
      style={{
        background: bg,
        borderColor,
        width: "clamp(240px, 22vw, 295px)",
        height: "clamp(420px, 50vw, 510px)",
      }}
    >
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-6">
        {children}
      </div>
      <div className="border-t border-white/[0.07] px-5 pb-6 pt-4 text-center">
        <p
          className="font-display text-4xl font-black leading-none"
          style={{ color: accent }}
        >
          {num}
        </p>
        <p className="mt-2 text-[15px] font-bold text-white/85">{title}</p>
      </div>
    </div>
  );
}

/* ─── Arrow connector ────────────────────────────────────────────── */

function Arrow() {
  return (
    <div className="flex shrink-0 items-center self-center text-xl text-white/20 select-none">
      →
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────────────── */

export function AnnaStorySection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.1]">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-20">
        <p
          data-reveal="up"
          className="text-[11px] font-semibold uppercase tracking-widest text-white/45"
        >
          Problēma
        </p>
        <h2
          data-reveal="left"
          data-delay="80"
          className="mt-3 font-display font-black text-4xl leading-tight tracking-tight text-white sm:text-5xl"
        >
          Šis ir darbs, ko{" "}
          <span className="text-gradient-emerald">vadītājs bieži neredz.</span>
        </h2>
        <p
          data-reveal="blur"
          data-delay="160"
          className="mt-4 max-w-xl text-base leading-relaxed text-white/55"
        >
          Viena darbiniece. Viena parasta darba diena. Vairāki uzdevumi, kas
          nekur neparādās.
        </p>
      </div>

      {/* Horizontal scroll cards */}
      <div
        data-reveal="up"
        data-delay="200"
        className="flex gap-3 overflow-x-auto px-6 pb-10 snap-x snap-mandatory scroll-px-6
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                   lg:mx-auto lg:max-w-6xl lg:overflow-visible lg:px-6"
        style={{ WebkitOverflowScrolling: "touch" }}
      >

        {/* ── 1: Palīdz visiem ─────────────────────────────── */}
        <PhotoCard
          num={1}
          title="Palīdz visiem"
          accent="hsl(185 70% 55%)"
          imageSrc="/images/story/card-1.png"
        >
          <Bubble className="top-[7%] left-[5%]" style={{ rotate: "-2deg" }}>
            Vari paskatīties?
          </Bubble>
          <Bubble className="top-[15%] right-[4%]" style={{ rotate: "2deg" }}>
            Vajag palīdzību
          </Bubble>
          <Bubble className="top-[44%] right-[4%]" style={{ rotate: "3deg" }}>
            Steidzams jautājums
          </Bubble>
          <Bubble className="bottom-[26%] left-[4%]" style={{ rotate: "-3deg" }}>
            Palīdzēsi ar ievadīšanu?
          </Bubble>
        </PhotoCard>

        <Arrow />

        {/* ── 2: Pārslodze ─────────────────────────────────── */}
        <PhotoCard
          num={2}
          title="Pārslodze"
          accent="hsl(30 85% 60%)"
          imageSrc="/images/story/card-2.png"
        >
          <Bubble
            className="top-[7%] left-[5%]"
            style={{ rotate: "-3deg", borderColor: "rgba(245,158,11,0.2)" }}
          >
            <span className="flex items-center gap-1">
              <TriangleAlert className="h-3 w-3 shrink-0 text-amber-400" />
              Dod. uzdevumi
            </span>
          </Bubble>
          <Bubble
            className="top-[16%] right-[4%]"
            style={{ rotate: "3deg", borderColor: "rgba(245,158,11,0.2)" }}
          >
            Nav fiksēts
          </Bubble>
          <Bubble
            className="top-[43%] left-[4%]"
            style={{ rotate: "-4deg", borderColor: "rgba(245,158,11,0.2)" }}
          >
            Nav amata aprakstā
          </Bubble>
          <Bubble
            className="bottom-[26%] right-[4%]"
            style={{ rotate: "4deg", borderColor: "rgba(245,158,11,0.2)" }}
          >
            ~2h neredzamā darba
          </Bubble>
        </PhotoCard>

        <Arrow />

        {/* ── 3: Shadowy fiksē ─────────────────────────────── */}
        <UICard
          num={3}
          title="Shadowy fiksē"
          accent="hsl(160 70% 55%)"
          bg="linear-gradient(175deg, hsl(160 35% 8%) 0%, hsl(200 45% 6%) 100%)"
          borderColor="hsl(160 50% 30% / 0.28)"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 55% at 50% 50%, hsl(160 60% 18% / 0.35) 0%, transparent 70%)",
            }}
          />
          <div
            className="relative w-full overflow-hidden rounded-xl border border-emerald-500/[0.2] bg-[#060d1c]/80"
            style={{ boxShadow: "0 0 40px hsl(160 60% 30% / 0.2)" }}
          >
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2.5">
              <div
                className="flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-black text-white"
                style={{ background: "hsl(160 70% 35%)" }}
              >
                S
              </div>
              <span className="text-[11px] font-semibold text-white/70">Shadowy</span>
              <span className="ml-auto text-[9px] font-medium text-emerald-400/60">
                ● automātiski
              </span>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {(
                [
                  { label: "palīdzība kolēģiem", t: "2h 15m", n: "14 reizes" },
                  { label: "onboarding", t: "45m", n: "8 reizes" },
                  { label: "koordinācija", t: "1h 05m", n: "11 reizes" },
                  { label: "ārpus lomas", t: "40m", n: "9 reizes" },
                ] as const
              ).map(({ label, t, n }) => (
                <div key={label} className="flex items-center justify-between px-3 py-2">
                  <div>
                    <p className="text-[10px] font-medium text-white/65">{label}</p>
                    <p className="text-[9px] text-white/30">{n}</p>
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-emerald-400/75">
                    {t}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.06] px-3 py-2.5">
              <span className="text-[10px] text-white/35">Kopā periodā</span>
              <span className="font-mono text-[11px] font-black text-emerald-400">4h 45m</span>
            </div>
          </div>
        </UICard>

        <Arrow />

        {/* ── 4: Vadītājs redz ─────────────────────────────── */}
        <PhotoCard
          num={4}
          title="Vadītājs redz"
          accent="hsl(185 65% 55%)"
          imageSrc="/images/story/card-4.png"
        >
          <div
            className="absolute bottom-[23%] left-[5%] right-[5%] overflow-hidden rounded-2xl"
            style={{
              background: "rgba(8, 13, 30, 0.88)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full font-display text-[10px] font-black text-white/70"
                  style={{ background: "hsl(185 40% 22%)" }}
                >
                  AK
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white/85">Anna Kalniņa</p>
                  <p className="text-[9px] text-white/40">4h 45m dod. darbs</p>
                </div>
              </div>
              <div
                className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                style={{
                  background: "hsl(185 60% 20% / 0.5)",
                  color: "hsl(185 70% 65%)",
                  border: "1px solid hsl(185 60% 40% / 0.3)",
                }}
              >
                Apstiprināts
              </div>
            </div>
            <div className="px-3 py-2.5">
              <p className="text-[10px] italic text-white/55">
                &ldquo;Paldies par ieguldījumu un komandas atbalstu!&rdquo;
              </p>
            </div>
          </div>
        </PhotoCard>

        <Arrow />

        {/* ── 5: Komanda kontrolē ──────────────────────────── */}
        <UICard
          num={5}
          title="Komanda kontrolē"
          accent="hsl(160 65% 55%)"
          bg="linear-gradient(175deg, hsl(160 30% 8%) 0%, hsl(200 45% 6%) 100%)"
          borderColor="hsl(160 50% 30% / 0.25)"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 55% at 50% 50%, hsl(160 50% 18% / 0.3) 0%, transparent 70%)",
            }}
          />
          <div className="relative w-full space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                Komandas analītika
              </p>
              <span className="text-[9px] text-white/25">šis mēnesis</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { v: "12", l: "darbinieki", c: "text-white/85" },
                  { v: "240h", l: "dod. darbs", c: "text-emerald-400" },
                  { v: "3", l: "risks", c: "text-orange-400" },
                ] as const
              ).map(({ v, l, c }) => (
                <div
                  key={l}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-2 text-center"
                >
                  <p className={`font-mono text-sm font-black ${c}`}>{v}</p>
                  <p className="mt-0.5 text-[8px] leading-tight text-white/30">{l}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 pt-0.5">
              {(["AK", "MJ", "RB", "IL", "KS"] as const).map((initials, i) => (
                <div
                  key={initials}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[9px] font-black text-white/60"
                  style={{
                    background: `linear-gradient(145deg, hsl(${160 + i * 15} 30% 22%) 0%, hsl(${175 + i * 15} 35% 15%) 100%)`,
                    boxShadow: `0 0 0 1px hsl(${160 + i * 15} 50% 35% / 0.25)`,
                    marginLeft: i > 0 ? "-6px" : "0",
                    zIndex: 5 - i,
                    position: "relative",
                  }}
                >
                  {initials}
                </div>
              ))}
              <span className="ml-2 text-[9px] text-white/35">+7 vairāk</span>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/30">
                Ieteikumi
              </p>
              {(
                [
                  "Pārdali slodzi AK",
                  "Fiksē atbildību zonas",
                  "Automatizē procesus",
                ] as const
              ).map((rec) => (
                <div key={rec} className="flex items-center gap-1.5 py-0.5">
                  <Check className="h-3 w-3 shrink-0 text-emerald-400/70" />
                  <span className="text-[9px] text-white/50">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </UICard>
      </div>
    </section>
  );
}
