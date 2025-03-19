"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

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
  name: string | null;
  isPremium: boolean;
  planType: string | null;
  planStart: string | null;
  planEnd: string | null;
}

interface NewsletterPageProps {
  initialSubscribers: Subscriber[];
  stats: {
    total: number;
    premium: number;
    free: number;
  };
}

export default function NewsletterPage({ initialSubscribers, stats }: NewsletterPageProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [showComposer, setShowComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'premium' | 'free'>('all');
  
  // Filter subscribers based on the active filter
  const filteredSubscribers = useMemo(() => {
    if (activeFilter === 'all') return subscribers;
    if (activeFilter === 'premium') return subscribers.filter(sub => sub.isPremium);
    if (activeFilter === 'free') return subscribers.filter(sub => !sub.isPremium);
    return subscribers;
  }, [subscribers, activeFilter]);

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

  const handleDeleteSubscriber = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscriber?")) {
      try {
        const response = await fetch(`/api/newsletter/subscriber/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete subscriber");
        }

        setSubscribers(subscribers.filter(sub => sub.id !== id));
        toast.success("Subscriber deleted successfully");
      } catch (error) {
        toast.error("Failed to delete subscriber");
        console.error(error);
      }
    }
  };

  const handleResendVerification = async (email: string) => {
    try {
      const response = await fetch("/api/newsletter/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend verification");
      }

      toast.success("Verification email resent successfully");
    } catch (error) {
      toast.error("Failed to resend verification email");
      console.error(error);
    }
  };

  const columns: ColumnDef<Subscriber>[] = [
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "isPremium",
      header: "Premium",
      cell: ({ row }) => {
        const isPremium = row.getValue("isPremium");
        const planType = row.original.planType;

        if (isPremium) {
          return (
            <div className="flex items-center">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {planType === "monthly" ? "Monthly" : "Yearly"}
              </span>
            </div>
          );
        }
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Free
          </span>
        );
      },
    },
    {
      accessorKey: "isVerified",
      header: "Status",
      cell: ({ row }) => {
        const isVerified = row.getValue("isVerified");
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              isVerified
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isVerified ? "Verified" : "Pending"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Subscribed On",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return <span>{new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const subscriber = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleDeleteSubscriber(subscriber.id)}>
                Delete
              </DropdownMenuItem>
              {!subscriber.isVerified && (
                <DropdownMenuItem
                  onClick={() => handleResendVerification(subscriber.email)}
                >
                  Resend Verification
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <a href="/api/newsletter/export" download>
                  All Subscribers ({stats.total})
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/api/newsletter/export?type=premium" download>
                  Premium Only ({stats.premium})
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/api/newsletter/export?type=free" download>
                  Free Only ({stats.free})
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Subscriber stats and filter tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex flex-wrap gap-4">
          <div className="bg-gray-50 rounded-lg px-4 py-2">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg px-4 py-2">
            <p className="text-xs text-gray-500">Premium</p>
            <p className="text-xl font-bold text-green-700">{stats.premium}</p>
          </div>
          <div className="bg-blue-50 rounded-lg px-4 py-2">
            <p className="text-xs text-gray-500">Free</p>
            <p className="text-xl font-bold text-blue-700">{stats.free}</p>
          </div>
        </div>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button 
            variant={activeFilter === 'all' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveFilter('all')}
            className={activeFilter === 'all' ? 'bg-[#B33771] hover:bg-[#92295c]' : ''}
          >
            All
          </Button>
          <Button 
            variant={activeFilter === 'premium' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveFilter('premium')}
            className={activeFilter === 'premium' ? 'bg-[#B33771] hover:bg-[#92295c]' : ''}
          >
            Premium
          </Button>
          <Button 
            variant={activeFilter === 'free' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveFilter('free')}
            className={activeFilter === 'free' ? 'bg-[#B33771] hover:bg-[#92295c]' : ''}
          >
            Free
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedEmails.size === filteredSubscribers.length}
                  onClick={handleSelectAll}
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedEmails.has(subscriber.email)}
                    onClick={() => handleSelectEmail(subscriber.email)}
                  />
                </TableCell>
                <TableCell>{subscriber.email}</TableCell>
                <TableCell>{subscriber.name || '-'}</TableCell>
                <TableCell>
                  {subscriber.isPremium ? (
                    <div className="flex flex-col">
                      <Badge variant="success" className="mb-1">
                        {subscriber.planType === "monthly" ? "Monthly" : "Yearly"}
                      </Badge>
                      {subscriber.planEnd && (
                        <span className="text-xs text-gray-500">
                          Expires: {new Date(subscriber.planEnd).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline">Free</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={subscriber.isVerified ? "success" : "default"}
                  >
                    {subscriber.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(subscriber.createdAt), { 
                    addSuffix: true,
                    locale: enUS 
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleDeleteSubscriber(subscriber.id)}>
                        Delete
                      </DropdownMenuItem>
                      {!subscriber.isVerified && (
                        <DropdownMenuItem
                          onClick={() => handleResendVerification(subscriber.email)}
                        >
                          Resend Verification
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredSubscribers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No subscribers found</p>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        {activeFilter === 'all' 
          ? `Showing all subscribers: ${filteredSubscribers.length}`
          : activeFilter === 'premium'
            ? `Showing premium subscribers: ${filteredSubscribers.length}`
            : `Showing free subscribers: ${filteredSubscribers.length}`
        }
      </div>

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