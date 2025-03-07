// app/api/newsletter/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// app/api/newsletter/export/route.ts
export async function GET(request: NextRequest) {
    try {
      // Verify admin session
      const session = await getServerSession(authOptions);
      if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      // Fetch all subscribers
      const subscribers = await prisma.newsletterSubscriber.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      // Create CSV content
      const csvHeaders = ['Email', 'Status', 'Subscribed Date', 'Last Updated']; // Renamed from headers to csvHeaders
      const rows = subscribers.map(sub => [
        sub.email,
        sub.isVerified ? 'Verified' : 'Pending',
        new Date(sub.createdAt).toISOString(),
        new Date(sub.updatedAt).toISOString()
      ]);
  
      const csvContent = [
        csvHeaders.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
  
      // Return CSV file
      const responseHeaders = new Headers(); // Renamed from headers to responseHeaders
      responseHeaders.set('Content-Type', 'text/csv');
      responseHeaders.set('Content-Disposition', 'attachment; filename=newsletter-subscribers.csv');
  
      return new NextResponse(csvContent, {
        status: 200,
        headers: responseHeaders,
      });
  
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      return new NextResponse(
        JSON.stringify({ message: "Internal Server Error" }), 
        { status: 500 }
      );
    }
  }