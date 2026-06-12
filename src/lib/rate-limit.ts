import "server-only";
import { headers } from "next/headers";
import { prisma } from "./db";

const WINDOW_MINUTES = 15;
const MAX_PER_IDENTITY = 5; // failed attempts per (ip + email) within the window
const MAX_PER_IP = 20; // failed attempts per ip within the window (anti password-spray)

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(): string {
  const h = headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

/** True if this ip/email combination has exceeded the allowed failed attempts. */
export async function isLoginRateLimited(ip: string, email: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60_000);
  const normalizedEmail = email.toLowerCase().trim();

  const [identityCount, ipCount] = await Promise.all([
    prisma.loginAttempt.count({
      where: { ip, email: normalizedEmail, createdAt: { gte: windowStart } },
    }),
    prisma.loginAttempt.count({
      where: { ip, createdAt: { gte: windowStart } },
    }),
  ]);

  return identityCount >= MAX_PER_IDENTITY || ipCount >= MAX_PER_IP;
}

/** Record a failed login and opportunistically prune stale rows for this ip. */
export async function recordFailedLogin(ip: string, email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const staleBefore = new Date(Date.now() - WINDOW_MINUTES * 60_000);

  await prisma.$transaction([
    prisma.loginAttempt.create({ data: { ip, email: normalizedEmail } }),
    prisma.loginAttempt.deleteMany({ where: { ip, createdAt: { lt: staleBefore } } }),
  ]);
}

/** Clear the counter after a successful login. */
export async function clearLoginAttempts(ip: string, email: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({
    where: { ip, email: email.toLowerCase().trim() },
  });
}

export const RATE_LIMIT_MESSAGE =
  "Pārāk daudz neveiksmīgu mēģinājumu. Lūdzu, mēģiniet vēlreiz pēc 15 minūtēm.";

/**
 * Generic IP-based rate limit for public, unauthenticated actions
 * (registration, password reset requests, pilot lead form).
 * Returns true if the caller has exceeded `max` hits for `key` within `windowMinutes`.
 */
export async function isActionRateLimited(
  key: string,
  ip: string,
  max: number,
  windowMinutes: number
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60_000);
  const count = await prisma.rateLimitHit.count({
    where: { key, ip, createdAt: { gte: windowStart } },
  });
  return count >= max;
}

/** Record a hit and opportunistically prune stale rows for this key/ip. */
export async function recordActionHit(key: string, ip: string, windowMinutes: number): Promise<void> {
  const staleBefore = new Date(Date.now() - windowMinutes * 60_000);
  await prisma.$transaction([
    prisma.rateLimitHit.create({ data: { key, ip } }),
    prisma.rateLimitHit.deleteMany({ where: { key, ip, createdAt: { lt: staleBefore } } }),
  ]);
}

export const ACTION_RATE_LIMIT_MESSAGE =
  "Pārāk daudz pieprasījumu. Lūdzu, mēģiniet vēlreiz vēlāk.";
