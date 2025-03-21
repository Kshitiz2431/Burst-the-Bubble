"use client";

import { motion } from "framer-motion";
import { Target, Compass } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-white pt-28">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Burst the Bubble
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empowering meaningful relationships through understanding and growth
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            >
              <div className="w-12 h-12 bg-[#e27396]/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-[#e27396]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed">
                At Burst the Bubble, we ignite the journey of creating
                meaningful relationships. We empower you with insights and tools
                to foster deep connections, encouraging open conversations about
                love and respect.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            >
              <div className="w-12 h-12 bg-[#e27396]/10 rounded-xl flex items-center justify-center mb-6">
                <Compass className="w-6 h-6 text-[#e27396]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Our Vision
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We envision a world where every person embraces emotional
                complexity, fostering authentic bonds that uplift and inspire.
                Join us in breaking down barriers and nurturing a community of
                love and understanding.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 bg-white">
        <motion.div
          className="max-w-4xl mx-auto prose prose-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            What is Burst the Bubble?
          </h2>
          <p className="text-gray-600 mb-6">
            Welcome to Burst the Bubble, your go-to resource for navigating the
            intricate world of healthy relationships and dating! Here, we
            believe that every connection—whether romantic, platonic, or
            familial—can thrive with the right understanding and tools.
          </p>
          <p className="text-gray-600 mb-6">
            Our mission is to provide insights, tips, and thoughtful discussions
            that empower you to foster meaningful relationships and embrace the
            beautiful complexities of human emotions.
          </p>
          <p className="text-gray-600 mb-6">
            At Burst the Bubble, we explore a variety of topics, from effective
            communication techniques and resolving conflicts to recognizing red
            flags and promoting mutual respect. Our aim is not to replace the
            invaluable guidance of professional help, which may be essential for
            certain individuals, but rather to create a nurturing space where
            you can better understand your emotions and enhance your
            relationships.
          </p>
          <p className="text-gray-600">
            Join us as we break down barriers, shatter misconceptions, and
            encourage open dialogues about love, trust, and connection.
            Together, let&apos;s burst the bubble of confusion surrounding
            healthy relationships and embark on a journey of growth and
            understanding!
          </p>
        </motion.div>
      </section>
    </main>
  );
}
