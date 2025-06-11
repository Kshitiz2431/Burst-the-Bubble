// app/admin/newsletter/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewsletterClient from "@/components/admin/newsletter-client";

// Define the interface to match the client component props
interface NewsletterStats {
  total: number;
  premium: number;
  free: number;
}

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
      // Include premium information
      name: subscriber.name,
      isPremium: subscriber.isPremium,
      planType: subscriber.planType,
      planStart: subscriber.planStart?.toISOString() || null,
      planEnd: subscriber.planEnd?.toISOString() || null,
    }));

  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch subscribers");
  }
}

export default async function NewsletterPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const subscribers = await getSubscribers();
  
  // Get subscriber counts
  const totalSubscribers = subscribers.length;
  const premiumSubscribers = subscribers.filter(sub => sub.isPremium).length;
  const freeSubscribers = totalSubscribers - premiumSubscribers;
  
  const stats: NewsletterStats = {
    total: totalSubscribers,
    premium: premiumSubscribers,
    free: freeSubscribers
  };

  return <NewsletterClient initialSubscribers={subscribers} stats={stats} />;
}