"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { sendEntryReviewedEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { statusLabel } from "@/lib/i18n";

const schema = z.object({
  entryId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "RETURN"]),
  comment: z.string().max(2000).optional().default(""),
});

export async function reviewEntry(input: {
  entryId: string;
  action: "APPROVE" | "REJECT" | "RETURN";
  comment?: string;
}) {
  const session = await requireUser(["MANAGER"]);
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Nederīgi dati." };
  }
  const { entryId, action, comment } = parsed.data;

  const entry = await prisma.invisibleWorkEntry.findFirst({
    where: {
      id: entryId,
      organizationId: session.organizationId,
      managerId: session.userId,
    },
    include: { employee: { select: { id: true, name: true, email: true } } },
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

  const status =
    action === "APPROVE"
      ? "APPROVED"
      : action === "REJECT"
      ? "REJECTED"
      : "RETURNED";

  await prisma.invisibleWorkEntry.update({
    where: { id: entry.id },
    data: {
      status,
      managerComment: action === "APPROVE" ? null : comment.trim(),
    },
  });

  if (entry.employee) {
    await createNotification({
      organizationId: session.organizationId,
      userId: entry.employee.id,
      title: `Ieraksts ${statusLabel[status as keyof typeof statusLabel].toLowerCase()}`,
      body: entry.title,
      link: "/employee/history",
    });
  }

  try {
    if (entry.employee?.email) {
      await sendEntryReviewedEmail({
        to: entry.employee.email,
        employeeName: entry.employee.name ?? "",
        entryTitle: entry.title,
        status,
        comment: action === "APPROVE" ? null : comment.trim(),
      });
    }
  } catch {}

  revalidatePath("/manager/entries");
  revalidatePath("/manager/dashboard");
  revalidatePath("/employee/history");
  revalidatePath("/admin/entries");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}

const bulkSchema = z.object({
  entryIds: z.array(z.string().min(1)).min(1).max(200),
  action: z.enum(["APPROVE", "REJECT", "RETURN"]),
  comment: z.string().max(2000).optional().default(""),
});

export async function bulkReviewEntries(input: {
  entryIds: string[];
  action: "APPROVE" | "REJECT" | "RETURN";
  comment?: string;
}) {
  const session = await requireUser(["MANAGER"]);
  const parsed = bulkSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Nederīgi dati." };

  const { entryIds, action, comment } = parsed.data;

  if ((action === "REJECT" || action === "RETURN") && comment.trim().length < 3) {
    return { ok: false as const, error: "Lūdzu, pievienojiet komentāru (vismaz 3 simbolus)." };
  }

  const status =
    action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : "RETURNED";

  const entries = await prisma.invisibleWorkEntry.findMany({
    where: {
      id: { in: entryIds },
      organizationId: session.organizationId,
      managerId: session.userId,
      status: "PENDING",
    },
    include: { employee: { select: { id: true, name: true, email: true } } },
  });

  await prisma.invisibleWorkEntry.updateMany({
    where: {
      id: { in: entries.map((e) => e.id) },
      organizationId: session.organizationId,
      managerId: session.userId,
      status: "PENDING",
    },
    data: {
      status,
      managerComment: action === "APPROVE" ? null : comment.trim(),
    },
  });

  await Promise.all(
    entries
      .filter((e) => e.employee)
      .map((e) =>
        createNotification({
          organizationId: session.organizationId,
          userId: e.employee!.id,
          title: `Ieraksts ${statusLabel[status as keyof typeof statusLabel].toLowerCase()}`,
          body: e.title,
          link: "/employee/history",
        })
      )
  );

  try {
    await Promise.all(
      entries
        .filter((e) => e.employee?.email)
        .map((e) =>
          sendEntryReviewedEmail({
            to: e.employee!.email!,
            employeeName: e.employee!.name ?? "",
            entryTitle: e.title,
            status,
            comment: action === "APPROVE" ? null : comment.trim(),
          })
        )
    );
  } catch {}

  revalidatePath("/manager/entries");
  revalidatePath("/manager/dashboard");
  revalidatePath("/employee/history");
  revalidatePath("/admin/entries");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}
