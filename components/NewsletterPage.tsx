"use client";

import { motion } from "framer-motion";
import { Mail, Star, BookOpen, Gift, Clock, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const benefits = [
  {
    title: "Weekly Love Tips",
    description:
      "Get fresh insights and practical advice delivered to your inbox",
    icon: <Mail className="w-6 h-6 text-[#B33771]" />,
    free: true,
  },
  {
    title: "Exclusive Content",
    description: "Access premium articles and in-depth relationship guides",
    icon: <Star className="w-6 h-6 text-[#B33771]" />,
    free: false,
  },
  {
    title: "Love Letters Templates",
    description: "Beautiful templates to express your feelings",
    icon: <BookOpen className="w-6 h-6 text-[#B33771]" />,
    free: true,
  },
  {
    title: "Premium Resources",
    description: "Download e-books and relationship workbooks",
    icon: <Gift className="w-6 h-6 text-[#B33771]" />,
    free: false,
  },
  {
    title: "Early Access",
    description: "Be the first to access new features and content",
    icon: <Clock className="w-6 h-6 text-[#B33771]" />,
    free: false,
  },
  {
    title: "Private Community",
    description: "Join our exclusive community of subscribers",
    icon: <Lock className="w-6 h-6 text-[#B33771]" />,
    free: false,
  },
];

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      console.log(data)
  
      toast.success(
        "Almost there! Please check your email to confirm your subscription.",
        {
          duration: 5000, // Show for 5 seconds
        }
      );
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to subscribe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-pink-50 to-white "
      id="newsletter"
    >
      {/* Hero Section */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get Weekly Tips on Love and Connection
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of readers who receive our curated insights on
            building stronger, healthier relationships. Stay informed, inspired,
            and connected.
          </p>
        </motion.div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)] 
                          hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300"
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#B33771]/10 rounded-xl flex items-center justify-center shrink-0">
                    {benefit.icon}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {benefit.title}
                      </h3>
                      {!benefit.free && (
                        <span className="px-2 py-1 bg-[#B33771]/10 text-[#B33771] text-xs font-medium rounded">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Form */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-[#B33771] to-[#92295c] rounded-2xl p-8 md:p-12 text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-white/90 mb-8">
              Join our community and receive expert advice directly in your
              inbox
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-2 border-transparent focus:outline-none focus:border-white"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-white text-[#B33771] rounded-lg font-medium hover:bg-pink-50 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe Now"}
              </button>
            </form>
            <p className="text-sm text-white/80 mt-4">
              By subscribing, you agree to receive our newsletter and accept our
              Privacy Policy
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
