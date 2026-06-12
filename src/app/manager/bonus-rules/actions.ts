"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { REWARD_TYPES, PERIOD_TYPES } from "@/lib/reward-types";

const ruleSchema = z.object({
  name: z.string().min(2, "Nosaukums ir pārāk īss.").max(100),
  description: z.string().max(500).optional(),
  minimumHours: z.coerce.number().min(0.5, "Minimāli 0.5 stundas.").max(500),
  periodType: z.enum(["WEEK", "TWO_WEEKS", "MONTH", "QUARTER"] as const),
  rewardType: z.enum(REWARD_TYPES as [string, ...string[]]) as z.ZodEnum<[string, ...string[]]>,
  categories: z.array(z.string()).default([]),
  workRoleIds: z.array(z.string()).default([]),
  oneTimePerPeriod: z.coerce.boolean().default(true),
  isActive: z.coerce.boolean().default(true),
});

function revalidate() {
  revalidatePath("/manager/bonus-rules");
  revalidatePath("/employee/bonuses");
}

export async function createRule(formData: FormData) {
  const session = await requireUser(["MANAGER"]);

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    minimumHours: formData.get("minimumHours"),
    periodType: formData.get("periodType"),
    rewardType: formData.get("rewardType"),
    categories: formData.getAll("categories"),
    workRoleIds: formData.getAll("workRoleIds"),
    oneTimePerPeriod: formData.get("oneTimePerPeriod") === "true",
    isActive: true,
  };

  const parsed = ruleSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  await prisma.recognitionRule.create({
    data: {
      organizationId: session.organizationId,
      managerId: session.userId,
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim(),
      minimumHours: parsed.data.minimumHours,
      periodType: parsed.data.periodType as any,
      rewardType: parsed.data.rewardType as any,
      categories: parsed.data.categories,
      workRoleIds: parsed.data.workRoleIds,
      oneTimePerPeriod: parsed.data.oneTimePerPeriod,
      isActive: true,
    },
  });

  revalidate();
  return { ok: true as const };
}

export async function updateRule(id: string, formData: FormData) {
  const session = await requireUser(["MANAGER"]);

  const rule = await prisma.recognitionRule.findFirst({
    where: { id, managerId: session.userId },
  });
  if (!rule) {
    return { ok: false as const, error: "Nav tiesību rediģēt šo noteikumu." };
  }

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    minimumHours: formData.get("minimumHours"),
    periodType: formData.get("periodType"),
    rewardType: formData.get("rewardType"),
    categories: formData.getAll("categories"),
    workRoleIds: formData.getAll("workRoleIds"),
    oneTimePerPeriod: formData.get("oneTimePerPeriod") === "true",
  };

  const parsed = ruleSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  await prisma.recognitionRule.update({
    where: { id },
    data: {
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim(),
      minimumHours: parsed.data.minimumHours,
      periodType: parsed.data.periodType as any,
      rewardType: parsed.data.rewardType as any,
      categories: parsed.data.categories,
      workRoleIds: parsed.data.workRoleIds,
      oneTimePerPeriod: parsed.data.oneTimePerPeriod,
    },
  });

  revalidate();
  return { ok: true as const };
}

export async function toggleRule(id: string, isActive: boolean) {
  const session = await requireUser(["MANAGER"]);

  const rule = await prisma.recognitionRule.findFirst({
    where: { id, managerId: session.userId },
  });
  if (!rule) return;

  await prisma.recognitionRule.update({ where: { id }, data: { isActive } });
  revalidate();
}

export async function deleteRule(id: string) {
  const session = await requireUser(["MANAGER"]);

  const rule = await prisma.recognitionRule.findFirst({
    where: { id, managerId: session.userId },
  });
  if (!rule) return;

  await prisma.recognitionRule.delete({ where: { id } });
  revalidate();
}
