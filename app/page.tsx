"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";

import AboutUsPreview from "@/components/AboutUsPreview";


export default function Home() {
  const { scrollY } = useScroll();

  // Parallax effect for sections
  const yBg = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 200, 300, 500], [1, 1, 0.5, 0]);

  return (
    <main className="relative">
      {/* Hero Section with Parallax */}
      <motion.div
        className="relative z-0 min-h-screen"
        style={{ y: yBg, opacity }}
      >
        <HeroSection />
      </motion.div>

      {/* Feature Cards Section */}
      <FeatureCards />

      {/* Newsletter Section */}
      {/* <NewsletterPage /> */}

      {/* About Us Preview Section */}
      <AboutUsPreview />

      {/* Testimonials Section */}
      {/* <Testimonials /> */}
    </main>
  );
}
