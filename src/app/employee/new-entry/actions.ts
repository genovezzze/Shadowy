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
    workDate: formData.get("workDate"),
    durationMinutes: formData.get("durationMinutes"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const employee = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  const entryTitle = parsed.data.title.trim();

  await prisma.invisibleWorkEntry.create({
    data: {
      organizationId: session.organizationId,
      employeeId: session.userId,
      managerId: employee?.managerId ?? null,
      title: entryTitle,
      category: parsed.data.category,
      description: parsed.data.description.trim(),
      workDate: parsed.data.workDate,
      durationMinutes: parsed.data.durationMinutes,
      status: "PENDING",
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

  revalidatePath("/employee/dashboard");
  revalidatePath("/employee/history");
  revalidatePath("/manager/entries");
  revalidatePath("/manager/dashboard");
  revalidatePath("/admin/entries");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}
