import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyManagerReport } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekAgo = new Date(Date.now() - 7 * 86400000);

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

  const orgNames = new Map<string, string>();
  const orgs = await prisma.organization.findMany({ select: { id: true, name: true } });
  for (const o of orgs) orgNames.set(o.id, o.name);

  await Promise.all(
    managers.map(async (manager) => {
      if (!manager.email) return;

      const [pendingCount, teamSize, weekApproved] = await Promise.all([
        prisma.invisibleWorkEntry.count({
          where: {
            organizationId: manager.organizationId,
            managerId: manager.id,
            status: "PENDING",
          },
        }),
        prisma.user.count({
          where: {
            organizationId: manager.organizationId,
            managerId: manager.id,
            role: "EMPLOYEE",
          },
        }),
        prisma.invisibleWorkEntry.findMany({
          where: {
            organizationId: manager.organizationId,
            managerId: manager.id,
            status: "APPROVED",
            updatedAt: { gte: weekAgo },
          },
          select: { durationMinutes: true },
        }),
      ]);

      const weekHours =
        Math.round(
          (weekApproved.reduce((s, e) => s + e.durationMinutes, 0) / 60) * 10
        ) / 10;

      await sendWeeklyManagerReport({
        to: manager.email,
        managerName: manager.name ?? "",
        orgName: orgNames.get(manager.organizationId) ?? "",
        pendingCount,
        weekEntries: weekApproved.length,
        weekHours,
        teamSize,
      });

      sent++;
    })
  );

  return NextResponse.json({ ok: true, sent });
}
