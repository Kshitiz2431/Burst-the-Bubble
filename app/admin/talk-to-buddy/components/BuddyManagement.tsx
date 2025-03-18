"use client";

import { useState, useEffect } from "react";
import { Buddy } from "@prisma/client";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, Trash2, Plus, UserPlus, RefreshCw } from "lucide-react";

// Type for Buddy with request count
interface BuddyWithCount extends Buddy {
  _count: {
    buddyRequests: number;
  };
}

// Form schema for creating/updating buddies
const buddyFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  calendlyLink: z.string().min(1, "Calendly link is required"),
  isActive: z.boolean().default(true),
});

type BuddyFormValues = z.infer<typeof buddyFormSchema>;

interface BuddyManagementProps {
  setError: (error: string | null) => void;
}

export function BuddyManagement({ setError }: BuddyManagementProps) {
  const [buddies, setBuddies] = useState<BuddyWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBuddy, setCurrentBuddy] = useState<BuddyWithCount | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  // Initialize form for adding buddies
  const addForm = useForm<BuddyFormValues>({
    resolver: zodResolver(buddyFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      calendlyLink: "",
      isActive: true,
    },
  });

  // Initialize form for editing buddies
  const editForm = useForm<BuddyFormValues>({
    resolver: zodResolver(buddyFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      calendlyLink: "",
      isActive: true,
    },
  });

  // Fetch buddies
  const fetchBuddies = async () => {
    setLoading(true);
    try {
      const url = activeFilter !== null 
        ? `/api/admin/buddies?isActive=${activeFilter}` 
        : '/api/admin/buddies';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch buddies");
      }
      
      const data = await response.json();
      setBuddies(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching buddies:", error);
      setError("Failed to load buddies. Please try again.");
      toast.error("Failed to load buddies");
    } finally {
      setLoading(false);
    }
  };

  // Fetch buddies on mount and when activeFilter changes
  useEffect(() => {
    fetchBuddies();
  }, [activeFilter]);

  // Handle add buddy form submission
  const handleAddBuddy = async (data: BuddyFormValues) => {
    try {
      const response = await fetch("/api/admin/buddies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to create buddy");
      }
      
      toast.success("Buddy created successfully");
      setIsAddDialogOpen(false);
      addForm.reset();
      fetchBuddies();
    } catch (error) {
      console.error("Error creating buddy:", error);
      toast.error("Failed to create buddy");
    }
  };

  // Handle edit buddy form submission
  const handleEditBuddy = async (data: BuddyFormValues) => {
    if (!currentBuddy) return;
    
    try {
      const response = await fetch(`/api/admin/buddies/${currentBuddy.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to update buddy");
      }
      
      toast.success("Buddy updated successfully");
      setIsEditDialogOpen(false);
      setCurrentBuddy(null);
      fetchBuddies();
    } catch (error) {
      console.error("Error updating buddy:", error);
      toast.error("Failed to update buddy");
    }
  };

  // Handle delete buddy
  const handleDeleteBuddy = async () => {
    if (!currentBuddy) return;
    
    try {
      const response = await fetch(`/api/admin/buddies/${currentBuddy.id}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle special case where buddy has active requests
        if (response.status === 400 && result.activeRequests) {
          toast.error(`Cannot delete buddy with ${result.activeRequests} active requests. Set inactive instead.`);
          setIsDeleteDialogOpen(false);
          setCurrentBuddy(null);
          return;
        }
        
        throw new Error(result.message || "Failed to delete buddy");
      }
      
      toast.success("Buddy deleted successfully");
      setIsDeleteDialogOpen(false);
      setCurrentBuddy(null);
      fetchBuddies();
    } catch (error) {
      console.error("Error deleting buddy:", error);
      toast.error("Failed to delete buddy");
    }
  };

  // Open edit dialog with buddy data
  const openEditDialog = (buddy: BuddyWithCount) => {
    setCurrentBuddy(buddy);
    editForm.reset({
      name: buddy.name,
      email: buddy.email,
      phone: buddy.phone || "",
      calendlyLink: buddy.calendlyLink,
      isActive: buddy.isActive,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (buddy: BuddyWithCount) => {
    setCurrentBuddy(buddy);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Buddy Management</h2>
          <p className="text-gray-500">
            Manage buddies who provide support to users
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="active-filter" className="text-gray-700">Show:</Label>
            <select
              id="active-filter"
              className="border border-gray-300 rounded p-2 text-gray-700 text-sm focus:ring-[#B33771] focus:border-[#B33771]"
              value={activeFilter === null ? "all" : activeFilter ? "active" : "inactive"}
              onChange={(e) => {
                const value = e.target.value;
                setActiveFilter(
                  value === "all" ? null : value === "active" ? true : false
                );
              }}
            >
              <option value="all">All Buddies</option>
              <option value="active">Active Buddies</option>
              <option value="inactive">Inactive Buddies</option>
            </select>
          </div>
          
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#B33771] hover:bg-[#9C296A] text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Buddy
          </Button>
          
          <Button variant="outline" onClick={fetchBuddies} className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p>Loading buddies...</p>
        </div>
      ) : buddies.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <p className="text-muted-foreground">No buddies found</p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Buddy
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buddies.map((buddy) => (
                  <TableRow key={buddy.id}>
                    <TableCell className="font-medium">{buddy.name}</TableCell>
                    <TableCell>{buddy.email}</TableCell>
                    <TableCell>{buddy.phone || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={buddy.isActive ? "default" : "secondary"}>
                        {buddy.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{buddy._count.buddyRequests}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(buddy)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(buddy)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Add Buddy Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#B33771]">Add New Buddy</DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new buddy who will provide support to users
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddBuddy)} className="space-y-6">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter buddy's name" {...field} className="border-gray-300 focus:border-[#B33771] focus:ring-[#B33771]" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="buddy@example.com" {...field} className="border-gray-300 focus:border-[#B33771] focus:ring-[#B33771]" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} className="border-gray-300 focus:border-[#B33771] focus:ring-[#B33771]" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="calendlyLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Calendly Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://calendly.com/username" {...field} className="border-gray-300 focus:border-[#B33771] focus:ring-[#B33771]" />
                    </FormControl>
                    <FormDescription className="text-gray-500 text-sm">
                      The Calendly link for this buddy's scheduling
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-gray-200 bg-gray-50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-gray-700">Active Status</FormLabel>
                      <FormDescription className="text-gray-500 text-sm">
                        Whether this buddy can accept new requests
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#B33771]"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#B33771] hover:bg-[#9C296A] text-white">Add Buddy</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Buddy Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#B33771]">Edit Buddy</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update buddy information
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditBuddy)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter buddy's name" {...field} className="border-gray-300 focus:border-[#B33771] focus:ring-[#B33771]" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="buddy@example.com" {...field} className="border-gray-300 focus:border-[#B33771] focus:ring-[#B33771]" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} className="border-gray-300 focus:border-[#B33771] focus:ring-[#B33771]" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="calendlyLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Calendly Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://calendly.com/username" {...field} className="border-gray-300 focus:border-[#B33771] focus:ring-[#B33771]" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-gray-200 bg-gray-50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-gray-700">Active Status</FormLabel>
                      <FormDescription className="text-gray-500 text-sm">
                        Whether this buddy can accept new requests
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#B33771]"
                      />
                    </FormControl>
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
                <Button type="submit" className="bg-[#B33771] hover:bg-[#9C296A] text-white">Update Buddy</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Buddy Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#B33771]">Delete Buddy</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this buddy?
              {currentBuddy?._count.buddyRequests ? (
                <p className="mt-2 text-red-500 font-medium">
                  Warning: This buddy has {currentBuddy._count.buddyRequests} assigned requests.
                  Consider setting them to inactive instead.
                </p>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteBuddy}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 