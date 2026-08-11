import { buildClientLookup, normalizeClientName } from "./client-name";

export type MatrixEmployee = { id: string; name: string };

export type MatrixClientRow = {
  clientId: string;
  clientName: string;
  freeMinutes: number | null;
  totalMinutes: number;
  overrunMinutes: number;
  /**
   * The total split by calendar month, newest last. The limit is monthly, so a
   * total spanning several months cannot be compared against it directly —
   * this is what makes "1.8h over a 1h limit, yet OK" explainable.
   */
  monthlyMinutes: { month: string; minutes: number }[];
  byEmployee: Record<string, number>; // employeeId → minutes
  /**
   * Normalized name plus every normalized alias, space separated. Lets the UI
   * find "Ventspils Kērlinga Klubs" by typing "VKK" or "kerlinga" — normalizing
   * both sides folds diacritics and whitespace, and normalized values never
   * contain a space, so a query can never match across the separator.
   */
  searchKey: string;
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
  /** Registered alternative spellings; see {@link buildClientLookup}. */
  aliases?: { normalized: string }[];
};

export function buildClientMatrix(
  entries: EntryInput[],
  clients: ClientInput[],
  options: { resetLimitMonthly?: boolean } = {},
): { rows: MatrixClientRow[]; employees: MatrixEmployee[] } {
  const clientById = new Map(clients.map((c) => [c.id, c]));
  const clientByNorm = buildClientLookup(clients);

  // clientKey → { empId → minutes }
  const byClientEmp = new Map<string, Map<string, number>>();
  const byClientMonth = new Map<string, Map<string, number>>();
  const clientMeta = new Map<string, ClientInput>();
  const empNames = new Map<string, string>();

  for (const e of entries) {
    if (!e.clientId && !e.clientName) continue;

    // Entries can outlive a deleted client, and a free-typed name is included
    // only when it resolves to a registered client (directly or via an alias).
    // Neither an orphaned clientId nor a value such as "Visi klienti" may
    // become a standalone matrix row.
    const c = e.clientId
      ? clientById.get(e.clientId)
      : clientByNorm.get(normalizeClientName(e.clientName!));
    if (!c) continue;

    const key = c.id;
    if (!byClientEmp.has(key)) {
      byClientEmp.set(key, new Map());
      clientMeta.set(key, c);
    }
    const empMap = byClientEmp.get(key)!;
    empMap.set(e.employeeId, (empMap.get(e.employeeId) ?? 0) + e.durationMinutes);
    if (options.resetLimitMonthly && !e.workDate) {
      throw new Error("workDate is required for all-time client limit calculations");
    }
    if (e.workDate) {
      const date = e.workDate;
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
    const freeMinutes = meta.freeMinutesPerMonth;
    const total = [...empMap.values()].reduce((s, v) => s + v, 0);
    const monthMinutes = [...(byClientMonth.get(key)?.values() ?? [])];
    const overrun = freeMinutes === null
      ? 0
      : options.resetLimitMonthly
        ? monthMinutes.reduce(
            (sum, minutes) => sum + Math.max(0, minutes - freeMinutes),
            0,
          )
        : Math.max(0, total - freeMinutes);
    const byEmployee: Record<string, number> = {};
    for (const [eid, min] of empMap) byEmployee[eid] = min;
    rows.push({
      clientId: meta.id,
      clientName: meta.name,
      freeMinutes,
      totalMinutes: total,
      overrunMinutes: overrun,
      monthlyMinutes: [...(byClientMonth.get(key) ?? new Map())]
        .map(([month, minutes]) => ({ month, minutes }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      byEmployee,
      searchKey: [
        normalizeClientName(meta.name),
        ...(meta.aliases ?? []).map((a) => a.normalized),
      ].join(" "),
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
