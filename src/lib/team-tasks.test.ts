import { describe, it, expect } from "vitest";
import {
  cellState,
  daysLate,
  dueDateFor,
  easterSunday,
  isDueInPeriod,
  isoDay,
  isWorkingDay,
  latvianHolidays,
  periodLabel,
  planTasks,
  reconcileTasks,
  resolveAssignee,
  rigaToday,
  scopedTaskWhere,
  shiftPeriod,
  taskPeople,
  taskScopeForSession,
  columnKey,
  LV_REPORT_TEMPLATE,
  LV_REPORT_TEMPLATE_EXTENDED,
  utcDay,
  type ExistingTask,
  type PlanReport,
} from "./team-tasks";

// These tests pin the deadlines a firm sees on its monthly report sheet and who
// may see which task. The dangerous bugs here: a deadline on a holiday, a task
// silently deleted after someone worked on it, and a crafted filter that lets
// an employee read a colleague's tasks.

describe("Latvian holidays", () => {
  it("computes Easter", () => {
    expect(isoDay(easterSunday(2026))).toBe("2026-04-05");
    expect(isoDay(easterSunday(2027))).toBe("2027-03-28");
  });

  it("includes Good Friday, Easter Monday and fixed days", () => {
    const h = latvianHolidays(2026);
    for (const d of ["2026-01-01", "2026-04-03", "2026-04-06", "2026-05-01", "2026-05-04", "2026-06-23", "2026-06-24", "2026-11-18", "2026-12-24", "2026-12-31"]) {
      expect(h.has(d), d).toBe(true);
    }
  });

  it("moves 4 May and 18 November to Monday when they fall on a weekend", () => {
    expect(latvianHolidays(2025).has("2025-05-05")).toBe(true); // 4 May 2025 is a Sunday
    expect(latvianHolidays(2023).has("2023-11-20")).toBe(true); // 18 Nov 2023 is a Saturday
    expect(latvianHolidays(2026).has("2026-11-19")).toBe(false); // 18 Nov 2026 is a Wednesday
  });

  it("treats weekends and holidays as non-working", () => {
    expect(isWorkingDay(utcDay(2026, 11, 7))).toBe(false); // Saturday
    expect(isWorkingDay(utcDay(2026, 11, 18))).toBe(false);
    expect(isWorkingDay(utcDay(2026, 11, 19))).toBe(true);
  });
});

describe("dueDateFor", () => {
  it("keeps a working-day deadline", () => {
    expect(isoDay(dueDateFor("2026-10", 7))).toBe("2026-10-07"); // Wednesday
  });

  it("moves a weekend deadline to Monday", () => {
    expect(isoDay(dueDateFor("2026-11", 7))).toBe("2026-11-09");
  });

  it("skips a chain of holidays and weekend", () => {
    // Good Friday 3 Apr -> Sat, Sun, Easter Monday 6 Apr -> Tuesday 7 Apr
    expect(isoDay(dueDateFor("2026-04", 3))).toBe("2026-04-07");
    expect(isoDay(dueDateFor("2026-06", 23))).toBe("2026-06-25");
  });

  it("clamps a day past the month's end to its last day", () => {
    expect(isoDay(dueDateFor("2026-09", 31))).toBe("2026-09-30");
    // 28 Feb 2026 is a Saturday -> Monday 2 March
    expect(isoDay(dueDateFor("2026-02", 31))).toBe("2026-03-02");
  });
});

describe("periods", () => {
  it("shifts across year boundaries", () => {
    expect(shiftPeriod("2026-12", 1)).toBe("2027-01");
    expect(shiftPeriod("2026-01", -1)).toBe("2025-12");
  });

  it("labels in Latvian", () => {
    expect(periodLabel("2026-09")).toBe("Septembris 2026");
  });

  it("puts quarterly reports in Jan, Apr, Jul, Oct", () => {
    expect(isDueInPeriod("quarterly", "2026-01")).toBe(true);
    expect(isDueInPeriod("quarterly", "2026-02")).toBe(false);
    expect(isDueInPeriod("quarterly", "2026-10")).toBe(true);
    expect(isDueInPeriod("monthly", "2026-02")).toBe(true);
  });

  it("resolves today in Riga, not UTC", () => {
    // 22:30 UTC on 19 Nov is 00:30 on 20 Nov in Riga (UTC+2)
    expect(isoDay(rigaToday(new Date("2026-11-19T22:30:00Z")))).toBe("2026-11-20");
    expect(isoDay(rigaToday(new Date("2026-11-19T21:30:00Z")))).toBe("2026-11-19");
  });
});

function report(over: Partial<PlanReport> = {}): PlanReport {
  return {
    clientId: "c1",
    reportTypeId: "pvn",
    frequency: "monthly",
    dueDay: null,
    responsibleUserId: null,
    client: { status: "active", responsibleUserId: "anna", assignmentEmployeeIds: [] },
    reportType: { dueDay: 7, active: true },
    ...over,
  };
}

const USERS = new Set(["anna", "ilze", "zane"]);

describe("resolveAssignee", () => {
  it("prefers the report's own responsible", () => {
    expect(resolveAssignee(report({ responsibleUserId: "ilze" }), USERS)).toBe("ilze");
  });

  it("falls back to the client's responsible", () => {
    expect(resolveAssignee(report(), USERS)).toBe("anna");
  });

  it("uses the only linked employee, but never guesses between several", () => {
    const base = { status: "active", responsibleUserId: null };
    expect(resolveAssignee(report({ client: { ...base, assignmentEmployeeIds: ["zane"] } }), USERS)).toBe("zane");
    expect(resolveAssignee(report({ client: { ...base, assignmentEmployeeIds: ["zane", "ilze"] } }), USERS)).toBeNull();
  });

  it("ignores users that are gone from the organisation", () => {
    expect(resolveAssignee(report({ responsibleUserId: "left-company" }), USERS)).toBe("anna");
  });
});

describe("planTasks", () => {
  it("skips inactive clients, inactive report types and off-quarter months", () => {
    const planned = planTasks(
      [
        report({ clientId: "ok" }),
        report({ clientId: "inactive", client: { status: "inactive", responsibleUserId: "anna", assignmentEmployeeIds: [] } }),
        report({ clientId: "hidden-type", reportType: { dueDay: 7, active: false } }),
        report({ clientId: "quarterly", frequency: "quarterly" }),
      ],
      "2026-11",
      USERS,
    );
    expect(planned.map((p) => p.clientId)).toEqual(["ok"]);
  });

  it("uses the report's own due day over the column default", () => {
    const [task] = planTasks([report({ dueDay: 15 })], "2026-10", USERS);
    expect(isoDay(task.dueDate)).toBe("2026-10-15");
  });
});

function existing(over: Partial<ExistingTask> = {}): ExistingTask {
  return {
    id: "t1",
    clientId: "c1",
    reportTypeId: "pvn",
    assigneeId: "anna",
    dueDate: utcDay(2026, 10, 7),
    status: "NOT_STARTED",
    comment: null,
    ...over,
  };
}

describe("reconcileTasks", () => {
  const planned = planTasks([report()], "2026-10", USERS);

  it("is idempotent: nothing to do when tasks match the plan", () => {
    expect(reconcileTasks(planned, [existing()])).toEqual({ create: [], remove: [], update: [] });
  });

  it("creates what is missing", () => {
    expect(reconcileTasks(planned, []).create).toHaveLength(1);
  });

  it("removes only untouched tasks whose report was switched off", () => {
    const result = reconcileTasks([], [
      existing({ id: "untouched" }),
      existing({ id: "started", clientId: "c2", status: "IN_PROGRESS" }),
      existing({ id: "done", clientId: "c3", status: "DONE" }),
      existing({ id: "commented", clientId: "c4", comment: "gaidu dokumentus" }),
    ]);
    expect(result.remove).toEqual(["untouched"]);
  });

  it("follows a new responsible on open tasks but leaves finished ones alone", () => {
    const replanned = planTasks([report({ responsibleUserId: "ilze" })], "2026-10", USERS);
    expect(reconcileTasks(replanned, [existing()]).update).toEqual([
      { id: "t1", assigneeId: "ilze", dueDate: utcDay(2026, 10, 7) },
    ]);
    expect(reconcileTasks(replanned, [existing({ status: "DONE" })]).update).toEqual([]);
  });
});

describe("cell state", () => {
  const today = utcDay(2026, 11, 20);

  it("is late only after the deadline day has passed", () => {
    expect(cellState({ status: "NOT_STARTED", dueDate: utcDay(2026, 11, 20) }, today)).toBe("todo");
    expect(cellState({ status: "NOT_STARTED", dueDate: utcDay(2026, 11, 19) }, today)).toBe("overdue");
    expect(cellState({ status: "IN_PROGRESS", dueDate: utcDay(2026, 11, 19) }, today)).toBe("overdue");
    expect(cellState({ status: "DONE", dueDate: utcDay(2026, 11, 1) }, today)).toBe("done");
  });

  it("counts days late", () => {
    expect(daysLate({ status: "NOT_STARTED", dueDate: utcDay(2026, 11, 9) }, today)).toBe(11);
    expect(daysLate({ status: "DONE", dueDate: utcDay(2026, 11, 9) }, today)).toBe(0);
  });
});

const EMPLOYEE_ANNA = {
  organizationId: "org-1",
  OR: [
    { assigneeId: "anna" },
    { reportType: { ownerUserId: "anna" } },
    { reportType: { ownerUserId: null }, client: { assignments: { some: { employeeId: "anna" } } } },
  ],
};

describe("task access scope", () => {
  const org = "org-1";

  it("gives an employee their tasks, their own columns and firm columns of their clients", () => {
    expect(taskScopeForSession({ role: "EMPLOYEE", organizationId: org, userId: "anna" })).toEqual(EMPLOYEE_ANNA);
  });

  it("never shows another employee's own columns, even on a shared client", () => {
    const scope = taskScopeForSession({ role: "EMPLOYEE", organizationId: org, userId: "anna" });
    // The only clause that reaches through client links is restricted to firm columns.
    const viaClient = (scope.OR ?? []).find((c) => "client" in c);
    expect(viaClient).toMatchObject({ reportType: { ownerUserId: null } });
  });

  it("gives an admin the whole organisation, never more", () => {
    expect(taskScopeForSession({ role: "ADMIN", organizationId: org, userId: "a" })).toEqual({ organizationId: org });
  });

  it("keeps the scope when a crafted filter asks for someone else or another org", () => {
    const where = scopedTaskWhere(
      { assigneeId: "ilze", organizationId: "org-evil" },
      { role: "EMPLOYEE", organizationId: org, userId: "anna" },
    );
    // AND, not a spread: the scope is a separate clause the filter cannot overwrite.
    expect(where).toEqual({ AND: [{ assigneeId: "ilze", organizationId: "org-evil" }, EMPLOYEE_ANNA] });
  });

  it("limits a manager to their people, themselves and unassigned tasks", () => {
    const scope = taskScopeForSession({ role: "MANAGER", organizationId: org, userId: "agnese" });
    expect(scope.organizationId).toBe(org);
    expect(scope.OR).toContainEqual({ assignee: { managerId: "agnese" } });
    expect(scope.OR).toContainEqual({ reportType: { owner: { managerId: "agnese" } } });
    // Nothing in the manager scope is unconditional.
    expect(scope.OR?.some((c) => Object.keys(c).length === 0)).toBe(false);
  });
});

describe("personal columns and shared tasks", () => {
  it("gives a personal column's task to its owner", () => {
    const r = report({ reportType: { dueDay: 7, active: true, ownerUserId: "zane" } });
    expect(resolveAssignee(r, USERS)).toBe("zane");
  });

  it("shares a firm-column task with everyone linked to the client", () => {
    expect(taskPeople({ assigneeId: null, ownerUserId: null, clientEmployeeIds: ["anna", "ilze"] })).toEqual(["anna", "ilze"]);
    expect(taskPeople({ assigneeId: "anna", ownerUserId: null, clientEmployeeIds: ["anna", "ilze"] })).toEqual(["anna", "ilze"]);
  });

  it("keeps a personal-column task with its owner only", () => {
    expect(taskPeople({ assigneeId: "zane", ownerUserId: "zane", clientEmployeeIds: ["anna", "zane"] })).toEqual(["zane"]);
  });
});

describe("ready-made sheet", () => {
  it("uses the VID deadlines", () => {
    const day = (name: string) => LV_REPORT_TEMPLATE.find((c) => c.name === name)?.dueDay;
    expect(day("PVN")).toBe(20);
    expect(day("UIN")).toBe(20);
    expect(day("Alga")).toBe(17);
    expect(day("VSAOI")).toBe(23);
    expect(day("Fiz.pers. paz.")).toBe(15);
  });

  it("has no duplicate columns", () => {
    for (const template of [LV_REPORT_TEMPLATE, LV_REPORT_TEMPLATE_EXTENDED]) {
      const keys = template.map((c) => columnKey(c.name));
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("makes DRN quarterly by the 15th in the extended sheet", () => {
    const drn = LV_REPORT_TEMPLATE_EXTENDED.find((c) => c.name === "DRN");
    expect(drn).toEqual({ name: "DRN", dueDay: 15, frequency: "quarterly" });
    expect(LV_REPORT_TEMPLATE_EXTENDED.find((c) => c.name === "VSAO")?.dueDay).toBe(23);
  });

  it("matches column names loosely", () => {
    expect(columnKey("Fiz.pers. paz.")).toBe(columnKey("fiz pers paz"));
  });
});
