"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}


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
  phone: z.string().optional(),
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
  message: z.string().min(10, "Please provide more details (10 character minimum)"),
  extraInfo: z.string().optional(),
  acknowledged: z.literal(true, {
    errorMap: () => ({ message: "You must acknowledge this before proceeding" }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function DetailedForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
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
      phone: "",
      message: "",
      extraInfo: "",
      mode: "CHAT",
      duration: "30",
      timeSlot: "",
    },
  });

  // Effect to handle payment after form submission
  useEffect(() => {
    if (shouldInitiatePayment && requestId) {
      console.log("Payment was set to initiate automatically, but we'll show a confirmation screen instead");
      // We are no longer auto-initiating payment - user must click the Pay Now button
      setShouldInitiatePayment(false);
    }
  }, [shouldInitiatePayment, requestId]);

  // Load Calendly widget script
  useEffect(() => {
    if (formSubmitted && paymentCompleted && guidelinesAccepted && buddyCalendlyUrl) {
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
              utmMedium: 'detailed_form',
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
  }, [formSubmitted, paymentCompleted, guidelinesAccepted, buddyCalendlyUrl, form]);

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
        handler: async function (response: RazorpayResponse) {
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
            console.log("Payment verification successful:", verifyData);
            console.log("Current state before update:", {
              formSubmitted,
              paymentCompleted,
              guidelinesAccepted,
              requestId,
              buddyName
            });
            
            // Wrap the state updates in a setTimeout to ensure they are properly batched
            // and the component has a chance to re-render
            setTimeout(() => {
              toast.success("Payment successful! Please review our guidelines before scheduling.");
              setPaymentCompleted(true);
              
              // Update buddy URL if it's in the response
              if (verifyData.calendlyUrl) {
                setBuddyCalendlyUrl(verifyData.calendlyUrl);
              }
              
              console.log("State after payment completion:", {
                formSubmitted,
                paymentCompleted: true,
                guidelinesAccepted,
                requestId,
                buddyName
              });
            }, 100);
            
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: form.getValues("name"),
          email: form.getValues("email"),
          contact: form.getValues("phone") || "",
        },
        theme: {
          color: "#e27396",
        },
      };
      
      // const razorpay = new (window as any).Razorpay(options);
      const razorpay = new (window as typeof window & { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);

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
      console.log("Submitting form data:", {
        ...data,
        type: "DETAILED"
      });
      
      // Make API call to create buddy request
      const response = await fetch("/api/buddy-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          type: "DETAILED", // This is a detailed form
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

  // Handle displaying the form, payment screen, guidelines, or Calendly
  if (formSubmitted && !paymentCompleted) {
    // Show payment confirmation screen
    return (
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#e27396] mb-2">Complete Your Payment</h2>
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
            Your request has been submitted! {buddyName} will be your buddy for this session.
            Please complete the payment to proceed with scheduling.
          </p>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-700">Buddy Session ({form.getValues("mode")} - {form.getValues("duration")} mins)</span>
                <span className="font-medium">
                  {form.getValues("mode") === "CHAT" 
                    ? (form.getValues("duration") === "30" ? "₹299" : "₹499") 
                    : (form.getValues("duration") === "30" ? "₹399" : "₹599")}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total</span>
                <span>
                  {form.getValues("mode") === "CHAT" 
                    ? (form.getValues("duration") === "30" ? "₹299" : "₹499") 
                    : (form.getValues("duration") === "30" ? "₹399" : "₹599")}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={handlePayment}
              disabled={isPaymentProcessing}
              className="w-full bg-[#e27396] hover:bg-[#d45c82] text-white py-3 text-md font-medium rounded-xl"
            >
              {isPaymentProcessing ? "Processing..." : "Pay Now"}
            </Button>
            
            <Button 
              onClick={() => {
                setFormSubmitted(false);
                setRequestId("");
              }}
              disabled={isPaymentProcessing}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 text-md font-medium rounded-xl"
              variant="outline"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (formSubmitted && paymentCompleted && !guidelinesAccepted) {
    // Show guidelines screen
    return (
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#e27396] mb-2">Guidelines for Your Session</h2>
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
            Please review these important guidelines before scheduling your session with {buddyName}.
          </p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
          <div className="space-y-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0 bg-[#e27396] text-white w-8 h-8 rounded-full flex items-center justify-center">1</div>
              <div>
                <h3 className="font-medium text-gray-800">Respect</h3>
                <p className="text-gray-600">We maintain a respectful environment where all perspectives are valued. Offensive language or personal attacks will not be tolerated.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 bg-[#e27396] text-white w-8 h-8 rounded-full flex items-center justify-center">2</div>
              <div>
                <h3 className="font-medium text-gray-800">Confidentiality</h3>
                <p className="text-gray-600">Your conversations remain confidential. We may use anonymized data for improving our services.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 bg-[#e27396] text-white w-8 h-8 rounded-full flex items-center justify-center">3</div>
              <div>
                <h3 className="font-medium text-gray-800">Not Therapy</h3>
                <p className="text-gray-600">Our service provides a friendly conversation, not professional therapy or counseling.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 bg-[#e27396] text-white w-8 h-8 rounded-full flex items-center justify-center">4</div>
              <div>
                <h3 className="font-medium text-gray-800">Crisis Support</h3>
                <p className="text-gray-600">If you&rsquo;re experiencing a crisis, please contact emergency services or a mental health helpline.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 bg-[#e27396] text-white w-8 h-8 rounded-full flex items-center justify-center">5</div>
              <div>
                <h3 className="font-medium text-gray-800">Session Focus</h3>
                <p className="text-gray-600">Sessions focus on having constructive conversations across different perspectives.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 bg-[#e27396] text-white w-8 h-8 rounded-full flex items-center justify-center">6</div>
              <div>
                <h3 className="font-medium text-gray-800">Cancellation Policy</h3>
                <p className="text-gray-600">Please provide at least 6 hours notice for cancellations or rescheduling.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 bg-[#e27396] text-white w-8 h-8 rounded-full flex items-center justify-center">7</div>
              <div>
                <h3 className="font-medium text-gray-800">Punctuality</h3>
                <p className="text-gray-600">Please be on time for your scheduled session. Your buddy will wait for 10 minutes.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 bg-[#e27396] text-white w-8 h-8 rounded-full flex items-center justify-center">8</div>
              <div>
                <h3 className="font-medium text-gray-800">Feedback</h3>
                <p className="text-gray-600">We value your feedback to improve our service. You&rsquo;ll receive a feedback form after your session.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Button 
            onClick={() => setGuidelinesAccepted(true)}
            className="w-full bg-[#e27396] hover:bg-[#d45c82] text-white py-3 text-md font-medium rounded-xl"
          >
            I Accept These Guidelines
          </Button>
          
          <Button 
            onClick={() => {
              setPaymentCompleted(false);
            }}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-2.5 text-md font-medium"
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (formSubmitted && paymentCompleted && guidelinesAccepted) {
    // Show Calendly screen
    return (
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#e27396] mb-2">Schedule with {buddyName}</h2>
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
            Please select a convenient time slot from {buddyName}&rsquo;s calendar. You&rsquo;ll receive a confirmation email once your appointment is scheduled.
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
              setGuidelinesAccepted(false);
            }}
            className="px-6 py-2 bg-white hover:bg-gray-50 text-[#e27396] border border-[#e27396] hover:border-[#d45c82] transition-colors duration-200"
            variant="outline"
          >
            Back to Guidelines
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-[#e27396] mb-2">Detailed Request Form</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Please provide more details to help our Buddies better understand your needs. This helps us match you with the most suitable buddy.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name"
                      {...field}
                      className="border-gray-300 focus:border-[#e27396] focus:ring-[#e27396]"
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
                  <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@example.com"
                      {...field}
                      className="border-gray-300 focus:border-[#e27396] focus:ring-[#e27396]"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          {/* Phone Number Field (Optional) */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your phone number"
                    {...field}
                    className="border-gray-300 focus:border-[#e27396] focus:ring-[#e27396]"
                  />
                </FormControl>
                <FormDescription className="text-gray-500 text-sm">
                  Only provide if you prefer a phone call
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <FormField
              control={form.control}
              name="preferredDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-gray-700 font-medium">Preferred Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal border-gray-300 hover:bg-gray-50 ${
                            !field.value && "text-gray-500"
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white rounded-lg shadow-lg" align="start">
                      <Calendar
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
                  <FormLabel className="text-gray-700 font-medium">Preferred Time Slot</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-[#e27396] focus:ring-[#e27396]">
                        <SelectValue placeholder="Select a time slot" />
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

          {/* Communication Mode Field */}
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Preferred Communication Mode</FormLabel>
                <FormControl>
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="CHAT"
                        checked={field.value === "CHAT"}
                        onChange={() => field.onChange("CHAT")}
                        className="h-4 w-4 text-[#e27396] focus:ring-[#e27396]"
                      />
                      <span className="text-gray-800">💬 Chat Session</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="CALL"
                        checked={field.value === "CALL"}
                        onChange={() => field.onChange("CALL")}
                        className="h-4 w-4 text-[#e27396] focus:ring-[#e27396]"
                      />
                      <span className="text-gray-800">📞 Call</span>
                    </label>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Session Duration Field */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Session Duration</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className={`flex justify-between items-center p-3 rounded-md cursor-pointer border ${field.value === "30" ? "border-[#e27396] bg-[#e27396]/5" : "border-gray-200 hover:border-[#e27396]/50"}`}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          value="30"
                          checked={field.value === "30"}
                          onChange={() => field.onChange("30")}
                          className="h-4 w-4 text-[#e27396] focus:ring-[#e27396]"
                        />
                        <span className="ml-2 text-gray-800">30 Minutes</span>
                      </div>
                      <span className="text-[#e27396] font-medium">
                        {form.getValues("mode") === "CHAT" ? "₹299" : "₹399"}
                      </span>
                    </label>
                    <label className={`flex justify-between items-center p-3 rounded-md cursor-pointer border ${field.value === "60" ? "border-[#e27396] bg-[#e27396]/5" : "border-gray-200 hover:border-[#e27396]/50"}`}>
                      <div className="flex items-center">
                      <input
                        type="radio"
                          value="60"
                          checked={field.value === "60"}
                          onChange={() => field.onChange("60")}
                          className="h-4 w-4 text-[#e27396] focus:ring-[#e27396]"
                        />
                        <span className="ml-2 text-gray-800">60 Minutes</span>
                      </div>
                      <span className="text-[#e27396] font-medium">
                        {form.getValues("mode") === "CHAT" ? "₹499" : "₹599"}
                      </span>
                    </label>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Situation Description Field */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">What brings you here today? (Brief description of your situation)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please describe your situation..."
                    className="min-h-[120px] border-gray-300 focus:border-[#e27396] focus:ring-[#e27396]"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Additional Information Field */}
          <FormField
            control={form.control}
            name="extraInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Have you tried any solutions so far?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us what you've already tried..."
                    className="min-h-[120px] border-gray-300 focus:border-[#e27396] focus:ring-[#e27396]"
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-[#e27396] data-[state=checked]:border-[#e27396]"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-gray-700">
                    I acknowledge that this is a listening service, not professional counseling or therapy.
                  </FormLabel>
                  <FormMessage className="text-red-500" />
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-[#e27396] hover:bg-[#d45c82] text-white py-2.5 text-md font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 