"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Navigation items with their paths
const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Resources", path: "/resources" },
  { name: "Newsletter", path: "/newsletter" },
  {name:"Talk to Buddy",path:"/talk-to-buddy"},
  { name: "Contact Us", path: "/contact-us" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're on the landing page
  const isLandingPage = pathname === "/";

  useEffect(() => {
    // Reset scroll state when navigating to the home page
    if (isLandingPage) {
      setIsScrolled(false);
    }
  }, [isLandingPage]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Only add scroll listener on landing page
    if (isLandingPage) {
      window.addEventListener("scroll", handleScroll);
      // Initial check for page refresh cases
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setIsScrolled(true); // Always show solid navbar on other pages
    }
  }, [isLandingPage]);

  // Handle navigation for hash links on landing page
  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);

    // Reset scroll state if going to homepage
    if (path === "/") {
      setIsScrolled(false);
    }

    if (path.startsWith("/#") && isLandingPage) {
      const element = document.querySelector(path.substring(1));
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Determine if a nav item is active
  const isActive = (path: string) => {
    if (path.startsWith("/#")) {
      return isLandingPage;
    }
    return pathname === path;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50  transition-all duration-300 ${
        isScrolled || !isLandingPage ? "bg-white shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            onClick={() => setIsScrolled(false)}
            className={`text-2xl font-bold transition-colors ${
              isScrolled || !isLandingPage ? "text-[#e27396]" : "text-white"
            }`}
          >
            Burst the Bubble
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`transition-colors ${
                  isScrolled || !isLandingPage
                    ? "text-gray-600 hover:text-[#e27396]"
                    : "text-white/80 hover:text-white"
                } ${isActive(item.path) ? "font-medium" : ""}`}
              >
                {item.name}
              </Link>
            ))}
            {/* <button
              className={`px-6 py-2 rounded-full transition-all ${
                isScrolled || !isLandingPage
                  ? "bg-[#e27396] text-white hover:bg-[#d45c82]"
                  : "bg-white text-[#e27396] hover:bg-white/90"
              }`}
            >
              <Link href="/#features" onClick={() => handleNavClick("/#features")}>Get Started</Link>
            </button> */}
          </div>

          <button
            className="md:hidden text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X
                className={
                  isScrolled || !isLandingPage ? "text-[#e27396]" : "text-white"
                }
              />
            ) : (
              <Menu
                className={
                  isScrolled || !isLandingPage ? "text-[#e27396]" : "text-white"
                }
              />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="flex flex-col px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`text-gray-600 hover:text-[#e27396] ${
                    isActive(item.path) ? "font-medium" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <button className="px-6 py-2 rounded-full bg-[#e27396] text-white hover:bg-[#d45c82] w-full">
                <Link href="/#features" onClick={() => handleNavClick("/#features")}>Get Started</Link>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
