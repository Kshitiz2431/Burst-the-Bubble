"use client";

import { useState, useEffect } from "react";
import { BuddyRequest, BuddyRequestStatus, BuddyRequestType, Buddy } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Eye, XCircle, CheckCircle, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Type for buddy request with buddy
interface BuddyRequestWithBuddy extends BuddyRequest {
  assignedBuddy: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  } | null;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Form schema for updating buddy requests
const buddyRequestUpdateSchema = z.object({
  status: z.enum(["PENDING", "ASSIGNED", "COMPLETED", "CANCELLED"]),
  assignedBuddyId: z.string().nullable(),
});

type BuddyRequestUpdateFormValues = z.infer<typeof buddyRequestUpdateSchema>;

interface BuddyRequestsTableProps {
  setError: (error: string | null) => void;
}

export function BuddyRequestsTable({ setError }: BuddyRequestsTableProps) {
  const [buddyRequests, setBuddyRequests] = useState<BuddyRequestWithBuddy[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BuddyRequestStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<BuddyRequestType | "ALL">("ALL");
  const [availableBuddies, setAvailableBuddies] = useState<Buddy[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<BuddyRequestWithBuddy | null>(null);

  // Initialize form for editing buddy requests
  const editForm = useForm<BuddyRequestUpdateFormValues>({
    resolver: zodResolver(buddyRequestUpdateSchema),
    defaultValues: {
      status: "PENDING",
      assignedBuddyId: null,
    },
  });

  // Fetch buddy requests
  const fetchBuddyRequests = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/api/admin/buddy-requests?page=${page}`;
      
      // Add status filter if not ALL
      if (statusFilter !== "ALL") {
        url += `&status=${statusFilter}`;
      }
      
      // Add type filter if not ALL
      if (typeFilter !== "ALL") {
        url += `&type=${typeFilter}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch buddy requests");
      }
      
      const data = await response.json();
      setBuddyRequests(data.data);
      setPagination(data.pagination);
      setError(null);
    } catch (error) {
      console.error("Error fetching buddy requests:", error);
      setError("Failed to load buddy requests. Please try again.");
      toast.error("Failed to load buddy requests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch active buddies for assignment
  const fetchAvailableBuddies = async () => {
    try {
      const response = await fetch("/api/admin/buddies?isActive=true");
      
      if (!response.ok) {
        throw new Error("Failed to fetch buddies");
      }
      
      const data = await response.json();
      setAvailableBuddies(data);
    } catch (error) {
      console.error("Error fetching buddies:", error);
      toast.error("Failed to load available buddies");
    }
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchBuddyRequests();
    fetchAvailableBuddies();
  }, [statusFilter, typeFilter]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchBuddyRequests(newPage);
    }
  };

  // Handle edit buddy request form submission
  const handleUpdateRequest = async (data: BuddyRequestUpdateFormValues) => {
    if (!currentRequest) return;
    
    try {
      const response = await fetch(`/api/admin/buddy-requests/${currentRequest.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to update buddy request");
      }
      
      toast.success("Buddy request updated successfully");
      setIsEditDialogOpen(false);
      setCurrentRequest(null);
      fetchBuddyRequests(pagination.currentPage);
    } catch (error) {
      console.error("Error updating buddy request:", error);
      toast.error("Failed to update buddy request");
    }
  };

  // Handle cancel buddy request
  const handleCancelRequest = async (request: BuddyRequestWithBuddy) => {
    try {
      const response = await fetch(`/api/admin/buddy-requests/${request.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "CANCELLED",
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to cancel buddy request");
      }
      
      toast.success("Buddy request cancelled successfully");
      fetchBuddyRequests(pagination.currentPage);
    } catch (error) {
      console.error("Error cancelling buddy request:", error);
      toast.error("Failed to cancel buddy request");
    }
  };

  // Handle complete buddy request
  const handleCompleteRequest = async (request: BuddyRequestWithBuddy) => {
    try {
      const response = await fetch(`/api/admin/buddy-requests/${request.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "COMPLETED",
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to complete buddy request");
      }
      
      toast.success("Buddy request marked as completed");
      fetchBuddyRequests(pagination.currentPage);
    } catch (error) {
      console.error("Error completing buddy request:", error);
      toast.error("Failed to complete buddy request");
    }
  };

  // Open edit dialog with request data
  const openEditDialog = (request: BuddyRequestWithBuddy) => {
    setCurrentRequest(request);
    editForm.reset({
      status: request.status,
      assignedBuddyId: request.assignedBuddyId,
    });
    setIsEditDialogOpen(true);
  };

  // Open view dialog with request details
  const openViewDialog = (request: BuddyRequestWithBuddy) => {
    setCurrentRequest(request);
    setIsViewDialogOpen(true);
  };

  // Get badge variant and text based on status
  const getStatusBadge = (status: BuddyRequestStatus) => {
    switch (status) {
      case "PENDING":
        return { variant: "secondary" as const, text: "Pending" };
      case "ASSIGNED":
        return { variant: "default" as const, text: "Assigned" };
      case "COMPLETED":
        return { variant: "success" as const, text: "Completed" };
      case "CANCELLED":
        return { variant: "destructive" as const, text: "Cancelled" };
    }
  };

  // Format date
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Buddy Requests</h2>
          <p className="text-gray-500">
            Manage buddy requests from users
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="status-filter" className="text-gray-700">Status:</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as BuddyRequestStatus | "ALL")}
            >
              <SelectTrigger className="w-[180px] border-gray-300 focus:border-[#B33771] focus:ring-[#B33771]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="type-filter" className="text-gray-700">Type:</Label>
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as BuddyRequestType | "ALL")}
            >
              <SelectTrigger className="w-[180px] border-gray-300 focus:border-[#B33771] focus:ring-[#B33771]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="FRIENDLY">Friendly</SelectItem>
                <SelectItem value="DETAILED">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={() => fetchBuddyRequests(pagination.currentPage)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p>Loading buddy requests...</p>
        </div>
      ) : buddyRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <p className="text-muted-foreground">No buddy requests found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buddyRequests.map((request) => {
                    const { variant, text } = getStatusBadge(request.status);
                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {request.type === "FRIENDLY" ? "Friendly" : "Detailed"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(request.preferredDate)}</TableCell>
                        <TableCell>{request.timeSlot}</TableCell>
                        <TableCell>
                          <Badge variant={variant}>{text}</Badge>
                        </TableCell>
                        <TableCell>
                          {request.assignedBuddy ? (
                            <span className="flex items-center">
                              {request.assignedBuddy.name}
                              {!request.assignedBuddy.isActive && (
                                <Badge variant="outline" className="ml-2">Inactive</Badge>
                              )}
                            </span>
                          ) : (
                            "Not assigned"
                          )}
                        </TableCell>
                        <TableCell className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status !== "COMPLETED" && request.status !== "CANCELLED" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(request)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelRequest(request)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCompleteRequest(request)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevPage}
                  className="mr-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#B33771]"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="mr-4 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#B33771]"
                >
                  Previous
                </Button>
                
                <span className="flex items-center px-4 font-medium text-gray-700">
                  Page <span className="text-[#B33771] font-semibold mx-1">{pagination.currentPage}</span> of <span className="text-gray-600 font-semibold ml-1">{pagination.totalPages}</span>
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="ml-4 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#B33771]"
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                  className="ml-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#B33771]"
                >
                  Last
                </Button>
              </nav>
            </div>
          )}
        </>
      )}
      
      {/* Edit Request Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#B33771]">Edit Buddy Request</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update the status and assignment of this buddy request
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateRequest)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-[#B33771] focus:ring-[#B33771]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="ASSIGNED">Assigned</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="assignedBuddyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Assigned Buddy</FormLabel>
                    <Select
                      value={field.value || "unassigned"}
                      onValueChange={(value) => field.onChange(value === "unassigned" ? null : value)}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-[#B33771] focus:ring-[#B33771]">
                          <SelectValue placeholder="Select a buddy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="unassigned">Not Assigned</SelectItem>
                        {availableBuddies.map((buddy) => (
                          <SelectItem key={buddy.id} value={buddy.id}>
                            {buddy.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-gray-500 text-sm">
                      Only active buddies are shown here
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#B33771] hover:bg-[#9C296A] text-white">Update Request</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#B33771]">Buddy Request Details</DialogTitle>
            <DialogDescription className="text-gray-600">
              View complete request information
            </DialogDescription>
          </DialogHeader>
          
          {currentRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">Request Type</h3>
                  <p className="text-gray-900">{currentRequest.type}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">Status</h3>
                  <Badge variant={getStatusBadge(currentRequest.status).variant}>
                    {getStatusBadge(currentRequest.status).text}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">Name</h3>
                  <p className="text-gray-900">{currentRequest.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">Email</h3>
                  <p className="text-gray-900">{currentRequest.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">Phone</h3>
                  <p className="text-gray-900">{currentRequest.phone || "Not provided"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">Communication Mode</h3>
                  <p className="text-gray-900">{currentRequest.mode}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">Preferred Date</h3>
                  <p className="text-gray-900">{formatDate(currentRequest.preferredDate)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">Time Slot</h3>
                  <p className="text-gray-900">{currentRequest.timeSlot}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="font-semibold text-sm text-gray-600">Assigned Buddy</h3>
                  <p className="text-gray-900">
                    {currentRequest.assignedBuddy
                      ? `${currentRequest.assignedBuddy.name} (${currentRequest.assignedBuddy.email})`
                      : "Not assigned"}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-sm mb-2 text-gray-600">Message</h3>
                <p className="text-sm whitespace-pre-wrap text-gray-900">{currentRequest.message}</p>
              </div>
              
              {currentRequest.extraInfo && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-sm mb-2 text-gray-600">Additional Information</h3>
                  <p className="text-sm whitespace-pre-wrap text-gray-900">{currentRequest.extraInfo}</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-500">
                <div>Created: {formatDate(currentRequest.createdAt)}</div>
                <div>Last Updated: {formatDate(currentRequest.updatedAt)}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
            {currentRequest && 
              currentRequest.status !== "COMPLETED" && 
              currentRequest.status !== "CANCELLED" && (
                <Button 
                  type="button"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openEditDialog(currentRequest);
                  }}
                  className="bg-[#B33771] hover:bg-[#9C296A] text-white"
                >
                  Edit Request
                </Button>
              )
            }
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 