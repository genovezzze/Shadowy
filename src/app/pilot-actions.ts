"use server";

import { z } from "zod";
import { sendPilotInquiry } from "@/lib/email";
import { prisma } from "@/lib/db";

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
  } catch {
    // DB save failed — still try to send email so the lead isn't lost
  }

  try {
    await sendPilotInquiry(parsed.data);
  } catch {
    // Email failed but DB save succeeded — not a user-facing error
  }

  return { ok: true as const };
}
