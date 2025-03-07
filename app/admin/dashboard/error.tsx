"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-lg font-semibold">Something went wrong!</h2>
      </div>
      <p className="text-gray-600 text-center max-w-md">
        There was an error loading the dashboard data. Please try again or
        contact support if the problem persists.
      </p>
      <Button
        onClick={reset}
        variant="outline"
        className="border-[#B33771] text-[#B33771] hover:bg-pink-50"
      >
        Try again
      </Button>
    </div>
  );
}
