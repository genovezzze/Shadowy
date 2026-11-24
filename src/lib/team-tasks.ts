import type { Prisma, Role, TaskStatus } from "@prisma/client";

/**
 * "Komandas vadība": recurring client report tasks.
 *
 * Pure functions only (no DB, no server-only), so the date and scoping rules
 * are covered by `team-tasks.test.ts`. All calendar maths runs on UTC-midnight
 * dates that stand for a Latvian calendar day; "today" is resolved in
 * Europe/Riga so a task never turns late at 22:00 UTC.
 */

// ── Calendar days ──────────────────────────────────────────────────────────

/** "YYYY-MM-DD" for a UTC-midnight date. */
export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function utcDay(year: number, month1: number, day: number): Date {
  return new Date(Date.UTC(year, month1 - 1, day));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

/** Today's calendar day in Riga, as a UTC-midnight date. */
export function rigaToday(now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Riga",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // en-CA formats as YYYY-MM-DD
  const [y, m, d] = parts.split("-").map(Number);
  return utcDay(y, m, d);
}

/** Western (Gregorian) Easter Sunday - the anonymous Gregorian algorithm. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utcDay(year, month, day);
}

/**
 * One-off public holidays declared by the Saeima (song festival closing days,
 * sports wins). Add new ones here when they are announced.
 */
const EXTRA_HOLIDAYS = new Set<string>([
  "2023-05-29", // hockey world championship bronze
  "2023-07-10", // Dziesmu un deju svētku noslēguma diena
]);

const holidayCache = new Map<number, Set<string>>();

/**
 * Latvian public holidays (Likums "Par svētku, atceres un atzīmējamām dienām")
 * that fall on weekdays or matter for deadlines. Sunday-only holidays (Easter
 * Sunday, Mother's Day, Pentecost) are weekends anyway.
 */
export function latvianHolidays(year: number): Set<string> {
  const cached = holidayCache.get(year);
  if (cached) return cached;

  const days: Date[] = [
    utcDay(year, 1, 1),
    utcDay(year, 5, 1),
    utcDay(year, 6, 23),
    utcDay(year, 6, 24),
    utcDay(year, 12, 24),
    utcDay(year, 12, 25),
    utcDay(year, 12, 26),
    utcDay(year, 12, 31),
  ];

  const easter = easterSunday(year);
  days.push(addDays(easter, -2), easter, addDays(easter, 1));

  // 4 May and 18 November: when they fall on a weekend, the next Monday is off.
  for (const [m, d] of [[5, 4], [11, 18]] as const) {
    const day = utcDay(year, m, d);
    days.push(day);
    const dow = day.getUTCDay();
    if (dow === 6) days.push(addDays(day, 2));
    if (dow === 0) days.push(addDays(day, 1));
  }

  const set = new Set(days.map(isoDay));
  for (const extra of EXTRA_HOLIDAYS) {
    if (extra.startsWith(`${year}-`)) set.add(extra);
  }
  holidayCache.set(year, set);
  return set;
}

export function isWorkingDay(date: Date): boolean {
  const dow = date.getUTCDay();
  if (dow === 0 || dow === 6) return false;
  return !latvianHolidays(date.getUTCFullYear()).has(isoDay(date));
}

/** The date itself when it is a working day, otherwise the next one. */
export function nextWorkingDay(date: Date): Date {
  let d = date;
  while (!isWorkingDay(d)) d = addDays(d, 1);
  return d;
}

/** The last working day strictly before the date. */
export function previousWorkingDay(date: Date): Date {
  let d = addDays(date, -1);
  while (!isWorkingDay(d)) d = addDays(d, -1);
  return d;
}

/**
 * Which deadlines today's reminder is about. The pilot firm asked for one
 * reminder the working day before a deadline, not a countdown (reminders days
 * ahead "annoy"), plus a single note the first working day after a deadline
 * was missed. Deadlines already sit on working days, so a Monday deadline is
 * reminded on Friday.
 */
export function reminderDays(today: Date): { dueIso: string; newlyLateIso: string } {
  return {
    dueIso: isoDay(nextWorkingDay(addDays(today, 1))),
    newlyLateIso: isoDay(previousWorkingDay(today)),
  };
}

// ── Periods ────────────────────────────────────────────────────────────────

const PERIOD_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isPeriod(value: string | undefined | null): value is string {
  return !!value && PERIOD_RE.test(value);
}

export function periodOf(date: Date): string {
  return isoDay(date).slice(0, 7);
}

export function parsePeriod(period: string): { year: number; month: number } {
  const match = PERIOD_RE.exec(period);
  if (!match) throw new Error(`Invalid period: ${period}`);
  return { year: Number(match[1]), month: Number(match[2]) };
}

export function shiftPeriod(period: string, months: number): string {
  const { year, month } = parsePeriod(period);
  const index = year * 12 + (month - 1) + months;
  const y = Math.floor(index / 12);
  const m = (index % 12) + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

const LV_MONTHS = [
  "janvāris", "februāris", "marts", "aprīlis", "maijs", "jūnijs",
  "jūlijs", "augusts", "septembris", "oktobris", "novembris", "decembris",
];

/** "Novembris 2026" */
export function periodLabel(period: string): string {
  const { year, month } = parsePeriod(period);
  const name = LV_MONTHS[month - 1];
  return `${name[0].toUpperCase()}${name.slice(1)} ${year}`;
}

/**
 * The deadline of a report in a period: `dueDay` of that month, clamped to the
 * month's last day (31 in a 30-day month), then moved to the next working day.
 */
export function dueDateFor(period: string, dueDay: number): Date {
  const { year, month } = parsePeriod(period);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(Math.max(1, Math.round(dueDay)), lastDay);
  return nextWorkingDay(utcDay(year, month, day));
}

export type ReportFrequency = "monthly" | "quarterly";

export function normalizeFrequency(value: string | null | undefined): ReportFrequency {
  return value === "quarterly" ? "quarterly" : "monthly";
}

/**
 * Quarterly reports are made in the month after a quarter closes: January,
 * April, July and October.
 */
export function isDueInPeriod(frequency: string, period: string): boolean {
  if (normalizeFrequency(frequency) === "monthly") return true;
  const { month } = parsePeriod(period);
  return month % 3 === 1;
}

// ── Generation plan ────────────────────────────────────────────────────────

export interface PlanReport {
  clientId: string;
  reportTypeId: string;
  frequency: string;
  /** ClientReport override, else null. */
  dueDay: number | null;
  /** ClientReport override, else null. */
  responsibleUserId: string | null;
  client: {
    status: string;
    responsibleUserId: string | null;
    /** Current ClientEmployee links, used when no responsible is set. */
    assignmentEmployeeIds: string[];
  };
  /** ownerUserId set = an employee's own column; the task is theirs. */
  reportType: { dueDay: number; active: boolean; ownerUserId?: string | null };
}

export interface PlannedTask {
  clientId: string;
  reportTypeId: string;
  assigneeId: string | null;
  period: string;
  /** For a task without deadline: the month's last day, only for ordering. */
  dueDate: Date;
  hasDeadline: boolean;
}

/** A deadline day of 0 means "no deadline" (internal work like KASE or Banka). */
export const NO_DEADLINE = 0;

export function hasDeadlineDay(dueDay: number | null | undefined): boolean {
  return dueDay != null && dueDay > 0;
}

/** The month's last calendar day: where a no-deadline task sits for ordering. */
export function lastDayOf(period: string): Date {
  const { year, month } = parsePeriod(period);
  return new Date(Date.UTC(year, month, 0));
}

/**
 * Who a generated task goes to: the report's own responsible, else the
 * client's, else the client's only linked employee. With several linked
 * employees and nobody named, the task stays unassigned rather than guessing.
 */
export function resolveAssignee(report: PlanReport, validUserIds: Set<string>): string | null {
  const owner = report.reportType.ownerUserId;
  if (owner) return validUserIds.has(owner) ? owner : null;
  const candidates = [report.responsibleUserId, report.client.responsibleUserId];
  for (const id of candidates) {
    if (id && validUserIds.has(id)) return id;
  }
  const linked = report.client.assignmentEmployeeIds.filter((id) => validUserIds.has(id));
  return linked.length === 1 ? linked[0] : null;
}

export function taskKey(clientId: string, reportTypeId: string): string {
  return `${clientId}:${reportTypeId}`;
}

/** Every task the period should have, active clients and report types only. */
export function planTasks(
  reports: PlanReport[],
  period: string,
  validUserIds: Set<string>,
): PlannedTask[] {
  const planned: PlannedTask[] = [];
  for (const report of reports) {
    if (report.client.status !== "active") continue;
    if (!report.reportType.active) continue;
    if (!isDueInPeriod(report.frequency, period)) continue;
    const day = report.dueDay ?? report.reportType.dueDay;
    const withDeadline = hasDeadlineDay(day);
    planned.push({
      clientId: report.clientId,
      reportTypeId: report.reportTypeId,
      assigneeId: resolveAssignee(report, validUserIds),
      period,
      dueDate: withDeadline ? dueDateFor(period, day) : lastDayOf(period),
      hasDeadline: withDeadline,
    });
  }
  return planned;
}

export interface ExistingTask {
  id: string;
  clientId: string;
  reportTypeId: string;
  assigneeId: string | null;
  dueDate: Date;
  hasDeadline: boolean;
  status: TaskStatus;
  comment: string | null;
}

/**
 * Bring a period's tasks in line with the registry after it was edited:
 * - create what is missing;
 * - drop untouched tasks whose report was switched off (grey cell);
 * - follow responsible / deadline changes on tasks not finished yet.
 * Finished or commented tasks are never deleted - that is someone's work.
 */
export function reconcileTasks(planned: PlannedTask[], existing: ExistingTask[]) {
  const plannedByKey = new Map(planned.map((p) => [taskKey(p.clientId, p.reportTypeId), p]));
  const existingKeys = new Set(existing.map((e) => taskKey(e.clientId, e.reportTypeId)));

  const create = planned.filter((p) => !existingKeys.has(taskKey(p.clientId, p.reportTypeId)));
  const remove: string[] = [];
  const update: { id: string; assigneeId: string | null; dueDate: Date; hasDeadline: boolean }[] = [];

  for (const task of existing) {
    const plan = plannedByKey.get(taskKey(task.clientId, task.reportTypeId));
    if (!plan) {
      if (task.status === "NOT_STARTED" && !task.comment) remove.push(task.id);
      continue;
    }
    if (task.status === "DONE") continue;
    if (
      task.assigneeId !== plan.assigneeId ||
      isoDay(task.dueDate) !== isoDay(plan.dueDate) ||
      task.hasDeadline !== plan.hasDeadline
    ) {
      update.push({ id: task.id, assigneeId: plan.assigneeId, dueDate: plan.dueDate, hasDeadline: plan.hasDeadline });
    }
  }

  return { create, remove, update };
}

// ── Cell state ─────────────────────────────────────────────────────────────

export type CellState = "todo" | "progress" | "done" | "overdue";

type TaskTiming = { status: TaskStatus; dueDate: Date; hasDeadline?: boolean };

/**
 * Late = past its deadline (Riga day) and not finished. Derived, never stored.
 * A task without a deadline is never late.
 */
export function isOverdue(task: TaskTiming, today: Date): boolean {
  if (task.hasDeadline === false) return false;
  return task.status !== "DONE" && isoDay(task.dueDate) < isoDay(today);
}

export function cellState(task: TaskTiming, today: Date): CellState {
  if (task.status === "DONE") return "done";
  if (isOverdue(task, today)) return "overdue";
  return task.status === "IN_PROGRESS" ? "progress" : "todo";
}

/** Whole days a task is late (0 when on time). */
export function daysLate(task: TaskTiming, today: Date): number {
  if (!isOverdue(task, today)) return 0;
  return Math.round((today.getTime() - task.dueDate.getTime()) / 86_400_000);
}

/** "07.11" */
export function shortDate(date: Date): string {
  const iso = isoDay(date);
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
}

// ── Access scope ───────────────────────────────────────────────────────────

/**
 * The mandatory tenant/role scope for reading or changing tasks, derived from
 * the session alone. Combine with any user-supplied filter through
 * {@link scopedTaskWhere} - never by spreading - so a crafted URL cannot widen
 * what the viewer sees.
 *
 * - ADMIN: the whole organisation.
 * - EMPLOYEE: tasks assigned to them, tasks of their own columns, and tasks of
 *   firm columns for clients they are linked to ("Tavi klienti") - shared by
 *   everyone linked to that client. Another person's own columns stay private.
 * - MANAGER: their own and unassigned tasks, plus everything of the people
 *   they manage (same rules as for those people).
 */
export function taskScopeForSession(
  session: {
    role: Role;
    organizationId: string;
    userId: string;
  },
  /**
   * People this employee substitutes today (approved vacation or sick leave,
   * resolved by the caller from the session, never from the URL). Their tasks
   * become visible and editable as if they were the employee's own.
   */
  opts: { substituteFor?: string[] } = {},
): Prisma.ClientTaskWhereInput {
  const org = session.organizationId;
  const me = session.userId;
  if (session.role === "ADMIN") return { organizationId: org };
  if (session.role === "MANAGER") {
    return {
      organizationId: org,
      OR: [
        { assigneeId: me },
        { assigneeId: null },
        { assignee: { managerId: me } },
        { reportType: { ownerUserId: me } },
        { reportType: { owner: { managerId: me } } },
        {
          reportType: { ownerUserId: null },
          client: { assignments: { some: { employee: { managerId: me } } } },
        },
      ],
    };
  }
  const people = [me, ...(opts.substituteFor ?? []).filter((id) => id && id !== me)];
  if (people.length === 1) {
    return {
      organizationId: org,
      OR: [
        { assigneeId: me },
        { reportType: { ownerUserId: me } },
        { reportType: { ownerUserId: null }, client: { assignments: { some: { employeeId: me } } } },
      ],
    };
  }
  return {
    organizationId: org,
    OR: [
      { assigneeId: { in: people } },
      { reportType: { ownerUserId: { in: people } } },
      { reportType: { ownerUserId: null }, client: { assignments: { some: { employeeId: { in: people } } } } },
    ],
  };
}

/**
 * The people a task belongs to, for workload and reminders: the owner of a
 * personal column; otherwise the named assignee plus everyone linked to the
 * client (a firm-column task is shared by all of them).
 */
export function taskPeople(task: {
  assigneeId: string | null;
  ownerUserId: string | null;
  clientEmployeeIds: string[];
}): string[] {
  if (task.ownerUserId) return [task.ownerUserId];
  const ids = [task.assigneeId, ...task.clientEmployeeIds].filter((id): id is string => !!id);
  return Array.from(new Set(ids));
}

/** User filter AND role scope: the scope can only narrow, never be overridden. */
export function scopedTaskWhere(
  filter: Prisma.ClientTaskWhereInput,
  session: { role: Role; organizationId: string; userId: string },
  opts: { substituteFor?: string[] } = {},
): Prisma.ClientTaskWhereInput {
  return { AND: [filter, taskScopeForSession(session, opts)] };
}

// ── Ready-made sheet ───────────────────────────────────────────────────────

export interface TemplateColumn {
  name: string;
  dueDay: number;
  /** Default for every client the column is switched on for. */
  frequency?: ReportFrequency;
}

/**
 * "Gatavā veidne": the columns of a typical Latvian bookkeeping firm's monthly
 * sheet. Only four reports carry a deadline, as the pilot firm works them
 * (set 2026-11-23): Fiz.pers. paz. by the 15th, VSAOI by the 17th, PVN and UIN
 * by the 20th. The rest have no deadline and never turn late.
 */
export const LV_REPORT_TEMPLATE: TemplateColumn[] = [
  { name: "PB rēķ.", dueDay: NO_DEADLINE },
  { name: "Debitoru rēķini", dueDay: NO_DEADLINE },
  { name: "KASE", dueDay: NO_DEADLINE },
  { name: "Banka", dueDay: NO_DEADLINE },
  { name: "Fiz.pers. paz.", dueDay: 15 },
  { name: "Alga", dueDay: NO_DEADLINE },
  { name: "PVN", dueDay: 20 },
  { name: "UIN", dueDay: 20 },
  { name: "VSAOI", dueDay: 17 },
  { name: "Nodokļi", dueDay: NO_DEADLINE },
  { name: "PL", dueDay: NO_DEADLINE },
];

/**
 * The extended sheet: payroll, non-residents, natural resources tax and
 * statistics on top of the basics. Same rule: only VSAO (17th), FP paz.
 * (15th), PVN and UIN (20th) carry a deadline; DRN and PL Q come quarterly.
 */
export const LV_REPORT_TEMPLATE_EXTENDED: TemplateColumn[] = [
  { name: "Rēķ.", dueDay: NO_DEADLINE },
  { name: "VSAO", dueDay: 17 },
  { name: "Nosūtīta alga", dueDay: NO_DEADLINE },
  { name: "IIeN nerez.", dueDay: NO_DEADLINE },
  { name: "PVN", dueDay: 20 },
  { name: "UIN", dueDay: 20 },
  { name: "Atbrīvots/Pieņemts", dueDay: NO_DEADLINE },
  { name: "FP paz.", dueDay: 15 },
  { name: "Rēķini", dueDay: NO_DEADLINE },
  { name: "Kvīšu gr.", dueDay: NO_DEADLINE },
  { name: "DRN", dueDay: NO_DEADLINE, frequency: "quarterly" },
  { name: "Op. bilance", dueDay: NO_DEADLINE },
  { name: "Statistika", dueDay: NO_DEADLINE },
  { name: "Bank", dueDay: NO_DEADLINE },
  { name: "PL Q", dueDay: NO_DEADLINE, frequency: "quarterly" },
  { name: "Debitori", dueDay: NO_DEADLINE },
  { name: "Kreditori", dueDay: NO_DEADLINE },
  { name: "Lauksaimnieki", dueDay: NO_DEADLINE },
];

export const REPORT_TEMPLATES = {
  basic: { label: "Pamata veidne", columns: LV_REPORT_TEMPLATE },
  extended: { label: "Paplašinātā veidne", columns: LV_REPORT_TEMPLATE_EXTENDED },
} as const;

export type ReportTemplateId = keyof typeof REPORT_TEMPLATES;

/** Columns are matched by name across sheets: case, spaces and dots aside. */
export function columnKey(name: string): string {
  return name.toLowerCase().replace(/[\s.]+/g, "");
}
