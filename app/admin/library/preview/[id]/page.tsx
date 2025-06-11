// app/admin/library/preview/[id]/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { S3Image } from "@/components/ui/s3-image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdminPDFViewer } from "@/components/library/admin-pdf-viewer";
import { ArrowLeft } from "lucide-react";

async function getLibraryItem(id: string) {
  const item = await prisma.libraryItem.findUnique({
    where: { id },
    include: {
      categories: true,
    },
  });

  if (!item) {
    throw new Error("Library item not found");
  }

  return item;
}

export default async function PreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const item = await getLibraryItem(params.id);

  return (
    <div className="p-8 space-y-8">
      {/* Back Button */}
      <Button asChild variant="outline">
        <Link href="/admin/library" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
      </Button>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cover Image and Details */}
          <div className="space-y-6">
            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
              {item.coverImage && (
                <S3Image
                  imageKey={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">{item.title}</h1>
              
              <div className="flex flex-wrap gap-2">
                {item.categories.map((category) => (
                  <span
                    key={category.id}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-600">{item.description}</p>

              <div className="space-y-2 text-sm text-gray-500">
                <div>Price: ₹{item.price.toString()}</div>
                <div>Preview Pages: {item.previewPages}</div>
                <div>Type: {item.type}</div>
                <div>Status: {item.published ? "Published" : "Draft"}</div>
              </div>
            </div>
          </div>

          {/* PDF Preview */}
            <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                    <AdminPDFViewer
                    itemId={item.id}
                    previewPages={item.previewPages}
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}