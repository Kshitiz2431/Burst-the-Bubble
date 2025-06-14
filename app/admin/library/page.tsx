// app/admin/library/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DownloadButton } from "@/components/library/download-button";
import { PreviewButton } from "@/components/library/preview-button";
import { Card } from "@/components/ui/card";
import { S3Image } from "@/components/ui/s3-image";
import Link from "next/link";
import { 
  PlusCircle, 
  Download 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DeleteButton } from "@/components/library/delete-button";
import { PublishButton } from "@/components/admin/publish-button";


async function getLibraryItems() {
  try {
    const items = await prisma.libraryItem.findMany({
      include: {
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            purchases: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return items;
  } catch (err) {
    console.error("Error fetching library items:", err);
    throw new Error("Failed to fetch library items");
  }
}

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const items = await getLibraryItems();

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Library</h1>
          <p className="text-sm text-gray-500">
            Manage your e-books and guides
          </p>
        </div>
        <Button asChild>
            <Link href="/admin/library/new" className="bg-[#B33771] hover:bg-[#92295c]">
                <PlusCircle className="w-4 h-4" />
                Add New Item
            </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {items.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex gap-6">
              {/* Cover Image */}
              <div className="w-32 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.coverImage && (
                    <S3Image
                      imageKey={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
              </div>

              {/* Content */}
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{item.title}</h2>
                    <div className="flex gap-2 mt-1">
                      {item.categories.map((category) => (
                        <span
                          key={category.id}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-sm"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                  <PreviewButton
                      itemId={item.id}
                      pdfUrl={item.pdfUrl}
                      title={item.title}
                      previewPages={item.previewPages}
                    />
                    <PublishButton
                      id={item.id}
                      type="library"
                      isPublished={item.published}
                    />
                  <DownloadButton
                    itemId={item.id}
                    fileName={`${item.title}.pdf`}
                  />
                  <DeleteButton
                      itemId={item.id}
                      // itemTitle={item.title}
                  />
                  </div>
                </div>

                <p className="mt-2 text-gray-600 line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {item._count.purchases} purchases
                  </div>
                  <div>
                    Price: ₹{item.price.toString()}
                  </div>
                  <div>
                    Added {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs ${
                    item.published 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-gray-50 text-gray-600'
                  }`}>
                    {item.published ? 'Published' : 'Draft'}
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-600`}>
                    {item.type}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="p-8 text-gray-500">No library items found</p>
          <Button asChild>
            <Link href="/admin/library/new" className="bg-[#B33771] hover:bg-[#92295c]">
                <PlusCircle className="w-4 h-4" />
                Add New Item
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}