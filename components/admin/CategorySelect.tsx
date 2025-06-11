"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategorySelectProps {
  selectedCategories: Category[];
  onCategoryChange: (categories: Category[]) => void;
}

export function CategorySelect({
  selectedCategories,
  onCategoryChange,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");

  // Fetch categories on component mount
  const fetchCategories = async () => {
    const response = await fetch("/api/categories");
    if (response.ok) {
      const data = await response.json();
      setCategories(data);
    }
  };

  console.log(fetchCategories);

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory.trim() }),
    });

    if (response.ok) {
      const category = await response.json();
      setCategories([...categories, category]);
      onCategoryChange([...selectedCategories, category]);
      setNewCategory("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selectedCategories.length > 0
            ? `${selectedCategories.length} categories selected`
            : "Select categories..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandEmpty>
            <div className="flex items-center gap-2 p-2">
              <span>Create &quot;{newCategory}&quot;</span>
              <Button
                size="sm"
                onClick={handleCreateCategory}
                className="h-8 px-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CommandEmpty>
          <CommandGroup>
            {categories.map((category) => (
              <CommandItem
                key={category.id}
                onSelect={() => {
                  const isSelected = selectedCategories.some(
                    (c) => c.id === category.id
                  );
                  if (isSelected) {
                    onCategoryChange(
                      selectedCategories.filter((c) => c.id !== category.id)
                    );
                  } else {
                    onCategoryChange([...selectedCategories, category]);
                  }
                }}
              >
                <span>{category.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
