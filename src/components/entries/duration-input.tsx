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
}: {
  name: string;
  id?: string;
  defaultMinutes?: number;
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
    <div className="flex flex-col gap-2.5">
      <div className="inline-flex w-fit items-stretch divide-x divide-input overflow-hidden rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
        <label className="flex items-baseline gap-1.5 px-3.5 py-2.5">
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
        <label className="flex items-baseline gap-1.5 px-3.5 py-2.5">
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

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.m}
            type="button"
            onClick={() => setFromMinutes(p.m)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              total === p.m
                ? "border-foreground bg-foreground text-background"
                : "border-input text-muted-foreground hover:bg-muted",
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
