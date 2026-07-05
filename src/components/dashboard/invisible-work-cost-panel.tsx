"use client";

import { useState, useEffect, useRef } from "react";
import { Settings2 } from "lucide-react";

const WORK_HOURS_PER_MONTH = 168; // 21 days × 8h

function loadRate(): { mode: "hourly" | "monthly"; hourly: string; monthly: string } {
  if (typeof window === "undefined") return { mode: "hourly", hourly: "20", monthly: "" };
  return {
    mode: (localStorage.getItem("shadowy_rate_mode") as "hourly" | "monthly") ?? "hourly",
    hourly: localStorage.getItem("shadowy_hourly_rate") ?? "20",
    monthly: localStorage.getItem("shadowy_monthly_rate") ?? "",
  };
}

function saveRate(mode: "hourly" | "monthly", hourly: string, monthly: string) {
  localStorage.setItem("shadowy_rate_mode", mode);
  localStorage.setItem("shadowy_hourly_rate", hourly);
  localStorage.setItem("shadowy_monthly_rate", monthly);
}

interface Props {
  extraHours: number;
  extraPct?: number;
  totalHours?: number;
}

export function InvisibleWorkCostPanel({ extraHours, extraPct, totalHours }: Props) {
  const [mode, setMode] = useState<"hourly" | "monthly">("hourly");
  const [hourlyStr, setHourlyStr] = useState("20");
  const [monthlyStr, setMonthlyStr] = useState("");
  const [editing, setEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = loadRate();
    setMode(saved.mode);
    setHourlyStr(saved.hourly);
    setMonthlyStr(saved.monthly);
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

  const effectiveHourly =
    mode === "hourly"
      ? parseFloat(hourlyStr) || 0
      : (parseFloat(monthlyStr) || 0) / WORK_HOURS_PER_MONTH;

  const derivedHourly = Math.round(effectiveHourly * 10) / 10;
  const cost = Math.round(extraHours * effectiveHourly);

  const rateLabel =
    mode === "monthly" && monthlyStr
      ? `€${monthlyStr}/mēn → €${derivedHourly}/h`
      : `€${hourlyStr}/h`;

  function handleModeChange(newMode: "hourly" | "monthly") {
    setMode(newMode);
    saveRate(newMode, hourlyStr, monthlyStr);
  }

  function handleHourlyChange(val: string) {
    setHourlyStr(val);
    saveRate("hourly", val, monthlyStr);
  }

  function handleMonthlyChange(val: string) {
    setMonthlyStr(val);
    saveRate("monthly", hourlyStr, val);
  }

  if (!mounted) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 print:border-gray-200">
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Papildu darba stundas</div>
          <div className="text-2xl font-bold tabular-nums">{extraHours}h</div>
          <div className="text-xs text-muted-foreground mt-0.5">ārpus oficiālās lomas</div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs text-muted-foreground">Novērtētā vērtība</span>
            <span className="text-xs text-muted-foreground/60">({rateLabel})</span>
            <div className="relative" ref={popoverRef}>
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="ml-0.5 inline-flex items-center rounded p-0.5 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/60 transition-colors print:hidden"
                title="Mainīt likmi"
              >
                <Settings2 className="h-3 w-3" />
              </button>

              {editing && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-border bg-card p-4 shadow-[0_8px_32px_rgba(0,0,0,0.28)] dark:border-white/[0.12] dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
                  {/* Mode toggle */}
                  <div className="mb-3 flex rounded-md border border-border overflow-hidden text-xs">
                    {(["hourly", "monthly"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleModeChange(m)}
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
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Vidējā stundas likme komandā
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-muted-foreground">€</span>
                        <input
                          type="number"
                          value={hourlyStr}
                          onChange={(e) => handleHourlyChange(e.target.value)}
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
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Vidējā mēneša bruto alga
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-muted-foreground">€</span>
                        <input
                          type="number"
                          value={monthlyStr}
                          onChange={(e) => handleMonthlyChange(e.target.value)}
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
          <div className="text-2xl font-bold tabular-nums">€{cost}</div>
          <div className="text-xs text-muted-foreground mt-0.5">neformalizēts ieguldījums</div>
        </div>

        {extraPct !== undefined && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">No apstiprinātajiem</div>
            <div className="text-2xl font-bold tabular-nums">{extraPct}%</div>
            <div className="text-xs text-muted-foreground mt-0.5">ir papildu darbs</div>
          </div>
        )}

        {totalHours !== undefined && extraPct === undefined && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">No kopējā laika</div>
            <div className="text-2xl font-bold tabular-nums">
              {totalHours > 0 ? Math.round((extraHours / totalHours) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">ir papildu darbs</div>
          </div>
        )}
      </div>

      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground print:text-gray-400">
        {mode === "monthly" && monthlyStr
          ? `Aprēķins: €${monthlyStr}/mēn ÷ ${WORK_HOURS_PER_MONTH}h × ${extraHours}h papildu darba = €${cost}.`
          : `Aprēķins: €${hourlyStr}/h × ${extraHours}h papildu darba = €${cost}.`}{" "}
        Nospiediet ⚙ lai mainītu likmi.
      </p>
    </div>
  );
}
