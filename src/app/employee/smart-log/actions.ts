"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import {
  SMART_LOG_CATEGORY_LABELS,
  smartLogDraftSchema,
} from "@/lib/smart-log";

const confirmedTicketSchema = smartLogDraftSchema.extend({
  estimated_time_minutes: z.number().int().min(1).max(1440),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  confirmed: z.literal(true),
});

const saveSchema = z.object({
  originalInput: z.string().trim().min(10).max(4000),
  source: z.enum(["text", "voice"]),
  tickets: z.array(confirmedTicketSchema).min(1).max(8),
});

export type ConfirmedSmartLogTicket = z.infer<typeof confirmedTicketSchema>;

export async function saveConfirmedSmartLogTickets(input: {
  originalInput: string;
  source: "text" | "voice";
  tickets: ConfirmedSmartLogTicket[];
}) {
  const session = await requireUser(["EMPLOYEE"]);
  const parsed = saveSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Pārbaudi apstiprināto ierakstu laukus un mēģini vēlreiz.",
    };
  }

  const employee = await prisma.user.findFirst({
    where: {
      id: session.userId,
      organizationId: session.organizationId,
    },
    select: { managerId: true, name: true },
  });

  if (!employee?.managerId) {
    return {
      ok: false as const,
      error:
        "Tev vēl nav piesaistīts vadītājs. Sazinies ar administratoru.",
    };
  }
  const managerId = employee.managerId;

  const today = new Date().toISOString().slice(0, 10);
  if (parsed.data.tickets.some((ticket) => ticket.workDate > today)) {
    return {
      ok: false as const,
      error: "Darba datums nevar būt nākotnē.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.invisibleWorkEntry.createMany({
        data: parsed.data.tickets.map((ticket) => ({
          organizationId: session.organizationId,
          employeeId: session.userId,
          managerId,
          title: ticket.title,
          category: SMART_LOG_CATEGORY_LABELS[ticket.category],
          description: ticket.description,
          workDate: new Date(`${ticket.workDate}T12:00:00.000Z`),
          durationMinutes: ticket.estimated_time_minutes,
          status: "PENDING" as const,
          source: parsed.data.source === "voice" ? "ai_voice" : "ai_text",
          originalInput: parsed.data.originalInput,
          isOutsideRole: ticket.is_outside_role,
          roleRelation: ticket.role_relation || null,
          businessImpact: ticket.business_impact || null,
          confidenceScore: ticket.confidence_score,
        })),
      });

      await tx.notification.create({
        data: {
          organizationId: session.organizationId,
          userId: managerId,
          title: "Jauni darba ieraksti",
          body: `${employee.name} iesniedza ${parsed.data.tickets.length} ierakstus no viedā darba žurnāla.`,
          link: "/manager/entries",
        },
      });
    });
  } catch {
    return {
      ok: false as const,
      error: "Neizdevās saglabāt ierakstus. Lūdzu, mēģini vēlreiz.",
    };
  }

  revalidatePath("/employee/dashboard");
  revalidatePath("/employee/history");
  revalidatePath("/manager/entries");
  revalidatePath("/manager/dashboard");
  revalidatePath("/admin/entries");
  revalidatePath("/admin/dashboard");

  return { ok: true as const, count: parsed.data.tickets.length };
}
