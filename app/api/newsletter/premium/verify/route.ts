import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment information" },
        { status: 400 }
      );
    }

    // Verify signature
    const signature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Find the newsletter payment by Razorpay order ID
    const payment = await prisma.newsletterPayment.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
      include: { subscriber: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Calculate plan end date
    const planStart = new Date();
    const planEnd = payment.planType === "monthly"
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days

    // Check if another payment record with this razorpayId already exists
    const existingPaymentWithRazorpayId = await prisma.newsletterPayment.findFirst({
      where: { razorpayId: razorpay_payment_id }
    });

    // Update payment status
     await prisma.newsletterPayment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        // Only update razorpayId if it doesn't conflict with an existing record
        ...(existingPaymentWithRazorpayId === null || existingPaymentWithRazorpayId.id === payment.id
           ? { razorpayId: razorpay_payment_id } 
           : {})
      },
    });

    // Update subscriber status
    const updatedSubscriber = await prisma.newsletterSubscriber.update({
      where: { id: payment.subscriber.id },
      data: {
        isPremium: true,
        planStart,
        planEnd,
        planType: payment.planType,
      },
    });

    // Send welcome email
    await resend.emails.send({
      from: "Burst The Bubble <newsletter@burstthebubble.com>",
      to: updatedSubscriber.email,
      subject: "Welcome to Premium Newsletter!",
      html: `
        <h1>Welcome to Burst The Bubble Premium Newsletter!</h1>
        <p>Thank you for subscribing to our premium newsletter. Your subscription is now active.</p>
        <p>Plan Details:</p>
        <ul>
          <li>Plan Type: ${payment.planType === "monthly" ? "Monthly" : "Yearly"}</li>
          <li>Start Date: ${planStart.toLocaleDateString()}</li>
          <li>End Date: ${planEnd.toLocaleDateString()}</li>
        </ul>
        <p>You will now receive our premium content directly in your inbox.</p>
      `,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscriber.id,
        email: updatedSubscriber.email,
        planType: updatedSubscriber.planType,
        planStart: updatedSubscriber.planStart,
        planEnd: updatedSubscriber.planEnd,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
} 