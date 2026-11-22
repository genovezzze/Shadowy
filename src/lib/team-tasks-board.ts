import "server-only";
import type { Role, TaskStatus } from "@prisma/client";
import { prisma } from "./db";
import type { Prisma } from "@prisma/client";
import {
  cellState,
  columnKey,
  daysLate,
  isoDay,
  scopedTaskWhere,
  taskPeople,
  taskScopeForSession,
  type CellState,
} from "./team-tasks";

type BoardSession = { role: Role; organizationId: string; userId: string };

export interface BoardColumn {
  id: string;
  name: string;
}

export interface BoardCell {
  taskId: string;
  status: TaskStatus;
  state: CellState;
  dueDate: string; // YYYY-MM-DD
  originalDueDate: string;
  completedAt: string | null; // ISO
  comment: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
}

export interface BoardRow {
  clientId: string;
  clientName: string;
  responsibleName: string | null;
  note: string | null;
  cells: Record<string, BoardCell>;
}

export interface AttentionItem {
  taskId: string;
  clientId: string;
  clientName: string;
  reportName: string;
  period: string;
  dueDate: string;
  daysLate: number;
  status: TaskStatus;
  assigneeName: string | null;
}

export interface LoadItem {
  userId: string | null;
  name: string;
  open: number;
  done: number;
  overdue: number;
}

export interface ColumnProgress {
  name: string;
  done: number;
  total: number;
  overdue: number;
}

export interface DueDateGroup {
  date: string; // YYYY-MM-DD
  count: number;
  reports: { name: string; count: number }[];
}

export interface PersonOverdue {
  userId: string | null;
  name: string;
  items: AttentionItem[];
}

/** The manager's overview, all computed from the same scoped queries. */
export interface TeamDashboard {
  byColumn: ColumnProgress[];
  upcoming: DueDateGroup[];
  overdueByPerson: PersonOverdue[];
  overdueTotal: number;
  oldestLateDays: number;
  unassigned: number;
  dueThisWeek: number;
}

export interface BoardData {
  columns: BoardColumn[];
  rows: BoardRow[];
  overdue: AttentionItem[];
  dueSoon: AttentionItem[];
  load: LoadItem[];
  totals: { all: number; done: number };
  dashboard: TeamDashboard;
}

const taskInclude = {
  client: {
    select: {
      id: true,
      name: true,
      responsibleUser: { select: { name: true } },
      assignments: { select: { employeeId: true, employee: { select: { name: true } } } },
    },
  },
  reportType: { select: { id: true, name: true, sortOrder: true, ownerUserId: true } },
  assignee: { select: { id: true, name: true } },
} as const;

/**
 * Everything the task sheet shows for one period. Every task query goes
 * through `scopedTaskWhere`, so the assignee filter from the URL can only
 * narrow what the viewer's role already allows.
 */
export async function loadBoard(
  session: BoardSession,
  period: string,
  opts: { today: Date; assigneeId?: string | null },
): Promise<BoardData> {
  // "Show one person": everything that person would see on their own sheet.
  const filter: Prisma.ClientTaskWhereInput = opts.assigneeId
    ? taskScopeForSession({ role: "EMPLOYEE", organizationId: session.organizationId, userId: opts.assigneeId })
    : {};
  const todayIso = isoDay(opts.today);
  const soonLimit = new Date(opts.today.getTime() + 3 * 86_400_000);
  // The dashboard's timeline looks two weeks ahead; the "soon" list keeps 3 days.
  const upcomingLimit = new Date(opts.today.getTime() + 14 * 86_400_000);

  const [tasks, reportTypes, lateTasks, soonTasks] = await Promise.all([
    prisma.clientTask.findMany({
      where: scopedTaskWhere({ ...filter, period }, session),
      include: taskInclude,
    }),
    prisma.reportType.findMany({
      // Firm columns always; personal columns only the viewer's own (others'
      // come in through their tasks when the viewer may see those).
      where: {
        organizationId: session.organizationId,
        active: true,
        OR: [{ ownerUserId: null }, { ownerUserId: session.userId }],
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, sortOrder: true, ownerUserId: true },
    }),
    prisma.clientTask.findMany({
      where: scopedTaskWhere({ ...filter, status: { not: "DONE" }, dueDate: { lt: opts.today } }, session),
      include: taskInclude,
      orderBy: [{ dueDate: "asc" }],
      take: 2000,
    }),
    prisma.clientTask.findMany({
      where: scopedTaskWhere(
        { ...filter, status: { not: "DONE" }, dueDate: { gte: opts.today, lte: upcomingLimit } },
        session,
      ),
      include: taskInclude,
      orderBy: [{ dueDate: "asc" }],
      take: 2000,
    }),
  ]);

  // Columns are merged by name, so a firm "PVN" and an employee's own "PVN"
  // share one column. Firm columns lead, personal ones follow in their order.
  // Switched-off columns that still have tasks this month stay visible.
  const columnMap = new Map<string, { id: string; name: string; rank: number }>();
  const addColumn = (rt: { name: string; sortOrder: number; ownerUserId: string | null }) => {
    const key = columnKey(rt.name);
    const rank = (rt.ownerUserId ? 10_000 : 0) + rt.sortOrder;
    const existing = columnMap.get(key);
    if (!existing || rank < existing.rank) columnMap.set(key, { id: key, name: rt.name, rank });
  };
  reportTypes.forEach(addColumn);
  tasks.forEach((t) => addColumn(t.reportType));
  const columns = Array.from(columnMap.values())
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, "lv"))
    .map((c) => ({ id: c.id, name: c.name }));

  /** "Ilze, Jānis" for a shared task; the owner for a personal column. */
  const sharedNames = (task: (typeof tasks)[number]): string | null => {
    if (task.reportType.ownerUserId || task.client.assignments.length === 0) return task.assignee?.name ?? null;
    const names = new Set<string>();
    if (task.assignee) names.add(task.assignee.name);
    for (const a of task.client.assignments) names.add(a.employee.name);
    return Array.from(names).join(", ");
  };

  const rowsById = new Map<string, BoardRow>();
  for (const task of tasks) {
    let row = rowsById.get(task.clientId);
    if (!row) {
      row = {
        clientId: task.clientId,
        clientName: task.client.name,
        responsibleName: task.client.responsibleUser?.name ?? null,
        note: null,
        cells: {},
      };
      rowsById.set(task.clientId, row);
    }
    const cellKey = columnKey(task.reportType.name);
    // Two tasks in one merged cell (firm and personal "PVN"): keep the open one.
    const taken = row.cells[cellKey];
    if (taken && taken.status !== "DONE") continue;
    row.cells[cellKey] = {
      taskId: task.id,
      status: task.status,
      state: cellState(task, opts.today),
      dueDate: isoDay(task.dueDate),
      originalDueDate: isoDay(task.originalDueDate),
      completedAt: task.completedAt?.toISOString() ?? null,
      comment: task.comment,
      assigneeId: task.assigneeId,
      assigneeName: sharedNames(task),
    };
  }

  const clientIds = Array.from(rowsById.keys());
  if (clientIds.length > 0) {
    const notes = await prisma.clientMonthNote.findMany({
      where: { organizationId: session.organizationId, period, clientId: { in: clientIds } },
      select: { clientId: true, text: true },
    });
    for (const note of notes) {
      const row = rowsById.get(note.clientId);
      if (row) row.note = note.text;
    }
  }

  const rows = Array.from(rowsById.values()).sort((a, b) =>
    a.clientName.localeCompare(b.clientName, "lv"),
  );

  const toItem = (task: (typeof lateTasks)[number]): AttentionItem => ({
    taskId: task.id,
    clientId: task.clientId,
    clientName: task.client.name,
    reportName: task.reportType.name,
    period: task.period,
    dueDate: isoDay(task.dueDate),
    daysLate: daysLate(task, opts.today),
    status: task.status,
    assigneeName: sharedNames(task),
  });

  // Workload per person, alphabetical - a support signal, never a ranking.
  const loadMap = new Map<string, LoadItem>();
  const loadFor = (id: string | null, name: string | null) => {
    const key = id ?? "none";
    let item = loadMap.get(key);
    if (!item) {
      item = { userId: id, name: name ?? "Nav atbildīgā", open: 0, done: 0, overdue: 0 };
      loadMap.set(key, item);
    }
    return item;
  };
  // A shared task counts for each person on it: everyone carries that work.
  const peopleOf = (task: (typeof tasks)[number]) => {
    const names = new Map<string, string>();
    if (task.assignee) names.set(task.assignee.id, task.assignee.name);
    for (const a of task.client.assignments) names.set(a.employeeId, a.employee.name);
    const ids = taskPeople({
      assigneeId: task.assigneeId,
      ownerUserId: task.reportType.ownerUserId,
      clientEmployeeIds: task.client.assignments.map((a) => a.employeeId),
    });
    return ids.length ? ids.map((id) => ({ id, name: names.get(id) ?? null })) : [{ id: null, name: null }];
  };
  for (const task of tasks) {
    for (const person of peopleOf(task)) {
      const item = loadFor(person.id, person.name);
      if (task.status === "DONE") item.done++;
      else item.open++;
    }
  }
  for (const task of lateTasks) {
    for (const person of peopleOf(task)) loadFor(person.id, person.name).overdue++;
  }
  const load = Array.from(loadMap.values()).sort((a, b) => {
    if (a.userId === null) return 1;
    if (b.userId === null) return -1;
    return a.name.localeCompare(b.name, "lv");
  });

  // ── Dashboard ──
  const soonIso = isoDay(soonLimit);
  const weekIso = isoDay(new Date(opts.today.getTime() + 7 * 86_400_000));

  const columnStats = new Map<string, ColumnProgress & { rank: number }>();
  for (const col of columns) {
    columnStats.set(col.id, { name: col.name, done: 0, total: 0, overdue: 0, rank: columnStats.size });
  }
  for (const task of tasks) {
    const stat = columnStats.get(columnKey(task.reportType.name));
    if (!stat) continue;
    stat.total++;
    if (task.status === "DONE") stat.done++;
    else if (isoDay(task.dueDate) < todayIso) stat.overdue++;
  }

  const byDate = new Map<string, Map<string, number>>();
  for (const task of soonTasks) {
    const day = isoDay(task.dueDate);
    if (day < todayIso) continue;
    const reports = byDate.get(day) ?? new Map<string, number>();
    reports.set(task.reportType.name, (reports.get(task.reportType.name) ?? 0) + 1);
    byDate.set(day, reports);
  }
  const upcoming: DueDateGroup[] = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 6)
    .map(([date, reports]) => ({
      date,
      count: Array.from(reports.values()).reduce((a, b) => a + b, 0),
      reports: Array.from(reports.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "lv")),
    }));

  const lateByPerson = new Map<string, PersonOverdue>();
  for (const task of lateTasks) {
    for (const person of peopleOf(task)) {
      const key = person.id ?? "none";
      let group = lateByPerson.get(key);
      if (!group) {
        group = { userId: person.id, name: person.name ?? "Nav atbildīgā", items: [] };
        lateByPerson.set(key, group);
      }
      group.items.push(toItem(task));
    }
  }
  const overdueByPerson = Array.from(lateByPerson.values()).sort((a, b) => {
    if (a.userId === null) return 1;
    if (b.userId === null) return -1;
    return a.name.localeCompare(b.name, "lv");
  });

  const openNow = [...lateTasks, ...soonTasks];
  const unassigned = new Set(
    [...tasks, ...openNow]
      .filter((t) => t.status !== "DONE" && peopleOf(t)[0]?.id === null)
      .map((t) => t.id),
  ).size;

  return {
    columns,
    rows,
    overdue: lateTasks.map(toItem),
    dueSoon: soonTasks.filter((t) => {
      const day = isoDay(t.dueDate);
      return day >= todayIso && day <= soonIso;
    }).map(toItem),
    load,
    totals: { all: tasks.length, done: tasks.filter((t) => t.status === "DONE").length },
    dashboard: {
      byColumn: Array.from(columnStats.values())
        .filter((c) => c.total > 0)
        .sort((a, b) => a.rank - b.rank)
        .map(({ rank: _rank, ...c }) => c),
      upcoming,
      overdueByPerson,
      overdueTotal: lateTasks.length,
      oldestLateDays: lateTasks.reduce((max, t) => Math.max(max, daysLate(t, opts.today)), 0),
      unassigned,
      dueThisWeek: soonTasks.filter((t) => {
        const day = isoDay(t.dueDate);
        return day >= todayIso && day <= weekIso;
      }).length,
    },
  };
}

/** People whose tasks the viewer may filter by (same rule as the task scope). */
export async function boardPeople(session: BoardSession) {
  return prisma.user.findMany({
    where: {
      organizationId: session.organizationId,
      ...(session.role === "MANAGER"
        ? { OR: [{ id: session.userId }, { managerId: session.userId }] }
        : {}),
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
