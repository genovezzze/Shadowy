"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  entryId: z.string().min(1),
  action: z.enum(["REJECT", "RETURN"]),
  comment: z.string().max(2000).optional().default(""),
});

export async function reviewEntryAsAdmin(input: {
  entryId: string;
  action: "REJECT" | "RETURN";
  comment?: string;
}) {
  const session = await requireUser(["ADMIN"]);
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Nederīgi dati." };
  }
  const { entryId, action, comment } = parsed.data;

  const entry = await prisma.invisibleWorkEntry.findFirst({
    where: { id: entryId, organizationId: session.organizationId },
  });
  if (!entry) {
    return { ok: false as const, error: "Ieraksts nav atrasts." };
  }

  if ((action === "REJECT" || action === "RETURN") && comment.trim().length < 3) {
    return {
      ok: false as const,
      error: "Lūdzu, pievienojiet komentāru (vismaz 3 simbolus).",
    };
  }

  const status = action === "REJECT" ? "REJECTED" : "RETURNED";

  await prisma.invisibleWorkEntry.update({
    where: { id: entry.id },
    data: { status, managerComment: comment.trim() },
  });

  revalidatePath("/admin/entries");
  revalidatePath("/admin/dashboard");
  revalidatePath("/employee/history");
  revalidatePath("/employee/dashboard");
  return { ok: true as const };
}
