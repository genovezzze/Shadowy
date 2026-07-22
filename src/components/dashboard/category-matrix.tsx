"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Maximize2, X } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface MatrixAxis {
  key: string;
  label: string;
}

interface CategoryMatrixProps {
  title: string;
  description: string;
  rows: MatrixAxis[];
  cols: MatrixAxis[];
  minutes: Record<string, Record<string, number>>;
  /** Plural noun for the "view all" button, e.g. "klientus". */
  unit?: string;
  /** How many columns to show in the compact preview before collapsing to a "+N". */
  previewCols?: number;
  /** How many rows to show in the compact preview before collapsing. */
  previewRows?: number;
}

function cellClasses(minutes: number, rowMax: number): string {
  if (!minutes || !rowMax) return "";
  const r = minutes / rowMax;
  if (r < 0.25) return "bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300";
  if (r < 0.5) return "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200";
  if (r < 0.75) return "bg-teal-200 text-teal-900 dark:bg-teal-800/50 dark:text-teal-100";
  return "bg-teal-300 text-teal-950 dark:bg-teal-700/60 dark:text-teal-50";
}

function fmtHours(minutes: number): string {
  return `${Math.round((minutes / 60) * 10) / 10}h`;
}

interface MatrixTableProps {
  rows: MatrixAxis[];
  cols: MatrixAxis[];
  allCols: MatrixAxis[];
  minutes: Record<string, Record<string, number>>;
  hiddenCount: number;
  compact?: boolean;
}

function MatrixTable({ rows, cols, allCols, minutes, hiddenCount, compact }: MatrixTableProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th
            className={`sticky left-0 z-10 bg-card px-2 py-2 text-left text-xs font-medium text-muted-foreground ${
              compact ? "w-32" : ""
            }`}
          >
            Kategorija
          </th>
          {cols.map((c) => (
            <th
              key={c.key}
              className={`px-2 py-2 text-center align-bottom text-xs font-medium text-muted-foreground ${
                compact ? "min-w-[60px]" : "min-w-[84px]"
              }`}
            >
              <span
                className={
                  compact
                    ? "mx-auto block max-w-[76px] truncate"
                    : "mx-auto block max-w-[120px] whitespace-normal break-words leading-tight"
                }
                title={c.label}
              >
                {c.label}
              </span>
            </th>
          ))}
          {hiddenCount > 0 && (
            <th className="px-2 py-2 text-center text-xs text-muted-foreground/50">+{hiddenCount}</th>
          )}
          <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Kopā</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((r) => {
          // Row colouring is relative to the visible cells; the total spans every client.
          const visibleVals = cols.map((c) => minutes[r.key]?.[c.key] ?? 0);
          const rowMax = Math.max(...visibleVals, 1);
          const rowTotal = allCols.reduce((s, c) => s + (minutes[r.key]?.[c.key] ?? 0), 0);
          if (rowTotal === 0) return null;
          return (
            <tr key={r.key} className="transition-colors hover:bg-muted/20">
              <td
                className={`sticky left-0 z-10 bg-card px-2 py-2 font-medium ${
                  compact
                    ? "truncate max-w-[140px]"
                    : "max-w-[200px] whitespace-normal break-words leading-tight"
                }`}
                title={r.label}
              >
                {r.label}
              </td>
              {cols.map((c) => {
                const min = minutes[r.key]?.[c.key] ?? 0;
                const cls = cellClasses(min, rowMax);
                return (
                  <td key={c.key} className="px-2 py-2 text-center">
                    {min > 0 ? (
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-xs tabular-nums font-medium ${cls}`}
                      >
                        {fmtHours(min)}
                      </span>
                    ) : (
                      <span className="select-none text-xs text-muted-foreground/25">—</span>
                    )}
                  </td>
                );
              })}
              {hiddenCount > 0 && (
                <td className="px-2 py-2 text-center text-xs text-muted-foreground/25">…</td>
              )}
              <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums">
                {fmtHours(rowTotal)}
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
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {(["bg-teal-50", "bg-teal-100", "bg-teal-200", "bg-teal-300"] as const).map((c, i) => (
          <div key={i} className={`h-2.5 w-2.5 rounded-sm ${c} dark:opacity-60`} />
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground">
        maz → daudz (relatīvi katrai kategorijai)
      </span>
    </div>
  );
}

export function CategoryMatrix({
  title,
  description,
  rows,
  cols,
  minutes,
  unit,
  previewCols = 5,
  previewRows = 5,
}: CategoryMatrixProps) {
  const [open, setOpen] = useState(false);

  if (rows.length === 0 || cols.length === 0) return null;

  const visibleCols = cols.slice(0, previewCols);
  const hiddenCount = cols.length - visibleCols.length;
  const visibleRows = rows.slice(0, previewRows);
  const hiddenRowCount = rows.length - visibleRows.length;
  const hasMore = hiddenCount > 0 || hiddenRowCount > 0;

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="p-5">
          <h2 className="text-sm font-semibold mb-1">{title}</h2>
          <p className="text-xs text-muted-foreground mb-4">{description}</p>
          <div className="overflow-x-auto">
            <MatrixTable
              rows={visibleRows}
              cols={visibleCols}
              allCols={cols}
              minutes={minutes}
              hiddenCount={hiddenCount}
              compact
            />
          </div>
          {hiddenRowCount > 0 && (
            <p className="mt-2 text-[11px] text-muted-foreground/60">
              +{hiddenRowCount} vēl kategorijas
            </p>
          )}
          <div className="mt-3">
            <Legend />
          </div>
        </div>
        {hasMore && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-center gap-2 border-t border-teal-500/30 bg-teal-500/15 px-4 py-3.5 text-sm font-semibold text-teal-600 transition-colors hover:bg-teal-500/25 dark:text-teal-300"
          >
            <Maximize2 className="h-4 w-4" />
            {`Skatīt visu — ${rows.length} kategorijas × ${cols.length}${unit ? ` ${unit}` : ""}`}
          </button>
        )}
      </Card>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[92vh] w-[96vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl focus:outline-none">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
              <div className="min-w-0">
                <Dialog.Title className="text-sm font-semibold">{title}</Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">
                  {description}
                  {unit ? ` · ${cols.length} ${unit}` : ""}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Aizvērt"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <div className="flex-1 overflow-auto px-2 py-1">
              <MatrixTable
                rows={rows}
                cols={cols}
                allCols={cols}
                minutes={minutes}
                hiddenCount={0}
              />
            </div>
            <div className="border-t border-border/40 bg-muted/10 px-5 py-2.5">
              <Legend />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
