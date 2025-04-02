"use client";

import { useState, useEffect, useRef } from "react";
import { enUS } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Script from "next/script";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define time slots
const TIME_SLOTS = [
  "Morning (9 AM - 12 PM)",
  "Afternoon (12 PM - 3 PM)",
  "Evening (3 PM - 6 PM)",
  "Night (6 PM - 9 PM)"
];

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  preferredDate: z.date({
    required_error: "Please select a date",
  }),
  timeSlot: z.string({
    required_error: "Please select a time slot",
  }),
  mode: z.enum(["CHAT", "CALL"], {
    required_error: "Please select a communication mode",
  }),
  duration: z.enum(["30", "60"], {
    required_error: "Please select a session duration",
  }),
  message: z.string().min(10, "Please tell us a bit more (10 character minimum)"),
  acknowledged: z.literal(true, {
    errorMap: () => ({ message: "You must acknowledge this before proceeding" }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function FriendlyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [buddyName, setBuddyName] = useState("");
  const [buddyCalendlyUrl, setBuddyCalendlyUrl] = useState("");
  const [requestId, setRequestId] = useState("");
  const [shouldInitiatePayment, setShouldInitiatePayment] = useState(false);
  const calendlyContainerRef = useRef<HTMLDivElement>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      mode: "CHAT",
      duration: "30",
      timeSlot: "",
    },
  });

  // Effect to handle payment after form submission
  useEffect(() => {
    if (shouldInitiatePayment && requestId) {
      console.log("Initiating payment for requestId:", requestId);
      handlePayment();
      setShouldInitiatePayment(false);
    }
  }, [shouldInitiatePayment, requestId]);

  // Load Calendly widget script
  useEffect(() => {
    if (formSubmitted && paymentCompleted && buddyCalendlyUrl) {
      // Clean up any existing scripts to avoid duplicates
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Create and append new script
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        console.log("Calendly script loaded successfully");
        if (calendlyContainerRef.current && window.Calendly) {
          console.log("Initializing Calendly widget with URL:", buddyCalendlyUrl);
          window.Calendly.initInlineWidget({
            url: buddyCalendlyUrl,
            parentElement: calendlyContainerRef.current,
            prefill: {
              name: form.getValues('name'),
              email: form.getValues('email'),
            },
            utm: {
              utmSource: 'burstthebubble',
              utmMedium: 'friendly_form',
            }
          });
        }
      };
      
      document.body.appendChild(script);

      return () => {
        // Clean up script on unmount
        const scriptToRemove = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [formSubmitted, paymentCompleted, buddyCalendlyUrl, form]);

  // Handle payment with Razorpay
  const handlePayment = async () => {
    try {
      setIsPaymentProcessing(true);
      
      console.log("Starting payment with requestId:", requestId);
      
      // Create order
      const orderResponse = await fetch("/api/buddy-payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: requestId,
          email: form.getValues("email"),
          name: form.getValues("name"),
          mode: form.getValues("mode"),
          duration: form.getValues("duration"),
        }),
      });
      
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error("Payment order creation failed:", errorData);
        throw new Error(errorData.message || "Failed to create payment order");
      }
      
      const orderData = await orderResponse.json();
      console.log("Order created successfully:", orderData);
      
      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Burst The Bubble",
        description: `Buddy Session (${form.getValues("mode")} - ${form.getValues("duration")} mins)`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/buddy-payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            
            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.message || "Failed to verify payment");
            }
            
            const verifyData = await verifyResponse.json();
            toast.success("Payment successful! You can now schedule your session.");
            setPaymentCompleted(true);
            
            // Update buddy URL if it's in the response
            if (verifyData.calendlyUrl) {
              setBuddyCalendlyUrl(verifyData.calendlyUrl);
            }
            
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: form.getValues("name"),
          email: form.getValues("email"),
        },
        theme: {
          color: "#e27396",
        },
      };
      
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Log data for debugging
      console.log("Submitting data:", {
        ...data,
        type: "FRIENDLY",
      });
      
      // Make API call to create buddy request
      const response = await fetch("/api/buddy-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          type: "FRIENDLY", // This is a friendly form
        }),
      });
      
      const result = await response.json();
      console.log("API response:", result);
      
      if (!response.ok) {
        if (result.message === "All buddies are busy at this time") {
          toast.error("All buddies are busy at this time. Please select a different time slot.");
        } else {
          throw new Error(result.message || "Failed to submit request");
        }
      } else {
        toast.success(`Your request has been submitted! ${result.buddyName} will be your buddy for this session.`);
        
        // Default Calendly URL if none is provided in the response
        const calendlyUrl = result.buddyCalendlyLink || 'https://calendly.com/burst-the-bubble/buddy-session';
        
        console.log("API Response Details:", {
          requestId: result.requestId,
          buddyName: result.buddyName,
          buddyCalendlyLink: result.buddyCalendlyLink
        });
        
        console.log("Setting buddy info:", {
          name: result.buddyName,
          calendlyUrl: calendlyUrl
        });
        
        setBuddyName(result.buddyName);
        setBuddyCalendlyUrl(calendlyUrl);
        setRequestId(result.requestId);
        setFormSubmitted(true);
        setShouldInitiatePayment(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle displaying the form, payment screen, or Calendly
  if (formSubmitted) {
    // If payment completed, show Calendly
    if (paymentCompleted) {
      return (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#e27396] mb-2">Schedule with {buddyName}</h2>
            <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
              Please select a convenient time slot from {buddyName}'s calendar. You'll receive a confirmation email once your appointment is scheduled.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden mb-8">
            <div 
              ref={calendlyContainerRef} 
              id="calendly-inline-widget"
              className="w-full"
              style={{ height: "calc(100vh - 300px)", minHeight: "800px", maxHeight: "1000px" }}
            ></div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => {
                setFormSubmitted(false);
                setPaymentCompleted(false);
                form.reset();
              }}
              className="px-6 py-2 bg-white hover:bg-gray-50 text-[#e27396] border border-[#e27396] hover:border-[#d45c82] transition-colors duration-200"
              variant="outline"
            >
              Go Back to Form
            </Button>
          </div>
        </div>
      );
    }
    
    // Show payment screen
    return (
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#e27396] mb-2">Complete Your Payment</h2>
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
            You're almost there! Complete the payment to schedule your session with {buddyName}.
          </p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Session Type:</span>
              <span className="font-medium">
                {form.getValues("mode") === "CHAT" ? "💬 Chat Session" : "📞 Call Session"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{form.getValues("duration")} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Buddy:</span>
              <span className="font-medium">{buddyName}</span>
            </div>
            <div className="border-t border-gray-200 my-2 pt-2"></div>
            <div className="flex justify-between">
              <span className="text-gray-800 font-medium">Total Amount:</span>
              <span className="text-[#e27396] font-bold">
                ₹{form.getValues("mode") === "CHAT" 
                  ? (form.getValues("duration") === "30" ? "299" : "499") 
                  : (form.getValues("duration") === "30" ? "399" : "599")}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Button 
            onClick={handlePayment}
            className="w-full bg-[#e27396] hover:bg-[#d45c82] text-white py-3 text-md font-medium rounded-xl"
            disabled={isPaymentProcessing || !requestId}
          >
            {isPaymentProcessing ? "Processing..." : "Pay Now"}
          </Button>
          
          <Button 
            onClick={() => {
              setFormSubmitted(false);
            }}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 text-md font-medium rounded-xl"
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-[#e27396] mb-2">Let's Chat About Your Needs</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          👋 Hey there! We're here to help you navigate your relationships. Let's have a friendly conversation about what's on your mind!
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-start mb-4">
          <div className="bg-[#e27396]/10 rounded-2xl p-4 max-w-[80%] relative chat-bubble">
            <p className="text-gray-800">What's your name? We'd love to get to know you!</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Enter your name" 
                      {...field} 
                      className="border-gray-300 focus:border-[#e27396] focus:ring-[#e27396] rounded-xl py-3" 
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-start mb-4">
                    <div className="bg-[#e27396]/10 rounded-2xl p-4 max-w-[80%] relative chat-bubble">
                      <p className="text-gray-800">Great! And what's the best email to reach you?</p>
                    </div>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="your.email@example.com" 
                      {...field} 
                      className="border-gray-300 focus:border-[#e27396] focus:ring-[#e27396] rounded-xl py-3" 
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-start mb-4">
            <div className="bg-[#e27396]/10 rounded-2xl p-4 max-w-[80%] relative chat-bubble">
              <p className="text-gray-800">When would you like to chat with one of our buddies?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <FormField
              control={form.control}
              name="preferredDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal border-gray-300 hover:bg-gray-50 rounded-xl ${
                            !field.value && "text-gray-500"
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white rounded-lg shadow-lg" align="start">
                      <Calendar
                        locale={enUS}
                        weekStartsOn={0}
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="border-[#e27396]"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Time Slot Selection */}
            <FormField
              control={form.control}
              name="timeSlot"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#e27396] focus:ring-[#e27396] rounded-xl">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-start mb-4">
            <div className="bg-[#e27396]/10 rounded-2xl p-4 max-w-[80%] relative chat-bubble">
              <p className="text-gray-800">How would you prefer to connect with your buddy?</p>
            </div>
          </div>

          {/* Communication Mode Field */}
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <div className="flex flex-wrap gap-4">
                    <label className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl cursor-pointer transition-all ${field.value === "CHAT" ? "bg-[#e27396] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
                      <input
                        type="radio"
                        value="CHAT"
                        checked={field.value === "CHAT"}
                        onChange={() => field.onChange("CHAT")}
                        className="sr-only"
                      />
                      <span>💬 Chat</span>
                    </label>
                    <label className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl cursor-pointer transition-all ${field.value === "CALL" ? "bg-[#e27396] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
                      <input
                        type="radio"
                        value="CALL"
                        checked={field.value === "CALL"}
                        onChange={() => field.onChange("CALL")}
                        className="sr-only"
                      />
                      <span>📞 Call</span>
                    </label>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="flex justify-start mb-4">
            <div className="bg-[#e27396]/10 rounded-2xl p-4 max-w-[80%] relative chat-bubble">
              <p className="text-gray-800">How long would you like your session to be?</p>
            </div>
          </div>

          {/* Duration Field */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <div className="flex flex-wrap gap-4">
                    <label className={`flex flex-col items-center justify-center gap-2 px-5 py-3 rounded-xl cursor-pointer transition-all ${field.value === "30" ? "bg-[#e27396] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
                      <input
                        type="radio"
                        value="30"
                        checked={field.value === "30"}
                        onChange={() => field.onChange("30")}
                        className="sr-only"
                      />
                      <span className="font-medium">30 Minutes</span>
                      <span className={`text-sm ${field.value === "30" ? "text-white/80" : "text-gray-500"}`}>
                        {form.getValues("mode") === "CHAT" ? "₹299" : "₹399"}
                      </span>
                    </label>
                    <label className={`flex flex-col items-center justify-center gap-2 px-5 py-3 rounded-xl cursor-pointer transition-all ${field.value === "60" ? "bg-[#e27396] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
                      <input
                        type="radio"
                        value="60"
                        checked={field.value === "60"}
                        onChange={() => field.onChange("60")}
                        className="sr-only"
                      />
                      <span className="font-medium">60 Minutes</span>
                      <span className={`text-sm ${field.value === "60" ? "text-white/80" : "text-gray-500"}`}>
                        {form.getValues("mode") === "CHAT" ? "₹499" : "₹599"}
                      </span>
                    </label>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="flex justify-start mb-4">
            <div className="bg-[#e27396]/10 rounded-2xl p-4 max-w-[80%] relative chat-bubble">
              <p className="text-gray-800">Tell us what's on your mind. What would you like to talk about?</p>
            </div>
          </div>

          {/* Message Field */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="I'd like to talk about..."
                    className="min-h-[120px] border-gray-300 focus:border-[#e27396] focus:ring-[#e27396] rounded-xl"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Acknowledgment Checkbox */}
          <FormField
            control={form.control}
            name="acknowledged"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-[#e27396]/5 p-4 rounded-xl border border-[#e27396]/20">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-[#e27396] data-[state=checked]:border-[#e27396]"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-gray-700">
                    I understand that this is a supportive service and not professional therapy.
                  </FormLabel>
                  <FormMessage className="text-red-500" />
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-[#e27396] hover:bg-[#d45c82] text-white py-3 text-md font-medium rounded-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Connecting you..." : "Let's Connect! 👋"}
          </Button>
        </form>
      </Form>

      <style jsx global>{`
        .chat-bubble:after {
          content: '';
          position: absolute;
          left: -10px;
          top: 15px;
          width: 0;
          height: 0;
          border: 10px solid transparent;
          border-right-color: rgba(226, 115, 150, 0.1);
          border-left: 0;
          margin-top: -10px;
        }
      `}</style>
    </div>
  );
} 