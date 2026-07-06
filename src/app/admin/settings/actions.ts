"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const settingsSchema = z.object({
  emailOnNewEntry: z.boolean(),
  emailOnEntryApproved: z.boolean(),
  emailWeeklySummary: z.boolean(),
});

export async function updateEmailSettings(input: {
  emailOnNewEntry: boolean;
  emailOnEntryApproved: boolean;
  emailWeeklySummary: boolean;
}) {
  const session = await requireUser(["ADMIN"]);
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Nepareizi dati." };
  }

  await prisma.organization.update({
    where: { id: session.organizationId },
    data: parsed.data,
  });

  revalidatePath("/admin/settings");
  return { ok: true as const };
}
