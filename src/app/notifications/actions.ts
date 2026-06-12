"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function listNotifications() {
  const session = await requireUser();

  return prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function markNotificationRead(id: string) {
  const session = await requireUser();

  await prisma.notification.updateMany({
    where: { id, userId: session.userId },
    data: { read: true },
  });

  revalidatePath("/", "layout");
}

export async function markAllNotificationsRead() {
  const session = await requireUser();

  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true },
  });

  revalidatePath("/", "layout");
}
