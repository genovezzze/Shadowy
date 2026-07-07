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
  client_id: z.string().nullable().optional(),
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

  const [employee, orgClients] = await Promise.all([
    prisma.user.findFirst({
      where: { id: session.userId, organizationId: session.organizationId },
      select: { managerId: true, name: true },
    }),
    prisma.client.findMany({
      where: {
        organizationId: session.organizationId,
        status: "active",
      },
      select: { id: true, name: true },
    }),
  ]);

  if (!employee?.managerId) {
    return {
      ok: false as const,
      error:
        "Tev vēl nav piesaistīts vadītājs. Sazinies ar administratoru.",
    };
  }
  const managerId = employee.managerId;

  // Allow UTC+14 offset: "today" for any timezone is at most UTC+1 day
  const maxDate = new Date();
  maxDate.setUTCDate(maxDate.getUTCDate() + 1);
  const maxDateStr = maxDate.toISOString().slice(0, 10);
  if (parsed.data.tickets.some((ticket) => ticket.workDate > maxDateStr)) {
    return {
      ok: false as const,
      error: "Darba datums nevar būt nākotnē.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const clientNameMap = new Map(orgClients.map((c) => [c.name.toLowerCase(), c.id]));

      await tx.invisibleWorkEntry.createMany({
        data: parsed.data.tickets.map((ticket) => {
          // Use explicitly set clientId, or auto-match by name from AI
          const resolvedClientId =
            ticket.client_id ||
            (ticket.client_name
              ? (clientNameMap.get(ticket.client_name.toLowerCase()) ?? null)
              : null);

          return {
            organizationId: session.organizationId,
            employeeId: session.userId,
            managerId,
            title: ticket.title,
            category: SMART_LOG_CATEGORY_LABELS[ticket.category],
            description: ticket.description,
            clientName: ticket.client_name || null,
            clientId: resolvedClientId,
            workDate: new Date(`${ticket.workDate}T12:00:00.000Z`),
            durationMinutes: ticket.estimated_time_minutes,
            status: "APPROVED" as const,
            source: parsed.data.source === "voice" ? "ai_voice" : "ai_text",
            originalInput: parsed.data.originalInput,
            isOutsideRole: ticket.is_outside_role,
            roleRelation: ticket.role_relation || null,
            businessImpact: ticket.business_impact || null,
            confidenceScore: ticket.confidence_score,
          };
        }),
      });

      await tx.notification.create({
        data: {
          organizationId: session.organizationId,
          userId: managerId,
          title: "Jauni darba ieraksti",
          body: `${employee.name} pievienoja ${parsed.data.tickets.length} ierakstus — tie automātiski apstiprināti.`,
          link: "/manager/dashboard",
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
