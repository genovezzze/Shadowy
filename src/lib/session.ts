import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "shadowy_session";

const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-change-me-please-min32chars";

let cachedSecret: Uint8Array | null = null;

/**
 * The signing key, resolved on first use rather than at import time — a missing
 * variable must fail the request, not the build.
 *
 * A checked-in fallback would let anyone who can read this file sign a session
 * for any user of any organisation, so production fails closed instead.
 */
function sessionSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;

  const configured = process.env.SESSION_SECRET;
  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is not set. Refusing to sign sessions with the development fallback.",
    );
  }

  cachedSecret = new TextEncoder().encode(configured ?? DEV_FALLBACK_SECRET);
  return cachedSecret;
}

export type SessionPayload = {
  userId: string;
  organizationId: string;
  role: Role;
  email: string;
  name: string;
};

/** The signed payload plus the JWT's issued-at claim, used for revocation checks. */
export type VerifiedSession = SessionPayload & { iat?: number };

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days (Google OAuth / default)
const REMEMBER_ME_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days
const SESSION_ONLY_DURATION_SECONDS = 60 * 60 * 24; // 24 h (no-remember JWT TTL)

/** Cookie options shared by createSession and route handlers that set the session directly. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

/** Sign a session JWT without touching cookies (for use in route handlers). */
export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(sessionSecret());
}

export async function createSession(payload: SessionPayload, rememberMe = false) {
  const duration = rememberMe ? REMEMBER_ME_DURATION_SECONDS : SESSION_ONLY_DURATION_SECONDS;
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${duration}s`)
    .sign(sessionSecret());

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(rememberMe ? { maxAge: REMEMBER_ME_DURATION_SECONDS } : {}),
  };

  cookies().set(COOKIE_NAME, token, cookieOpts);
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

/**
 * Verify the cookie's signature only. This says nothing about whether the
 * account still exists, still has that role, or whether the token was revoked —
 * server code should use `getValidatedSession` from `@/lib/auth` instead.
 */
export async function getSession(): Promise<VerifiedSession | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    return payload as unknown as VerifiedSession;
  } catch {
    return null;
  }
}

// Edge-safe verify for middleware (no next/headers cookies API).
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
