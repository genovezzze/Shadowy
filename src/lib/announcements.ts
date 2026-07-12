import "server-only";
import { prisma } from "@/lib/db";

export function getUnreadAnnouncementForUser(userId: string, organizationId: string) {
  return prisma.announcement.findFirst({
    where: { organizationId, reads: { none: { userId } } },
    orderBy: { createdAt: "desc" },
  });
}
