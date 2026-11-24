"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHIP_GROUP, chipClass } from "@/components/dashboard/apple";
import { startNavigationLoading } from "@/lib/navigation-loading";
import { DateInput, localToday } from "@/components/ui/date-input";
import { resolveDateRange } from "@/lib/date-range";

const PERIODS = [
  { label: "7 d.", value: "7d" },
  { label: "30 d.", value: "30d" },
  { label: "90 d.", value: "90d" },
  { label: "Viss", value: "all" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Quick ranges inside the calendar popover, by the viewer's local calendar. */
function quickRanges(): { label: string; from: string; to: string }[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const sinceMonday = (now.getDay() + 6) % 7;
  const thisMonday = new Date(y, m, now.getDate() - sinceMonday);
  const lastMonday = new Date(y, m, thisMonday.getDate() - 7);
  const lastSunday = new Date(y, m, thisMonday.getDate() - 1);
  const quarter = Math.floor(m / 3);
  return [
    { label: "Pagājušā nedēļa", from: iso(lastMonday), to: iso(lastSunday) },
    { label: "Šis mēnesis", from: iso(new Date(y, m, 1)), to: localToday() },
    { label: "Pagājušais mēnesis", from: iso(new Date(y, m - 1, 1)), to: iso(new Date(y, m, 0)) },
    { label: "Šis ceturksnis", from: iso(new Date(y, quarter * 3, 1)), to: localToday() },
    { label: "Šis gads", from: iso(new Date(y, 0, 1)), to: localToday() },
    { label: "Pagājušais gads", from: iso(new Date(y - 1, 0, 1)), to: iso(new Date(y - 1, 11, 31)) },
  ];
}

export function PeriodTabs({
  current,
  className,
  apple = false,
}: {
  current: string;
  className?: string;
  /** Pill group look, used on the admin overview. */
  apple?: boolean;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(sp.get("from") ?? "");
  const [to, setTo] = useState(sp.get("to") ?? "");
  const boxRef = useRef<HTMLDivElement>(null);

  const custom = current === "custom" ? resolveDateRange(
    { period: "custom", from: sp.get("from") ?? undefined, to: sp.get("to") ?? undefined },
    { defaultKey: "30d" },
  ) : null;

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      // The date fields render their own calendar inside this box, so a click
      // there stays inside.
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function go(params: URLSearchParams) {
    const qs = params.toString();
    const destination = qs ? `${pathname}?${qs}` : pathname;
    startNavigationLoading(destination);
    router.push(destination);
  }

  function navigate(value: string) {
    const params = new URLSearchParams(sp.toString());
    // Always explicit: some pages default to 30 days when `period` is absent,
    // so dropping it would turn "Viss" back into 30 days.
    params.set("period", value);
    params.delete("from");
    params.delete("to");
    setOpen(false);
    go(params);
  }

  function applyRange(nextFrom: string, nextTo: string) {
    if (!nextFrom || !nextTo) return;
    const params = new URLSearchParams(sp.toString());
    params.set("period", "custom");
    params.set("from", nextFrom <= nextTo ? nextFrom : nextTo);
    params.set("to", nextFrom <= nextTo ? nextTo : nextFrom);
    setFrom(params.get("from")!);
    setTo(params.get("to")!);
    setOpen(false);
    go(params);
  }

  const active = current || "all";
  const tabClass = (isActive: boolean) =>
    apple
      ? cn(chipClass(isActive), "flex-1 justify-center sm:flex-initial")
      : cn(
          "flex-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all duration-150 sm:flex-initial sm:px-4 sm:text-xs",
          isActive
            ? "bg-card text-foreground shadow-sm dark:bg-white/[0.12] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
            : "text-muted-foreground hover:bg-card/60 hover:text-foreground dark:hover:bg-white/[0.06]"
        );

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <div
        data-slot="segmented"
        className={cn(
          apple
            ? CHIP_GROUP
            : "flex items-center gap-0.5 rounded-xl border border-border bg-muted/60 p-1 backdrop-blur-md dark:border-white/[0.09] dark:bg-white/[0.04] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        )}
      >
        {PERIODS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            data-state={active === value ? "active" : "inactive"}
            onClick={() => navigate(value)}
            className={tabClass(active === value)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          aria-expanded={open}
          aria-label="Izvēlēties periodu kalendārā"
          data-state={custom ? "active" : "inactive"}
          onClick={() => setOpen((o) => !o)}
          className={cn(tabClass(!!custom), "gap-1.5", !apple && "inline-flex items-center")}
        >
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span className="tabular-nums">{custom ? custom.badge : "Periods"}</span>
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="Perioda izvēle"
          className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-4 text-foreground shadow-xl"
        >
          <div className="mb-3 flex flex-wrap gap-1.5">
            {quickRanges().map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => applyRange(q.from, q.to)}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                {q.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>No</span>
              <DateInput value={from} onChange={setFrom} max={to || undefined} />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>Līdz</span>
              <DateInput value={to} onChange={setTo} min={from || undefined} align="right" />
            </label>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Atcelt
            </button>
            <button
              type="button"
              disabled={!from || !to}
              onClick={() => applyRange(from, to)}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              Rādīt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
