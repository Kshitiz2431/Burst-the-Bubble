// app/api/newsletter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';
import { z } from 'zod';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = subscribeSchema.parse(body);

    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      if (existingSubscriber.isVerified) {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 400 }
        );
      } else {
        // Resend verification email
        await sendVerificationEmail(email, existingSubscriber.token!);
        return NextResponse.json({
          message: "Verification email has been resent",
        });
      }
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        token,
        isVerified: false,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, token);

    return NextResponse.json({
      message: "Please check your email to confirm your subscription"
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}

async function sendVerificationEmail(email: string, token: string) {
    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/verify/${token}`;
  
      const response = await resend.emails.send({
        from: 'onboarding@resend.dev', // Use this email for testing
        to: email,
        subject: 'Confirm your newsletter subscription',
        html: `
          <h2>Confirm your subscription</h2>
          <p>Click the button below to confirm your newsletter subscription:</p>
          <a href="${verificationUrl}" style="background-color: #B33771; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Confirm Subscription
          </a>
          <p>If you did not request this subscription, you can ignore this email.</p>
        `
      });
  
      console.log('Email sent successfully:', response);
      return response;
  
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }