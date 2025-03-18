"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BuddyManagement } from "./components/BuddyManagement";
import { BuddyRequestsTable } from "./components/BuddyRequestsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function TalkToBuddyAdminPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-[#B33771]">Talk to Buddy Management</h1>
        <p className="text-gray-600 mb-8">Manage buddies and buddy requests from users</p>
        
        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <Tabs defaultValue="buddies">
            <TabsList className="mb-6 bg-gray-100">
              <TabsTrigger 
                value="buddies"
                className="data-[state=active]:bg-[#B33771] data-[state=active]:text-white"
              >
                Buddies
              </TabsTrigger>
              <TabsTrigger 
                value="requests"
                className="data-[state=active]:bg-[#B33771] data-[state=active]:text-white"
              >
                Buddy Requests
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="buddies">
              <BuddyManagement setError={setError} />
            </TabsContent>
            
            <TabsContent value="requests">
              <BuddyRequestsTable setError={setError} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 