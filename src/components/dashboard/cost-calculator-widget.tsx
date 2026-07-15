"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, Settings2, TrendingUp } from "lucide-react";
import { formatDurationLV } from "@/lib/utils";

const LV_DAYS_SHORT = ["Pirm", "Otr", "Tre", "Ceturt", "Piekt", "Sest", "Svētd"];

function mondayKey(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // 0 = Monday
  return new Date(d.getTime() - dow * 86400000).toISOString().slice(0, 10);
}

function dateLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function weekdayShort(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return LV_DAYS_SHORT[(d.getUTCDay() + 6) % 7];
}

function weekRangeLabel(mondayStr: string): string {
  const start = new Date(`${mondayStr}T12:00:00Z`);
  const end = new Date(start.getTime() + 6 * 86400000);
  return `${dateLabel(start.toISOString().slice(0, 10))}–${dateLabel(end.toISOString().slice(0, 10))}`;
}

interface DailyBreakdownEntry {
  date: string; // YYYY-MM-DD
  minutes: number;
}

interface Props {
  extraMinutes: number;
  dailyBreakdown?: DailyBreakdownEntry[];
}

export function CostCalculatorWidget({ extraMinutes, dailyBreakdown = [] }: Props) {
  const [mode, setMode] = useState<"hourly" | "monthly">("hourly");
  const [hourlyStr, setHourlyStr] = useState("20");
  const [monthlyStr, setMonthlyStr] = useState("");
  const [hoursPerMonth, setHoursPerMonth] = useState("168");
  const [editing, setEditing] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [breakdownView, setBreakdownView] = useState<"day" | "week">("week");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setMode((localStorage.getItem("shadowy_rate_mode") as "hourly" | "monthly") ?? "hourly");
    setHourlyStr(localStorage.getItem("shadowy_hourly_rate") ?? "20");
    setMonthlyStr(localStorage.getItem("shadowy_monthly_rate") ?? "");
    setHoursPerMonth(localStorage.getItem("shadowy_hours_per_month") ?? "168");
  }, []);

  const openPopup = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const POPUP_HEIGHT = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= POPUP_HEIGHT
      ? rect.bottom + 6
      : rect.top - POPUP_HEIGHT - 6;
    setPopupStyle({
      position: "fixed",
      top,
      right: window.innerWidth - rect.right,
      width: 256,
    });
    setEditing((v) => !v);
  }, []);

  useEffect(() => {
    if (!editing) return;
    function onOutside(e: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setEditing(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [editing]);

  function save(updates: Partial<{ mode: string; hourly: string; monthly: string; hpm: string }>) {
    if (updates.mode !== undefined) localStorage.setItem("shadowy_rate_mode", updates.mode);
    if (updates.hourly !== undefined) localStorage.setItem("shadowy_hourly_rate", updates.hourly);
    if (updates.monthly !== undefined) localStorage.setItem("shadowy_monthly_rate", updates.monthly);
    if (updates.hpm !== undefined) localStorage.setItem("shadowy_hours_per_month", updates.hpm);
  }

  const hpm = parseFloat(hoursPerMonth) || 168;
  const effectiveHourly =
    mode === "hourly"
      ? parseFloat(hourlyStr) || 0
      : (parseFloat(monthlyStr) || 0) / hpm;

  const hours = Math.round((extraMinutes / 60) * 10) / 10;
  const cost = Math.round(hours * effectiveHourly);
  const derivedHourly = Math.round(effectiveHourly * 10) / 10;

  const rateLabel =
    mode === "monthly" && monthlyStr
      ? `€${monthlyStr}/mēn → €${derivedHourly}/h`
      : `€${hourlyStr}/h`;

  const breakdownRows = useMemo(() => {
    const clean = dailyBreakdown.filter((d) => d.minutes > 0);
    if (breakdownView === "day") {
      return [...clean]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 30)
        .map((d) => ({
          key: d.date,
          label: `${weekdayShort(d.date)}, ${dateLabel(d.date)}`,
          minutes: d.minutes,
        }));
    }
    const byWeek = new Map<string, number>();
    for (const d of clean) {
      const wk = mondayKey(d.date);
      byWeek.set(wk, (byWeek.get(wk) ?? 0) + d.minutes);
    }
    return Array.from(byWeek.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 12)
      .map(([wk, minutes]) => ({ key: wk, label: weekRangeLabel(wk), minutes }));
  }, [dailyBreakdown, breakdownView]);

  const maxBreakdownMinutes = Math.max(1, ...breakdownRows.map((r) => r.minutes));

  if (extraMinutes === 0) return null;

  return (
    <>
      <Card className="relative mb-8 border-amber-500/20 bg-amber-500/[0.03] p-0 dark:border-amber-500/15">
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

          <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
            {breakdownRows.length > 0 && (
              <button
                type="button"
                onClick={() => setDetailsOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <span>Detalizēti</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
              </button>
            )}
            <button
              ref={buttonRef}
              type="button"
              onClick={openPopup}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>{mode === "monthly" && monthlyStr ? `€${monthlyStr}/mēn` : `€${hourlyStr}/h`}</span>
            </button>
          </div>
        </div>

        {detailsOpen && breakdownRows.length > 0 && (
          <div className="border-t border-amber-500/20 p-5 pt-4 dark:border-amber-500/15">
            <div className="mb-3 flex overflow-hidden rounded-md border border-border text-xs w-fit">
              {(["week", "day"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBreakdownView(v)}
                  className={`px-3 py-1.5 text-center transition-colors ${
                    breakdownView === v
                      ? "bg-foreground text-background font-medium"
                      : "bg-background text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {v === "week" ? "Pa nedēļām" : "Pa dienām"}
                </button>
              ))}
            </div>

            <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {breakdownRows.map((row) => {
                const rowHours = Math.round((row.minutes / 60) * 10) / 10;
                const rowCost = Math.round(rowHours * effectiveHourly);
                const barPct = Math.round((row.minutes / maxBreakdownMinutes) * 100);
                return (
                  <div key={row.key} className="flex items-center gap-3 text-sm">
                    <span className="w-24 shrink-0 text-muted-foreground">{row.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/60">
                      <div
                        className="h-full rounded-full bg-amber-500/60"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right text-muted-foreground tabular-nums">
                      {formatDurationLV(row.minutes)}
                    </span>
                    <span className="w-16 shrink-0 text-right font-medium tabular-nums">
                      €{rowCost.toLocaleString("de-DE")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {editing && mounted && (
        <div
          ref={popupRef}
          style={popupStyle}
          className="z-[200] rounded-xl border border-border bg-card p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] dark:border-white/[0.12] dark:shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
        >
          <p className="mb-2 text-xs font-medium">Likmes veids</p>

          <div className="mb-3 flex overflow-hidden rounded-md border border-border text-xs">
            {(["hourly", "monthly"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); save({ mode: m }); }}
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
                  onChange={(e) => { setHourlyStr(e.target.value); save({ hourly: e.target.value }); }}
                  className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
                  min="0" step="0.5" autoFocus
                />
                <span className="text-sm text-muted-foreground">/h</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Vidējā mēneša bruto alga</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">€</span>
                  <input
                    type="number"
                    value={monthlyStr}
                    onChange={(e) => { setMonthlyStr(e.target.value); save({ monthly: e.target.value }); }}
                    placeholder="2000"
                    className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
                    min="0" step="50" autoFocus
                  />
                  <span className="text-sm text-muted-foreground">/mēn</span>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Darba stundas mēnesī</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={hoursPerMonth}
                    onChange={(e) => { setHoursPerMonth(e.target.value); save({ hpm: e.target.value }); }}
                    className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
                    min="1" step="1"
                  />
                  <span className="text-sm text-muted-foreground shrink-0">h/mēn</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground/60">
                  21 d. × 8h = 168 · 22 d. × 8h = 176
                </p>
              </div>
              {monthlyStr && (
                <p className="rounded bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                  €{monthlyStr} ÷ {hoursPerMonth}h = <span className="font-medium text-foreground">€{derivedHourly}/h</span>
                </p>
              )}
            </div>
          )}

          <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground/50">
            Komandas vidējā likme. Individuālas — drīzumā.
          </p>
        </div>
      )}
    </>
  );
}
