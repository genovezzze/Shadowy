import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "shadowy_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me-please-min32chars";

const secret = new TextEncoder().encode(SESSION_SECRET);

export type SessionPayload = {
  userId: string;
  organizationId: string;
  role: Role;
  email: string;
  name: string;
};

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

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
    .sign(secret);
}

export async function createSession(payload: SessionPayload) {
  const token = await signSessionToken(payload);
  cookies().set(COOKIE_NAME, token, sessionCookieOptions());
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Edge-safe verify for middleware (no next/headers cookies API).
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
