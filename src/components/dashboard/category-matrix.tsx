"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Maximize2, X } from "lucide-react";
import { Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLE_CARD_LABEL, APPLE_FILL, APPLE_SEPARATOR, METRIC_SURFACE, QUIET_LABEL, TINT_FILL, TINT_TILE } from "@/components/dashboard/apple";

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
                      <span className="select-none text-xs text-muted-foreground/25">-</span>
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

interface MatrixListProps {
  rows: MatrixAxis[];
  cols: MatrixAxis[];
  minutes: Record<string, Record<string, number>>;
  /** Show at most this many columns per category; the rest fold into "+N". */
  maxItems?: number;
}

/**
 * Phones get the matrix as a list: each category with its non-empty columns,
 * largest first, as thin bars. No sideways scrolling, nothing hidden behind a
 * sticky column.
 */
function MatrixList({ rows, cols, minutes, maxItems }: MatrixListProps) {
  return (
    <div className="space-y-4">
      {rows.map((r) => {
        const items = cols
          .map((c) => ({ col: c, min: minutes[r.key]?.[c.key] ?? 0 }))
          .filter((x) => x.min > 0)
          .sort((a, b) => b.min - a.min);
        if (items.length === 0) return null;
        const total = items.reduce((s, x) => s + x.min, 0);
        const top = items[0].min;
        const shown = maxItems ? items.slice(0, maxItems) : items;
        const rest = items.length - shown.length;
        return (
          <div key={r.key}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="min-w-0 text-[14px] font-medium leading-snug">{r.label}</span>
              <span className="shrink-0 text-[13px] font-semibold tabular-nums">{fmtHours(total)}</span>
            </div>
            <div className="space-y-1.5">
              {shown.map(({ col, min }) => (
                <div key={col.key} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-[13px] text-muted-foreground" title={col.label}>
                    {col.label}
                  </span>
                  <div className={cn("h-1.5 flex-1 overflow-hidden rounded-full", APPLE_FILL)}>
                    <div className={cn("h-full rounded-full", TINT_FILL.blue)} style={{ width: `${(min / top) * 100}%` }} />
                  </div>
                  <span className="w-12 shrink-0 text-right text-[13px] tabular-nums">{fmtHours(min)}</span>
                </div>
              ))}
              {rest > 0 && <div className="text-[12px] text-muted-foreground">+{rest} vēl</div>}
            </div>
          </div>
        );
      })}
    </div>
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
      <div className={cn(METRIC_SURFACE, "overflow-hidden")}>
        <div className="p-5">
          <h2 className={cn(APPLE_CARD_LABEL, TINT_TILE.neutral, QUIET_LABEL)}>
            <Grid3x3 />
            {title}
          </h2>
          <p className="mb-4 mt-2 text-[13px] text-muted-foreground">{description}</p>
          <div className="sm:hidden">
            <MatrixList rows={visibleRows} cols={cols} minutes={minutes} maxItems={3} />
          </div>
          <div className="hidden overflow-x-auto sm:block">
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
            <p className="mt-2 text-[13px] text-muted-foreground">
              +{hiddenRowCount} vēl kategorijas
            </p>
          )}
          <div className="mt-3 hidden sm:block">
            <Legend />
          </div>
        </div>
        {hasMore && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 border-t text-[14px] font-medium text-[#007AFF] transition-colors hover:bg-black/[0.03] dark:text-[#0A84FF] dark:hover:bg-white/[0.04]",
              APPLE_SEPARATOR
            )}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            {`Skatīt visu - ${rows.length} kategorijas × ${cols.length}${unit ? ` ${unit}` : ""}`}
          </button>
        )}
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-card focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[92vh] sm:w-[96vw] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:border sm:border-border sm:shadow-2xl">
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
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:hidden">
              <MatrixList rows={rows} cols={cols} minutes={minutes} />
            </div>
            <div className="hidden flex-1 overflow-auto px-2 py-1 sm:block">
              <MatrixTable
                rows={rows}
                cols={cols}
                allCols={cols}
                minutes={minutes}
                hiddenCount={0}
              />
            </div>
            <div className="hidden border-t border-border/40 bg-muted/10 px-5 py-2.5 sm:block">
              <Legend />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
