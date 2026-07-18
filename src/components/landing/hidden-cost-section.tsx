"use client";

import React from "react";
import {
  CalendarDays,
  CalendarRange,
  CircleDollarSign,
  TrendingUp,
} from "lucide-react";

const formatEuro = (value: number) =>
  `€${new Intl.NumberFormat("lv-LV", {
    maximumFractionDigits: 0,
  }).format(value)}`;

const lostMoney = [
  { left: "3%", size: "1.6rem", delay: "0s", dur: "3.6s", tone: "text-emerald-300/70" },
  { left: "17%", size: "1.1rem", delay: "1.3s", dur: "4.3s", tone: "text-white/35" },
  { left: "31%", size: "1.9rem", delay: "0.5s", dur: "3.9s", tone: "text-emerald-400/65" },
  { left: "45%", size: "1.2rem", delay: "2.1s", dur: "4.6s", tone: "text-rose-300/55" },
  { left: "58%", size: "1.5rem", delay: "0.9s", dur: "3.4s", tone: "text-emerald-300/60" },
  { left: "71%", size: "1.1rem", delay: "1.8s", dur: "4.1s", tone: "text-white/30" },
  { left: "84%", size: "1.7rem", delay: "0.3s", dur: "3.8s", tone: "text-rose-300/55" },
  { left: "95%", size: "1.2rem", delay: "2.4s", dur: "4.4s", tone: "text-emerald-300/55" },
] as const;

function CardGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-0 top-0 h-[66%] w-[76%] opacity-85"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.17) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.17) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        maskImage:
          "radial-gradient(ellipse 90% 95% at 100% 0%, black 0%, rgba(0,0,0,.78) 46%, transparent 82%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 90% 95% at 100% 0%, black 0%, rgba(0,0,0,.78) 46%, transparent 82%)",
      }}
    />
  );
}

type CostInputProps = {
  id: string;
  label: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

function CostInput({
  id,
  label,
  value,
  suffix,
  min,
  max,
  step = 1,
  onChange,
}: CostInputProps) {
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <label htmlFor={id} className="block">
      <span className="flex min-h-[2.75rem] items-start justify-between gap-3">
        <span className="max-w-[11rem] font-display text-sm font-medium leading-[1.15] normal-case tracking-[0.01em] text-white/62">
          {label}
        </span>
        <span className="flex shrink-0 items-baseline gap-1 whitespace-nowrap font-display text-sm font-bold leading-5 text-white/88">
          {value.toLocaleString("lv-LV")}{" "}
          <span className="text-[10px] font-normal text-white/40">{suffix}</span>
        </span>
      </span>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="cost-range mt-1.5 block w-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, rgba(212,212,216,.72) 0%, rgba(212,212,216,.72) ${progress}%, rgba(255,255,255,.1) ${progress}%, rgba(255,255,255,.1) 100%)`,
        }}
      />

      <span className="mt-1.5 flex justify-between text-[9px] text-white/18">
        <span>{min}</span>
        <span>{max}</span>
      </span>
    </label>
  );
}

export function HiddenCostSection() {
  const [employees, setEmployees] = React.useState(6);
  const [hours, setHours] = React.useState(3);
  const [hourlyCost, setHourlyCost] = React.useState(15);

  const weeklyCost = employees * hours * hourlyCost;
  const monthlyCost = weeklyCost * 4;
  const yearlyCost = monthlyCost * 12;

  const results = [
    {
      label: "Nedēļas slēptās izmaksas",
      value: weeklyCost,
      icon: CalendarDays,
      valueClassName: "text-white",
    },
    {
      label: "Mēneša slēptās izmaksas",
      value: monthlyCost,
      icon: CalendarRange,
      valueClassName:
        "text-[#42ff9f] drop-shadow-[0_0_14px_rgba(66,255,159,0.48)]",
    },
    {
      label: "Gada slēptās izmaksas",
      value: yearlyCost,
      icon: TrendingUp,
      valueClassName:
        "text-[#ff3f62] drop-shadow-[0_0_14px_rgba(255,63,98,0.5)]",
    },
  ] as const;

  return (
    <section
      id="hidden-cost"
      aria-labelledby="hidden-cost-heading"
      className="relative overflow-hidden bg-[#070809] py-16 scroll-mt-24 sm:py-20 md:py-24"
    >
      <div className="relative mx-auto grid max-w-[1500px] gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 xl:px-14">
        <div className="min-w-0 lg:order-2">
          <h2
            id="hidden-cost-heading"
            className="max-w-lg bg-gradient-to-r from-white from-[0%] via-zinc-300 via-[45%] to-zinc-500 to-[100%] bg-clip-text text-balance font-accent text-[clamp(2.25rem,4.4vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.02em] text-transparent"
          >
            <span className="sm:hidden">
              <span className="block">Neredzamais darbs</span>
              <span className="mobile-free-accent mt-1 inline-block">
                nav bezmaksas
              </span>
            </span>
            <span className="hidden sm:inline">
              Neredzamais darbs{" "}
              <span className="mobile-free-accent inline-block">
                nav bezmaksas
              </span>
            </span>
          </h2>
          <p className="mt-5 max-w-[34rem] text-pretty font-accent text-base font-light leading-[1.6] text-white/70 sm:mt-6 sm:text-lg lg:text-xl lg:leading-[1.65]">
            Katra stunda, kas veltīta palīdzībai kolēģiem, jauno darbinieku
            ievadīšanai, steidzamu uzdevumu koordinēšanai vai darbam ārpus
            oficiālās lomas,{" "}
            <strong className="font-semibold text-white">
              uzņēmumam maksā naudu
            </strong>
            . Ja šis darbs netiek fiksēts,{" "}
            <strong className="font-semibold text-white">
              uzņēmums neredz, kur pazūd laiks un nauda
            </strong>
          </p>

          {/* money slipping away */}
          <div
            aria-hidden
            className="pointer-events-none relative mt-8 h-40 overflow-hidden sm:mt-10"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 22%, black 74%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 22%, black 74%, transparent 100%)",
            }}
          >
            {lostMoney.map((c, i) => (
              <span
                key={i}
                className={`animate-money-fall absolute top-0 select-none font-bold ${c.tone}`}
                style={{
                  left: c.left,
                  fontSize: c.size,
                  animationDelay: c.delay,
                  animationDuration: c.dur,
                }}
              >
                €
              </span>
            ))}
          </div>
        </div>

        <div
          id="hidden-cost-calculator"
          className="relative min-w-0 overflow-hidden rounded-[18px] border border-white/[0.1] bg-[#08090a] p-5 font-display font-medium shadow-[0_16px_45px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.02)] sm:p-6 lg:order-1"
        >
          <CardGrid />
          <div className="relative">
          <div>
            <div className="flex items-center gap-3">
              <CircleDollarSign
                className="size-5 text-white/55"
                strokeWidth={1.6}
                aria-hidden
              />
              <p className="text-base font-medium text-white/55">
                Slēpto izmaksu kalkulators
              </p>
            </div>
            <h3 className="mt-4 text-xl font-medium leading-tight text-white sm:text-2xl">
              Aprēķiniet neredzamā darba izmaksas
            </h3>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-3 sm:gap-5">
            <CostInput
              id="employee-count"
              label="Darbinieki"
              value={employees}
              suffix="cilvēki"
              min={1}
              max={100}
              onChange={setEmployees}
            />
            <CostInput
              id="weekly-hours"
              label="Stundas uz darbinieku"
              value={hours}
              suffix="st. / nedēļā"
              min={1}
              max={40}
              onChange={setHours}
            />
            <CostInput
              id="hourly-cost"
              label="Vidējās stundas izmaksas"
              value={hourlyCost}
              suffix="€ / stundā"
              min={5}
              max={100}
              onChange={setHourlyCost}
            />
          </div>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
            {results.map((result) => {
              const Icon = result.icon;
              return (
                <div
                  key={result.label}
                  className="group relative min-h-[124px] overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.018] p-4 transition-colors hover:border-white/[0.18]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[76px] opacity-35 transition-opacity group-hover:opacity-50"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(135deg, transparent 0px, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)",
                      maskImage:
                        "linear-gradient(to bottom, black 0%, rgba(0,0,0,.7) 58%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black 0%, rgba(0,0,0,.7) 58%, transparent 100%)",
                    }}
                  />
                  <div className="relative flex items-start gap-1.5 text-white/68">
                    <Icon
                      className="mt-0.5 size-3 shrink-0 text-white/55"
                      aria-hidden
                    />
                    <span className="text-[12px] font-medium leading-4 text-white/82 xl:text-[13px] 2xl:text-sm">
                      {result.label.split(" ").slice(0, -1).join(" ")}
                      <br />
                      {result.label.split(" ").slice(-1).join(" ")}
                    </span>
                  </div>
                  <p
                    className={`relative mt-7 font-display text-xl font-black tracking-[-0.015em] sm:text-2xl ${result.valueClassName}`}
                  >
                    {formatEuro(result.value)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 border-t border-white/[0.07] pt-4">
            <p className="font-display text-sm font-medium text-white/58">
              Izmaksu formula
            </p>
            <p className="mt-2 text-base font-medium text-white/88">
              Stundas × stundas izmaksas × biežums
            </p>
            <p className="mt-2 text-xs leading-5 text-white/42">
              5 × 3 stundas nedēļā × €15 stundā = €225 nedēļā × 4 = €900
              mēnesī
            </p>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
