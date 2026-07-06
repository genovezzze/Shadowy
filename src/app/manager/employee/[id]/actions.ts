"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function toggleCanSeeAllClients(employeeId: string, current: boolean) {
  const session = await requireUser(["MANAGER", "ADMIN"]);

  const employee = await prisma.user.findFirst({
    where: { id: employeeId, organizationId: session.organizationId, role: "EMPLOYEE" },
  });
  if (!employee) return { ok: false as const };

  await prisma.user.update({
    where: { id: employeeId },
    data: { canSeeAllClients: !current },
  });

  revalidatePath(`/manager/employee/${employeeId}`);
  return { ok: true as const };
}
