import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { roleHome } from "@/lib/auth";
import { signSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";

const STATE_COOKIE = "google_oauth_state";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

function loginError(req: NextRequest, code: string) {
  const res = NextResponse.redirect(new URL(`/login?error=${code}`, req.url));
  res.cookies.delete(STATE_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = req.cookies.get(STATE_COOKIE)?.value;

  // CSRF: state must be present and match the cookie we set on the start route.
  if (!code || !state || !storedState || state !== storedState) {
    return loginError(req, "google_state");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return loginError(req, "google_config");
  }

  const redirectUri = `${url.origin}/api/auth/google/callback`;

  // Exchange the authorization code for tokens.
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    return loginError(req, "google_token");
  }
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) {
    return loginError(req, "google_token");
  }

  // Fetch the verified profile (email).
  const infoRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) {
    return loginError(req, "google_userinfo");
  }
  const info = (await infoRes.json()) as {
    email?: string;
    email_verified?: boolean;
  };

  if (!info.email || info.email_verified === false) {
    return loginError(req, "google_email");
  }

  // Match by email — accounts are provisioned by an admin/manager.
  const user = await prisma.user.findUnique({
    where: { email: info.email.toLowerCase().trim() },
  });
  if (!user) {
    return loginError(req, "no_account");
  }

  const token = await signSessionToken({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  const res = NextResponse.redirect(new URL(roleHome(user.role), url.origin));
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  res.cookies.delete(STATE_COOKIE);
  return res;
}
