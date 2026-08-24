import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyManagerReport, sendWeeklyAdminReport, isDemoEmail } from "@/lib/email";
import { buildAdminWeeklyReport, buildManagerWeeklyReport } from "@/lib/weekly-report";

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
  if (!cronSecret || authHeader?.trim() !== `Bearer ${cronSecret.trim()}`) {
    console.warn(
      `[cron] weekly-report unauthorized: secretConfigured=${!!cronSecret} authHeaderLen=${authHeader?.length ?? 0}`
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("[cron] weekly-report started");

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

  // Only needed for the admin side, which honours the organisation's own
  // "weekly summary" switch.
  const orgs = await prisma.organization.findMany({
    select: { id: true, emailWeeklySummary: true },
  });
  const orgById = new Map(orgs.map((o) => [o.id, o]));

  for (const manager of managers) {
    if (!manager.email || isDemoEmail(manager.email)) continue;

    try {
      const report = await buildManagerWeeklyReport(manager.id);
      if (!report) continue;

      await sendWeeklyManagerReport({
        ...report,
        to: manager.email,
        managerName: manager.name ?? "",
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
      const report = await buildAdminWeeklyReport(organizationId);
      if (!report) continue;

      for (const admin of orgAdmins) {
        try {
          await sendWeeklyAdminReport({
            ...report,
            to: admin.email!,
            adminName: admin.name ?? "",
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
