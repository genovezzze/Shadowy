import { normalizeClientName } from "./client-name";

export type MatrixEmployee = { id: string; name: string };

export type MatrixClientRow = {
  clientId: string;
  clientName: string;
  freeMinutes: number | null;
  totalMinutes: number;
  overrunMinutes: number;
  byEmployee: Record<string, number>; // employeeId → minutes
};

type EntryInput = {
  clientId: string | null;
  clientName: string | null;
  employeeId: string;
  employeeName: string;
  durationMinutes: number;
  workDate?: Date;
};

type ClientInput = {
  id: string;
  name: string;
  freeMinutesPerMonth: number | null;
};

export function buildClientMatrix(
  entries: EntryInput[],
  clients: ClientInput[],
  options: { resetLimitMonthly?: boolean } = {},
): { rows: MatrixClientRow[]; employees: MatrixEmployee[] } {
  const clientById = new Map(clients.map((c) => [c.id, c]));
  const clientByNorm = new Map(clients.map((c) => [normalizeClientName(c.name), c]));

  // clientKey → { empId → minutes }
  const byClientEmp = new Map<string, Map<string, number>>();
  const byClientMonth = new Map<string, Map<string, number>>();
  const clientMeta = new Map<string, { name: string; id: string; freeMinutes: number | null }>();
  const empNames = new Map<string, string>();

  for (const e of entries) {
    if (!e.clientId && !e.clientName) continue;

    let key: string;
    let meta: { name: string; id: string; freeMinutes: number | null };

    if (e.clientId) {
      const c = clientById.get(e.clientId);
      // Entries can outlive a deleted client. Do not resurrect that stale
      // client as a standalone matrix row.
      if (!c) continue;

      key = c.id;
      meta = {
        id: c.id,
        name: c.name,
        freeMinutes: c.freeMinutesPerMonth,
      };
    } else {
      const norm = normalizeClientName(e.clientName!);
      const c = clientByNorm.get(norm);
      // A free-typed name is included only when it resolves to a registered
      // client. Values such as "Visi klienti" must not become fake clients.
      if (!c) continue;

      key = c.id;
      meta = {
        id: c.id,
        name: c.name,
        freeMinutes: c.freeMinutesPerMonth,
      };
    }

    if (!byClientEmp.has(key)) {
      byClientEmp.set(key, new Map());
      clientMeta.set(key, meta);
    }
    const empMap = byClientEmp.get(key)!;
    empMap.set(e.employeeId, (empMap.get(e.employeeId) ?? 0) + e.durationMinutes);
    if (options.resetLimitMonthly) {
      const date = e.workDate;
      if (!date) throw new Error("workDate is required for all-time client limit calculations");
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      if (!byClientMonth.has(key)) byClientMonth.set(key, new Map());
      const monthMap = byClientMonth.get(key)!;
      monthMap.set(monthKey, (monthMap.get(monthKey) ?? 0) + e.durationMinutes);
    }
    empNames.set(e.employeeId, e.employeeName);
  }

  const rows: MatrixClientRow[] = [];
  for (const [key, empMap] of byClientEmp) {
    const meta = clientMeta.get(key)!;
    const total = [...empMap.values()].reduce((s, v) => s + v, 0);
    const overrun = meta.freeMinutes === null
      ? 0
      : options.resetLimitMonthly
        ? [...(byClientMonth.get(key)?.values() ?? [])].reduce(
            (sum, monthMinutes) => sum + Math.max(0, monthMinutes - meta.freeMinutes!),
            0,
          )
        : Math.max(0, total - meta.freeMinutes);
    const byEmployee: Record<string, number> = {};
    for (const [eid, min] of empMap) byEmployee[eid] = min;
    rows.push({
      clientId: meta.id,
      clientName: meta.name,
      freeMinutes: meta.freeMinutes,
      totalMinutes: total,
      overrunMinutes: overrun,
      byEmployee,
    });
  }
  rows.sort((a, b) => b.totalMinutes - a.totalMinutes);

  // Sort employees by their total time across all clients (descending)
  const employees: MatrixEmployee[] = [...empNames.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => {
      const at = rows.reduce((s, r) => s + (r.byEmployee[a.id] ?? 0), 0);
      const bt = rows.reduce((s, r) => s + (r.byEmployee[b.id] ?? 0), 0);
      return bt - at;
    });

  return { rows, employees };
}
