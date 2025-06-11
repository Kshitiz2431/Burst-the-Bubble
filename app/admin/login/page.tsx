"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminCard } from "@/components/ui/admin-card";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpRequired, setIsOtpRequired] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      const from = searchParams.get("from") || "/admin/dashboard";
      router.push(from);
    }
  }, [status, router, searchParams]);

  useEffect(() => {
    // Show welcome back message if redirected from signup
    const message = searchParams.get("message");
    if (message) {
      toast.success(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        otp: formData.otp,
        redirect: false,
      });

      if (result?.error === "OTP_REQUIRED") {
        setIsOtpRequired(true);
        toast.info("Please enter the OTP sent to your email");
      } else if (result?.error) {
        toast.error(result.error);
      }
    } catch (err) {
      console.log(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#B33771]" />
      </div>
    );
  }

  return (
    <AdminCard>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome Back
        </CardTitle>
        <CardDescription>
          Sign in to access your admin dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isOtpRequired || isLoading}
              required
              className="bg-white"
              placeholder="admin@example.com"
              autoComplete="email"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              disabled={isOtpRequired || isLoading}
              required
              className="bg-white"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {isOtpRequired && (
            <div className="space-y-2">
              <label
                htmlFor="otp"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                One-Time Password
              </label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={formData.otp}
                onChange={(e) =>
                  setFormData({ ...formData, otp: e.target.value })
                }
                placeholder="Enter 6-digit OTP"
                required
                className="bg-white"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Please check your email for the OTP
              </p>
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-[#B33771] hover:bg-[#B33771]/90"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading
              ? "Please wait..."
              : isOtpRequired
              ? "Verify OTP"
              : "Sign In"}
          </Button>
          <div className="text-center space-y-2">
            <Link
              href="/admin/signup"
              className="text-sm text-[#B33771] hover:underline"
            >
              Register as Admin
            </Link>
            <div className="text-xs text-gray-500">
              Protected by two-factor authentication
            </div>
          </div>
        </form>
      </CardContent>
    </AdminCard>
  );
}
