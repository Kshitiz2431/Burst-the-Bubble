"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import GuidelinesBridge from "./GuidelinesBridge";

export default function SimplifiedForm() {
  const [currentStep, setCurrentStep] = useState<'form' | 'payment' | 'guidelines' | 'calendly'>('form');
  const [buddyName, setBuddyName] = useState("Sarah");

  const handleSubmitForm = () => {
    console.log("Form submitted");
    setCurrentStep('payment');
  };

  const handlePaymentComplete = () => {
    console.log("Payment completed");
    setCurrentStep('guidelines');
  };

  const handleGuidelinesAccepted = () => {
    console.log("Guidelines accepted");
    setCurrentStep('calendly');
  };

  const handleGoBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('form');
    } else if (currentStep === 'guidelines') {
      setCurrentStep('payment');
    } else if (currentStep === 'calendly') {
      setCurrentStep('form');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-center">
        <div className="flex items-center text-sm">
          <div className={`px-4 py-2 rounded-full ${currentStep === 'form' ? 'bg-[#e27396] text-white' : 'bg-gray-200 text-gray-600'}`}>
            1. Form
          </div>
          <div className="w-8 h-1 bg-gray-200"></div>
          <div className={`px-4 py-2 rounded-full ${currentStep === 'payment' ? 'bg-[#e27396] text-white' : 'bg-gray-200 text-gray-600'}`}>
            2. Payment
          </div>
          <div className="w-8 h-1 bg-gray-200"></div>
          <div className={`px-4 py-2 rounded-full ${currentStep === 'guidelines' ? 'bg-[#e27396] text-white' : 'bg-gray-200 text-gray-600'}`}>
            3. Guidelines
          </div>
          <div className="w-8 h-1 bg-gray-200"></div>
          <div className={`px-4 py-2 rounded-full ${currentStep === 'calendly' ? 'bg-[#e27396] text-white' : 'bg-gray-200 text-gray-600'}`}>
            4. Schedule
          </div>
        </div>
      </div>

      {/* Form Step */}
      {currentStep === 'form' && (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#e27396] mb-2">Step 1: Fill in the Form</h2>
            <p className="text-gray-600">This is a simplified demonstration of the form flow.</p>
          </div>
          
          <div className="space-y-6 mb-8">
            <p className="text-gray-700">Form fields would go here in the real implementation.</p>
          </div>
          
          <Button 
            onClick={handleSubmitForm}
            className="w-full bg-[#e27396] hover:bg-[#d45c82] text-white py-3 text-md font-medium rounded-xl"
          >
            Submit Form
          </Button>
        </div>
      )}

      {/* Payment Step */}
      {currentStep === 'payment' && (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#e27396] mb-2">Step 2: Complete Payment</h2>
            <p className="text-gray-600">This is where payment would be processed.</p>
          </div>
          
          <div className="space-y-6 mb-8">
            <p className="text-gray-700">Payment details would go here in the real implementation.</p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={handlePaymentComplete}
              className="w-full bg-[#e27396] hover:bg-[#d45c82] text-white py-3 text-md font-medium rounded-xl"
            >
              Complete Payment
            </Button>
            
            <Button 
              onClick={handleGoBack}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 text-md font-medium rounded-xl"
              variant="outline"
            >
              Go Back
            </Button>
          </div>
        </div>
      )}

      {/* Guidelines Step */}
      {currentStep === 'guidelines' && (
        <GuidelinesBridge 
          buddyName={buddyName}
          onAccept={handleGuidelinesAccepted}
          onGoBack={handleGoBack}
        />
      )}

      {/* Calendly Step */}
      {currentStep === 'calendly' && (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#e27396] mb-2">Step 4: Schedule Your Session</h2>
            <p className="text-gray-600">Select a convenient time slot with {buddyName}.</p>
          </div>
          
          <div className="space-y-6 mb-8">
            <p className="text-gray-700">Calendly widget would be embedded here in the real implementation.</p>
          </div>
          
          <Button 
            onClick={handleGoBack}
            className="w-full bg-white hover:bg-gray-50 text-[#e27396] border border-[#e27396] hover:border-[#d45c82] transition-colors duration-200"
            variant="outline"
          >
            Go Back to Form
          </Button>
        </div>
      )}
    </div>
  );
} 