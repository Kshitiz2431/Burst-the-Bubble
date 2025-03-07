"use client";

import { cn } from "@/lib/utils";
import { Card } from "./card";

export function AdminCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white">
      <Card
        className={cn(
          "w-full max-w-md border-none shadow-lg bg-white/80 backdrop-blur-sm",
          className
        )}
      >
        {children}
      </Card>
    </div>
  );
}
