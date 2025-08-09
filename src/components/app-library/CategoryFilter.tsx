import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  count: number;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onCategorySelect(null)}
        className="h-8"
      >
        All Apps
        <Badge variant="secondary" className="ml-2 text-xs">
          {categories.reduce((sum, cat) => sum + cat.count, 0)}
        </Badge>
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.name ? "default" : "outline"}
          size="sm"
          onClick={() => onCategorySelect(category.name)}
          className="h-8"
        >
          <span className="mr-2">{category.icon}</span>
          {category.name}
          <Badge variant="secondary" className="ml-2 text-xs">
            {category.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
};