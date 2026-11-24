import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isDemoEmail, sendTaskDigest, sendTeamOverdueDigest, type TaskDigestItem } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { ensureTasksForPeriod } from "@/lib/team-tasks-server";
import { daysLate, isoDay, isWorkingDay, periodOf, reminderDays, rigaToday, shortDate, taskPeople } from "@/lib/team-tasks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEND_DELAY_MS = 150; // Resend caps at 10 req/s
const DAY_MS = 86_400_000;
const LV_WEEKDAYS = ["svētdien", "pirmdien", "otrdien", "trešdien", "ceturtdien", "piektdien", "sestdien"];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Daily "Komandas vadība" run, meant for ~07:00 Riga on working days:
 * 1. makes sure this month's tasks exist (the 1st of the month creates them);
 * 2. reminds each person of the reports due on the next working day, and once
 *    of the ones whose deadline passed on the previous working day (the pilot
 *    firm asked for one reminder the day before, not a countdown);
 * 3. tells managers and admins about their people's newly late reports.
 *
 * Not in vercel.json yet: the Hobby plan allows two crons and both are taken.
 * Add `{ "path": "/api/cron/team-tasks", "schedule": "0 5 * * 1-5" }` after
 * moving to Vercel Pro.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader?.trim() !== `Bearer ${cronSecret.trim()}`) {
    console.warn(`[cron] team-tasks unauthorized: secretConfigured=${!!cronSecret}`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = rigaToday();
  const period = periodOf(today);
  const workingDay = isWorkingDay(today);
  const { dueIso, newlyLateIso } = reminderDays(today);
  const dueDay = new Date(`${dueIso}T00:00:00.000Z`);
  // "rīt" when the deadline is literally tomorrow, otherwise the weekday.
  const dueLabel =
    dueDay.getTime() - today.getTime() === DAY_MS
      ? "rīt"
      : `${LV_WEEKDAYS[dueDay.getUTCDay()]}, ${shortDate(dueDay)}`;

  const orgs = await prisma.organization.findMany({
    where: { teamTasksEnabled: true },
    select: { id: true, name: true },
  });

  let generated = 0;
  let sent = 0;
  let failed = 0;

  for (const org of orgs) {
    generated += await ensureTasksForPeriod(org.id, period);
    // Generation runs every day; reminders only on working days.
    if (!workingDay) continue;

    const [openTasks, users] = await Promise.all([
      prisma.clientTask.findMany({
        where: {
          organizationId: org.id,
          status: { not: "DONE" },
          hasDeadline: true,
          dueDate: { gte: new Date(`${newlyLateIso}T00:00:00.000Z`), lt: new Date(dueDay.getTime() + DAY_MS) },
        },
        select: {
          assigneeId: true,
          dueDate: true,
          status: true,
          client: { select: { name: true, assignments: { select: { employeeId: true } } } },
          reportType: { select: { name: true, ownerUserId: true } },
          assignee: { select: { name: true } },
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.user.findMany({
        where: { organizationId: org.id },
        select: { id: true, name: true, email: true, role: true, managerId: true },
      }),
    ]);

    // Everyone a task belongs to: personal-column owner, or the assignee plus
    // every employee linked to the client (shared firm-column tasks).
    const peopleByTask = new Map(
      openTasks.map((t) => [
        t,
        taskPeople({
          assigneeId: t.assigneeId,
          ownerUserId: t.reportType.ownerUserId,
          clientEmployeeIds: t.client.assignments.map((a) => a.employeeId),
        }),
      ]),
    );
    const managerOf = new Map(users.map((u) => [u.id, u.managerId]));
    const nameOf = new Map(users.map((u) => [u.id, u.name]));

    const isDue = (t: (typeof openTasks)[number]) => isoDay(t.dueDate) === dueIso;
    const isNewlyLate = (t: (typeof openTasks)[number]) => isoDay(t.dueDate) === newlyLateIso;
    const item = (t: (typeof openTasks)[number]): TaskDigestItem => ({
      clientName: t.client.name,
      reportName: t.reportType.name,
      due: shortDate(t.dueDate),
      assigneeName: (peopleByTask.get(t) ?? []).map((id) => nameOf.get(id) ?? "").filter(Boolean).join(", ") || null,
      daysLate: daysLate(t, today),
    });

    for (const user of users) {
      const mine = openTasks.filter((t) => peopleByTask.get(t)?.includes(user.id));
      const dueNext = mine.filter(isDue).map(item);
      const newlyLate = mine.filter(isNewlyLate).map(item);

      // Managers and admins: the late tasks of the people they look after.
      const teamLate =
        user.role === "EMPLOYEE"
          ? []
          : openTasks
              .filter(isNewlyLate)
              .filter((t) => {
                const people = peopleByTask.get(t) ?? [];
                if (people.includes(user.id)) return false; // already in their own list
                if (user.role === "ADMIN") return true;
                return people.length === 0 || people.some((id) => managerOf.get(id) === user.id);
              })
              .map(item);

      if (dueNext.length + newlyLate.length === 0 && teamLate.length === 0) continue;

      const link = user.role === "EMPLOYEE" ? "/employee/uzdevumi" : "/manager/uzdevumi";
      try {
        if (dueNext.length + newlyLate.length > 0) {
          const parts = [
            dueNext.length ? `${dueLabel} termiņš ${dueNext.length}` : null,
            newlyLate.length ? `${newlyLate.length} nokavētas` : null,
          ].filter(Boolean);
          await createNotification({
            organizationId: org.id,
            userId: user.id,
            title: `Atskaites: ${parts.join(", ")}`,
            link,
          });
          if (user.email && !isDemoEmail(user.email)) {
            await sendTaskDigest({ to: user.email, name: user.name, orgName: org.name, dueNext, dueLabel, newlyLate, link });
            sent++;
            await sleep(SEND_DELAY_MS);
          }
        }
        if (teamLate.length > 0) {
          await createNotification({
            organizationId: org.id,
            userId: user.id,
            title: `Komandā ${teamLate.length} nokavētas atskaites`,
            link: "/manager/uzdevumi",
          });
          if (user.email && !isDemoEmail(user.email)) {
            await sendTeamOverdueDigest({ to: user.email, name: user.name, orgName: org.name, overdue: teamLate });
            sent++;
            await sleep(SEND_DELAY_MS);
          }
        }
      } catch (err) {
        failed++;
        console.error(`[cron] team-tasks failed for user ${user.id}:`, err);
      }
    }
  }

  console.log(`[cron] team-tasks done: orgs=${orgs.length} generated=${generated} sent=${sent} failed=${failed}`);
  return NextResponse.json({ ok: true, orgs: orgs.length, generated, sent, failed, workingDay });
}
