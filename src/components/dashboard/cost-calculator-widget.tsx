"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Settings2, TrendingUp } from "lucide-react";

const WORK_HOURS_PER_MONTH = 168;

interface Props {
  extraMinutes: number;
}

export function CostCalculatorWidget({ extraMinutes }: Props) {
  const [mode, setMode] = useState<"hourly" | "monthly">("hourly");
  const [hourlyStr, setHourlyStr] = useState("20");
  const [monthlyStr, setMonthlyStr] = useState("");
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setMode((localStorage.getItem("shadowy_rate_mode") as "hourly" | "monthly") ?? "hourly");
    setHourlyStr(localStorage.getItem("shadowy_hourly_rate") ?? "20");
    setMonthlyStr(localStorage.getItem("shadowy_monthly_rate") ?? "");
  }, []);

  useEffect(() => {
    if (!editing) return;
    function onOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setEditing(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [editing]);

  const save = (m: "hourly" | "monthly", h: string, mo: string) => {
    localStorage.setItem("shadowy_rate_mode", m);
    localStorage.setItem("shadowy_hourly_rate", h);
    localStorage.setItem("shadowy_monthly_rate", mo);
  };

  const effectiveHourly =
    mode === "hourly"
      ? parseFloat(hourlyStr) || 0
      : (parseFloat(monthlyStr) || 0) / WORK_HOURS_PER_MONTH;

  const hours = Math.round((extraMinutes / 60) * 10) / 10;
  const cost = Math.round(hours * effectiveHourly);
  const derivedHourly = Math.round(effectiveHourly * 10) / 10;

  const rateLabel =
    mode === "monthly" && monthlyStr
      ? `€${monthlyStr}/mēn → €${derivedHourly}/h`
      : `€${hourlyStr}/h`;

  if (extraMinutes === 0) return null;

  return (
    <Card className="relative mb-8 overflow-visible border-amber-500/20 bg-amber-500/[0.03] p-0 dark:border-amber-500/15">
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
              <div className="text-4xl font-bold tabular-nums">€{cost.toLocaleString("de-DE")}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {hours}h papildu darba · {rateLabel} · nav atspoguļots budžetā
              </p>
            </>
          ) : (
            <div className="text-4xl font-bold tabular-nums text-muted-foreground/20">—</div>
          )}
        </div>

        <div ref={popoverRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>{mode === "monthly" && monthlyStr ? `€${monthlyStr}/mēn` : `€${hourlyStr}/h`}</span>
          </button>

          {editing && mounted && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-60 rounded-lg border border-border bg-popover p-3 shadow-lg">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Likmes veids</p>
              <div className="mb-3 flex rounded-md border border-border overflow-hidden text-xs">
                {(["hourly", "monthly"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); save(m, hourlyStr, monthlyStr); }}
                    className={`flex-1 py-1.5 text-center transition-colors ${
                      mode === m
                        ? "bg-foreground text-background font-medium"
                        : "bg-background text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    {m === "hourly" ? "€/h stundas" : "€/mēn alga"}
                  </button>
                ))}
              </div>

              {mode === "hourly" ? (
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Vidējā stundas likme</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">€</span>
                    <input
                      type="number"
                      value={hourlyStr}
                      onChange={(e) => { setHourlyStr(e.target.value); save("hourly", e.target.value, monthlyStr); }}
                      className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
                      min="0"
                      step="0.5"
                      autoFocus
                    />
                    <span className="text-sm text-muted-foreground">/h</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Vidējā mēneša bruto alga</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">€</span>
                    <input
                      type="number"
                      value={monthlyStr}
                      onChange={(e) => { setMonthlyStr(e.target.value); save("monthly", hourlyStr, e.target.value); }}
                      placeholder="2000"
                      className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
                      min="0"
                      step="50"
                      autoFocus
                    />
                    <span className="text-sm text-muted-foreground">/mēn</span>
                  </div>
                  {monthlyStr && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      ÷ {WORK_HOURS_PER_MONTH}h = €{derivedHourly}/h
                    </p>
                  )}
                </div>
              )}

              <p className="mt-2.5 border-t border-border pt-2 text-[11px] text-muted-foreground/60">
                Komandas vidējā likme. Individuālas likmes — darbinieku profilos (drīzumā).
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
