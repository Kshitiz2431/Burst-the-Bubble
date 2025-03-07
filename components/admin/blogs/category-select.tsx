"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface CategorySelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function CategorySelect({ value = [], onChange }: CategorySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showNewCategoryDialog, setShowNewCategoryDialog] =
    React.useState(false);
  const [selectedCategories, setSelectedCategories] = React.useState<
    Category[]
  >([]);

  // Fetch existing categories
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data);

        // Update selected categories
        const selected = data.filter((cat: Category) => value.includes(cat.id));
        setSelectedCategories(selected);
      } catch (error) {
        toast.error("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [value]);

  const handleCreateCategory = async () => {
    if (!searchTerm.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: searchTerm.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create category");
      }

      const newCategory = await response.json();
      setCategories((prev) => [...prev, newCategory]);
      onChange([...value, newCategory.id]);
      setSelectedCategories((prev) => [...prev, newCategory]);
      setSearchTerm("");
      setShowNewCategoryDialog(false);
      toast.success("Category created successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const existingCategory = categories.find(
    (cat) => cat.name.toLowerCase() === searchTerm.toLowerCase()
  );

  return (
    <div className="relative space-y-2">
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[2rem]">
          {selectedCategories.map((category) => (
            <Badge
              key={category.id}
              variant="secondary"
              className="bg-pink-50 hover:bg-pink-100 text-[#B33771] px-2 py-0.5 h-6 flex items-center gap-1 transition-colors"
            >
              {category.name}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(value.filter((id) => id !== category.id));
                }}
                className="rounded-full hover:bg-pink-200/50 inline-flex items-center justify-center w-4 h-4 transition-colors"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !selectedCategories.length && "text-muted-foreground"
            )}
          >
            <span className="truncate">
              {selectedCategories.length > 0
                ? `${selectedCategories.length} categor${
                    selectedCategories.length === 1 ? "y" : "ies"
                  } selected`
                : "Select categories..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search categories..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty className="py-6 text-center text-sm">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <button
                  className="mx-auto flex items-center gap-2 text-[#B33771]"
                  onClick={() => setShowNewCategoryDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create "{searchTerm}"
                </button>
              )}
            </CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-64">
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => {
                      const newValue = value.includes(category.id)
                        ? value.filter((id) => id !== category.id)
                        : [...value, category.id];
                      onChange(newValue);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(category.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog
        open={showNewCategoryDialog}
        onOpenChange={setShowNewCategoryDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to your collection. This will be available for
              all content types.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h4 className="text-sm font-medium mb-2">Category Name</h4>
            <p className="text-sm text-muted-foreground mb-4">"{searchTerm}"</p>
            {existingCategory && (
              <p className="text-sm text-red-500">
                This category already exists. Please select it from the list
                instead.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={isLoading || !searchTerm.trim() || !!existingCategory}
              className="bg-[#B33771] hover:bg-[#B33771]/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
