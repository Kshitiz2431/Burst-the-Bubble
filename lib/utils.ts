import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Session } from "next-auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin");
}

export function getInitials(session: Session | null): string {
  if (!session?.user?.name && !session?.user?.email) return "A";

  if (session.user.name) {
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  return session.user.email?.[0].toUpperCase() || "A";
}

export function getRedirectPath(
  searchParams: URLSearchParams,
  defaultPath: string = "/admin/dashboard"
): string {
  return searchParams.get("from") || defaultPath;
}

export const ADMIN_ROUTES = {
  LOGIN: "/admin/login",
  SIGNUP: "/admin/signup",
  DASHBOARD: "/admin/dashboard",
  SETTINGS: "/admin/settings",
} as const;

export const AUTH_ROUTES = new Set<string>([
  ADMIN_ROUTES.LOGIN,
  ADMIN_ROUTES.SIGNUP,
]);

// export function isAuthRoute(pathname: string): boolean {
//   return [ADMIN_ROUTES.LOGIN, ADMIN_ROUTES.SIGNUP].includes(pathname as string);
// }

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.has(pathname);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
}
