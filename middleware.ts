import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Redirect admin from root to /dashboard
    if (pathname === "/" && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Protect /api/dashboard routes — admins only (notifications endpoint is public-safe, reads by userId)
    if (pathname.startsWith("/api/dashboard") && pathname !== "/api/dashboard/notifications") {
      if (token?.role !== "ADMIN") {
        return NextResponse.rewrite(new URL("/api/auth/unauthorized", req.url));
      }
    }

    // Protect /dashboard pages — redirect non-admins to /user/dashboard
    if (pathname.startsWith("/dashboard")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/user/dashboard", req.url));
      }
    }

    // Protect /user pages — redirect admins to /dashboard
    if (pathname.startsWith("/user")) {
      if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/user/:path*",
    "/api/dashboard/:path*",
    "/api/user/:path*",
    "/bookings",
    "/contact",
  ],
};
