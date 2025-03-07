"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const AnimatedBackground = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = () => {
      if (!interactiveRef.current) return;

      setCursorPos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) / 8,
        y: prev.y + (targetPos.y - prev.y) / 8,
      }));

      interactiveRef.current.style.transform = `translate(${Math.round(
        cursorPos.x
      )}px, ${Math.round(cursorPos.y)}px)`;

      requestAnimationFrame(move);
    };

    const animationFrame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetPos]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveRef.current) return;
    const rect = interactiveRef.current.getBoundingClientRect();
    setTargetPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-[#FF6B81] via-[#FFB6C1] to-[#845EC2]">
      <div className="gradients-container absolute inset-0 blur-xl">
        {/* Balanced gradient layers with our custom palette */}
        <div
          className="absolute inset-0 [background:radial-gradient(circle_at_top_left,#FF6B81_10%,transparent_50%)] 
                      animate-first opacity-70 mix-blend-soft-light"
        />
        <div
          className="absolute inset-0 [background:radial-gradient(circle_at_bottom_right,#FFB6C1_10%,transparent_50%)] 
                      animate-second opacity-70 mix-blend-soft-light"
        />
        <div
          className="absolute inset-0 [background:radial-gradient(circle_at_center,#845EC2_10%,transparent_50%)] 
                      animate-third opacity-65 mix-blend-soft-light"
        />

        {/* Interactive gradient with softer glow */}
        <div
          ref={interactiveRef}
          onMouseMove={handleMouseMove}
          className="absolute inset-0 [background:radial-gradient(circle_at_center,rgba(255,182,193,0.6)_0%,transparent_50%)] 
                   opacity-50 mix-blend-soft-light transition-opacity duration-300"
        />

        {/* Floating orbs with our custom palette */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-[#FF6B81] opacity-20 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-[#FFB6C1] opacity-20 rounded-full blur-3xl animate-float-slower" />
          <div className="absolute top-2/3 left-2/3 w-36 h-36 bg-[#845EC2] opacity-20 rounded-full blur-3xl animate-float-slowest" />
          <div className="absolute bottom-1/4 right-1/3 w-28 h-28 bg-[#FFB6C1] opacity-20 rounded-full blur-3xl animate-float-slow" />
        </div>
      </div>

      {/* Optional static gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#845EC2]/10" />

      {/* Content */}
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
