"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { smartLogDraftSchema } from "@/lib/smart-log";
import { resolveClientSelection } from "@/lib/client-name";
import { normalizePersonName } from "@/lib/work-nature";

const confirmedTicketSchema = smartLogDraftSchema.extend({
  estimated_time_minutes: z.number().int().min(1).max(1440),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  confirmed: z.literal(true),
  client_id: z.string().nullable().optional(),
  helped_user_id: z.string().nullable().optional(),
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

  const [employee, orgClients, colleagues] = await Promise.all([
    prisma.user.findFirst({
      where: { id: session.userId, organizationId: session.organizationId },
      select: { managerId: true, name: true },
    }),
    prisma.client.findMany({
      where: {
        organizationId: session.organizationId,
        status: "active",
      },
      select: { id: true, name: true, aliases: { select: { normalized: true } } },
    }),
    prisma.user.findMany({
      where: {
        organizationId: session.organizationId,
        NOT: { id: session.userId },
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

  // Every entry must name a client from the firm's list (or none): a name the
  // AI misheard is not a client, and a client id from outside the firm is not
  // allowed to attach hours to it.
  const clientSelections = parsed.data.tickets.map((ticket) =>
    resolveClientSelection(
      { clientId: ticket.client_id, clientName: ticket.client_name },
      orgClients,
    ),
  );
  const unknownClient = clientSelections.find((selection) => !selection.ok);
  if (unknownClient && !unknownClient.ok) {
    return {
      ok: false as const,
      error: unknownClient.unknownName
        ? `Klients "${unknownClient.unknownName}" nav jūsu klientu sarakstā. Izvēlies klientu no saraksta vai "Nav klienta".`
        : 'Izvēlētais klients nav atrasts. Izvēlies klientu no saraksta vai "Nav klienta".',
    };
  }

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
      const colleagueIds = new Set(colleagues.map((c) => c.id));
      // Name -> id, but only for names that are unambiguous in the org, so a
      // second "Anna" never silently attributes help to the wrong person.
      const colleagueNameMap = new Map<string, string | null>();
      for (const colleague of colleagues) {
        if (!colleague.name) continue;
        const key = normalizePersonName(colleague.name);
        colleagueNameMap.set(key, colleagueNameMap.has(key) ? null : colleague.id);
      }

      await tx.invisibleWorkEntry.createMany({
        data: parsed.data.tickets.map((ticket, index) => {
          const client = clientSelections[index];
          const resolved = client.ok ? client : { clientId: null, clientName: null };

          // The recipient is only recorded when the help flag is set: an
          // explicit pick from the review UI wins, otherwise the name the AI
          // heard is matched against the org's people.
          const helpedUserId = !ticket.is_helping_colleague
            ? null
            : ticket.helped_user_id && colleagueIds.has(ticket.helped_user_id)
              ? ticket.helped_user_id
              : ticket.helped_colleague_name
                ? (colleagueNameMap.get(
                    normalizePersonName(ticket.helped_colleague_name)
                  ) ?? null)
                : null;

          return {
            organizationId: session.organizationId,
            employeeId: session.userId,
            managerId,
            title: ticket.title,
            category: ticket.category,
            description: ticket.description,
            clientName: resolved.clientName,
            clientId: resolved.clientId,
            workDate: new Date(`${ticket.workDate}T12:00:00.000Z`),
            durationMinutes: ticket.estimated_time_minutes,
            status: "APPROVED" as const,
            source: parsed.data.source === "voice" ? "ai_voice" : "ai_text",
            originalInput: parsed.data.originalInput,
            isOutsideRole: ticket.is_outside_role,
            helpedColleague: ticket.is_helping_colleague,
            helpedUserId,
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
          body:
            parsed.data.tickets.length === 1
              ? `${employee.name} pievienoja 1 ierakstu - tas automātiski apstiprināts.`
              : `${employee.name} pievienoja ${parsed.data.tickets.length} ierakstus - tie automātiski apstiprināti.`,
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
