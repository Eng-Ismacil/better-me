import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "betterme-super-secret-jwt-key-minimum-32-chars!!"
);
const SESSION_COOKIE_NAME = "betterme_session";

// Routes that ONLY unauthenticated guests can view
const AUTH_ROUTES = [
  "/welcome",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

// Routes that require an active session
const PROTECTED_PREFIXES = [
  "/home",
  "/habits",
  "/routines",
  "/check-in",
  "/insights",
  "/calendar",
  "/achievements",
  "/finance",
  "/notifications",
  "/profile",
  "/settings",
  "/reminders",
  "/more",
  "/support",
  "/admin",
];

// Public API routes accessible without session
const PUBLIC_API_PREFIXES = [
  "/api/auth/",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Verify session token
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = false;
  let hasInvalidToken = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.sub && typeof payload.sub === "string") {
        isAuthenticated = true;
      } else {
        hasInvalidToken = true;
      }
    } catch {
      hasInvalidToken = true;
    }
  }

  // Forward pathname in request headers for layout/components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-betterme-pathname", pathname);

  // 2. Root path handling
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    const response = NextResponse.redirect(new URL("/welcome", request.url));
    if (hasInvalidToken) response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // 3. Authenticated user trying to access guest/auth routes
  // e.g. Logged-in user visiting /welcome, /login, /signup
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // 4. Unauthenticated user trying to access protected routes
  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isAuthenticated && isProtectedRoute) {
    const redirectTarget = pathname.startsWith("/admin") ? "/login" : "/welcome";
    const response = NextResponse.redirect(new URL(redirectTarget, request.url));
    if (hasInvalidToken) response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // 5. Unauthenticated user calling protected API endpoints
  if (pathname.startsWith("/api/")) {
    const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (!isAuthenticated && !isPublicApi) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and assets
     */
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|manifest.json|sw.js|icon-.*\\.png|icon.svg|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
