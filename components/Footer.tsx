"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="#newsletter"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Newsletter
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {/* <li>
                <Link
                  href="/resources"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li> */}
              <li>
                <Link
                  href="/resources"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-300">
                <Mail className="w-5 h-5" />
                <span>infoburstthebubble@gmail.com</span>
              </li>
              <li>
              <div className="mt-8 text-sm text-gray-400 pt-10">
              Subscribe to our newsletter for weekly relationship tips and
              updates.
            </div>
              </li>
              {/* <li className="flex items-center gap-2 text-gray-300">
                <Phone className="w-5 h-5" />
                <span>1-800-BUBBLE</span>
              </li> */}
              {/* <li className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-5 h-5" />
                <span>123 Love Street</span>
              </li> */}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <div className="flex flex-col items-center">

              <h3 className="text-lg font-semibold mb-4">Follow Us on Instagram</h3>
                <a
                  href="https://www.instagram.com/burst_thebubble/?hl=en"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#e27396] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
            </div>
            {/* <div className="flex space-x-4"> */}
              {/* <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#e27396] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#e27396] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a> */}
              {/* <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#e27396] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a> */}
            {/* </div> */}
           
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© 2025 Burst the Bubble. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
