"use client";

import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Types
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  readingTime: string;
  date: string;
  tags: string[];
  slug: string;
}

// interface Resource {
//   id: string;
//   title: string;
//   description: string;
//   image: string;
//   isPremium: boolean;
//   price?: string;
//   downloadUrl?: string;
//   previewUrl?: string;
// }

// Sample data
// const sampleBlogPosts: BlogPost[] = [
//   {
//     id: "1",
//     title: "Understanding Love Languages in Modern Relationships",
//     excerpt:
//       "Discover how understanding love languages can transform your relationship...",
//     image: "/placeholder-blog-1.jpg",
//     readingTime: "5 min read",
//     date: "Jan 15, 2024",
//     tags: ["Communication", "Trust & Growth"],
//     slug: "understanding-love-languages",
//   },
//   // Add more sample posts...
// ];

// const sampleLibraryResources: Resource[] = [
//   {
//     id: "1",
//     title: "Complete Guide to Healthy Communication",
//     description:
//       "A comprehensive guide to building better dialogue in relationships.",
//     image: "/placeholder-guide-1.jpg",
//     isPremium: true,
//     price: "$9.99",
//     previewUrl: "/preview-1.pdf",
//   },
//   // Add more sample resources...
// ];

// const sampleTemplates: Resource[] = [
//   {
//     id: "1",
//     title: "Love Letter Collection",
//     description: "Beautiful templates for expressing your feelings.",
//     image: "/placeholder-template-1.jpg",
//     isPremium: true,
//     price: "$4.99",
//     previewUrl: "/preview-template-1.pdf",
//   },
//   // Add more sample templates...
// ];

// Tag options
// const allTags = [
//   "Communication",
//   "Trust & Growth",
//   "Red Flags",
//   "Dating",
//   "Self Growth",
//   "Boundaries",
// ];

// Blog Post Card Component
export const BlogPostCard = ({ post }: { post: BlogPost }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
  >
    <div className="relative h-48">
      <Image src={post.image} alt={post.title} fill className="object-cover" />
    </div>
    <div className="p-6">
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="text-sm px-3 py-1 bg-[#B33771]/10 text-[#B33771] rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">
        {post.title}
      </h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {post.readingTime}
        </div>
        <span>{post.date}</span>
      </div>
      <Link
        href={`/blog/${post.slug}`}
        className="mt-4 inline-flex items-center text-[#B33771] hover:text-[#92295c]"
      >
        Read More
        <ChevronRight className="w-4 h-4 ml-1" />
      </Link>
    </div>
  </motion.div>
);
