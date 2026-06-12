import "server-only";
import { prisma } from "./db";

export async function createNotification(input: {
  organizationId: string;
  userId: string;
  title: string;
  body?: string;
  link?: string;
}) {
  await prisma.notification.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      title: input.title,
      body: input.body,
      link: input.link,
    },
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}
