import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendMorningReminder } from "@/lib/email";

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

  for (const employee of employees) {
    if (!employee.email) continue;
    const org = orgById.get(employee.organizationId);
    if (!org) continue;

    try {
      await sendMorningReminder({
        to: employee.email,
        employeeName: employee.name ?? "",
        orgName: org.name,
      });
      sent++;
    } catch (err) {
      failed++;
      console.error(`[daily-morning-reminder] Failed for employee ${employee.id}:`, err);
    }

    await sleep(SEND_DELAY_MS);
  }

  return NextResponse.json({ ok: true, sent, failed });
}
