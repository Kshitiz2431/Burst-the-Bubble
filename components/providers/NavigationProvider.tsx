"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { AdminNav } from "@/components/admin/AdminNav";
import { isAdminRoute } from "@/lib/utils";

export function NavigationProvider() {
  const pathname = usePathname();
  const isAdmin = isAdminRoute(pathname);

  return isAdmin ? <AdminNav /> : <Navbar />;
}
