"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, roleHome } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { slugify } from "@/lib/utils";
import { isReservedSuperAdminEmail, RESERVED_EMAIL_MESSAGE } from "@/lib/superadmin";
import { trialEndsAtDate } from "@/lib/trial";
import { getClientIp, isActionRateLimited, recordActionHit, ACTION_RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

const RATE_LIMIT_KEY = "register";
const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX = 5;

const schema = z.object({
  organizationName: z
    .string()
    .min(2, "Organizācijas nosaukums ir pārāk īss.")
    .max(80),
  name: z.string().min(2, "Lūdzu, ievadiet vārdu un uzvārdu.").max(80),
  email: z.string().email("Lūdzu, ievadiet derīgu e-pasta adresi."),
  password: z
    .string()
    .min(8, "Parolei jābūt vismaz 8 simbolus garai.")
    .max(120),
  termsAccepted: z
    .string()
    .refine(
      (value) => value === "true",
      "Lūdzu, izlasiet un pieņemiet lietošanas noteikumus.",
    ),
});

const DEFAULT_CATEGORIES = [
  "Palīdzība kolēģiem",
  "Jauno darbinieku ievadīšana",
  "Koordinācija",
  "Tulkošanas palīdzība",
  "Telefoniskais atbalsts",
  "Papildu komunikācija",
  "Emocionālais atbalsts",
  "Darbs ārpus lomas",
  "Atkārtots atbalsts",
];

export async function registerAction(formData: FormData) {
  const ip = getClientIp();
  if (await isActionRateLimited(RATE_LIMIT_KEY, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MINUTES)) {
    return { ok: false as const, error: ACTION_RATE_LIMIT_MESSAGE };
  }
  await recordActionHit(RATE_LIMIT_KEY, ip, RATE_LIMIT_WINDOW_MINUTES);

  const parsed = schema.safeParse({
    organizationName: formData.get("organizationName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    termsAccepted: formData.get("termsAccepted"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  const { organizationName, name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Registering the configured super-admin address would hand out that role.
  if (isReservedSuperAdminEmail(normalizedEmail)) {
    return { ok: false as const, error: RESERVED_EMAIL_MESSAGE };
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return {
      ok: false as const,
      error: "Lietotājs ar šādu e-pastu jau eksistē.",
    };
  }

  const baseSlug = slugify(organizationName) || "organizacija";
  let slug = baseSlug;
  let i = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${baseSlug}-${i}`;
  }

  const passwordHash = await hashPassword(password);

  const org = await prisma.organization.create({
    data: {
      name: organizationName,
      slug,
      trialEndsAt: trialEndsAtDate(),
      categories: {
        create: DEFAULT_CATEGORIES.map((n) => ({ name: n })),
      },
      users: {
        create: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: "ADMIN",
          title: "Administrators",
        },
      },
    },
    include: { users: true },
  });

  const admin = org.users[0];

  await createSession({
    userId: admin.id,
    organizationId: org.id,
    role: admin.role,
    email: admin.email,
    name: admin.name,
  });

  return { ok: true as const, redirectTo: roleHome(admin.role) };
}
