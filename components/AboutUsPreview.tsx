import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutUsPreview() {
  return (
    <section className="relative z-10 py-24 px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ margin: "-50px" }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          We believe in empowering healthy relationships
        </h2>
        <Link
          href="/about"
          className="inline-flex items-center justify-center px-8 py-3 bg-[#e27396] text-white rounded-lg hover:bg-[#d45c82] transition-colors font-medium group"
        >
          Learn More
          <svg
            className="w-5 h-5 ml-2 transform transition-transform duration-200 ease-out group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}
