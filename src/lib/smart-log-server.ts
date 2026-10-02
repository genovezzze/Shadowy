import "server-only";
import { prisma } from "@/lib/db";
import { categoriesForWorkRole, type SmartLogCategoryDef } from "@/lib/smart-log";

/**
 * The selectable category set for a specific employee, chosen from their work
 * role. Server-only because it hits the database; UI components receive the
 * result as a prop.
 */
export async function categoriesForUser(
  userId: string,
): Promise<readonly SmartLogCategoryDef[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workRole: { select: { name: true } } },
  });
  return categoriesForWorkRole(user?.workRole?.name);
}
