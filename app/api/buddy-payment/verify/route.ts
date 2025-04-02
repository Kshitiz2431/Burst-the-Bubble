import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PurchaseStatus } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";

const prisma = new PrismaClient();

// Validation schema
const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    console.log("Payment verification request:", body);
    
    const validatedData = verifySchema.parse(body);
    
    // Find the payment record
    const payment = await prisma.buddyPayment.findFirst({
      where: { razorpayOrderId: validatedData.razorpay_order_id },
      include: { buddyRequest: true },
    });
    
    console.log("Payment record found:", !!payment, payment?.id);
    
    if (!payment) {
      console.error("Payment record not found for order ID:", validatedData.razorpay_order_id);
      return NextResponse.json(
        { message: "Payment record not found" },
        { status: 404 }
      );
    }
    
    // Verify signature
    const text = `${validatedData.razorpay_order_id}|${validatedData.razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex");
    
    const isSignatureValid = generatedSignature === validatedData.razorpay_signature;
    
    if (!isSignatureValid) {
      return NextResponse.json(
        { message: "Invalid payment signature" },
        { status: 400 }
      );
    }
    
    // Update payment status
    const updatedPayment = await prisma.buddyPayment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED" as PurchaseStatus,
        razorpayPaymentId: validatedData.razorpay_payment_id,
        razorpaySignature: validatedData.razorpay_signature,
      },
    });
    
    return NextResponse.json({
      success: true,
      paymentId: updatedPayment.id,
      buddyRequestId: payment.buddyRequestId,
      buddyName: payment.buddyRequest.assignedBuddyId ? 
        (await prisma.buddy.findUnique({ where: { id: payment.buddyRequest.assignedBuddyId } }))?.name : 
        null,
      calendlyUrl: payment.buddyRequest?.calendlyLink || null,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to verify payment" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 