// app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

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

    // Get existing purchase
    const existingPurchase = await prisma.purchase.findUnique({
      where: { razorpayId: razorpay_order_id },
    });

    if (!existingPurchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    // Update purchase status and include related item
    const updatedPurchase = await prisma.purchase.update({
      where: { 
        razorpayId: razorpay_order_id 
      },
      data: { 
        status: "COMPLETED",
        // Set expiry for library items
        ...(existingPurchase.libraryItemId 
          ? {
              urlExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            }
          : {})
      },
      include: {
        libraryItem: true,
        template: true,
      },
    });

    // Prepare response data
    const responseData = {
      success: true,
      purchase: {
        id: updatedPurchase.id,
        type: updatedPurchase.libraryItemId ? 'library' : 'template',
        itemId: updatedPurchase.libraryItemId || updatedPurchase.templateId,
        title: updatedPurchase.libraryItem?.title || updatedPurchase.template?.title,
        email: updatedPurchase.email,
        amount: updatedPurchase.amount,
        status: updatedPurchase.status,
      },
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}