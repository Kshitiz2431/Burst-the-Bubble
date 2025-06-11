// app/api/newsletter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

// Schema validation
const subscriptionSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = subscriptionSchema.parse(body);
    
    // Check if the user already has a subscription
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: {
        email: validatedData.email,
      }
    });
    
    if (existingSubscriber) {
      // If user is already verified and has an active premium subscription
      if (existingSubscriber.isVerified && existingSubscriber.isPremium && existingSubscriber.planEnd && new Date(existingSubscriber.planEnd) > new Date()) {
        return NextResponse.json({ 
          message: "You already have an active premium subscription!", 
          alreadySubscribed: true,
          isPremium: true,
        });
      }

      // If user is already verified and has a free subscription
      if (existingSubscriber.isVerified && !existingSubscriber.isPremium) {
        return NextResponse.json({ 
          message: "You're already subscribed to our free newsletter!", 
          alreadySubscribed: true,
          isPremium: false,
        });
      }
      
      // Generate new token for unverified subscriber
      const token = crypto.randomBytes(32).toString('hex');
      
      await prisma.newsletterSubscriber.update({
        where: {
          id: existingSubscriber.id
        },
        data: {
          token,
          name: validatedData.name || existingSubscriber.name,
        }
      });
      
      // Send verification email with new token
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/verify/${token}`;
      
      await sendEmail({
        to: validatedData.email,
        subject: 'Confirm your newsletter subscription',
        html: `
          <h1>Confirm Your Subscription</h1>
          <p>Click the button below to confirm your newsletter subscription:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #85C1E9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Subscription</a>
        `
      });
      
      return NextResponse.json({ 
        message: "Verification email sent successfully!",
        resent: true,
      });
    }
    
    // Create a new subscriber
    const token = crypto.randomBytes(32).toString('hex');
    
     await prisma.newsletterSubscriber.create({
      data: {
        email: validatedData.email,
        token,
        name: validatedData.name || null,
        isPremium: false,
        planType: null,
        planStart: null,
        planEnd: null,
      }
    });
    
    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/verify/${token}`;
    
    await sendEmail({
      to: validatedData.email,
      subject: 'Confirm your newsletter subscription',
      html: `
        <h1>Confirm Your Subscription</h1>
        <p>Click the button below to confirm your newsletter subscription:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #85C1E9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm Subscription</a>
      `
    });
    
    return NextResponse.json({ 
      message: "Subscription successful! Please check your email to confirm."
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to subscribe to newsletter" 
    }, { status: 500 });
  }
}