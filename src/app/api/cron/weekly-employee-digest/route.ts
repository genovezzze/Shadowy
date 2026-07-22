import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyEmployeeDigest, sendEmptyWeekNudge, isDemoEmail } from "@/lib/email";
import {
  groupByCategory,
  groupByClient,
  topCategory,
  categoryLabel,
  weeklyRecommendation,
  weekTrend,
  weekCountTrend,
} from "@/lib/work-insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ENTRY_ROWS = 8;
// Resend caps at 10 req/s; stay well under that even for larger teams.
const SEND_DELAY_MS = 150;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader?.trim() !== `Bearer ${cronSecret.trim()}`) {
    console.warn(
      `[cron] weekly-employee-digest unauthorized: secretConfigured=${!!cronSecret} authHeaderLen=${authHeader?.length ?? 0}`
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("[cron] weekly-employee-digest started");

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);

  const orgs = await prisma.organization.findMany({
    where: { emailWeeklySummary: true },
    select: { id: true, name: true },
  });
  const orgById = new Map(orgs.map((o) => [o.id, o]));

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE", organizationId: { in: orgs.map((o) => o.id) } },
    select: { id: true, name: true, email: true, organizationId: true },
  });

  let digestsSent = 0;
  let nudgesSent = 0;
  let failed = 0;

  for (const employee of employees) {
    if (!employee.email || isDemoEmail(employee.email)) continue;
    const org = orgById.get(employee.organizationId);
    if (!org) continue;

    try {
      const [weekEntries, prevWeekEntries] = await Promise.all([
        prisma.invisibleWorkEntry.findMany({
          where: {
            organizationId: employee.organizationId,
            employeeId: employee.id,
            deletedAt: null,
            workDate: { gte: weekAgo },
          },
          select: {
            title: true,
            category: true,
            durationMinutes: true,
            clientId: true,
            clientName: true,
            client: { select: { name: true } },
          },
        }),
        prisma.invisibleWorkEntry.findMany({
          where: {
            organizationId: employee.organizationId,
            employeeId: employee.id,
            deletedAt: null,
            workDate: { gte: twoWeeksAgo, lt: weekAgo },
          },
          select: { durationMinutes: true },
        }),
      ]);

      if (weekEntries.length === 0) {
        await sendEmptyWeekNudge({
          to: employee.email,
          employeeName: employee.name ?? "",
          orgName: org.name,
        });
        nudgesSent++;
      } else {
        const grouped = groupByCategory(weekEntries);
        const top = topCategory(grouped);
        const weekMinutes = weekEntries.reduce((s, e) => s + e.durationMinutes, 0);
        const helpedCount = grouped.find((g) => g.category === "helping_colleague")?.count ?? 0;

        const prevWeekMinutes = prevWeekEntries.reduce((s, e) => s + e.durationMinutes, 0);

        const clientEntries = weekEntries.map((e) => ({
          clientId: e.clientId,
          clientName: e.client?.name ?? e.clientName,
          durationMinutes: e.durationMinutes,
        }));

        const sortedByDuration = [...weekEntries].sort((a, b) => b.durationMinutes - a.durationMinutes);
        const entryList = sortedByDuration.slice(0, MAX_ENTRY_ROWS).map((e) => ({
          title: e.title,
          category: categoryLabel(e.category),
          durationMinutes: e.durationMinutes,
        }));

        await sendWeeklyEmployeeDigest({
          to: employee.email,
          employeeName: employee.name ?? "",
          orgName: org.name,
          weekEntries: weekEntries.length,
          weekMinutes,
          helpedCount,
          entriesTrend: weekCountTrend(weekEntries.length, prevWeekEntries.length),
          hoursTrend: weekTrend(weekMinutes, prevWeekMinutes),
          topCategoryLabel: top ? categoryLabel(top.category) : null,
          recommendation: weeklyRecommendation(grouped),
          categoryBreakdown: grouped.map((g) => ({
            label: categoryLabel(g.category),
            count: g.count,
            minutes: g.minutes,
          })),
          clientBreakdown: groupByClient(clientEntries).map((c) => ({
            name: c.name,
            minutes: c.minutes,
          })),
          entryList,
          entryListMoreCount: Math.max(0, weekEntries.length - entryList.length),
        });
        digestsSent++;
      }
    } catch (err) {
      failed++;
      console.error(`[weekly-employee-digest] Failed for employee ${employee.id}:`, err);
    }

    await sleep(SEND_DELAY_MS);
  }

  console.log(`[cron] weekly-employee-digest done: digestsSent=${digestsSent} nudgesSent=${nudgesSent} failed=${failed}`);
  return NextResponse.json({ ok: true, digestsSent, nudgesSent, failed });
}
