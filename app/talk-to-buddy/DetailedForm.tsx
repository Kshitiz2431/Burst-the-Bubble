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
import { Label } from "@/components/ui/label";
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
  mode: z.enum(["CHAT", "CALL", "VIDEO"], {
    required_error: "Please select a communication mode",
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
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [buddyName, setBuddyName] = useState("");
  const [buddyCalendlyUrl, setBuddyCalendlyUrl] = useState("");
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
      timeSlot: "",
    },
  });

  // Load Calendly widget script
  useEffect(() => {
    if (formSubmitted && buddyCalendlyUrl) {
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
  }, [formSubmitted, buddyCalendlyUrl, form]);

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
        
        console.log("Setting buddy info:", {
          name: result.buddyName,
          calendlyUrl: calendlyUrl
        });
        
        setBuddyName(result.buddyName);
        setBuddyCalendlyUrl(calendlyUrl);
        setFormSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show the Calendly scheduling widget if the form has been submitted
  if (formSubmitted) {
    console.log("Form submitted, buddy URL:", buddyCalendlyUrl);
    
    return (
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
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
                    <PopoverContent className="w-auto p-0" align="start">
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
              <FormItem className="space-y-3">
                <FormLabel className="text-gray-700 font-medium">Preferred Mode of Communication</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap space-x-6 items-center">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="CHAT"
                        checked={field.value === "CHAT"}
                        onChange={() => field.onChange("CHAT")}
                        className="h-4 w-4 text-[#e27396] focus:ring-[#e27396]"
                      />
                      <span className="text-gray-800">💬 Chat</span>
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
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="VIDEO"
                        checked={field.value === "VIDEO"}
                        onChange={() => field.onChange("VIDEO")}
                        className="h-4 w-4 text-[#e27396] focus:ring-[#e27396]"
                      />
                      <span className="text-gray-800">🎥 Video Call</span>
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