"use client";
// components/HeroSection.tsx

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { AnimatedBackground } from "./AnimatedBackground";
import { ScrollIndicator } from "./ScrollIndicator";
import Link from "next/link";

const BUBBLE_CONFIG = {
  // Bubble numbers
  initialCount: 30,
  maxBubbles: 45,

  // Size range
  minSize: 30,
  maxSize: 90,

  // Animation speeds
  floatDuration: {
    min: 8,
    max: 15,
  },

  // Mouse interaction
  pushRadius: 150, // How far the push effect reaches
  pushStrength: 0.5, // How strongly bubbles are pushed (0-1)
  pushEasing: 0.15, // Smoothness of the push effect
  returnSpeed: 0.1, // How fast bubbles return to their path

  // Bursting
  burstChance: 0.35,
  burstParticles: 6,

  // Appearance
  opacity: {
    min: 0.6,
    max: 0.9,
  },
};

interface BubbleData {
  element: HTMLDivElement;
  originalX: number;
  originalY: number;
  velocityX: number;
  velocityY: number;
  currentX: number;
  currentY: number;
  size: number;
}

export default function HeroSection() {
  const bubbles = useRef<BubbleData[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();

  const createBubble = () => {
    if (
      !containerRef.current ||
      bubbles.current.length >= BUBBLE_CONFIG.maxBubbles
    )
      return;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    const inner = document.createElement("div");
    bubble.appendChild(inner);
    containerRef.current.appendChild(bubble);

    const size =
      BUBBLE_CONFIG.minSize +
      Math.random() * (BUBBLE_CONFIG.maxSize - BUBBLE_CONFIG.minSize);
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + size;

    const bubbleData: BubbleData = {
      element: bubble,
      originalX: startX,
      originalY: startY,
      velocityX: 0,
      velocityY: 0,
      currentX: startX,
      currentY: startY,
      size: size,
    };

    bubbles.current.push(bubbleData);

    // Initial position
    gsap.set(bubble, {
      width: size,
      height: size,
      x: startX,
      y: startY,
      opacity:
        BUBBLE_CONFIG.opacity.min +
        Math.random() * (BUBBLE_CONFIG.opacity.max - BUBBLE_CONFIG.opacity.min),
    });

    // Float animation
    const duration =
      BUBBLE_CONFIG.floatDuration.min +
      Math.random() *
        (BUBBLE_CONFIG.floatDuration.max - BUBBLE_CONFIG.floatDuration.min);

    gsap.to(bubbleData, {
      originalY: -size,
      duration: duration,
      ease: "none",
      onComplete: () => {
        bubble.remove();
        bubbles.current = bubbles.current.filter((b) => b !== bubbleData);
        createBubble();
      },
    });

    // Random bursting
    if (Math.random() < BUBBLE_CONFIG.burstChance) {
      const burstDelay = Math.random() * duration * 0.6;
      setTimeout(() => {
        if (!bubble.parentElement) return;

        // Create burst particles
        for (let i = 0; i < BUBBLE_CONFIG.burstParticles; i++) {
          const particle = document.createElement("div");
          particle.className = "bubble-particle";
          containerRef.current?.appendChild(particle);

          const angle = (i / BUBBLE_CONFIG.burstParticles) * Math.PI * 2;
          const particleSize = size * 0.2;

          gsap.set(particle, {
            width: particleSize,
            height: particleSize,
            x: bubbleData.currentX,
            y: bubbleData.currentY,
            opacity: 0.8,
          });

          gsap.to(particle, {
            x: bubbleData.currentX + Math.cos(angle) * size,
            y: bubbleData.currentY + Math.sin(angle) * size,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => particle.remove(),
          });
        }

        // Burst animation
        gsap.to(bubble, {
          scale: 1.2,
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            bubble.remove();
            bubbles.current = bubbles.current.filter((b) => b !== bubbleData);
            createBubble();
          },
        });
      }, burstDelay * 1000);
    }
  };

  const updateBubbles = () => {
    bubbles.current.forEach((bubble) => {
      const dx = bubble.currentX - mousePos.current.x;
      const dy = bubble.currentY - mousePos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < BUBBLE_CONFIG.pushRadius) {
        const force =
          (1 - distance / BUBBLE_CONFIG.pushRadius) *
          BUBBLE_CONFIG.pushStrength;
        bubble.velocityX += (dx / distance) * force;
        bubble.velocityY += (dy / distance) * force;
      }

      // Return to original path
      bubble.velocityX +=
        (bubble.originalX - bubble.currentX) * BUBBLE_CONFIG.returnSpeed;
      bubble.velocityY +=
        (bubble.originalY - bubble.currentY) * BUBBLE_CONFIG.returnSpeed;

      // Apply velocity with easing
      bubble.currentX += bubble.velocityX;
      bubble.currentY += bubble.velocityY;
      bubble.velocityX *= 1 - BUBBLE_CONFIG.pushEasing;
      bubble.velocityY *= 1 - BUBBLE_CONFIG.pushEasing;

      // Update position
      gsap.set(bubble.element, {
        x: bubble.currentX,
        y: bubble.currentY,
      });
    });

    animationFrameId.current = requestAnimationFrame(updateBubbles);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    // Create initial bubbles
    for (let i = 0; i < BUBBLE_CONFIG.initialCount; i++) {
      setTimeout(createBubble, i * 200);
    }

    // Start animation loop
    updateBubbles();

    // Add mouse tracking
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      bubbles.current.forEach((bubble) => bubble.element.remove());
      bubbles.current = [];
    };
  }, []);

  return (
    <AnimatedBackground>
      <div ref={containerRef} className="absolute inset-0" />

      <div className="relative min-h-screen flex flex-col items-center justify-center">
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Title with glowing effect */}
            <h1 className="text-6xl md:text-5xl font-bold text-white mb-6 relative">
              <span className="relative z-10">Find Your Path to Love & Growth
</span>
              {/* Glowing gradient background */}
              {/* <span
                className="absolute inset-0 blur-2xl bg-gradient-to-r from-pink-500/40 via-rose-500/40 to-pink-500/40 
                             animate-pulse z-0"
                aria-hidden="true"
              ></span> */}
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 mx-auto">
              Your go-to resource for navigating healthy relationships and
              dating.
            </p>
            <button
              className="px-8 py-4 bg-white text-[#B33771] rounded-full text-lg 
                             font-medium hover:bg-white/90 transform hover:scale-105 
                             transition-all shadow-lg"
            >
              <Link href="/resources">Explore Now</Link>
            </button>
          </motion.div>
        </div>

        <ScrollIndicator />
      </div>
    </AnimatedBackground>
  );
}
