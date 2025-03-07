// app/admin/blogs/preview/[slug]/page.tsx
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma as db } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { Image } from "@/components/Image";


async function getBlog(slug: string) {
  const blog = await db.blog.findUnique({
    where: {
      slug,
      // No status filter for admin preview
    },
    include: {
      categories: {
        select: {
          name: true,
          slug: true
        }
      }
    }
  });

  if (!blog) {
    notFound();
  }

  return blog;
}

export default async function AdminBlogPreviewPage({
  params
}: {
  params: { slug: string }
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    notFound();
  }

  const blog = await getBlog(params.slug);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Banner */}
      <div className="bg-[#B33771] text-white py-2 px-4 text-center">
        <p className="text-sm">
          Preview Mode - {blog.status === 'draft' ? 'Draft' : 'Published'} Post
        </p>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-12">
        {blog.coverImage && (
            <Image
              imageKey={blog.coverImage}
              alt={blog.title}
              className="w-full h-[400px] object-cover rounded-xl mb-8"
            />
        )}

        <header className="mb-8">
          <div className="flex gap-2 mb-4">
            {blog.categories.map((category) => (
              <span
                key={category.slug}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {category.name}
              </span>
            ))}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
          
          {blog.excerpt && (
            <p className="text-xl text-gray-600 mb-4">{blog.excerpt}</p>
          )}

          <div className="text-sm text-gray-500">
            {blog.publishedAt 
              ? `Published on ${format(new Date(blog.publishedAt), "MMMM d, yyyy")}`
              : 'Draft'}
          </div>
        </header>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }} 
        />
      </article>
    </div>
  );
}