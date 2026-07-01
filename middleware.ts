import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;


    if (req.nextUrl.pathname === "/" && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/api/dashboard")) {
      if (token?.role !== "ADMIN") {

        return NextResponse.rewrite(new URL("/api/auth/unauthorized", req.url));
      }
    }


    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
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
  matcher: ["/dashboard/:path*", "/api/admin/:path*", '/bookings', '/contact'],
};
