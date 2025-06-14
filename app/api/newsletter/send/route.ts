// app/api/newsletter/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { recipients, subject, content } = await request.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "No recipients provided" }), 
        { status: 400 }
      );
    }

    if (!subject || !content) {
      return new NextResponse(
        JSON.stringify({ message: "Subject and content are required" }), 
        { status: 400 }
      );
    }

    // Verify all recipients are valid subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: {
        email: { in: recipients },
        isVerified: true, // Only send to verified subscribers
      },
    });

    if (subscribers.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "No valid subscribers found" }), 
        { status: 400 }
      );
    }

    // Send emails
    await Promise.all(
      subscribers.map(async (subscriber) => {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: subscriber.email,
          subject: subject,
          html: content,
        });
      })
    );

    return new NextResponse(
      JSON.stringify({ 
        message: "Newsletter sent successfully",
        sentTo: subscribers.length 
      }), 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error sending newsletter:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }), 
      { status: 500 }
    );
  }
}