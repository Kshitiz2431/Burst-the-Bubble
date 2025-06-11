"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Instagram,
} from "lucide-react";
import FaqSection from "@/components/FaqSection";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4 pt-12">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions or feedback? We&rsquo;d love to hear from you.
          </p>
        </motion.div>

        {/* Glassmorphism Cards */}
        <div className="space-y-12">
          {/* Contact Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl p-8 shadow-lg mx-auto max-w-2xl"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Contact Information
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="p-3 bg-[#e27396] rounded-full text-white">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="text-lg text-gray-800">
                  infoburstthebubble@gmail.com
                </span>
              </div>
              {/* <div className="flex items-center justify-center gap-4">
                <div className="p-3 bg-[#e27396] rounded-full text-white">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-lg text-gray-800">1-800-BUBBLE</span>
              </div> */}
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Follow Us On Instagram
              </h3>
              <div className="flex items-center justify-center gap-4">
                {[
                  // {
                  //   icon: <Facebook className="w-5 h-5" />,
                  //   label: "Facebook",
                  // },
                  // { icon: <Twitter className="w-5 h-5" />, label: "Twitter" },
                  {
                    icon: <Instagram className="w-5 h-5" />,
                    label: "Instagram",
                  },
                  // {
                  //   icon: <Linkedin className="w-5 h-5" />,
                  //   label: "LinkedIn",
                  // },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    className="p-3 bg-gray-100 rounded-full hover:bg-[#e27396] hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* FAQ Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl p-8 shadow-lg mx-auto max-w-4xl"
          >
            <FaqSection />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
