import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/accept-invite",
  "/privacy",
];
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "shadowy_session";

function roleHome(role: string) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "MANAGER":
      return "/manager/dashboard";
    case "EMPLOYEE":
      return "/employee/dashboard";
    default:
      return "/login";
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals, static assets, and routes with their own auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/cron/")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isPublic = PUBLIC_PATHS.includes(pathname);

  // Authenticated user on public auth pages -> push to their home
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL(roleHome(session.role), req.url));
  }

  if (isPublic) return NextResponse.next();

  // Protected areas
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Role-area enforcement
  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL(roleHome(session.role), req.url));
  }
  if (pathname.startsWith("/manager") && session.role !== "MANAGER") {
    return NextResponse.redirect(new URL(roleHome(session.role), req.url));
  }
  if (pathname.startsWith("/employee") && session.role !== "EMPLOYEE") {
    return NextResponse.redirect(new URL(roleHome(session.role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
