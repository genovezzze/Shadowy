"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function dismissAnnouncement(announcementId: string) {
  const session = await requireUser(["EMPLOYEE"]);
  await prisma.announcementRead.upsert({
    where: { announcementId_userId: { announcementId, userId: session.userId } },
    create: { announcementId, userId: session.userId },
    update: {},
  });
  revalidatePath("/employee", "layout");
}
