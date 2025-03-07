// app/admin/newsletter/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewsletterClient from "@/components/admin/newsletter-client";

async function getSubscribers() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the client component's expected types
    return subscribers.map(subscriber => ({
      id: subscriber.id,
      email: subscriber.email,
      isVerified: subscriber.isVerified,
      createdAt: subscriber.createdAt.toISOString(),
      updatedAt: subscriber.updatedAt.toISOString(),
    }));

  } catch (error) {
    throw new Error("Failed to fetch subscribers");
  }
}

export default async function NewsletterPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const subscribers = await getSubscribers();

  return <NewsletterClient initialSubscribers={subscribers} />;
}