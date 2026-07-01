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
      <span className="flex h-10 items-start justify-between gap-3">
        <span className="max-w-[10rem] font-display text-sm font-medium leading-5 normal-case tracking-[0.01em] text-white/62">
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
      valueClassName: "text-[#54f5a9]",
    },
    {
      label: "Gada slēptās izmaksas",
      value: yearlyCost,
      icon: TrendingUp,
      valueClassName: "text-[#ff626d]",
    },
  ] as const;

  return (
    <section
      id="hidden-cost"
      aria-labelledby="hidden-cost-heading"
      className="relative overflow-hidden border-y border-white/[0.07] bg-[#06090b] py-16 scroll-mt-24 sm:py-20 md:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_12%_35%,rgba(255,255,255,0.035),transparent_72%),radial-gradient(45%_70%_at_92%_78%,rgba(113,113,122,0.045),transparent_74%)]"
      />

      <div className="relative mx-auto grid max-w-[1500px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-16 xl:px-14">
        <div>
          <h2
            id="hidden-cost-heading"
            className="max-w-xl bg-gradient-to-r from-white from-[0%] via-zinc-300 via-[45%] to-zinc-700 to-[100%] bg-clip-text text-balance font-accent text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[0.98] tracking-[-0.02em] text-transparent"
          >
            Neredzamais darbs nav bezmaksas
          </h2>
          <p className="mt-8 max-w-[36rem] font-accent text-xl font-light leading-[1.55] text-white/68 sm:text-[1.4rem] lg:text-[clamp(1.4rem,1.65vw,1.75rem)]">
            Katra stunda, kas veltīta palīdzībai kolēģiem, jauno darbinieku
            ievadīšanai, steidzamu uzdevumu koordinēšanai vai darbam ārpus
            oficiālās lomas,{" "}
            <strong className="font-bold text-white">
              uzņēmumam maksā naudu
            </strong>
            . Ja šis darbs netiek fiksēts,{" "}
            <strong className="font-bold text-white">
              uzņēmums neredz, kur pazūd laiks un nauda
            </strong>
          </p>

        </div>

        <div
          id="hidden-cost-calculator"
          className="relative overflow-hidden rounded-[18px] border border-white/[0.1] bg-[#08090a] p-5 font-display font-medium shadow-[0_16px_45px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.02)] sm:p-6"
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
                    <span className="whitespace-nowrap text-[12px] font-medium leading-5 text-white/82 xl:text-[13px] 2xl:text-sm">
                      {result.label}
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
