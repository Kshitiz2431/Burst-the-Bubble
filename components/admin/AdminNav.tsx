"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { navItems } from "./nav-items";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AdminNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoginPage =
    pathname === "/admin/login" || pathname === "/admin/signup";

  if (!session && !isLoginPage) return null;

  // Get initials for avatar
  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    session?.user?.email?.[0].toUpperCase() ||
    "A";

  return (
    <div className="sticky top-0 w-full bg-white border-b shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {session && <MobileNav />}
            <Link
              href="/admin/dashboard"
              className="flex items-center mr-6 lg:mr-8 font-bold text-xl text-[#B33771] whitespace-nowrap"
            >
              Admin Portal
            </Link>
            
            {session && (
              <nav className="hidden md:flex flex-1">
                <ul className="flex items-center gap-1 lg:gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center justify-center whitespace-nowrap px-2 py-2 lg:px-3 rounded-md text-sm font-medium transition-colors",
                            isActive
                              ? "bg-[#B33771] text-white"
                              : "text-gray-600 hover:bg-pink-50"
                          )}
                        >
                          <Icon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </div>
          
          {session && (
            <div className="flex items-center ml-6 pl-4 border-l border-gray-200">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                  <Avatar className="h-8 w-8 bg-pink-100">
                    <AvatarFallback className="text-[#B33771]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm text-gray-600 max-w-[150px] truncate">
                    {session.user?.email}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-white border rounded-md shadow-lg p-2 z-[100]"
                >
                  <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-gray-900">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-gray-200" />
                  <DropdownMenuItem
                    className="px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer flex items-center"
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
