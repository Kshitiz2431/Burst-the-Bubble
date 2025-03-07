"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqData = [
  {
    category: "General Information",
    faqs: [
      {
        question: "What inspired the creation of Burst the Bubble?",
        answer:
          "Burst the Bubble was created to address the complexities of relationships and provide accessible resources to help people build stronger, healthier connections in every aspect of their lives.",
      },
      {
        question: "Who is Burst the Bubble for?",
        answer:
          "Our platform is for anyone seeking to understand relationships better—whether you’re navigating romantic partnerships, friendships, family dynamics, or self-love.",
      },
      {
        question: "Do I need to create an account to access your content?",
        answer:
          "No account is required to access our free resources. However, signing up for our newsletter or purchasing premium content may require basic registration.",
      },
    ],
  },
  {
    category: "Content and Topics",
    faqs: [
      {
        question: "What topics do you cover on your platform?",
        answer:
          "We explore a variety of topics, including effective communication, conflict resolution, self-love, dating tips, navigating breakups, spotting red flags, and promoting mutual respect in relationships.",
      },
      {
        question: "Do you focus on romantic relationships only?",
        answer:
          "No, we cover all types of relationships, including platonic, familial, professional, and romantic connections.",
      },
      {
        question: "Do you address specific relationship challenges, like long-distance relationships or co-parenting?",
        answer:
          "Yes, our platform covers a wide range of topics, including specific challenges like long-distance relationships, co-parenting, and more. Browse our articles or use the search bar to find content tailored to your needs.",
      },
      {
        question: "Do you provide advice on LGBTQ+ relationships?",
        answer:
          "Absolutely! Our content is inclusive and designed to support relationships of all kinds, including LGBTQ+ partnerships.",
      },
      {
        question: "How often do you publish new content?",
        answer:
          "We publish new articles and resources weekly. Newsletter subscribers receive updates every Monday with our latest content and exclusive tips.",
      },
      {
        question: "How do you ensure your advice is credible?",
        answer:
          "Our content is based on research, insights from relationship experts, and real-world experiences. We aim to provide practical, well-rounded advice.",
      },
    ],
  },
  {
    category: "Services and Offerings",
    faqs: [
      {
        question: "What kind of resources do you provide?",
        answer:
          "Burst the Bubble offers articles, newsletters, love letters, one-liners, and small e-books that focus on building healthy relationships, effective communication, and self-growth.",
      },
      {
        question: "Do you offer relationship counseling?",
        answer:
          "We don't provide direct counseling services. Our platform offers resources and general advice, but for specific relationship issues, we recommend consulting with a licensed professional.",
      },
      {
        question: "What are your premium resources?",
        answer:
          "Our premium offerings include detailed e-books, personalized love letters, relationship worksheets, and exclusive content accessible through subscription plans.",
      },
      {
        question: "Can I request a custom love letter or message?",
        answer:
          "Yes! We offer personalized love letters and one-liners tailored to your needs. Check our 'Love Resources' section for more details.",
      },
      {
        question: "How can I get personalized advice?",
        answer:
          "While we don't offer one-on-one consultations, our resources are crafted to address common relationship concerns. For personalized guidance, we encourage seeking advice from licensed professionals or therapists.",
      },
      {
        question: "Do you host workshops or webinars?",
        answer:
          "We’re planning to launch online workshops and webinars soon. Stay tuned by subscribing to our newsletter or following us on social media.",
      },
      {
        question: "Are your resources tailored for different age groups?",
        answer:
          "Yes, we aim to create content that is relevant to people of all ages, from teenagers navigating first loves to adults working on long-term partnerships.",
      },
      {
        question: "Are your resources free?",
        answer:
          "Many of our resources, like articles and newsletters, are free. Premium resources, such as detailed e-books or exclusive content, may have a small fee. Details are provided on the respective resource pages.",
      },
    ],
  },
  {
    category: "Community and Contribution",
    faqs: [
      {
        question: "Can I contribute to your platform?",
        answer:
          "Yes! We welcome guest contributions from relationship experts and experienced writers. Please contact us with your proposal and writing samples.",
      },
      {
        question: "How can I join the Burst the Bubble community?",
        answer:
          "Join our community by subscribing to our newsletter, following us on social media, and participating in discussions on our blog or forums.",
      },
      {
        question: "Can I become a guest writer or expert contributor?",
        answer:
          "Yes! If you have expertise or experiences to share, we’d love to feature your work. Send us a proposal through our contact form.",
      },
      {
        question: "Can I share my relationship story with your audience?",
        answer:
          "Absolutely! We welcome real-life stories that can inspire or help others. Submit your story through our contact page for consideration.",
      },
      {
        question: "Do you collaborate with brands or other platforms?",
        answer:
          "Yes, we’re open to collaborations that align with our mission of promoting healthy relationships and emotional well-being. Feel free to reach out via our contact form to discuss partnership opportunities.",
      },
    ],
  },
  {
    category: "Policies and Technical Support",
    faqs: [
      {
        question: "How do you handle privacy and data security?",
        answer:
          "We take privacy seriously. Your data is never shared with third parties, and we follow strict security protocols to protect your information. For more details, view our Privacy Policy.",
      },
      {
        question: "How can I unsubscribe from the newsletter?",
        answer:
          "You can unsubscribe anytime by clicking the 'Unsubscribe' link at the bottom of any newsletter email. If you face issues, contact us, and we’ll assist you.",
      },
      {
        question: "What should I do if I encounter a technical issue on your site?",
        answer:
          "If you face any technical issues, please contact us through our support form or email. We’ll resolve the issue as quickly as possible.",
      },
      {
        question: "Can I access Burst the Bubble resources offline?",
        answer:
          "While our website requires internet access, some premium resources, like e-books, can be downloaded for offline use after purchase.",
      },
    ],
  },
];

export default function FaqSection() {
  const [openCategories, setOpenCategories] = useState<{ [key: number]: boolean }>({});
  const [openFaqs, setOpenFaqs] = useState<{ [key: string]: boolean }>({});

  const toggleCategory = (catIndex: number) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catIndex]: !prev[catIndex],
    }));
  };

  const toggleFaq = (catIndex: number, faqIndex: number) => {
    const key = `${catIndex}-${faqIndex}`;
    setOpenFaqs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      {/* Main Heading */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">
        Frequently Asked Questions
      </h1>

      <div className="space-y-8">
        {faqData.map((group, catIndex) => {
          const isCategoryOpen = openCategories[catIndex] || false;

          return (
            <div key={catIndex}>
              {/* Category Row */}
              <button
                onClick={() => toggleCategory(catIndex)}
                className="flex items-center justify-between w-full py-4 border-b border-gray-300 text-left hover:text-[#B33771] transition-colors focus:outline-none"
              >
                <h2 className="text-xl font-semibold">
                  {group.category}
                </h2>
                {isCategoryOpen ? (
                  <Minus className="w-6 h-6" />
                ) : (
                  <Plus className="w-6 h-6" />
                )}
              </button>

              {/* Questions for this Category */}
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 pl-4 border-l border-gray-200"
                  >
                    {group.faqs.map((faq, faqIndex) => {
                      const faqKey = `${catIndex}-${faqIndex}`;
                      const isFaqOpen = openFaqs[faqKey] || false;

                      return (
                        <div key={faqIndex} className="py-3 border-b last:border-b-0">
                          <button
                            onClick={() => toggleFaq(catIndex, faqIndex)}
                            className="w-full flex items-center justify-between text-left focus:outline-none"
                          >
                            <span className="font-medium text-gray-700 hover:text-[#B33771] transition-colors">
                              {faq.question}
                            </span>
                            {isFaqOpen ? (
                              <Minus className="w-5 h-5 text-gray-500" />
                            ) : (
                              <Plus className="w-5 h-5 text-gray-500" />
                            )}
                          </button>

                          {/* Answer */}
                          <AnimatePresence>
                            {isFaqOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-gray-600 mt-2"
                              >
                                {faq.answer}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
