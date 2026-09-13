"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

/**
 * An employee asks for their data to be deleted / anonymised. We do not delete
 * anything automatically — the request is routed to the organisation's admins,
 * who handle it as part of offboarding. This keeps a human in the loop and
 * avoids destroying records another role may still be reviewing.
 */
export async function requestDataDeletion(formData: FormData): Promise<{ ok: true }> {
  const session = await requireUser(["EMPLOYEE"]);
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);

  const admins = await prisma.user.findMany({
    where: { organizationId: session.organizationId, role: "ADMIN" },
    select: { id: true },
  });

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        organizationId: session.organizationId,
        userId: admin.id,
        title: `Datu dzēšanas pieprasījums: ${session.name}`,
        body: reason
          ? `${session.name} (${session.email}) lūdz dzēst vai anonimizēt savus datus. Pamatojums: ${reason}`
          : `${session.name} (${session.email}) lūdz dzēst vai anonimizēt savus datus.`,
        link: "/admin/employees",
      }),
    ),
  );

  return { ok: true };
}
