import { Providers } from "./providers";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/providers/SessionProvider";
import { NavigationProvider } from "@/components/providers/NavigationProvider";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import { Toaster } from 'sonner';

import { isAdminRoute } from "@/lib/utils";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Burst the Bubble - Relationship Advice",
  description:
    "Your go-to resource for navigating healthy relationships and dating.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const pathname = headersList.get("x-invoke-path") || "";
  const isAdmin = isAdminRoute(pathname);

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <NavigationProvider />
              <main className={cn("flex-grow", isAdmin && "pt-16")}>
                {children}
                <Script
                  id="razorpay-checkout"
                  src="https://checkout.razorpay.com/v1/checkout.js"
                  strategy="lazyOnload"
                />
                <Toaster />
              </main>
              {!isAdmin && <Footer />}
            </div>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
