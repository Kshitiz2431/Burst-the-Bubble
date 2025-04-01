"use client";

import { Heart, MessageCircle, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    title: "Healthy Communication",
    description:
      "Learn the art of open, honest, and effective communication. From understanding your partner's perspective to expressing your own feelings clearly, we provide tips and techniques to enhance your conversations and foster deeper connections.",
    icon: <MessageCircle className="w-6 h-6 text-[#e27396]" />,
    link: "/resources/communication",
  },
  {
    title: "Relationship Red Flags",
    description:
      "Spotting red flags early can save you from unhealthy dynamics. We help you recognize warning signs like lack of respect, poor boundaries, and manipulative behaviors, empowering you to make informed decisions about your relationships.",
    icon: <Shield className="w-6 h-6 text-[#e27396]" />,
    link: "/resources/red-flags",
  },
  {
    title: "Love Resources",
    description:
      "Elevate your relationships with our curated resources. From heartfelt love letters and romantic one-liners to e-books filled with expert advice, these tools are designed to inspire and strengthen your bonds.",
    icon: <Heart className="w-6 h-6 text-[#e27396]" />,
    link: "/resources/love",
  },
  {
    title: "Trust & Growth",
    description:
      "Trust is the foundation of any healthy relationship. Discover actionable ways to build, nurture, and rebuild trust while growing individually and together. Explore how vulnerability and accountability can lead to stronger connections.",
    icon: <Users className="w-6 h-6 text-[#e27396]" />,
    link: "/resources/trust",
  },
];

const FeatureCards = () => {
  return (
    <section className="relative z-10 bg-white py-24" id="features">
      {/* Curved top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-20 bg-white"
        style={{ borderTopLeftRadius: "3rem", borderTopRightRadius: "3rem" }}
      />

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ margin: "-50px" }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Building Better Relationships
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover tools and insights for meaningful connections
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ margin: "-50px" }}
                className="group bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)] 
                            hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300 ease-in-out"
              >
                {/* Icon Header Area */}
                <div className="flex items-start mb-6">
                  <div
                    className="w-14 h-14 bg-[#e27396]/10 rounded-xl flex items-center justify-center shrink-0 
                                  group-hover:bg-[#e27396]/15 transition-colors duration-300"
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 ml-4 mt-1">
                    {feature.title}
                  </h3>
                </div>

                {/* Description Area */}
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <Link
                    href={feature.link}
                    className="inline-flex items-center text-[#e27396] hover:text-[#d45c82] transition-colors font-medium mt-4 group-hover:underline"
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
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
