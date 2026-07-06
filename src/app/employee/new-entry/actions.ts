"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { sendEntrySubmittedEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
  title: z.string().min(3, "Nosaukums ir pārāk īss.").max(120),
  category: z.string().min(1, "Lūdzu, izvēlieties kategoriju.").max(80),
  description: z
    .string()
    .min(10, "Lūdzu, aprakstiet vismaz dažus teikumus.")
    .max(2000),
  clientName: z.string().trim().max(120).optional(),
  clientId: z.string().optional(),
  workDate: z.coerce.date(),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(1, "Ilgumam jābūt vismaz 1 minūte.")
    .max(1440, "Ilgums nedrīkst pārsniegt 24 stundas."),
});

export async function createEntry(formData: FormData) {
  const session = await requireUser(["EMPLOYEE"]);

  const parsed = schema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    clientName: formData.get("clientName"),
    clientId: formData.get("clientId") || undefined,
    workDate: formData.get("workDate"),
    durationMinutes: formData.get("durationMinutes"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const [employee, org] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: { emailOnNewEntry: true },
    }),
  ]);

  // Resolve clientId: verify it belongs to this org
  let resolvedClientId: string | null = null;
  if (parsed.data.clientId) {
    const client = await prisma.client.findFirst({
      where: { id: parsed.data.clientId, organizationId: session.organizationId },
    });
    resolvedClientId = client?.id ?? null;
  }

  const entryTitle = parsed.data.title.trim();

  await prisma.invisibleWorkEntry.create({
    data: {
      organizationId: session.organizationId,
      employeeId: session.userId,
      managerId: employee?.managerId ?? null,
      title: entryTitle,
      category: parsed.data.category,
      description: parsed.data.description.trim(),
      clientName: parsed.data.clientName || null,
      clientId: resolvedClientId,
      workDate: parsed.data.workDate,
      durationMinutes: parsed.data.durationMinutes,
      status: "APPROVED",
    },
  });

  if (employee?.managerId) {
    await createNotification({
      organizationId: session.organizationId,
      userId: employee.managerId,
      title: "Jauns darba ieraksts",
      body: `${employee.name} iesniedza: ${entryTitle}`,
      link: "/manager/entries",
    });

    if (org?.emailOnNewEntry !== false) {
      try {
        const manager = await prisma.user.findUnique({
          where: { id: employee.managerId },
          select: { name: true, email: true },
        });
        if (manager?.email) {
          await sendEntrySubmittedEmail({
            to: manager.email,
            managerName: manager.name ?? "",
            employeeName: employee.name ?? "",
            entryTitle,
          });
        }
      } catch {}
    }
  }

  revalidatePath("/employee/dashboard");
  revalidatePath("/employee/history");
  revalidatePath("/manager/entries");
  revalidatePath("/manager/dashboard");
  revalidatePath("/admin/entries");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}
