import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';
import { Resend } from 'resend';
import Razorpay from 'razorpay';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Schema for subscription request
const subscriptionSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  planType: z.enum(["monthly", "yearly"]),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

// Define plan prices
const PLAN_PRICES = {
  monthly: 299, // ₹299
  yearly: 2499,  // ₹2499
};

// Verify Razorpay signature
function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + "|" + paymentId;
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
    .update(body.toString())
    .digest("hex");
  return generatedSignature === signature;
}

// Create a Razorpay order for a new subscription
async function handleNewSubscription(data: z.infer<typeof subscriptionSchema>) {
  try {
    // Validate Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay credentials:', {
        hasKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
      });
      return NextResponse.json({ 
        error: "Payment service configuration error. Please contact support." 
      }, { status: 500 });
    }

    console.log('Razorpay credentials verified, proceeding with subscription check');

    // Check if user already has an active premium subscription
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: data.email },
    });

    if (existingSubscriber?.isPremium && existingSubscriber.planEnd && new Date(existingSubscriber.planEnd) > new Date()) {
      return NextResponse.json(
        {
          error: "You already have an active premium subscription",
          alreadySubscribed: true,
          isPremium: true,
          message: "You already have an active premium subscription",
        },
        { status: 400 }
      );
    }
    
    // Calculate amount based on plan type
    const amount = PLAN_PRICES[data.planType]; // ₹299 or ₹2499
    const amountInPaise = amount * 100; // Convert to paise
    
    console.log('Creating Razorpay order with:', {
      amount: amountInPaise,
      currency: "INR",
      receipt: `newsletter_${Date.now()}`,
      email: data.email,
      planType: data.planType
    });
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `newsletter_${Date.now()}`,
      notes: {
        email: data.email,
        name: data.name || "",
        planType: data.planType,
      },
    });
    
    console.log('Razorpay order created:', order);
    
    // Create or update subscriber with pending payment
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: data.email },
      update: {
        name: data.name || undefined,
      },
      create: {
        email: data.email,
        name: data.name || "",
        isVerified: false,
        isPremium: false,
      },
    });
    
    console.log('Subscriber created/updated:', subscriber);
    
    // Check if a payment record with this order ID already exists
    const existingPayment = await prisma.newsletterPayment.findFirst({
      where: { razorpayOrderId: order.id }
    });
    
    // Create or update payment record
    let payment;
    if (existingPayment) {
      // Update existing payment record
      payment = await prisma.newsletterPayment.update({
        where: { id: existingPayment.id },
        data: {
          subscriberId: subscriber.id,
          amount: amount, // Store the amount in rupees, not paise
          planType: data.planType,
          status: "PENDING",
        },
      });
    } else {
      // Create new payment record
      payment = await prisma.newsletterPayment.create({
        data: {
          subscriberId: subscriber.id,
          razorpayId: data.razorpayPaymentId || `pending_${order.id}`, // Use a unique identifier if no payment ID yet
          razorpayOrderId: order.id,
          amount: amount, // Store the amount in rupees, not paise
          planType: data.planType,
          status: "PENDING",
        },
      });
    }
    
    console.log('Payment record created/updated:', payment);
    
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      subscriptionId: subscriber.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.message.includes('key_id')) {
        return NextResponse.json({ 
          error: "Payment service configuration error. Please contact support." 
        }, { status: 500 });
      }
      if (error.message.includes('amount')) {
        return NextResponse.json({ 
          error: "Invalid payment amount. Please try again." 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: "Failed to create payment order. Please try again." 
    }, { status: 500 });
  }
}

// Verify payment and create/update subscription
async function handlePaymentVerification(data: z.infer<typeof subscriptionSchema>) {
  if (!data.razorpayOrderId || !data.razorpayPaymentId || !data.razorpaySignature) {
    return NextResponse.json({ error: "Missing payment verification data" }, { status: 400 });
  }

  // Verify the payment signature
  const isValid = verifyRazorpaySignature(
    data.razorpayOrderId,
    data.razorpayPaymentId,
    data.razorpaySignature
  );
  
  if (!isValid) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }
  
  try {
    // Fetch payment details from Razorpay for verification
    const paymentData = await razorpay.payments.fetch(data.razorpayPaymentId);
    
    if (paymentData.status !== 'captured') {
      return NextResponse.json({ 
        error: "Payment not completed. Please try again." 
      }, { status: 400 });
    }
    
    // Proceed with subscription creation/update
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: {
        email: data.email,
      }
    });
    
    // Generate verification token if needed
    const token = crypto.randomBytes(32).toString('hex');
    
    let subscriber;
    
    // Set plan dates
    const planStart = new Date();
    const planEnd = data.planType === 'monthly' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days
    
    // Begin transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      if (existingSubscriber) {
        // Update existing subscriber to premium
        subscriber = await prisma.newsletterSubscriber.update({
          where: {
            id: existingSubscriber.id,
          },
          data: {
            isPremium: true,
            planType: data.planType,
            planStart,
            planEnd,
            name: data.name || existingSubscriber.name,
          }
        });
        
        // Check if a payment record already exists with this order ID
        const existingPayment = await prisma.newsletterPayment.findFirst({
          where: { razorpayOrderId: data.razorpayOrderId || '' }
        });
        
        if (existingPayment) {
          // Update existing payment record
          await prisma.newsletterPayment.update({
            where: { id: existingPayment.id },
            data: {
              razorpayId: data.razorpayPaymentId || '',
              amount: Number(paymentData.amount) / 100, // Convert from paise to rupees
              status: 'COMPLETED',
            }
          });
        } else {
          // Create new payment record
          await prisma.newsletterPayment.create({
            data: {
              subscriberId: existingSubscriber.id,
              razorpayId: data.razorpayPaymentId || `payment_${Date.now()}`,
              razorpayOrderId: data.razorpayOrderId || `order_${Date.now()}`,
              amount: Number(paymentData.amount) / 100, // Convert from paise to rupees
              planType: data.planType,
              status: 'COMPLETED',
            }
          });
        }
      } else {
        // Create new premium subscriber
        subscriber = await prisma.newsletterSubscriber.create({
          data: {
            email: data.email,
            name: data.name || null,
            isPremium: true,
            planType: data.planType,
            planStart,
            planEnd,
            token,
            isVerified: false,
          }
        });
        
        // Check if a payment record already exists with this order ID
        const existingPayment = await prisma.newsletterPayment.findFirst({
          where: { razorpayOrderId: data.razorpayOrderId || '' }
        });
        
        if (existingPayment) {
          // Update existing payment record
          await prisma.newsletterPayment.update({
            where: { id: existingPayment.id },
            data: {
              razorpayId: data.razorpayPaymentId || '',
              subscriberId: subscriber.id,
              amount: Number(paymentData.amount) / 100, // Convert from paise to rupees
              status: 'COMPLETED',
            }
          });
        } else {
          // Create new payment record
          await prisma.newsletterPayment.create({
            data: {
              subscriberId: subscriber.id,
              razorpayId: data.razorpayPaymentId || `payment_${Date.now()}`,
              razorpayOrderId: data.razorpayOrderId || `order_${Date.now()}`,
              amount: Number(paymentData.amount) / 100, // Convert from paise to rupees
              planType: data.planType,
              status: 'COMPLETED',
            }
          });
        }
      }
      
      return { subscriber, isNewSubscriber: !existingSubscriber };
    });
    
    subscriber = result.subscriber;
    const isNewSubscriber = result.isNewSubscriber;
    
    // Send welcome email for premium subscribers
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/verify/${token}`;
    
    await sendEmail({
      to: data.email,
      subject: 'Welcome to Premium Newsletter!',
      html: `
        <h1>Welcome to Our Premium Newsletter!</h1>
        <p>Thank you for subscribing to our premium newsletter!</p>
        ${isNewSubscriber ? `
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #85C1E9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        ` : ''}
        <p>Your premium access has been activated. You can now enjoy all premium benefits!</p>
        <p>Your subscription plan: ${data.planType === 'monthly' ? 'Monthly' : 'Yearly'}</p>
        <p>Subscription end date: ${planEnd.toLocaleDateString()}</p>
      `
    });
    
    return NextResponse.json({
      message: "Premium subscription successful",
      isPremium: true,
      planType: data.planType,
      planEnd: planEnd.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ 
      error: "Failed to verify payment. Please contact support." 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = subscriptionSchema.parse(body);
    
    // Check if this is a payment verification or a new subscription request
    const isPaymentVerification = 
      data.razorpayPaymentId && 
      data.razorpayOrderId && 
      data.razorpaySignature;
    
    if (isPaymentVerification) {
      return handlePaymentVerification(data);
    } else {
      return handleNewSubscription(data);
    }
    
  } catch (error) {
    console.error('Premium newsletter subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to subscribe to premium newsletter" 
    }, { status: 500 });
  }
} 