"use client";

import { Heart, MessageCircle, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

import Image from "next/image";

const features = [
  {
    title: "Healthy Communication",
    description:
      "Learn the art of open, honest, and effective communication. From understanding your partner's perspective to expressing your own feelings clearly, we provide tips and techniques to enhance your conversations and foster deeper connections.",
    icon: <MessageCircle className="w-7 h-7 text-[#e27396]" />,
    link: "/resources/communication",
    image: "/images/communication.svg",
    bgColor: "bg-pink-50",
  },
  {
    title: "Relationship Red Flags",
    description:
      "Spotting red flags early can save you from unhealthy dynamics. We help you recognize warning signs like lack of respect, poor boundaries, and manipulative behaviors, empowering you to make informed decisions about your relationships.",
    icon: <Shield className="w-7 h-7 text-[#e27396]" />,
    link: "/resources/red-flags",
    image: "/images/red-flags.svg",
    bgColor: "bg-red-50",
  },
  {
    title: "Love Resources",
    description:
      "Elevate your relationships with our curated resources. From heartfelt love letters and romantic one-liners to e-books filled with expert advice, these tools are designed to inspire and strengthen your bonds.",
    icon: <Heart className="w-7 h-7 text-[#e27396]" />,
    link: "/resources/love",
    image: "/images/love.svg",
    bgColor: "bg-rose-50",
  },
  {
    title: "Trust & Growth",
    description:
      "Trust is the foundation of any healthy relationship. Discover actionable ways to build, nurture, and rebuild trust while growing individually and together. Explore how vulnerability and accountability can lead to stronger connections.",
    icon: <Users className="w-7 h-7 text-[#e27396]" />,
    link: "/resources/trust",
    image: "/images/trust.svg",
    bgColor: "bg-purple-50",
  },
];

const FeatureCards = () => {
  return (
    <section className="relative z-10 py-24" id="features">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-pink-50">
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e27396' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }} />
      </div>

      {/* Curved top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-pink-50"
        style={{ borderTopLeftRadius: "3rem", borderTopRightRadius: "3rem" }}
      />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-[#e27396] rounded-full opacity-[0.1] blur-2xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#e27396] rounded-full opacity-[0.1] blur-3xl animate-pulse" />

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
                className={`group relative ${feature.bgColor} rounded-2xl p-8 
                          shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(226,115,150,0.2)] 
                          transition-all duration-300 ease-in-out hover:-translate-y-1 overflow-hidden`}
              >
                {/* Feature Image */}
                <div className="absolute top-0 right-0 w-48 h-48 opacity-30 transform translate-x-8 -translate-y-8">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={192}
                    height={192}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Card Highlight Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#e27396]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon Header Area */}
                <div className="flex items-start mb-6 relative">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0 
                                shadow-sm group-hover:shadow-md transition-all duration-300
                                group-hover:scale-105">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 ml-4 mt-2 group-hover:text-[#e27396] transition-colors duration-300">
                    {feature.title}
                  </h3>
                </div>

                {/* Description Area */}
                <div className="space-y-4 relative">
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  {/* <Link
                    href={feature.link}
                    className="inline-flex items-center text-[#e27396] hover:text-[#d45c82] transition-colors font-medium mt-4 
                             bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
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
                  </Link> */}
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
