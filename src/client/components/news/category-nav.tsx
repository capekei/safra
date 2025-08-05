import { GlassCard } from "@/components/ui/glass-card";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { Home } from "lucide-react";

interface CategoryNavProps {
  activeCategory?: string;
  onCategoryChange: (categorySlug?: string) => void;
}

export function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <div className="mb-8">
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
        <GlassCard 
          
          active={!activeCategory}
          className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap"
          onClick={() => onCategoryChange()}
        >
          <div className="flex items-center space-x-1">
            <Home className="h-4 w-4" />
            <span>Todas</span>
          </div>
        </GlassCard>
        
        {NEWS_CATEGORIES.map((category) => (
          <GlassCard
            key={category.slug}
            variant="pill"
            active={activeCategory === category.slug}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap"
            onClick={() => onCategoryChange(category.slug)}
          >
            <div className="flex items-center space-x-1">
              <i className={`fas ${category.icon}`}></i>
              <span>{category.name}</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
