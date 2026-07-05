"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Settings2 } from "lucide-react";

function loadSettings() {
  if (typeof window === "undefined")
    return { mode: "hourly" as const, hourly: "20", monthly: "", hpm: "168" };
  return {
    mode: (localStorage.getItem("shadowy_rate_mode") as "hourly" | "monthly") ?? "hourly",
    hourly: localStorage.getItem("shadowy_hourly_rate") ?? "20",
    monthly: localStorage.getItem("shadowy_monthly_rate") ?? "",
    hpm: localStorage.getItem("shadowy_hours_per_month") ?? "168",
  };
}

function persist(updates: Partial<{ mode: string; hourly: string; monthly: string; hpm: string }>) {
  if (updates.mode !== undefined) localStorage.setItem("shadowy_rate_mode", updates.mode);
  if (updates.hourly !== undefined) localStorage.setItem("shadowy_hourly_rate", updates.hourly);
  if (updates.monthly !== undefined) localStorage.setItem("shadowy_monthly_rate", updates.monthly);
  if (updates.hpm !== undefined) localStorage.setItem("shadowy_hours_per_month", updates.hpm);
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
  const [hoursPerMonth, setHoursPerMonth] = useState("168");
  const [editing, setEditing] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const s = loadSettings();
    setMode(s.mode);
    setHourlyStr(s.hourly);
    setMonthlyStr(s.monthly);
    setHoursPerMonth(s.hpm);
  }, []);

  const openPopup = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const POPUP_HEIGHT = 320;
    const POPUP_WIDTH = 272;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= POPUP_HEIGHT ? rect.bottom + 6 : rect.top - POPUP_HEIGHT - 6;
    const right = Math.max(8, window.innerWidth - rect.right - POPUP_WIDTH / 2);
    setPopupStyle({ position: "fixed", top, right, width: POPUP_WIDTH });
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

  const hpm = parseFloat(hoursPerMonth) || 168;
  const effectiveHourly =
    mode === "hourly"
      ? parseFloat(hourlyStr) || 0
      : (parseFloat(monthlyStr) || 0) / hpm;

  const derivedHourly = Math.round(effectiveHourly * 10) / 10;
  const cost = Math.round(extraHours * effectiveHourly);

  const rateLabel =
    mode === "monthly" && monthlyStr
      ? `€${monthlyStr}/mēn → €${derivedHourly}/h`
      : `€${hourlyStr}/h`;

  if (!mounted) return null;

  return (
    <>
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
              <span className="text-xs text-muted-foreground/50">({rateLabel})</span>
              <button
                ref={buttonRef}
                type="button"
                onClick={openPopup}
                className="ml-0.5 inline-flex items-center rounded p-0.5 text-muted-foreground/40 transition-colors hover:bg-muted/60 hover:text-muted-foreground print:hidden"
                title="Mainīt likmi"
              >
                <Settings2 className="h-3 w-3" />
              </button>
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
            ? `€${monthlyStr}/mēn ÷ ${hoursPerMonth}h × ${extraHours}h = €${cost}.`
            : `€${hourlyStr}/h × ${extraHours}h papildu darba = €${cost}.`}{" "}
          Nospiediet ⚙ lai mainītu.
        </p>
      </div>

      {editing && (
        <div
          ref={popupRef}
          style={popupStyle}
          className="z-[200] rounded-xl border border-border bg-card p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] dark:border-white/[0.12] dark:shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
        >
          <div className="mb-3 flex overflow-hidden rounded-md border border-border text-xs">
            {(["hourly", "monthly"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); persist({ mode: m }); }}
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
                  onChange={(e) => { setHourlyStr(e.target.value); persist({ hourly: e.target.value }); }}
                  className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
                  min="0" step="0.5" autoFocus
                />
                <span className="text-sm text-muted-foreground">/h</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Mēneša bruto alga</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">€</span>
                  <input
                    type="number"
                    value={monthlyStr}
                    onChange={(e) => { setMonthlyStr(e.target.value); persist({ monthly: e.target.value }); }}
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
                    onChange={(e) => { setHoursPerMonth(e.target.value); persist({ hpm: e.target.value }); }}
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
