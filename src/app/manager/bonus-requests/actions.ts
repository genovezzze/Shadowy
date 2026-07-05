"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

function revalidate() {
  revalidatePath("/manager/bonus-requests");
  revalidatePath("/manager/dashboard");
  revalidatePath("/employee/bonuses");
}

export async function approveRequest(id: string) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const req = await prisma.bonusRequest.findFirst({
    where: { id, managerId: session.userId, status: { in: ["PENDING", "RETURNED"] } },
    include: { rule: { select: { name: true } } },
  });
  if (!req) return;

  await prisma.bonusRequest.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  await createNotification({
    organizationId: session.organizationId,
    userId: req.employeeId,
    title: "Bonusa pieprasījums apstiprināts",
    body: req.rule.name,
    link: "/employee/bonuses",
  });

  revalidate();
}

export async function rejectRequest(id: string) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const req = await prisma.bonusRequest.findFirst({
    where: { id, managerId: session.userId, status: { in: ["PENDING", "RETURNED"] } },
    include: { rule: { select: { name: true } } },
  });
  if (!req) return;

  await prisma.bonusRequest.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  await createNotification({
    organizationId: session.organizationId,
    userId: req.employeeId,
    title: "Bonusa pieprasījums noraidīts",
    body: req.rule.name,
    link: "/employee/bonuses",
  });

  revalidate();
}

export async function returnRequest(id: string, comment: string) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  if (!comment.trim()) {
    return { ok: false as const, error: "Komentārs ir obligāts, nosūtot atpakaļ." };
  }

  const req = await prisma.bonusRequest.findFirst({
    where: { id, managerId: session.userId, status: "PENDING" },
    include: { rule: { select: { name: true } } },
  });
  if (!req) return;

  await prisma.bonusRequest.update({
    where: { id },
    data: { status: "RETURNED", managerComment: comment.trim() },
  });

  await createNotification({
    organizationId: session.organizationId,
    userId: req.employeeId,
    title: "Bonusa pieprasījums nosūtīts atpakaļ",
    body: req.rule.name,
    link: "/employee/bonuses",
  });

  revalidate();
  return { ok: true as const };
}
