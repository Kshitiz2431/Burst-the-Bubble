import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define public admin routes
const publicAdminRoutes = ["/admin/login", "/admin/signup"];

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isPublicRoute = publicAdminRoutes.includes(req.nextUrl.pathname);

    if (isPublicRoute) {
      if (isAuth) {
        // If user is authenticated and trying to access public routes,
        // redirect to admin dashboard
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      // Allow access to public routes for unauthenticated users
      return NextResponse.next();
    }

    if (!isAuth) {
      // If user is not authenticated and trying to access protected route,
      // redirect to login page
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/admin/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let middleware handle the auth check
    },
  }
);

export const config = {
  matcher: ["/admin/:path*","/preview/:path*"],
};
