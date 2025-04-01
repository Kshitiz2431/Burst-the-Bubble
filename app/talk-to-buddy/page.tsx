"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FriendlyForm from "./FriendlyForm";
import DetailedForm from "./DetailedForm";
import { motion } from "framer-motion";
import { MessageCircle, ClipboardList, Clock, PhoneCall, MessageSquare, Shield } from "lucide-react";

export default function TalkToBuddyPage() {
  const [activeTab, setActiveTab] = useState<string>("friendly");

  return (
    <main className="container mx-auto px-4 pt-28 pb-20 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Talk to a Buddy</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          Connect with a supportive buddy who's ready to listen. Choose the form
          type that suits your needs and we'll match you with someone who can help.
        </p>
      </motion.div>

      {/* Introduction Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-md p-8 mb-12 border border-gray-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Talk to Buddy?</h2>
            <p className="text-gray-700 mb-4">
              Talk to Buddy is a safe and supportive space where you can book 1-on-1 sessions with a Buddy to share your thoughts, concerns, and relationship challenges. This service offers emotional support and guidance, but it is not a replacement for professional therapy. Whether you need someone to listen or help you navigate a difficult situation, our Buddies are here for you.
            </p>
            <div className="flex flex-col space-y-3 mt-6">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-[#e27396] mr-2" />
                <span className="text-gray-700">Safe and confidential environment</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-[#e27396] mr-2" />
                <span className="text-gray-700">Non-judgmental listening and support</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-[#e27396] mr-2" />
                <span className="text-gray-700">Flexible scheduling to fit your needs</span>
              </div>
            </div>
          </div>
          <div className="bg-[#e27396]/5 p-6 rounded-xl border border-[#e27396]/20">
            <h3 className="text-xl font-semibold text-[#e27396] mb-4">Pricing (in INR)</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e27396]/10">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-[#e27396] mr-2" />
                  <span className="text-gray-700">30-minute chat session</span>
                </div>
                <span className="font-medium text-gray-900">₹299</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#e27396]/10">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-[#e27396] mr-2" />
                  <span className="text-gray-700">60-minute chat session</span>
                </div>
                <span className="font-medium text-gray-900">₹499</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#e27396]/10">
                <div className="flex items-center">
                  <PhoneCall className="h-4 w-4 text-[#e27396] mr-2" />
                  <span className="text-gray-700">30-minute voice call</span>
                </div>
                <span className="font-medium text-gray-900">₹399</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PhoneCall className="h-4 w-4 text-[#e27396] mr-2" />
                  <span className="text-gray-700">60-minute voice call</span>
                </div>
                <span className="font-medium text-gray-900">₹599</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs
        defaultValue="friendly"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full max-w-3xl mx-auto"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-100 rounded-xl">
          <TabsTrigger 
            value="friendly" 
            className={`rounded-lg py-3 flex items-center justify-center gap-2 ${activeTab === 'friendly' ? 'bg-white shadow-sm text-[#e27396]' : 'text-gray-600 hover:text-[#e27396]'}`}
          >
            <MessageCircle className="w-4 h-4" />
            Friendly Chat
          </TabsTrigger>
          <TabsTrigger 
            value="detailed" 
            className={`rounded-lg py-3 flex items-center justify-center gap-2 ${activeTab === 'detailed' ? 'bg-white shadow-sm text-[#e27396]' : 'text-gray-600 hover:text-[#e27396]'}`}
          >
            <ClipboardList className="w-4 h-4" />
            Detailed Form
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="friendly" className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FriendlyForm />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="detailed" className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <DetailedForm />
          </motion.div>
        </TabsContent>
      </Tabs>
    </main>
  );
} 