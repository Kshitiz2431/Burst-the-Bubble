"use client";

import { useState, useEffect } from "react";
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

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Log data for debugging
      console.log("Submitting detailed form data:", data);
      
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
      
      if (!response.ok) {
        if (result.message === "All buddies are busy at this time") {
          toast.error("All buddies are busy at this time. Please select a different time slot.");
        } else {
          throw new Error(result.message || "Failed to submit request");
        }
      } else {
        toast.success(`Your request has been submitted! ${result.buddyName} will be your buddy for this session.`);
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">Detailed Form</h2>
        <p className="text-muted-foreground">
          Please provide more context to help us better understand your needs.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number Field (Optional) */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Your phone number" {...field} />
                </FormControl>
                <FormDescription>
                  Only provided if you'd prefer a phone call
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Selection */}
          <FormField
            control={form.control}
            name="preferredDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Preferred Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value && "text-muted-foreground"
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
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time Slot Selection */}
          <FormField
            control={form.control}
            name="timeSlot"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Time Slot</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Communication Mode Field */}
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Preferred Mode of Communication</FormLabel>
                <FormControl>
                  <div className="flex space-x-4 items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="CHAT"
                        checked={field.value === "CHAT"}
                        onChange={() => field.onChange("CHAT")}
                        className="h-4 w-4"
                      />
                      <span>💬 Chat</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="CALL"
                        checked={field.value === "CALL"}
                        onChange={() => field.onChange("CALL")}
                        className="h-4 w-4"
                      />
                      <span>📞 Call</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="VIDEO"
                        checked={field.value === "VIDEO"}
                        onChange={() => field.onChange("VIDEO")}
                        className="h-4 w-4"
                      />
                      <span>🎥 Video Call</span>
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Situation Description Field */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What brings you here today? (Brief description of your situation)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please describe your situation..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Additional Information Field */}
          <FormField
            control={form.control}
            name="extraInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Have you tried any solutions so far?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us what you've already tried..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Acknowledgment Checkbox */}
          <FormField
            control={form.control}
            name="acknowledged"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I acknowledge that this is a listening service, not professional counseling or therapy.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </Form>
    </div>
  );
} 