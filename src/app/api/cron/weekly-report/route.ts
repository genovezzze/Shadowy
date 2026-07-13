import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyManagerReport } from "@/lib/email";
import { groupByCategoryWithTitles, groupByClient, groupByEmployee, categoryLabel, weekTrend, weekCountTrend } from "@/lib/work-insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_HOURLY_RATE_EUR = 20;
// Resend caps at 10 req/s; stay well under that even for larger orgs.
const SEND_DELAY_MS = 150;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);

  const managers = await prisma.user.findMany({
    where: { role: "MANAGER" },
    select: {
      id: true,
      name: true,
      email: true,
      organizationId: true,
    },
  });

  let sent = 0;
  let failed = 0;

  const orgs = await prisma.organization.findMany({ select: { id: true, name: true, defaultHourlyRate: true } });
  const orgById = new Map(orgs.map((o) => [o.id, o]));

  for (const manager of managers) {
    if (!manager.email) continue;
    const org = orgById.get(manager.organizationId);

    try {
      const [pendingCount, teamEmployees, weekApproved, prevWeekApproved, weekActiveEmployeeIds] = await Promise.all([
        prisma.invisibleWorkEntry.count({
          where: {
            organizationId: manager.organizationId,
            managerId: manager.id,
            status: "PENDING",
          },
        }),
        prisma.user.findMany({
          where: {
            organizationId: manager.organizationId,
            managerId: manager.id,
            role: "EMPLOYEE",
          },
          select: { id: true, name: true },
        }),
        prisma.invisibleWorkEntry.findMany({
          where: {
            organizationId: manager.organizationId,
            managerId: manager.id,
            status: "APPROVED",
            updatedAt: { gte: weekAgo },
          },
          select: {
            title: true,
            durationMinutes: true,
            category: true,
            clientId: true,
            clientName: true,
            client: { select: { name: true } },
            employeeId: true,
            employee: { select: { name: true } },
          },
        }),
        prisma.invisibleWorkEntry.findMany({
          where: {
            organizationId: manager.organizationId,
            managerId: manager.id,
            status: "APPROVED",
            updatedAt: { gte: twoWeeksAgo, lt: weekAgo },
          },
          select: { durationMinutes: true },
        }),
        prisma.invisibleWorkEntry.findMany({
          where: {
            organizationId: manager.organizationId,
            managerId: manager.id,
            deletedAt: null,
            workDate: { gte: weekAgo },
          },
          select: { employeeId: true },
          distinct: ["employeeId"],
        }),
      ]);

      const teamSize = teamEmployees.length;
      const activeIds = new Set(weekActiveEmployeeIds.map((e) => e.employeeId));
      const inactiveEmployeeNames = teamEmployees.filter((e) => !activeIds.has(e.id)).map((e) => e.name);

      const weekMinutes = weekApproved.reduce((s, e) => s + e.durationMinutes, 0);
      const prevWeekMinutes = prevWeekApproved.reduce((s, e) => s + e.durationMinutes, 0);

      const rateEur = org?.defaultHourlyRate ? Number(org.defaultHourlyRate) : DEFAULT_HOURLY_RATE_EUR;
      const costEur = Math.round((weekMinutes / 60) * rateEur);

      const clientEntries = weekApproved.map((e) => ({
        clientId: e.clientId,
        clientName: e.client?.name ?? e.clientName,
        durationMinutes: e.durationMinutes,
      }));
      const employeeEntries = weekApproved.map((e) => ({
        employeeId: e.employeeId,
        employeeName: e.employee.name,
        durationMinutes: e.durationMinutes,
      }));

      await sendWeeklyManagerReport({
        to: manager.email,
        managerName: manager.name ?? "",
        orgName: org?.name ?? "",
        pendingCount,
        weekEntries: weekApproved.length,
        weekMinutes,
        teamSize,
        entriesTrend: weekCountTrend(weekApproved.length, prevWeekApproved.length),
        hoursTrend: weekTrend(weekMinutes, prevWeekMinutes),
        costEur,
        rateEur,
        employeeBreakdown: groupByEmployee(employeeEntries).map((e) => ({
          name: e.name,
          count: e.count,
          minutes: e.minutes,
        })),
        categoryBreakdown: groupByCategoryWithTitles(weekApproved).map((c) => ({
          label: categoryLabel(c.category),
          count: c.count,
          minutes: c.minutes,
          topTitles: c.topTitles,
        })),
        clientBreakdown: groupByClient(clientEntries).map((c) => ({
          name: c.name,
          minutes: c.minutes,
        })),
        inactiveEmployeeNames,
      });

      sent++;
    } catch (err) {
      failed++;
      console.error(`[weekly-report] Failed for manager ${manager.id}:`, err);
    }

    await sleep(SEND_DELAY_MS);
  }

  return NextResponse.json({ ok: true, sent, failed });
}
