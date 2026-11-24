"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isTeamTasksEnabled } from "@/lib/team-tasks-server";
import { isoDay, rigaToday } from "@/lib/team-tasks";
import { parseQuickTask } from "@/lib/quick-tasks";
import { createNotification } from "@/lib/notifications";

type Result = { ok: true; summary?: string } | { ok: false; error: string };

function revalidate() {
  revalidatePath("/employee/uzdevumi");
  revalidatePath("/manager/uzdevumi");
}

async function sessionWithModule() {
  const session = await requireUser();
  if (!(await isTeamTasksEnabled(session.organizationId))) return null;
  return session;
}

/** "Zvanīt Letex par izrakstu rīt" -> a to-do with a date and a client. */
export async function addQuickTask(raw: string): Promise<Result> {
  const session = await sessionWithModule();
  if (!session) return { ok: false, error: "Nav piekļuves." };
  const text = typeof raw === "string" ? raw.trim().slice(0, 300) : "";
  if (!text) return { ok: false, error: "Ierakstiet, kas jādara." };

  const [clients, people] = await Promise.all([
    prisma.client.findMany({
      where: {
        organizationId: session.organizationId,
        status: "active",
        // Employees link their own clients; managers any client of the firm.
        ...(session.role === "EMPLOYEE" ? { assignments: { some: { employeeId: session.userId } } } : {}),
      },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { organizationId: session.organizationId, NOT: { id: session.userId } },
      select: { id: true, name: true, role: true },
    }),
  ]);

  const parsed = parseQuickTask(text, { today: rigaToday(), clients, people });
  await prisma.quickTask.create({
    data: {
      organizationId: session.organizationId,
      createdById: session.userId,
      assigneeId: parsed.assigneeId ?? session.userId,
      clientId: parsed.clientId,
      text: parsed.text,
      dueDate: parsed.dueDate,
    },
  });

  // A to-do handed to a colleague must reach them, not just sit in a list.
  if (parsed.assigneeId) {
    const me = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } });
    const to = people.find((p) => p.id === parsed.assigneeId);
    await createNotification({
      organizationId: session.organizationId,
      userId: parsed.assigneeId,
      title: `${me?.name ?? "Kolēģis"} nodod jums darbu`,
      body: parsed.text,
      link: to?.role === "EMPLOYEE" ? "/employee/uzdevumi" : "/manager/uzdevumi",
    });
  }

  const bits: string[] = [];
  if (parsed.dueDate) bits.push(`termiņš ${isoDay(parsed.dueDate).slice(8, 10)}.${isoDay(parsed.dueDate).slice(5, 7)}`);
  if (parsed.clientId) bits.push(`klients ${clients.find((c) => c.id === parsed.clientId)?.name}`);
  if (parsed.assigneeId) bits.push(`nodots ${people.find((p) => p.id === parsed.assigneeId)?.name}`);
  revalidate();
  return { ok: true, summary: bits.length ? `Pievienots: ${bits.join(", ")}` : "Pievienots" };
}

/** Only the person doing it or the one who wrote it may touch a to-do. */
async function ownTask(id: string, userId: string, organizationId: string) {
  return prisma.quickTask.findFirst({
    where: { id, organizationId, OR: [{ assigneeId: userId }, { createdById: userId }] },
    select: { id: true, done: true },
  });
}

export async function toggleQuickTask(id: string): Promise<Result> {
  const session = await sessionWithModule();
  if (!session || typeof id !== "string") return { ok: false, error: "Nav piekļuves." };
  const task = await ownTask(id, session.userId, session.organizationId);
  if (!task) return { ok: false, error: "Uzdevums nav atrasts." };
  await prisma.quickTask.update({
    where: { id: task.id },
    data: { done: !task.done, doneAt: task.done ? null : new Date() },
  });
  revalidate();
  return { ok: true };
}

export async function deleteQuickTask(id: string): Promise<Result> {
  const session = await sessionWithModule();
  if (!session || typeof id !== "string") return { ok: false, error: "Nav piekļuves." };
  const task = await ownTask(id, session.userId, session.organizationId);
  if (!task) return { ok: false, error: "Uzdevums nav atrasts." };
  await prisma.quickTask.delete({ where: { id: task.id } });
  revalidate();
  return { ok: true };
}
