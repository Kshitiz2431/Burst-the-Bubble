// app/api/newsletter/verify/[token]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  console.log(params.token);
  try {
    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: { token: params.token },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Update subscriber
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        isVerified: true,
        token: null, // Clear the token after verification
      },
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/success`
    );

  } catch (error) {
    console.error('Newsletter verification error:', error);
    return NextResponse.json(
      { error: "Failed to verify subscription" },
      { status: 500 }
    );
  }
}