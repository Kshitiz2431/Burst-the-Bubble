// app/api/payment/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  console.log(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);
  try {
    const { itemType, itemId, email } = await req.json();

    // Validate request
    if (!itemType || !itemId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get item details based on type
    let item;
    if (itemType === "library") {
      item = await prisma.libraryItem.findUnique({
        where: { id: itemId },
        select: { 
          id: true, 
          title: true, 
          price: true 
        },
      });
    } else if (itemType === "template") {
      item = await prisma.template.findUnique({
        where: { id: itemId },
        select: { 
          id: true, 
          title: true, 
          price: true 
        },
      });
    }

    if (!item || !item.price) {
      return NextResponse.json(
        { error: "Item not found or price not set" },
        { status: 404 }
      );
    }

    // Create Razorpay order
    const amount = Number(item.price) * 100; // Convert to paisa
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      notes: {
        itemType,
        itemId,
        email,
      },
    });

    // Create pending purchase record
    const purchase = await prisma.purchase.create({
      data: {
        email,
        amount: item.price,
        razorpayId: order.id,
        status: "PENDING",
        ...(itemType === "library" 
          ? { libraryItemId: itemId } 
          : { templateId: itemId }
        ),
      },
      select: {
        id: true,
        libraryItemId: true,
        templateId: true,
      }
    });

    // Add logging to debug the key
    console.log("Razorpay key check:", {
      keyExists: !!process.env.RAZORPAY_KEY_ID,
      keyLength: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.length : 0
    });

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency: "INR",
      purchaseId: purchase.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}