// app/api/newsletter/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// app/api/newsletter/export/route.ts
export async function GET(request: NextRequest) {
    try {
      // Verify admin session
      const session = await getServerSession(authOptions);
      if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      
      // Get the type parameter from the URL
      const { searchParams } = new URL(request.url);
      const exportType = searchParams.get('type');
      
      // Prepare filter based on export type
      const filter: Prisma.NewsletterSubscriberWhereInput = {};
      let filenameSuffix = 'all';
      
      if (exportType === 'premium') {
        filter.isPremium = true;
        filenameSuffix = 'premium';
      } else if (exportType === 'free') {
        filter.isPremium = false;
        filenameSuffix = 'free';
      }
  
      // Fetch subscribers based on the filter
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where: filter,
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      // Create CSV content with additional fields
      const csvHeaders = [
        'Email', 
        'Name', 
        'Status', 
        'Subscription Type', 
        'Plan', 
        'Start Date', 
        'End Date', 
        'Subscribed Date'
      ];
      
      const rows = subscribers.map(sub => [
        sub.email,
        sub.name || '',
        sub.isVerified ? 'Verified' : 'Pending',
        sub.isPremium ? 'Premium' : 'Free',
        sub.planType || '',
        sub.planStart ? new Date(sub.planStart).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }) : '',
        sub.planEnd ? new Date(sub.planEnd).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }) : '',
        new Date(sub.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      ]);
  
      const csvContent = [
        csvHeaders.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
  
      // Return CSV file with appropriate filename
      const responseHeaders = new Headers();
      responseHeaders.set('Content-Type', 'text/csv');
      responseHeaders.set('Content-Disposition', `attachment; filename=newsletter-subscribers-${filenameSuffix}.csv`);
  
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