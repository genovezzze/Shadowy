import "server-only";
import { notFound } from "next/navigation";
import { prisma } from "./db";
import { periodOf, planTasks, reconcileTasks, rigaToday, type PlanReport } from "./team-tasks";

export async function isTeamTasksEnabled(organizationId: string): Promise<boolean> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { teamTasksEnabled: true },
  });
  return org?.teamTasksEnabled ?? false;
}

/** 404 for organisations the module is not switched on for. */
export async function requireTeamTasks(organizationId: string): Promise<void> {
  if (!(await isTeamTasksEnabled(organizationId))) notFound();
}

async function loadPlanInputs(organizationId: string) {
  const [reports, users] = await Promise.all([
    prisma.clientReport.findMany({
      where: { organizationId },
      select: {
        clientId: true,
        reportTypeId: true,
        frequency: true,
        dueDay: true,
        responsibleUserId: true,
        client: {
          select: {
            status: true,
            responsibleUserId: true,
            assignments: { select: { employeeId: true } },
          },
        },
        reportType: { select: { dueDay: true, active: true, ownerUserId: true } },
      },
    }),
    prisma.user.findMany({ where: { organizationId }, select: { id: true } }),
  ]);

  const planReports: PlanReport[] = reports.map((r) => ({
    clientId: r.clientId,
    reportTypeId: r.reportTypeId,
    frequency: r.frequency,
    dueDay: r.dueDay,
    responsibleUserId: r.responsibleUserId,
    client: {
      status: r.client.status,
      responsibleUserId: r.client.responsibleUserId,
      assignmentEmployeeIds: r.client.assignments.map((a) => a.employeeId),
    },
    reportType: r.reportType,
  }));
  return { planReports, validUserIds: new Set(users.map((u) => u.id)) };
}

/**
 * Make sure the period has a task for every applicable report. Create-only and
 * idempotent (unique clientId+reportTypeId+period), so it is safe to call on
 * every page view as well as from the cron.
 */
export async function ensureTasksForPeriod(
  organizationId: string,
  period: string,
  opts: { onlyIfEmpty?: boolean } = {},
): Promise<number> {
  // Page views only need the month's first creation: every registry edit
  // reconciles the running month itself, and the daily cron does a full pass.
  // Skipping the full plan keeps a click on the sheet from re-reading hundreds
  // of rows over the network.
  if (opts.onlyIfEmpty) {
    const any = await prisma.clientTask.findFirst({ where: { organizationId, period }, select: { id: true } });
    if (any) return 0;
  }
  const { planReports, validUserIds } = await loadPlanInputs(organizationId);
  const planned = planTasks(planReports, period, validUserIds);
  if (planned.length === 0) return 0;

  const result = await prisma.clientTask.createMany({
    data: planned.map((p) => ({
      organizationId,
      clientId: p.clientId,
      reportTypeId: p.reportTypeId,
      assigneeId: p.assigneeId,
      period: p.period,
      dueDate: p.dueDate,
      originalDueDate: p.dueDate,
    })),
    skipDuplicates: true,
  });
  return result.count;
}

/**
 * Full sync of one period after the registry changed (a cell switched, a
 * responsible or deadline edited). See `reconcileTasks` for what is kept.
 */
export async function reconcilePeriod(organizationId: string, period: string): Promise<void> {
  const [{ planReports, validUserIds }, existing] = await Promise.all([
    loadPlanInputs(organizationId),
    prisma.clientTask.findMany({
      where: { organizationId, period },
      select: {
        id: true,
        clientId: true,
        reportTypeId: true,
        assigneeId: true,
        dueDate: true,
        status: true,
        comment: true,
      },
    }),
  ]);

  const planned = planTasks(planReports, period, validUserIds);
  const { create, remove, update } = reconcileTasks(planned, existing);

  await prisma.$transaction([
    ...(remove.length > 0
      ? [prisma.clientTask.deleteMany({ where: { organizationId, id: { in: remove } } })]
      : []),
    ...(create.length > 0
      ? [
          prisma.clientTask.createMany({
            data: create.map((p) => ({
              organizationId,
              clientId: p.clientId,
              reportTypeId: p.reportTypeId,
              assigneeId: p.assigneeId,
              period: p.period,
              dueDate: p.dueDate,
              originalDueDate: p.dueDate,
            })),
            skipDuplicates: true,
          }),
        ]
      : []),
    // A registry edit is a change of plan, not a delay: move both dates.
    ...update.map((u) =>
      prisma.clientTask.updateMany({
        where: { id: u.id, organizationId },
        data: { assigneeId: u.assigneeId, dueDate: u.dueDate, originalDueDate: u.dueDate },
      }),
    ),
  ]);
}

/**
 * A client was switched on/off or got other employees: bring the running
 * month's tasks in line. A no-op for organisations without the module, and
 * never allowed to fail the client edit itself.
 */
export async function syncTeamTasksAfterClientChange(organizationId: string): Promise<void> {
  try {
    if (!(await isTeamTasksEnabled(organizationId))) return;
    await reconcilePeriod(organizationId, periodOf(rigaToday()));
  } catch (error) {
    console.error("[team-tasks] sync after client change failed", error);
  }
}
