// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { S3Image } from "@/components/ui/s3-image";
import { formatDistanceToNow } from "date-fns";
import { ViewCounter } from '../components/ViewCounter';
import BlogContent from "@/components/resources/BlogContent";


async function getBlog(slug: string) {
  const blog = await prisma.blog.findUnique({
    where: {
      slug,
      status: "published", // Only show published blogs
    },
    include: {
      categories: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!blog) {
    notFound();
  }

  return blog;
}

export default async function BlogPage({
  params,
}: {
  params: { slug: string };
}) {
  const blog = await getBlog(params.slug);

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-white pt-32">
        <ViewCounter slug={params.slug} />
      <article className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.categories.map((category) => (
              <span
                key={category.slug}
                className="px-3 py-1 bg-pink-50 text-[#B33771] rounded-full text-sm"
              >
                {category.name}
              </span>
            ))}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{blog.excerpt}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <time dateTime={blog.publishedAt?.toISOString()}>
              {blog.publishedAt
                ? formatDistanceToNow(blog.publishedAt, { addSuffix: true })
                : "Draft"}
            </time>
            <span>{blog.views} views</span>
          </div>
        </header>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="mb-12 rounded-xl overflow-hidden">
            <S3Image
              imageKey={blog.coverImage}
              alt={blog.title}
              className="w-full h-auto aspect-[2/1] object-cover"
            />
          </div>
        )}

        {/* Content */}
        {/* <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }} 
        /> */}

        <BlogContent content={blog.content}/>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* <div className="flex gap-2">
              {blog.categories.map((category) => (
                <a
                  key={category.slug}
                  href={`/resources?category=${category.slug}`}
                  className="text-sm text-[#B33771] hover:underline"
                >
                  {category.name}
                </a>
              ))}
            </div> */}
            
            <button
            //   onClick={() => window.history.back()}
              className="text-lg text-gray-600 hover:text-[#B33771]"
            >
              ← Back to Resources
            </button>
          </div>
        </footer>
      </article>
    </main>
  );
}