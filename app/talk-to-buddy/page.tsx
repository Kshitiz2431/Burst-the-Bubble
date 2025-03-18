"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FriendlyForm from "./FriendlyForm";
import DetailedForm from "./DetailedForm";
import { motion } from "framer-motion";

export default function TalkToBuddyPage() {
  const [activeTab, setActiveTab] = useState<string>("friendly");

  return (
    <main className="container mx-auto px-4 pt-28 pb-20 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold mb-4">Talk to a Buddy</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with a supportive buddy who's ready to listen. Choose the form
          type that suits your needs and we'll match you with someone who can help.
        </p>
      </motion.div>

      <Tabs
        defaultValue="friendly"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full max-w-3xl mx-auto"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="friendly">Friendly & Conversational</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Form</TabsTrigger>
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