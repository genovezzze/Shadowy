"use server";

import { z } from "zod";
import { sendPilotInquiry } from "@/lib/email";
import { prisma } from "@/lib/db";
import { getClientIp, isActionRateLimited, recordActionHit, ACTION_RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

const RATE_LIMIT_KEY = "pilot-lead";
const RATE_LIMIT_WINDOW_MINUTES = 60;
const RATE_LIMIT_MAX = 3;

const schema = z.object({
  name: z.string().min(2, "Lūdzu, ievadiet vārdu.").max(100),
  company: z.string().min(2, "Lūdzu, ievadiet uzņēmuma nosaukumu.").max(100),
  email: z.string().email("Lūdzu, ievadiet derīgu e-pastu."),
  teamSize: z.string().min(1, "Lūdzu, izvēlieties komandas lielumu."),
  comment: z.string().max(1000).optional().default(""),
});

export async function submitPilotApplication(formData: FormData) {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    teamSize: formData.get("teamSize"),
    comment: formData.get("comment") ?? "",
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const ip = getClientIp();
  if (await isActionRateLimited(RATE_LIMIT_KEY, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MINUTES)) {
    return { ok: false as const, error: ACTION_RATE_LIMIT_MESSAGE };
  }
  await recordActionHit(RATE_LIMIT_KEY, ip, RATE_LIMIT_WINDOW_MINUTES);

  let savedToDatabase = false;
  let emailSent = false;

  try {
    await prisma.pilotLead.create({
      data: {
        name: parsed.data.name,
        company: parsed.data.company,
        email: parsed.data.email,
        teamSize: parsed.data.teamSize,
        comment: parsed.data.comment || null,
      },
    });
    savedToDatabase = true;
  } catch (error) {
    // DB save failed - still try to send email so the lead isn't lost
    console.error("[pilot] Database save failed", error);
  }

  try {
    await sendPilotInquiry(parsed.data);
    emailSent = true;
  } catch (error) {
    // Email failed but DB save succeeded - not a user-facing error
    console.error("[pilot] Email notification failed", error);
  }

  if (!savedToDatabase && !emailSent) {
    return {
      ok: false as const,
      error: "Pieteikumu neizdevās nosūtīt. Lūdzu, mēģiniet vēlreiz.",
    };
  }

  return { ok: true as const };
}

const chatSchema = z.object({
  email: z.string().email("Lūdzu, ievadiet derīgu e-pastu."),
  teamSize: z.string().max(100).optional().default(""),
  niche: z.string().max(200).optional().default(""),
  message: z.string().max(1000).optional().default(""),
});

/**
 * The landing concierge chat's pilot intake: team size, niche, wishes and an
 * email, gathered step by step. It lands in the same place as the full pilot
 * form (the PilotLead table plus the notification email); the niche and wishes
 * are folded into the comment, with a placeholder name so it is easy to spot as
 * a chat lead.
 */
export async function submitChatLead(input: {
  email: string;
  teamSize?: string;
  niche?: string;
  message?: string;
}) {
  const parsed = chatSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const ip = getClientIp();
  if (await isActionRateLimited(RATE_LIMIT_KEY, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MINUTES)) {
    return { ok: false as const, error: ACTION_RATE_LIMIT_MESSAGE };
  }
  await recordActionHit(RATE_LIMIT_KEY, ip, RATE_LIMIT_WINDOW_MINUTES);

  const commentParts = [
    parsed.data.niche ? `Nozare: ${parsed.data.niche}` : "",
    parsed.data.message ? `Vēlmes: ${parsed.data.message}` : "",
  ].filter(Boolean);

  const lead = {
    name: "Čata pieteikums",
    company: parsed.data.niche || "-",
    email: parsed.data.email,
    teamSize: parsed.data.teamSize || "-",
    comment: commentParts.join(" · "),
  };

  let savedToDatabase = false;
  let emailSent = false;

  try {
    await prisma.pilotLead.create({
      data: { ...lead, comment: lead.comment || null },
    });
    savedToDatabase = true;
  } catch (error) {
    console.error("[chat-lead] Database save failed", error);
  }

  try {
    await sendPilotInquiry(lead);
    emailSent = true;
  } catch (error) {
    console.error("[chat-lead] Email notification failed", error);
  }

  if (!savedToDatabase && !emailSent) {
    return {
      ok: false as const,
      error: "Neizdevās nosūtīt. Lūdzu, mēģiniet vēlreiz.",
    };
  }

  return { ok: true as const };
}
