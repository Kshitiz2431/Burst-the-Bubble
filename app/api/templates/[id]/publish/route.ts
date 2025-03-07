// app/api/templates/[id]/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const templateId = params.id;

    // Fetch current template to get its publish status
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
    }

    // Toggle the published status
    const updatedTemplate = await prisma.template.update({
      where: { id: templateId },
      data: {
        published: !template.published,
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error toggling publish status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}