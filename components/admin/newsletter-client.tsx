"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Loader2, Mail, ScrollText, Send, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {modules,formats} from "@/components/admin/blogs/quill-config"
import "react-quill/dist/quill.snow.css";

const QuillEditor = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-50 animate-pulse rounded-lg">
      <div className="h-full flex items-center justify-center text-gray-400">
        Loading editor...
      </div>
    </div>
  ),
});

interface Subscriber {
  id: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewsletterPageProps {
  initialSubscribers: Subscriber[];
}

export default function NewsletterPage({ initialSubscribers }: NewsletterPageProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [showComposer, setShowComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSelectAll = () => {
    if (selectedEmails.size === subscribers.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(subscribers.map(s => s.email)));
    }
  };

  const handleSelectEmail = (email: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedEmails(newSelected);
  };

  const handleSendNewsletter = async () => {
    if (selectedEmails.size === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    if (!emailSubject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!emailContent.trim()) {
      toast.error("Please enter content for the email");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: Array.from(selectedEmails),
          subject: emailSubject,
          content: emailContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to send newsletter");

      toast.success("Newsletter sent successfully!");
      setShowComposer(false);
      setEmailSubject("");
      setEmailContent("");
      setSelectedEmails(new Set());
    } catch (error) {
      toast.error("Failed to send newsletter");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500">
            Manage your newsletter subscribers
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => setShowComposer(true)}
            disabled={selectedEmails.size === 0}
            className="bg-[#B33771] hover:bg-[#92295c]"
          >
            <Mail className="w-4 h-4 mr-2" />
            Compose ({selectedEmails.size})
          </Button>
          <Button asChild variant="outline">
            <a href="/api/newsletter/export" download>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </a>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedEmails.size === subscribers.length}
                  onClick={handleSelectAll}
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedEmails.has(subscriber.email)}
                    onClick={() => handleSelectEmail(subscriber.email)}
                  />
                </TableCell>
                <TableCell>{subscriber.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={subscriber.isVerified ? "success" : "default"}
                  >
                    {subscriber.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(subscriber.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(subscriber.updatedAt), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {subscribers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No subscribers found</p>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        Total Subscribers: {subscribers.length}
      </div>

{/* Inside your NewsletterClient component, replace the Dialog section */}

<Dialog open={showComposer} onOpenChange={setShowComposer}>
  <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-gradient-to-b from-white to-pink-50/30">
    <DialogHeader className="border-b pb-4">
      <DialogTitle className="text-2xl font-bold text-[#B33771]">Compose Newsletter</DialogTitle>
      <p className="text-sm text-gray-600">Create and send beautiful newsletters to your subscribers</p>
    </DialogHeader>

    <div className="flex-1 overflow-y-auto space-y-6 py-6">
      {/* Recipients Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm font-medium text-[#B33771]">
            <Mail className="w-4 h-4" />
            Recipients ({selectedEmails.size})
          </label>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedEmails(new Set())}
            className="text-xs hover:bg-pink-50 text-[#B33771]"
          >
            Clear All
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-white border-2 border-pink-100 min-h-[60px] max-h-[120px] overflow-y-auto shadow-sm">
          {Array.from(selectedEmails).map((email) => (
            <div
              key={email}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-pink-50 to-pink-100/50 px-3 py-1.5 rounded-full text-sm border border-pink-200"
            >
              <span className="text-gray-700">{email}</span>
              <button
                onClick={() => handleSelectEmail(email)}
                className="text-[#B33771] hover:text-[#92295c] ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Line */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-[#B33771]">
          <FileText className="w-4 h-4" />
          Subject Line
        </label>
        <div className="relative">
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white border-2 border-pink-100 focus:outline-none focus:ring-2 focus:ring-[#B33771] pr-20 shadow-sm"
            placeholder="Enter an engaging subject..."
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-full bg-pink-50 text-[#B33771]">
            {emailSubject.length} chars
          </span>
        </div>
      </div>

      {/* Email Content */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm font-medium text-[#B33771]">
            <ScrollText className="w-4 h-4" />
            Email Content
          </label>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              size="sm" 
              onClick={() => setEmailContent("")}
              className="text-xs hover:bg-pink-50 text-[#B33771]"
            >
              Clear
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className="text-xs hover:bg-pink-50 text-[#B33771]"
            >
              Preview
            </Button>
          </div>
        </div>
        <div className="border-2 border-pink-100 rounded-lg overflow-hidden shadow-sm bg-white">
          <QuillEditor
            theme="snow"
            value={emailContent}
            onChange={setEmailContent}
            className="h-[400px] bg-white"
          />
        </div>
      </div>
    </div>

    {/* Footer Actions */}
    <div className="flex items-center justify-between pt-6 border-t border-pink-100 mt-6">
      <div className="flex items-center gap-2 text-sm text-[#B33771]">
        <Users className="w-4 h-4" />
        Sending to {selectedEmails.size} verified subscriber{selectedEmails.size !== 1 ? 's' : ''}
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setShowComposer(false)}
          disabled={isSending}
          className="border-pink-200 text-gray-600 hover:bg-pink-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSendNewsletter}
          disabled={isSending || !emailSubject.trim() || !emailContent.trim()}
          className="bg-[#B33771] hover:bg-[#92295c] min-w-[120px] shadow-sm"
        >
          {isSending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}