"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Enter a duration as hours + minutes so nobody has to convert to minutes by
 * hand. A hidden field submits the total in minutes under `name`, which is what
 * the rest of the app stores. Quick-pick chips cover the common values.
 */
const PRESETS: { label: string; m: number }[] = [
  { label: "15 min", m: 15 },
  { label: "30 min", m: 30 },
  { label: "45 min", m: 45 },
  { label: "1 st.", m: 60 },
  { label: "1 st. 30 min", m: 90 },
  { label: "2 st.", m: 120 },
];

export function DurationInput({
  name,
  id,
  defaultMinutes,
  apple = false,
}: {
  name: string;
  id?: string;
  defaultMinutes?: number;
  /** Soft rounded field and blue chips, used on the new entry form. */
  apple?: boolean;
}) {
  const [hours, setHours] = useState(
    defaultMinutes != null && defaultMinutes >= 60
      ? String(Math.floor(defaultMinutes / 60))
      : "",
  );
  const [minutes, setMinutes] = useState(
    defaultMinutes != null ? String(defaultMinutes % 60) : "",
  );

  const total = (Number(hours) || 0) * 60 + (Number(minutes) || 0);

  const setFromMinutes = (m: number) => {
    setHours(m >= 60 ? String(Math.floor(m / 60)) : "");
    setMinutes(String(m % 60));
  };

  const fieldInput =
    "w-10 bg-transparent text-right text-base font-semibold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  return (
    <div className={apple ? "flex flex-wrap items-center gap-2" : "flex flex-col gap-2.5"}>
      <div
        className={cn(
          "inline-flex w-fit items-stretch divide-x overflow-hidden",
          apple
            ? "h-10 [@media(min-height:1000px)]:h-12 rounded-xl border border-black/[0.08] bg-black/[0.02] divide-black/[0.08] focus-within:border-[#007AFF]/50 focus-within:ring-2 focus-within:ring-[#007AFF]/20 dark:border-white/[0.08] dark:bg-white/[0.04] dark:divide-white/[0.08] dark:focus-within:border-[#0A84FF]/50"
            : "divide-input rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0"
        )}
      >
        <label className={cn("flex gap-1.5 px-3.5", apple ? "items-center" : "items-baseline py-2.5")}>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={0}
            max={24}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="0"
            className={fieldInput}
            aria-label="Stundas"
          />
          <span className="text-sm text-muted-foreground">st.</span>
        </label>
        <label className={cn("flex gap-1.5 px-3.5", apple ? "items-center" : "items-baseline py-2.5")}>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="0"
            className={fieldInput}
            aria-label="Minūtes"
          />
          <span className="text-sm text-muted-foreground">min</span>
        </label>
      </div>

      <div className={cn("flex flex-wrap", apple ? "gap-1.5" : "gap-1.5")}>
        {PRESETS.map((p) => (
          <button
            key={p.m}
            type="button"
            onClick={() => setFromMinutes(p.m)}
            className={cn(
              apple
                ? cn(
                    "h-8 rounded-full px-3 text-[14px] font-medium transition-colors [@media(min-height:1000px)]:h-9 [@media(min-height:1000px)]:px-3.5 [@media(min-height:1000px)]:text-[15px]",
                    total === p.m
                      ? "bg-[#007AFF] text-white dark:bg-[#0A84FF]"
                      : "bg-black/[0.04] text-foreground/80 hover:bg-black/[0.07] hover:text-foreground dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
                  )
                : cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    total === p.m
                      ? "border-foreground bg-foreground text-background"
                      : "border-input text-muted-foreground hover:bg-muted"
                  ),
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <input type="hidden" name={name} value={String(total)} />
    </div>
  );
}
