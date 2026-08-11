import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyManagerReport, sendWeeklyAdminReport, isDemoEmail } from "@/lib/email";
import { groupByCategoryWithTitles, groupByCategory, groupByClient, groupByEmployee, categoryLabel, weekTrend, weekCountTrend } from "@/lib/work-insights";

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
  if (!cronSecret || authHeader?.trim() !== `Bearer ${cronSecret.trim()}`) {
    console.warn(
      `[cron] weekly-report unauthorized: secretConfigured=${!!cronSecret} authHeaderLen=${authHeader?.length ?? 0}`
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("[cron] weekly-report started");

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

  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true, defaultHourlyRate: true, emailWeeklySummary: true },
  });
  const orgById = new Map(orgs.map((o) => [o.id, o]));

  // Needed so free-typed shorthands fold into the client they alias instead of
  // showing up as a second line in the breakdown. Same for every recipient of
  // an organisation, so it is fetched once rather than per email.
  const allClients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      organizationId: true,
      aliases: { select: { normalized: true } },
    },
  });
  const clientsByOrg = new Map<string, typeof allClients>();
  for (const client of allClients) {
    const list = clientsByOrg.get(client.organizationId) ?? [];
    list.push(client);
    clientsByOrg.set(client.organizationId, list);
  }

  for (const manager of managers) {
    if (!manager.email || isDemoEmail(manager.email)) continue;
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
        clientBreakdown: groupByClient(
          clientEntries,
          clientsByOrg.get(manager.organizationId) ?? [],
        ).map((c) => ({
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

  // Administrators get the same week seen across the whole organisation. The
  // figures are the same for every admin of an organisation, so they are
  // computed once per organisation rather than once per recipient.
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true, organizationId: true },
  });

  const adminsByOrg = new Map<string, typeof admins>();
  for (const admin of admins) {
    if (!admin.email || isDemoEmail(admin.email)) continue;
    const list = adminsByOrg.get(admin.organizationId) ?? [];
    list.push(admin);
    adminsByOrg.set(admin.organizationId, list);
  }

  let adminSent = 0;
  let adminFailed = 0;

  for (const [organizationId, orgAdmins] of adminsByOrg) {
    const org = orgById.get(organizationId);
    // Unlike the manager report, this one honours the organisation's own
    // "weekly summary" switch, which is what an admin toggles in settings.
    if (!org || !org.emailWeeklySummary) continue;

    try {
      const [pendingByManager, employees, weekApproved, prevWeekApproved, weekActiveEmployeeIds] =
        await Promise.all([
          prisma.invisibleWorkEntry.groupBy({
            by: ["managerId"],
            where: { organizationId, status: "PENDING", deletedAt: null },
            _count: { _all: true },
          }),
          prisma.user.findMany({
            where: { organizationId, role: "EMPLOYEE" },
            select: { id: true, name: true },
          }),
          prisma.invisibleWorkEntry.findMany({
            where: {
              organizationId,
              status: "APPROVED",
              deletedAt: null,
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
              managerId: true,
              manager: { select: { name: true } },
            },
          }),
          prisma.invisibleWorkEntry.findMany({
            where: {
              organizationId,
              status: "APPROVED",
              deletedAt: null,
              updatedAt: { gte: twoWeeksAgo, lt: weekAgo },
            },
            select: { durationMinutes: true },
          }),
          prisma.invisibleWorkEntry.findMany({
            where: { organizationId, deletedAt: null, workDate: { gte: weekAgo } },
            select: { employeeId: true },
            distinct: ["employeeId"],
          }),
        ]);

      const pendingByManagerId = new Map(
        pendingByManager.map((row) => [row.managerId ?? "", row._count._all]),
      );
      const pendingCount = pendingByManager.reduce((sum, row) => sum + row._count._all, 0);

      const activeIds = new Set(weekActiveEmployeeIds.map((e) => e.employeeId));
      const inactiveEmployeeNames = employees.filter((e) => !activeIds.has(e.id)).map((e) => e.name);

      const weekMinutes = weekApproved.reduce((s, e) => s + e.durationMinutes, 0);
      const prevWeekMinutes = prevWeekApproved.reduce((s, e) => s + e.durationMinutes, 0);

      const rateEur = org.defaultHourlyRate ? Number(org.defaultHourlyRate) : DEFAULT_HOURLY_RATE_EUR;
      const costEur = Math.round((weekMinutes / 60) * rateEur);

      const managerTotals = new Map<string, { name: string; count: number; minutes: number }>();
      for (const entry of weekApproved) {
        const key = entry.managerId ?? "";
        const current = managerTotals.get(key)
          ?? { name: entry.manager?.name ?? "Nav piešķirts vadītājs", count: 0, minutes: 0 };
        current.count += 1;
        current.minutes += entry.durationMinutes;
        managerTotals.set(key, current);
      }
      // Managers with nothing approved this week still matter when entries are
      // piling up unreviewed, so they are added from the pending side.
      for (const [managerId, pending] of pendingByManagerId) {
        if (pending > 0 && !managerTotals.has(managerId)) {
          managerTotals.set(managerId, { name: "", count: 0, minutes: 0 });
        }
      }
      const managerIdsWithoutName = [...managerTotals.entries()]
        .filter(([, value]) => !value.name)
        .map(([id]) => id)
        .filter(Boolean);
      if (managerIdsWithoutName.length > 0) {
        const names = await prisma.user.findMany({
          where: { id: { in: managerIdsWithoutName } },
          select: { id: true, name: true },
        });
        for (const manager of names) {
          const row = managerTotals.get(manager.id);
          if (row) row.name = manager.name;
        }
      }

      const managerBreakdown = [...managerTotals.entries()]
        .map(([managerId, value]) => ({
          name: value.name || "Nav piešķirts vadītājs",
          count: value.count,
          minutes: value.minutes,
          pending: pendingByManagerId.get(managerId) ?? 0,
        }))
        .sort((a, b) => b.minutes - a.minutes || b.pending - a.pending);

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

      for (const admin of orgAdmins) {
        try {
          await sendWeeklyAdminReport({
            to: admin.email!,
            adminName: admin.name ?? "",
            orgName: org.name,
            pendingCount,
            weekEntries: weekApproved.length,
            weekMinutes,
            employeeCount: employees.length,
            activeEmployeeCount: employees.filter((e) => activeIds.has(e.id)).length,
            entriesTrend: weekCountTrend(weekApproved.length, prevWeekApproved.length),
            hoursTrend: weekTrend(weekMinutes, prevWeekMinutes),
            costEur,
            rateEur,
            managerBreakdown,
            employeeBreakdown: groupByEmployee(employeeEntries).map((e) => ({
              name: e.name,
              count: e.count,
              minutes: e.minutes,
            })),
            categoryBreakdown: groupByCategory(weekApproved).map((c) => ({
              label: categoryLabel(c.category),
              count: c.count,
              minutes: c.minutes,
            })),
            clientBreakdown: groupByClient(
              clientEntries,
              clientsByOrg.get(organizationId) ?? [],
            ).map((c) => ({
              name: c.name,
              minutes: c.minutes,
            })),
            inactiveEmployeeNames,
          });
          adminSent++;
        } catch (err) {
          adminFailed++;
          console.error(`[weekly-report] Failed for admin ${admin.id}:`, err);
        }

        await sleep(SEND_DELAY_MS);
      }
    } catch (err) {
      adminFailed += orgAdmins.length;
      console.error(`[weekly-report] Failed for organization ${organizationId}:`, err);
    }
  }

  console.log(
    `[cron] weekly-report done: sent=${sent} failed=${failed} adminSent=${adminSent} adminFailed=${adminFailed}`,
  );
  return NextResponse.json({ ok: true, sent, failed, adminSent, adminFailed });
}
