import "server-only";
import { randomBytes, createHash } from "crypto";
import { prisma } from "./db";

const TOKEN_TTL_MINUTES = 60;

/** Hash a raw reset token before storing/looking it up. */
export function hashResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Create a single-use reset token for a user.
 * Returns the RAW token (to embed in the email link); only its hash is stored.
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000);

  // Invalidate any previous tokens for this user, then create the new one.
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } }),
  ]);

  return rawToken;
}

/** Look up a valid (unused, unexpired) token. Returns the userId or null. */
export async function consumePasswordResetToken(
  rawToken: string
): Promise<{ userId: string } | null> {
  const tokenHash = hashResetToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { userId: record.userId };
}

/** Validate a token without consuming it (for rendering the reset form). */
export async function isResetTokenValid(rawToken: string): Promise<boolean> {
  const tokenHash = hashResetToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  return !!record && !record.usedAt && record.expiresAt >= new Date();
}
