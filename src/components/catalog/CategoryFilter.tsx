
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type Category = {
  id: number;
  name: string;
  count: number;
};

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  isLoading?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Категории</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="h-4 w-4 rounded bg-gray-200"></div>
              <div className="h-4 rounded bg-gray-200 w-32"></div>
              <div className="h-4 w-6 rounded bg-gray-200 ml-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Категории</h3>
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category.id}`}
              checked={selectedCategories.includes(category.name)}
              onCheckedChange={() => onCategoryChange(category.name)}
            />
            <Label
              htmlFor={`category-${category.id}`}
              className="flex justify-between w-full cursor-pointer text-sm"
            >
              <span>{category.name}</span>
              <span className="text-gray-500">({category.count})</span>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
