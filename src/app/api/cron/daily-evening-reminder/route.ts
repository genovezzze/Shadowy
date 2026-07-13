import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendEveningReminder } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart.getTime() + 86400000);

  const orgs = await prisma.organization.findMany({
    where: { emailDailyReminder: true },
    select: { id: true, name: true },
  });
  const orgById = new Map(orgs.map((o) => [o.id, o]));

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE", organizationId: { in: orgs.map((o) => o.id) } },
    select: { id: true, name: true, email: true, organizationId: true },
  });

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const employee of employees) {
    if (!employee.email) continue;
    const org = orgById.get(employee.organizationId);
    if (!org) continue;

    try {
      const todayCount = await prisma.invisibleWorkEntry.count({
        where: {
          employeeId: employee.id,
          deletedAt: null,
          workDate: { gte: todayStart, lt: tomorrowStart },
        },
      });

      if (todayCount > 0) {
        skipped++;
        continue;
      }

      await sendEveningReminder({
        to: employee.email,
        employeeName: employee.name ?? "",
        orgName: org.name,
      });
      sent++;
    } catch (err) {
      failed++;
      console.error(`[daily-evening-reminder] Failed for employee ${employee.id}:`, err);
    }

    await sleep(SEND_DELAY_MS);
  }

  return NextResponse.json({ ok: true, sent, skipped, failed });
}
