"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Burst the Bubble helped me navigate a healthier relationship with myself and others!",
    author: "Sarah M.",
  },
  {
    quote:
      "The insights and resources provided here completely transformed how I approach relationships.",
    author: "James R.",
  },
  {
    quote:
      "Learning to recognize relationship red flags early on has been invaluable for my personal growth.",
    author: "Emily L.",
  },
  {
    quote:
      "The weekly tips have helped me build stronger, more meaningful connections in all areas of life.",
    author: "Michael K.",
  },
];

const Testimonials = () => {
  return (
    <section className="relative z-10 py-24 px-4 bg-gradient-to-br from-pink-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ margin: "-50px" }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Community Says
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from people who transformed their relationships
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              viewport={{ margin: "-50px" }}
              className="bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)] 
                        hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all"
            >
              <div className="flex flex-col h-full">
                <Quote className="w-10 h-10 text-[#B33771] mb-4" />
                <p className="text-gray-600 leading-relaxed italic mb-6 flex-grow">
                  &quot;{testimonial.quote}&quot;
                </p>
                <p className="text-[#B33771] font-medium">
                  {testimonial.author}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
