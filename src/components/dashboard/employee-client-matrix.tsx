"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import type { MatrixClientRow, MatrixEmployee } from "@/lib/client-matrix";

function hours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

/** Emerald heat fill scaled to the busiest cell in the row. */
function cellStyle(minutes: number, rowMax: number): React.CSSProperties | undefined {
  if (!minutes || !rowMax) return undefined;
  const r = minutes / rowMax;
  const alpha = 0.14 + r * 0.42; // 0.14 → 0.56
  return { backgroundColor: `rgba(52, 211, 153, ${alpha.toFixed(2)})` };
}

export type ClientAssignment = { clientId: string; clientName: string; employeeId: string };

interface EmployeeClientMatrixProps {
  rows: MatrixClientRow[];
  employees: MatrixEmployee[];
  monthLabel: string;
  /** Client ⇄ employee assignments, so a worker's clients still appear even
   * with no logged hours yet. */
  assignments?: ClientAssignment[];
}

/**
 * Employee-first view of the client matrix: pick one worker, several, or all,
 * and see which clients they work for and how many hours on each. Clients the
 * selected workers do not touch are still listed with a dash, so the full
 * client picture stays visible.
 */
export function EmployeeClientMatrix({ rows, employees, monthLabel, assignments = [] }: EmployeeClientMatrixProps) {
  // Empty selection = nothing chosen yet; the matrix stays collapsed until the
  // user picks at least one worker (or "Visi darbinieki").
  const [selected, setSelected] = useState<string[]>([]);
  const chosen = selected.length > 0;

  const activeEmployees = useMemo(
    () => employees.filter((e) => selected.includes(e.id)),
    [employees, selected],
  );

  const clientRows = useMemo(() => {
    // Clients assigned to any of the selected workers - shown even at 0h.
    const assignedIds = new Set<string>();
    const assignedNames = new Map<string, string>();
    for (const a of assignments) {
      if (selected.includes(a.employeeId)) {
        assignedIds.add(a.clientId);
        assignedNames.set(a.clientId, a.clientName);
      }
    }

    const used = rows.map((r) => {
      const perEmployee = activeEmployees.map((e) => r.byEmployee[e.id] ?? 0);
      const total = perEmployee.reduce((s, v) => s + v, 0);
      const rowMax = Math.max(...perEmployee, 1);
      return { clientId: r.clientId, clientName: r.clientName, perEmployee, total, rowMax };
    });

    // Show a client if the selected workers logged time on it, or it is one of
    // their assigned clients (even with nothing logged yet).
    const shown = used.filter((r) => r.total > 0 || assignedIds.has(r.clientId));

    // Assigned clients that have no entries at all are absent from `rows`.
    const presentIds = new Set(rows.map((r) => r.clientId));
    const extra = [...assignedIds]
      .filter((id) => !presentIds.has(id))
      .map((id) => ({
        clientId: id,
        clientName: assignedNames.get(id) ?? "—",
        perEmployee: activeEmployees.map(() => 0),
        total: 0,
        rowMax: 1,
      }));

    return [...shown, ...extra].sort((a, b) => b.total - a.total);
  }, [rows, activeEmployees, assignments, selected]);

  const employeeTotals = activeEmployees.map((_, i) =>
    clientRows.reduce((s, r) => s + r.perEmployee[i], 0),
  );
  const grandTotal = employeeTotals.reduce((s, v) => s + v, 0);
  const activeClientCount = clientRows.filter((r) => r.total > 0).length;
  const unusedClientCount = clientRows.length - activeClientCount;

  if (employees.length === 0) return null;

  const selector = (
    <div className="w-full sm:w-64">
      <MultiSelect
        options={employees.map((e) => ({ value: e.id, label: e.name }))}
        value={selected}
        onChange={setSelected}
        placeholder="Izvēlēties darbinieku..."
        allLabel="Visi darbinieki"
        searchPlaceholder="Meklēt darbinieku..."
      />
    </div>
  );

  // ── Collapsed prompt ──
  if (!chosen) {
    return (
      <Card className="relative z-30 mb-8 p-5">
        <div className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:justify-between sm:py-2 sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Darbinieku klienti</div>
              <p className="text-xs text-muted-foreground">
                Izvēlieties darbinieku, lai redzētu viņa klientus un nostrādātās stundas.
              </p>
            </div>
          </div>
          {selector}
        </div>
      </Card>
    );
  }

  // ── Expanded matrix ──
  return (
    <Card className="mb-8 overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>
            {selected.length === employees.length
              ? `Visi darbinieki (${employees.length})`
              : `Izvēlēti: ${activeEmployees.length}`}
            {` · ${activeClientCount} klienti`}
            {unusedClientCount > 0 && ` · ${unusedClientCount} bez stundām`}
            {` · ${monthLabel}`}
          </span>
        </div>
        {selector}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 border-b border-border bg-card px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Klients
              </th>
              {activeEmployees.map((e) => (
                <th
                  key={e.id}
                  className="min-w-[64px] border-b border-border bg-card px-2 py-2.5 text-center text-xs font-medium text-muted-foreground"
                >
                  <span className="block truncate" title={e.name}>
                    {e.name.split(" ")[0]}
                  </span>
                </th>
              ))}
              <th className="border-b border-border bg-card px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                Kopā
              </th>
            </tr>
          </thead>
          <tbody>
            {clientRows.map((r, idx) => (
              <tr
                key={r.clientId}
                className={`transition-colors hover:bg-muted/30 ${idx % 2 ? "bg-muted/[0.04]" : ""} ${r.total === 0 ? "opacity-45" : ""}`}
              >
                <td className="sticky left-0 z-10 max-w-[170px] truncate border-b border-border/40 bg-inherit px-4 py-2.5 font-medium">
                  {r.clientName}
                </td>
                {r.perEmployee.map((min, i) => (
                  <td key={i} className="border-b border-border/40 px-2 py-2 text-center">
                    {min > 0 ? (
                      <span
                        className="inline-block min-w-[42px] rounded-md px-1.5 py-1 text-xs font-medium tabular-nums text-emerald-50"
                        style={cellStyle(min, r.rowMax)}
                      >
                        {hours(min)}h
                      </span>
                    ) : (
                      <span className="select-none text-xs text-muted-foreground/25">-</span>
                    )}
                  </td>
                ))}
                <td className="border-b border-border/40 px-4 py-2.5 text-right text-xs font-semibold tabular-nums text-emerald-400">
                  {r.total > 0 ? `${hours(r.total)}h` : <span className="text-muted-foreground/30">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/40">
              <td className="sticky left-0 z-10 bg-muted/40 px-4 py-3 text-xs font-semibold">
                Kopā
              </td>
              {employeeTotals.map((min, i) => (
                <td key={i} className="px-2 py-3 text-center text-xs font-semibold tabular-nums">
                  {hours(min)}h
                </td>
              ))}
              <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-emerald-400">
                {hours(grandTotal)}h
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
