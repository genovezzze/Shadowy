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
};

type ClientInput = {
  id: string;
  name: string;
  freeMinutesPerMonth: number | null;
};

export function buildClientMatrix(
  entries: EntryInput[],
  clients: ClientInput[],
): { rows: MatrixClientRow[]; employees: MatrixEmployee[] } {
  const clientById = new Map(clients.map((c) => [c.id, c]));
  const clientByNorm = new Map(clients.map((c) => [normalizeClientName(c.name), c]));

  // clientKey → { empId → minutes }
  const byClientEmp = new Map<string, Map<string, number>>();
  const clientMeta = new Map<string, { name: string; id: string; freeMinutes: number | null }>();
  const empNames = new Map<string, string>();

  for (const e of entries) {
    if (!e.clientId && !e.clientName) continue;

    let key: string;
    let meta: { name: string; id: string; freeMinutes: number | null };

    if (e.clientId) {
      key = e.clientId;
      const c = clientById.get(e.clientId);
      meta = {
        id: e.clientId,
        name: c?.name ?? e.clientName ?? "?",
        freeMinutes: c?.freeMinutesPerMonth ?? null,
      };
    } else {
      const norm = normalizeClientName(e.clientName!);
      const c = clientByNorm.get(norm);
      key = c ? c.id : `name:${norm}`;
      meta = {
        id: key,
        name: c?.name ?? e.clientName!,
        freeMinutes: c?.freeMinutesPerMonth ?? null,
      };
    }

    if (!byClientEmp.has(key)) {
      byClientEmp.set(key, new Map());
      clientMeta.set(key, meta);
    }
    const empMap = byClientEmp.get(key)!;
    empMap.set(e.employeeId, (empMap.get(e.employeeId) ?? 0) + e.durationMinutes);
    empNames.set(e.employeeId, e.employeeName);
  }

  const rows: MatrixClientRow[] = [];
  for (const [key, empMap] of byClientEmp) {
    const meta = clientMeta.get(key)!;
    const total = [...empMap.values()].reduce((s, v) => s + v, 0);
    const overrun =
      meta.freeMinutes !== null ? Math.max(0, total - meta.freeMinutes) : 0;
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
