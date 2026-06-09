"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { sendBonusRequestEmail } from "@/lib/email";

const requestSchema = z.object({
  ruleId: z.string().min(1),
  employeeComment: z.string().max(1000).optional(),
  hoursAccumulated: z.coerce.number(),
});

export async function submitBonusRequest(formData: FormData) {
  const session = await requireUser(["EMPLOYEE"]);

  const parsed = requestSchema.safeParse({
    ruleId: formData.get("ruleId"),
    employeeComment: formData.get("employeeComment") || undefined,
    hoursAccumulated: formData.get("hoursAccumulated"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const rule = await prisma.recognitionRule.findUnique({
    where: { id: parsed.data.ruleId },
  });

  if (!rule || !rule.isActive) {
    return { ok: false as const, error: "Noteikums nav pieejams." };
  }

  const employee = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { managerId: true, name: true },
  });

  if (!employee?.managerId || employee.managerId !== rule.managerId) {
    return { ok: false as const, error: "Jūs nevarat pieprasīt šo bonusu." };
  }

  if (rule.oneTimePerPeriod) {
    const existing = await prisma.bonusRequest.findFirst({
      where: {
        employeeId: session.userId,
        ruleId: parsed.data.ruleId,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });
    if (existing) {
      return {
        ok: false as const,
        error: "Jūs jau esat iesnieguši pieprasījumu par šo noteikumu.",
      };
    }
  }

  await prisma.bonusRequest.create({
    data: {
      organizationId: session.organizationId,
      employeeId: session.userId,
      managerId: rule.managerId,
      ruleId: rule.id,
      rewardType: rule.rewardType,
      hoursAccumulated: parsed.data.hoursAccumulated,
      employeeComment: parsed.data.employeeComment?.trim(),
    },
  });

  try {
    const manager = await prisma.user.findUnique({
      where: { id: rule.managerId },
      select: { name: true, email: true },
    });
    if (manager?.email) {
      await sendBonusRequestEmail({
        to: manager.email,
        managerName: manager.name ?? "",
        employeeName: employee.name ?? "",
        ruleName: rule.name,
      });
    }
  } catch {}

  revalidatePath("/employee/bonuses");
  revalidatePath("/manager/bonus-requests");
  revalidatePath("/manager/dashboard");
  return { ok: true as const };
}

export async function cancelBonusRequest(id: string) {
  const session = await requireUser(["EMPLOYEE"]);

  const req = await prisma.bonusRequest.findUnique({ where: { id } });
  if (!req || req.employeeId !== session.userId) return;
  if (req.status !== "PENDING" && req.status !== "RETURNED") return;

  await prisma.bonusRequest.delete({ where: { id } });

  revalidatePath("/employee/bonuses");
  revalidatePath("/manager/bonus-requests");
}
