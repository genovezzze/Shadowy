"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isTeamTasksEnabled } from "@/lib/team-tasks-server";
import { checkAbsence, needsSubstitute, type AbsenceType } from "@/lib/absences";
import { utcDay } from "@/lib/team-tasks";
import { createNotification } from "@/lib/notifications";

type Result =
  | { ok: true; warnings: string[] }
  | { ok: false; error: string };

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = z.object({
  type: z.enum(["vacation", "sick", "busy"]),
  startDate: z.string().regex(DAY),
  endDate: z.string().regex(DAY),
  startTime: z.string().regex(TIME).nullable(),
  endTime: z.string().regex(TIME).nullable(),
  substituteId: z.string().nullable(),
  note: z.string().trim().max(300).nullable(),
});

function toDay(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return utcDay(y, m, d);
}

function revalidate() {
  revalidatePath("/employee/prombutne");
  revalidatePath("/manager/prombutne");
  revalidatePath("/employee/uzdevumi");
  revalidatePath("/manager/uzdevumi");
}

const TYPE_LABEL: Record<string, string> = { vacation: "atvaļinājumā", sick: "uz slimības lapu", busy: "aizņemts" };

/** dd.mm.-dd.mm. for a notification line. */
function span(start: Date, end: Date): string {
  const f = (d: Date) => `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.`;
  return start.getTime() === end.getTime() ? f(start) : `${f(start)}-${f(end)}`;
}

/** The substitute learns they cover someone once the absence is approved. */
async function notifySubstitute(absence: {
  organizationId: string;
  userId: string;
  substituteId: string | null;
  type: string;
  startDate: Date;
  endDate: Date;
}) {
  if (!absence.substituteId || absence.substituteId === absence.userId) return;
  const person = await prisma.user.findUnique({ where: { id: absence.userId }, select: { name: true } });
  await createNotification({
    organizationId: absence.organizationId,
    userId: absence.substituteId,
    title: `Jūs aizvietojat: ${person?.name ?? "kolēģi"}`,
    body: `${person?.name ?? "Kolēģis"} būs ${TYPE_LABEL[absence.type] ?? "prom"} ${span(absence.startDate, absence.endDate)}. Viņa klienti šajās dienās redzami jūsu uzdevumos.`,
    link: "/employee/uzdevumi",
  });
}

async function sessionWithModule() {
  const session = await requireUser();
  if (!(await isTeamTasksEnabled(session.organizationId))) return null;
  return session;
}

/** Someone records their own time away. Vacation and sick leave need a substitute. */
export async function saveAbsence(input: z.input<typeof schema>): Promise<Result> {
  const session = await sessionWithModule();
  if (!session) return { ok: false, error: "Nav piekļuves." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Pārbaudiet datumus un laiku." };
  const data = parsed.data;
  const type = data.type as AbsenceType;
  const startDate = toDay(data.startDate);
  const endDate = toDay(data.endDate);

  if (data.substituteId) {
    const sub = await prisma.user.findFirst({
      where: { id: data.substituteId, organizationId: session.organizationId },
      select: { id: true },
    });
    if (!sub) return { ok: false, error: "Aizvietotājs nav atrasts." };
  }

  // Everyone's absences around these dates, for the overlap rules.
  const window = 1000 * 60 * 60 * 24 * 1;
  const [others, people] = await Promise.all([
    prisma.absence.findMany({
      where: {
        organizationId: session.organizationId,
        startDate: { lte: new Date(endDate.getTime() + window) },
        endDate: { gte: new Date(startDate.getTime() - window) },
      },
      select: { id: true, userId: true, substituteId: true, type: true, startDate: true, endDate: true },
    }),
    prisma.user.findMany({ where: { organizationId: session.organizationId }, select: { id: true, name: true } }),
  ]);
  const names = new Map(people.map((p) => [p.id, p.name]));

  const issues = checkAbsence(
    { userId: session.userId, substituteId: data.substituteId, type, startDate, endDate },
    others.map((o) => ({ ...o, type: o.type as AbsenceType })),
    names,
  );
  const error = issues.find((i) => i.kind === "error");
  if (error) return { ok: false, error: error.message };

  // "Busy" is just a heads-up; managers and admins approve their own leave.
  const autoApproved = type === "busy" || session.role !== "EMPLOYEE";
  const created = await prisma.absence.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      substituteId: needsSubstitute(type) ? data.substituteId : data.substituteId || null,
      type,
      startDate,
      endDate,
      startTime: type === "busy" ? data.startTime : null,
      endTime: type === "busy" ? data.endTime : null,
      status: autoApproved ? "approved" : "planned",
      approvedById: autoApproved ? session.userId : null,
      note: data.note || null,
    },
  });

  if (autoApproved) await notifySubstitute(created);
  else {
    const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { managerId: true, name: true } });
    const approvers = await prisma.user.findMany({
      where: {
        organizationId: session.organizationId,
        OR: [{ role: "ADMIN" }, ...(me?.managerId ? [{ id: me.managerId }] : [])],
      },
      select: { id: true },
    });
    await Promise.all(
      approvers.map((a) =>
        createNotification({
          organizationId: session.organizationId,
          userId: a.id,
          title: `${me?.name ?? "Darbinieks"} piesaka prombūtni`,
          body: `${data.startDate} - ${data.endDate}. Apstipriniet sadaļā Prombūtne.`,
          link: "/manager/prombutne",
        }),
      ),
    );
  }

  revalidate();
  return { ok: true, warnings: issues.filter((i) => i.kind === "warning").map((i) => i.message) };
}

/** Managers approve their own people; admins anyone in the firm. */
export async function approveAbsence(id: string): Promise<Result> {
  const session = await requireUser(["MANAGER", "ADMIN"]);
  if (!(await isTeamTasksEnabled(session.organizationId))) return { ok: false, error: "Nav piekļuves." };
  const absence = await prisma.absence.findFirst({
    where: {
      id,
      organizationId: session.organizationId,
      ...(session.role === "MANAGER" ? { user: { managerId: session.userId } } : {}),
    },
    select: { id: true, organizationId: true, userId: true, substituteId: true, type: true, startDate: true, endDate: true },
  });
  if (!absence) return { ok: false, error: "Prombūtne nav atrasta." };
  await prisma.absence.update({
    where: { id: absence.id },
    data: { status: "approved", approvedById: session.userId },
  });
  await createNotification({
    organizationId: session.organizationId,
    userId: absence.userId,
    title: "Prombūtne apstiprināta",
    link: "/employee/prombutne",
  });
  await notifySubstitute(absence);
  revalidate();
  return { ok: true, warnings: [] };
}

/** The person themselves, their manager or an admin may remove it. */
export async function deleteAbsence(id: string): Promise<Result> {
  const session = await sessionWithModule();
  if (!session) return { ok: false, error: "Nav piekļuves." };
  const absence = await prisma.absence.findFirst({
    where: {
      id,
      organizationId: session.organizationId,
      OR: [
        { userId: session.userId },
        ...(session.role === "ADMIN" ? [{}] : []),
        ...(session.role === "MANAGER" ? [{ user: { managerId: session.userId } }] : []),
      ],
    },
    select: { id: true, userId: true, startDate: true, endDate: true },
  });
  if (!absence) return { ok: false, error: "Prombūtne nav atrasta." };
  await prisma.absence.delete({ where: { id: absence.id } });
  // Removed by a manager or admin: that is a rejection, so the person is told.
  if (absence.userId !== session.userId) {
    await createNotification({
      organizationId: session.organizationId,
      userId: absence.userId,
      title: "Prombūtne noņemta",
      body: `Jūsu prombūtni ${span(absence.startDate, absence.endDate)} noņēma vadītājs. Precizējiet ar vadītāju.`,
      link: "/employee/prombutne",
    });
  }
  revalidate();
  return { ok: true, warnings: [] };
}
