"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(2, "Virsraksts ir pārāk īss.").max(150),
  body: z.string().min(2, "Teksts ir pārāk īss.").max(2000),
});

export async function createAnnouncement(formData: FormData) {
  const session = await requireUser(["ADMIN"]);

  const parsed = schema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  await prisma.announcement.create({
    data: {
      organizationId: session.organizationId,
      createdById: session.userId,
      title: parsed.data.title,
      body: parsed.data.body,
    },
  });

  revalidatePath("/admin/announcements");
  return { ok: true as const };
}

export async function deleteAnnouncement(id: string) {
  const session = await requireUser(["ADMIN"]);

  const announcement = await prisma.announcement.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!announcement) {
    return { ok: false as const, error: "Paziņojums nav atrasts." };
  }

  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/admin/announcements");
  return { ok: true as const };
}
