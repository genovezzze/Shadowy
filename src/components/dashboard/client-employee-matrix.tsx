"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Maximize2, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MatrixClientRow, MatrixEmployee } from "@/lib/client-matrix";
import type { ClientMonthOption } from "@/lib/client-month";
import { ClientMonthDropdown } from "@/components/dashboard/client-month-selector";

function overrunEur(minutes: number, rateEur: number): number {
  return Math.round((minutes / 60) * rateEur);
}

const MAX_EMP_COLS = 8;
const PREVIEW_ROWS = 5;

function cellClasses(minutes: number, rowMax: number, overLimit: boolean): string {
  if (!minutes || !rowMax) return "";
  const r = minutes / rowMax;
  if (overLimit) {
    if (r < 0.33) return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    if (r < 0.66) return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200";
    return "bg-amber-200 text-amber-900 dark:bg-amber-800/60 dark:text-amber-100";
  }
  if (r < 0.25) return "bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300";
  if (r < 0.5)  return "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200";
  if (r < 0.75) return "bg-teal-200 text-teal-900 dark:bg-teal-800/50 dark:text-teal-100";
  return "bg-teal-300 text-teal-950 dark:bg-teal-700/60 dark:text-teal-50";
}

interface MatrixTableProps {
  rows: MatrixClientRow[];
  employees: MatrixEmployee[];
  hiddenCount: number;
  rateEur: number;
  compact?: boolean;
}

function MatrixTable({ rows, employees, hiddenCount, rateEur, compact }: MatrixTableProps) {
  const cellPad = compact ? "px-2 py-1.5" : "px-2 py-3";
  const namePad = compact ? "px-3 py-1.5" : "px-5 py-3";
  const numPad = compact ? "px-3 py-1.5" : "px-4 py-3";
  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <table className={`w-full border-separate border-spacing-0 ${textSize}`}>
      <thead>
        <tr className="border-b border-border bg-muted">
          <th className={`${namePad} sticky left-0 top-0 z-40 border-b border-border bg-muted text-left text-xs font-medium text-muted-foreground ${compact ? "w-28" : "w-36"}`}>
            Klients
          </th>
          {employees.map((emp) => (
            <th
              key={emp.id}
              className={`${cellPad} sticky top-0 z-30 border-b border-border bg-muted text-center text-xs font-medium text-muted-foreground ${compact ? "min-w-[52px]" : "min-w-[68px]"}`}
            >
              <span className="block truncate max-w-[80px] mx-auto" title={emp.name}>
                {emp.name.split(" ")[0]}
              </span>
            </th>
          ))}
          {hiddenCount > 0 && (
            <th className={`${cellPad} sticky top-0 z-30 border-b border-border bg-muted text-center text-xs text-muted-foreground/50`}>
              +{hiddenCount}
            </th>
          )}
          <th className={`${numPad} sticky top-0 z-30 border-b border-border bg-muted text-right text-xs font-medium text-muted-foreground`}>
            Kopā
          </th>
          {!compact && (
            <th className={`${numPad} sticky top-0 z-30 border-b border-border bg-muted text-right text-xs font-medium text-muted-foreground`}>
              Limits
            </th>
          )}
          <th className={`${numPad} sticky top-0 z-30 border-b border-border bg-muted text-right text-xs font-medium text-muted-foreground`}>
            Statuss
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((row) => {
          const overLimit = row.overrunMinutes > 0;
          const rowMax = Math.max(
            ...employees.map((e) => row.byEmployee[e.id] ?? 0),
            1,
          );
          return (
            <tr
              key={row.clientId}
              className={`transition-colors hover:bg-muted/20 ${overLimit ? "bg-amber-500/[0.02]" : ""}`}
            >
              <td
                className={`${namePad} sticky left-0 z-10 max-w-[140px] bg-inherit font-medium hover:z-50`}
              >
                <div className="group relative min-w-0">
                  {row.clientId.startsWith("name:") ? (
                    <span className="block truncate">{row.clientName}</span>
                  ) : (
                    <Link href={`/manager/clients/${row.clientId}`} className="block truncate hover:underline underline-offset-4">
                      {row.clientName}
                    </Link>
                  )}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-max max-w-72 whitespace-normal rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-xl group-hover:block"
                  >
                    {row.clientName}
                  </span>
                </div>
              </td>
              {employees.map((emp) => {
                const min = row.byEmployee[emp.id] ?? 0;
                const cls = cellClasses(min, rowMax, overLimit);
                return (
                  <td key={emp.id} className={`${cellPad} text-center`}>
                    {min > 0 ? (
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-xs tabular-nums font-medium ${cls}`}
                      >
                        {Math.round((min / 60) * 10) / 10}h
                      </span>
                    ) : (
                      <span className="text-muted-foreground/25 text-xs select-none">-</span>
                    )}
                  </td>
                );
              })}
              {hiddenCount > 0 && (
                <td className={`${cellPad} text-center text-muted-foreground/25 text-xs`}>…</td>
              )}
              <td className={`${numPad} text-right text-xs tabular-nums font-medium`}>
                {Math.round((row.totalMinutes / 60) * 10) / 10}h
              </td>
              {!compact && (
                <td className={`${numPad} text-right text-xs tabular-nums text-muted-foreground`}>
                  {row.freeMinutes !== null
                    ? `${Math.round((row.freeMinutes / 60) * 10) / 10}h/mēn.`
                    : "∞"}
                </td>
              )}
              <td className={`${numPad} text-right`}>
                {overLimit ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 tabular-nums whitespace-nowrap">
                    <AlertTriangle className="h-3 w-3" />
                    +{Math.round((row.overrunMinutes / 60) * 10) / 10}h
                    {!compact && (
                      <span className="font-normal text-amber-500/70">
                        · −€{overrunEur(row.overrunMinutes, rateEur)}
                      </span>
                    )}
                  </span>
                ) : row.freeMinutes !== null ? (
                  <span className="text-xs text-emerald-500 font-medium">OK</span>
                ) : (
                  <span className="text-xs text-muted-foreground/30">-</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1">
          {(["bg-teal-50", "bg-teal-100", "bg-teal-200", "bg-teal-300"] as const).map((c, i) => (
            <div key={i} className={`h-2.5 w-2.5 rounded-sm ${c} dark:opacity-60`} />
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground">
          klients ietilpst limitā - maz → daudz stundu
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1">
          {(["bg-amber-50", "bg-amber-100", "bg-amber-200", "bg-amber-800/60"] as const).map((c, i) => (
            <div key={i} className={`h-2.5 w-2.5 rounded-sm ${c} dark:opacity-60`} />
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground">
          klients pārsniedz limitu - jo tumšāks, jo lielāka daļa no darbinieka laika
        </span>
      </div>
    </div>
  );
}

interface ClientEmployeeMatrixProps {
  rows: MatrixClientRow[];
  employees: MatrixEmployee[];
  hourlyRateEur?: number;
  monthLabel: string;
  detailEventName?: string;
  selectedMonth: string;
  monthOptions: ClientMonthOption[];
}

export function ClientEmployeeMatrix({
  rows,
  employees,
  hourlyRateEur = 20,
  monthLabel,
  detailEventName,
  selectedMonth,
  monthOptions,
}: ClientEmployeeMatrixProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!detailEventName) return;
    const openDetails = () => setOpen(true);
    window.addEventListener(detailEventName, openDetails);
    return () => window.removeEventListener(detailEventName, openDetails);
  }, [detailEventName]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.clientName.toLowerCase().includes(q));
  }, [rows, query]);

  if (!rows.length || !employees.length) return null;

  const visibleEmps = employees.slice(0, MAX_EMP_COLS);
  const hiddenCount = employees.length - visibleEmps.length;
  const overrunCount = rows.filter((r) => r.overrunMinutes > 0).length;
  const totalOverrunEur = rows.reduce((s, r) => s + overrunEur(r.overrunMinutes, hourlyRateEur), 0);
  const previewRows = rows.slice(0, PREVIEW_ROWS);
  const remainingCount = rows.length - previewRows.length;

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2">
          {overrunCount > 0 ? (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs text-muted-foreground">
                {overrunCount} {overrunCount === 1 ? "klients pārsniedz" : "klienti pārsniedz"} mēneša limitu
                {totalOverrunEur > 0 && ` · kopā −€${totalOverrunEur}`}
                {` · ${monthLabel}`}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">{rows.length} klienti</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <MatrixTable rows={previewRows} employees={visibleEmps} hiddenCount={hiddenCount} rateEur={hourlyRateEur} compact />
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 border-t border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
        >
          <Maximize2 className="h-4 w-4" />
          {remainingCount > 0 ? `Skatīt visus ${rows.length} klientus pilnā skatā` : "Atvērt pilnā skatā"}
        </button>
      </Card>

      <Dialog.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[92vh] w-[96vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl focus:outline-none">
            <div className="relative z-40 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-5 py-3">
              <div className="min-w-0">
                <Dialog.Title className="text-sm font-semibold">
                  Noslodze pa darbiniekiem
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">
                  {monthLabel} · visi darbinieki un klienti ({employees.length} darbinieki · {rows.length} klienti)
                  {totalOverrunEur > 0 && ` · kopā pārsniegums −€${totalOverrunEur}`}
                </Dialog.Description>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ClientMonthDropdown selectedMonth={selectedMonth} options={monthOptions} compact />
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Meklēt klientu..."
                    className="h-8 w-48 pl-8 text-xs sm:w-64"
                  />
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Aizvērt"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>
            </div>
            <div className="relative z-0 min-h-0 flex-1 isolate overflow-auto bg-card">
              {filteredRows.length > 0 ? (
                <MatrixTable rows={filteredRows} employees={employees} hiddenCount={0} rateEur={hourlyRateEur} />
              ) : (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Nav klientu, kas atbilst meklējumam &ldquo;{query}&rdquo;.
                </p>
              )}
            </div>
            <div className="relative z-40 shrink-0 border-t border-border/40 bg-card px-5 py-2.5">
              <Legend />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
