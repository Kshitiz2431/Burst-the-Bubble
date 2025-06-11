"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Mail, Star, BookOpen, Gift, Clock, Lock } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Script from 'next/script';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

// Add a TypeScript interface for the Razorpay window property
declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}
const premiumPlans = [
  {
    name: "Monthly Premium",
    price: "₹299",
    period: "per month",
    features: [
      "All Free Newsletter Content",
      "Exclusive Premium Articles",
      "Relationship Workbooks",
      "Private Community Access",
      "Early Access to New Features",
      "Priority Support"
    ],
    popular: false,
    id: "monthly"
  },
  {
    name: "Yearly Premium",
    price: "₹2499",
    period: "per year",
    features: [
      "All Free Newsletter Content",
      "Exclusive Premium Articles",
      "Relationship Workbooks",
      "Private Community Access",
      "Early Access to New Features",
      "Priority Support",
      "2 Free Relationship E-Books",
      "16% Savings Compared to Monthly"
    ],
    popular: true,
    id: "yearly"
  }
];

const freeBenefits = [
  {
    title: "Weekly Love Tips",
    description: "Fresh insights and practical advice delivered to your inbox",
    icon: <Mail className="w-6 h-6 text-[#e27396]" />,
  },
  {
    title: "Love Letters Templates",
    description: "Basic templates to express your feelings",
    icon: <BookOpen className="w-6 h-6 text-[#e27396]" />,
  },
  {
    title: "Relationship Articles",
    description: "Access to our weekly free articles",
    icon: <Star className="w-6 h-6 text-[#e27396]" />,
  }
];

const premiumBenefits = [
  {
    title: "Exclusive Articles",
    description: "In-depth content not available on the website, tackling advanced or nuanced relationship topics.",
    icon: <Star className="w-6 h-6 text-[#e27396]" />,
  },
  {
    title: "Access to Premium Love Letters",
    description: "Personalized or curated love letters designed to inspire deeper emotional connections.",
    icon: <BookOpen className="w-6 h-6 text-[#e27396]" />,
  },
  {
    title: "Relationship Toolkits",
    description: "Downloadable resources such as comprehensive guides, worksheets, or checklists for specific relationship challenges.",
    icon: <Gift className="w-6 h-6 text-[#e27396]" />,
  },
  {
    title: "Monthly Q&A",
    description: "A subscriber-only Q&A session with relationship experts or contributors.",
    icon: <Lock className="w-6 h-6 text-[#e27396]" />,
  },
  {
    title: "Early Access",
    description: "Receive new resources and announcements before they go live to the general audience.",
    icon: <Clock className="w-6 h-6 text-[#e27396]" />,
  },
  {
    title: "Custom Love Notes",
    description: "Subscribers can request personalized love notes or quotes for special occasions.",
    icon: <Mail className="w-6 h-6 text-[#e27396]" />,
  }
];

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>("monthly");
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isSubscribed: boolean;
    isPremium: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  console.log(error);
  const [success, setSuccess] = useState<string | null>(null);
  console.log(success);
  const handleFreeSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      if (data.alreadySubscribed) {
        setSubscriptionStatus({
          isSubscribed: true,
          isPremium: data.isPremium,
          message: data.message
        });
        return;
      }
  
      toast.success(
        "Almost there! Please check your email to confirm your subscription.",
        { duration: 5000 }
      );
      setEmail("");
      setName("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to subscribe");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePremiumSubscribe = async () => {
    if (!email || !selectedPlan) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Creating order with plan:', selectedPlan);

      // Create order
      const response = await fetch('/api/newsletter/premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          planType: selectedPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Order creation failed:', data);
        throw new Error(data.error || 'Failed to create payment order');
      }

      console.log('Order created successfully:', data);

      // Initialize Razorpay
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Burst The Bubble",
        description: `Premium Newsletter Subscription - ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Plan`,
        order_id: data.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            console.log('Payment successful:', response);
            
            // Verify payment
            const verifyResponse = await fetch('/api/newsletter/premium', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                name,
                planType: selectedPlan,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              console.error('Payment verification failed:', verifyData);
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            console.log('Payment verified successfully:', verifyData);
            
            // Show success message
            setSuccess("Premium subscription successful! Please check your email for verification.");
            setIsLoading(false);
          } catch (error) {
            console.error('Payment verification error:', error);
            setError(error instanceof Error ? error.message : "Payment verification failed");
            setIsLoading(false);
          }
        },
        prefill: {
          name: name || "",
          email: email,
        },
        theme: {
          color: "#e27396",
        },
      };

      console.log('Initializing Razorpay with options:', options);

      // const razorpay = new (window as any).Razorpay(options);
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : "Payment failed");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-white pt-24">
      {/* Add Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
        onError={(e) => {
          console.error('Failed to load Razorpay script:', e);
          toast.error('Failed to load payment system. Please try again later.');
        }}
      />

      {/* Hero Section */}
      <section className="py-16 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Relationship Newsletter <br />
            <span className="text-[#e27396]">You&rsquo;ve Been Waiting For</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            From casual dating advice to deep relationship insights,
            our newsletter gives you the tools to build meaningful connections.
          </p>
        </motion.div>
      </section>

      {/* Free vs Premium Comparison */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Choose Your Subscription</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Free Tier */}
            <motion.div 
              className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Free Newsletter</h3>
                <p className="text-gray-600 mt-2">Perfect for anyone starting their relationship journey</p>
                <div className="mt-4 text-3xl font-bold text-gray-900">₹0 <span className="text-lg font-normal text-gray-600">forever</span></div>
              </div>
              
              <div className="space-y-4 mb-8">
                {freeBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mt-1 mr-3 text-[#e27396]">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{benefit.title}</h4>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleFreeSubscribe} className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full px-4 py-3 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:border-[#e27396] focus:ring-2 focus:ring-[#e27396]/20"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-3 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:border-[#e27396] focus:ring-2 focus:ring-[#e27396]/20"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-8 py-3 bg-[#e27396] text-white rounded-lg font-medium hover:bg-[#d45c82] transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Subscribing..." : "Subscribe for Free"}
                </button>
              </form>
            </motion.div>
            
            {/* Premium Tier */}
            <motion.div 
              className="bg-gradient-to-br from-[#e27396]/10 to-[#de5c98]/10 rounded-2xl p-8 border border-[#e27396]/30 relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="absolute -top-4 right-8 bg-[#e27396] text-white px-4 py-1 rounded-full text-sm font-medium">
                Recommended
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Premium Newsletter</h3>
                <p className="text-gray-600 mt-2">For those serious about building lasting relationships</p>
                
                <div className="mt-4 space-y-3">
                  {premiumPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`flex items-center border rounded-lg p-3 cursor-pointer transition-all
                      ${selectedPlan === plan.id 
                        ? 'border-[#e27396] bg-[#e27396]/10' 
                        : 'border-gray-200 hover:border-[#e27396]/50'}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className={`h-5 w-5 rounded-full border mr-3 flex items-center justify-center
                        ${selectedPlan === plan.id ? 'border-[#e27396]' : 'border-gray-300'}`}>
                        {selectedPlan === plan.id && (
                          <div className="h-3 w-3 rounded-full bg-[#e27396]"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{plan.name}</h4>
                        <p className="text-sm text-gray-600">{plan.popular && 'Most popular • '}Save 16% annually</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{plan.price}</div>
                        <div className="text-xs text-gray-600">{plan.period}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                {premiumBenefits.slice(0, 4).map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mt-1 mr-3 text-[#e27396]">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{benefit.title}</h4>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
                <div className="text-sm text-[#e27396] font-medium">+ {premiumBenefits.length - 4} more premium benefits</div>
              </div>
              
              <button
                onClick={handlePremiumSubscribe}
                className="w-full px-8 py-3 bg-gradient-to-r from-[#e27396] to-[#de5c98] text-white rounded-lg font-medium hover:from-[#d45c82] hover:to-[#de5c98] transition-colors shadow-md disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Get Premium Access"}
              </button>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Premium Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Premium Benefits in Detail</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">
            Unlock all these exclusive benefits when you subscribe to our premium newsletter
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {premiumBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)] 
                          hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300"
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#e27396]/10 rounded-xl flex items-center justify-center shrink-0">
                    {benefit.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">What&rsquo;s included in the free newsletter?</h3>
              <p className="text-gray-600">
                Our free newsletter includes weekly relationship tips, selected love letter templates, 
                and access to our basic articles. It&rsquo;s perfect for those just starting their relationship journey.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">How does the premium subscription work?</h3>
              <p className="text-gray-600">
                After subscribing, you&rsquo;ll receive immediate access to our premium content library, 
                exclusive templates, and all premium benefits. You&rsquo;ll also get weekly premium newsletters with exclusive content.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Can I cancel my premium subscription?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your premium subscription at any time from your account settings.
                You&rsquo;ll continue to have access until the end of your billing period.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">How often will I receive the newsletter?</h3>
              <p className="text-gray-600">
                Both free and premium newsletters are sent weekly, typically every Monday morning.
                Premium subscribers also receive exclusive mid-week content updates.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Link href="/contact-us" className="text-[#e27396] font-medium hover:underline">
              Contact our support team
            </Link>
          </div>
        </div>
      </section>
      
      {subscriptionStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-[#e27396]">
              {subscriptionStatus.isPremium ? "Premium Subscription Active" : "Already Subscribed"}
            </h2>
            <p className="text-gray-600 mb-6">
              {subscriptionStatus.message}
            </p>
            {subscriptionStatus.isPremium ? (
              <p className="text-sm text-gray-500">
                Your premium subscription is active. You can access all premium features.
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  You&rsquo;re already subscribed to our free newsletter.
                </p>
                <button
                  onClick={() => setSubscriptionStatus(null)}
                  className="w-full px-4 py-2 bg-[#e27396] text-white rounded-lg hover:bg-[#d45c82] transition-colors"
                >
                  Upgrade to Premium
                </button>
              </div>
            )}
            <button
              onClick={() => setSubscriptionStatus(null)}
              className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
} 