"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const updateSchema = z.object({
  entryId: z.string().min(1),
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

export async function updateEntry(formData: FormData) {
  const session = await requireUser(["EMPLOYEE"]);

  const parsed = updateSchema.safeParse({
    entryId: formData.get("entryId"),
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    workDate: formData.get("workDate"),
    durationMinutes: formData.get("durationMinutes"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const entry = await prisma.invisibleWorkEntry.findUnique({
    where: { id: parsed.data.entryId },
  });

  if (!entry || entry.employeeId !== session.userId) {
    return { ok: false as const, error: "Ieraksts nav atrasts." };
  }

  if (entry.status !== "PENDING" && entry.status !== "RETURNED") {
    return {
      ok: false as const,
      error: "Var rediģēt tikai ierakstus, kas gaida izskatīšanu vai nosūtīti atpakaļ.",
    };
  }

  await prisma.invisibleWorkEntry.update({
    where: { id: parsed.data.entryId },
    data: {
      title: parsed.data.title.trim(),
      category: parsed.data.category,
      description: parsed.data.description.trim(),
      workDate: parsed.data.workDate,
      durationMinutes: parsed.data.durationMinutes,
      ...(entry.status === "RETURNED" && { status: "PENDING", managerComment: null }),
    },
  });

  revalidatePath("/employee/history");
  revalidatePath("/employee/dashboard");
  revalidatePath("/manager/entries");
  revalidatePath("/manager/dashboard");
  revalidatePath("/admin/entries");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}

export async function deleteEntry(entryId: string) {
  const session = await requireUser(["EMPLOYEE"]);

  const entry = await prisma.invisibleWorkEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry || entry.employeeId !== session.userId) {
    return { ok: false as const, error: "Ieraksts nav atrasts." };
  }

  if (entry.status !== "PENDING" && entry.status !== "RETURNED") {
    return {
      ok: false as const,
      error: "Var dzēst tikai ierakstus, kas gaida izskatīšanu vai nosūtīti atpakaļ.",
    };
  }

  await prisma.invisibleWorkEntry.delete({ where: { id: entryId } });

  revalidatePath("/employee/history");
  revalidatePath("/employee/dashboard");
  revalidatePath("/manager/entries");
  revalidatePath("/manager/dashboard");
  revalidatePath("/admin/entries");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}
