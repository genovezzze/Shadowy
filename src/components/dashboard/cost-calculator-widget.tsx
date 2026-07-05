"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface Props {
  extraMinutes: number;
}

export function CostCalculatorWidget({ extraMinutes }: Props) {
  const [rateStr, setRateStr] = useState("20");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("shadowy_hourly_rate");
    if (saved) setRateStr(saved);
  }, []);

  const rate = parseFloat(rateStr) || 0;
  const hours = Math.round((extraMinutes / 60) * 10) / 10;
  const cost = Math.round(hours * rate);

  if (extraMinutes === 0) return null;

  return (
    <Card className="relative mb-8 overflow-hidden border-amber-500/20 bg-amber-500/[0.03] p-0 dark:border-amber-500/15">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Neredzamo izmaksu aprēķins
            </span>
          </div>
          {mounted ? (
            <>
              <div className="text-4xl font-bold tabular-nums">
                €{cost.toLocaleString("de-DE")}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {hours}h papildu darba · nav atspoguļots budžetā
              </p>
            </>
          ) : (
            <div className="text-4xl font-bold tabular-nums text-muted-foreground/20">
              —
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
          <span className="text-xs text-muted-foreground">Vidējā stundas likme</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">€</span>
            <input
              type="number"
              value={rateStr}
              onChange={(e) => {
                setRateStr(e.target.value);
                localStorage.setItem("shadowy_hourly_rate", e.target.value);
              }}
              className="w-16 rounded-md border border-border bg-background/60 px-2 py-1 text-right text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
              min="0"
              step="1"
            />
            <span className="text-sm text-muted-foreground">/h</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
