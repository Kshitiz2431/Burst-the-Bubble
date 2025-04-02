import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, PurchaseStatus, BuddyMode } from "@prisma/client";
import { z } from "zod";
import Razorpay from "razorpay";

const prisma = new PrismaClient();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Validation schema
const orderSchema = z.object({
  requestId: z.string(),
  email: z.string().email(),
  name: z.string(),
  mode: z.enum(["CHAT", "CALL"]),
  duration: z.enum(["30", "60"]),
});

// Type for price calculation
type DurationType = "30" | "60";
type ModeType = "CHAT" | "CALL";

// Helper function to calculate price based on mode and duration
function calculatePrice(mode: ModeType, duration: DurationType): number {
  const prices = {
    CHAT: {
      "30": 299,
      "60": 499,
    },
    CALL: {
      "30": 399,
      "60": 599,
    },
  };

  return prices[mode][duration];
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    console.log("Request body for payment order:", body);
    
    const validatedData = orderSchema.parse(body);
    console.log("Validated data:", validatedData);
    
    // Check if requestId is valid
    if (!validatedData.requestId) {
      console.error("Missing or invalid requestId");
      return NextResponse.json(
        { message: "Missing or invalid request ID" },
        { status: 400 }
      );
    }
    
    // Fetch the buddy request to verify it exists
    const buddyRequest = await prisma.buddyRequest.findUnique({
      where: { id: validatedData.requestId },
      include: { payment: true },
    });
    
    console.log("Buddy request found:", !!buddyRequest, buddyRequest?.id);
    
    if (!buddyRequest) {
      console.error("Buddy request not found for ID:", validatedData.requestId);
      return NextResponse.json(
        { message: "Buddy request not found" },
        { status: 404 }
      );
    }
    
    // Check if payment already exists
    if (buddyRequest.payment) {
      // If payment exists but is pending, return the existing order
      if (buddyRequest.payment.status === "PENDING") {
        return NextResponse.json({
          orderId: buddyRequest.payment.razorpayOrderId,
          amount: Number(buddyRequest.payment.amount),
          currency: "INR",
          keyId: process.env.RAZORPAY_KEY_ID,
        });
      }
      
      // If payment is already completed, return error
      if (buddyRequest.payment.status === "COMPLETED") {
        return NextResponse.json(
          { message: "Payment already completed for this request" },
          { status: 400 }
        );
      }
    }
    
    // Calculate amount based on mode and duration
    const mode = buddyRequest.mode as ModeType;
    const duration = buddyRequest.duration as DurationType;
    const amount = calculatePrice(mode, duration);
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `buddy-${buddyRequest.id}`,
      notes: {
        buddyRequestId: buddyRequest.id,
        email: validatedData.email,
        name: validatedData.name,
        mode: buddyRequest.mode,
        duration: buddyRequest.duration,
      },
    });
    
    // Create or update payment record in database
    const payment = await prisma.buddyPayment.upsert({
      where: { buddyRequestId: buddyRequest.id },
      update: {
        razorpayOrderId: order.id,
        amount: amount,
        status: "PENDING" as PurchaseStatus,
      },
      create: {
        buddyRequestId: buddyRequest.id,
        razorpayOrderId: order.id,
        amount: amount,
        status: "PENDING" as PurchaseStatus,
      },
    });
    
    return NextResponse.json({
      orderId: order.id,
      amount: amount * 100, // Return amount in paise for Razorpay client
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to create payment order" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 