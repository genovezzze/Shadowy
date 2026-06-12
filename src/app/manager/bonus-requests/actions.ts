"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function revalidate() {
  revalidatePath("/manager/bonus-requests");
  revalidatePath("/manager/dashboard");
  revalidatePath("/employee/bonuses");
}

export async function approveRequest(id: string) {
  const session = await requireUser(["MANAGER"]);

  const req = await prisma.bonusRequest.findFirst({
    where: { id, managerId: session.userId, status: { in: ["PENDING", "RETURNED"] } },
  });
  if (!req) return;

  await prisma.bonusRequest.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  revalidate();
}

export async function rejectRequest(id: string) {
  const session = await requireUser(["MANAGER"]);

  const req = await prisma.bonusRequest.findFirst({
    where: { id, managerId: session.userId, status: { in: ["PENDING", "RETURNED"] } },
  });
  if (!req) return;

  await prisma.bonusRequest.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  revalidate();
}

export async function returnRequest(id: string, comment: string) {
  const session = await requireUser(["MANAGER"]);

  if (!comment.trim()) {
    return { ok: false as const, error: "Komentārs ir obligāts, nosūtot atpakaļ." };
  }

  const req = await prisma.bonusRequest.findFirst({
    where: { id, managerId: session.userId, status: "PENDING" },
  });
  if (!req) return;

  await prisma.bonusRequest.update({
    where: { id },
    data: { status: "RETURNED", managerComment: comment.trim() },
  });

  revalidate();
  return { ok: true as const };
}
