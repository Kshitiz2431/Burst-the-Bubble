"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navItems } from "./nav-items";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const initials = getInitials(session);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6 text-[#B33771]" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] p-0 bg-gradient-to-br from-pink-50 to-white border-r-0"
      >
        <SheetHeader className="p-4 border-b bg-white/50 backdrop-blur-sm">
          <SheetTitle>
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 bg-pink-100 border-2 border-[#B33771]/10">
                <AvatarFallback className="text-[#B33771] font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {session?.user?.name || "Admin User"}
                </span>
                <span className="text-xs text-gray-500">
                  {session?.user?.email}
                </span>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pb-10">
          <div className="px-2 py-4">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-[#B33771] text-white shadow-md shadow-[#B33771]/20"
                        : "text-gray-600 hover:bg-white/60 hover:shadow-sm"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-white" : "text-[#B33771]"
                      )}
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <Separator className="my-2 bg-pink-200/20" />

          <div className="px-4 py-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-white/60 font-medium"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/admin/login" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
