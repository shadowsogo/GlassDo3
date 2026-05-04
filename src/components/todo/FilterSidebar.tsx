import { Category, Priority, PRIORITY_LABELS } from '@/types/todo';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Filter, X } from 'lucide-react';

interface Filters {
  category: string | null;
  priority: Priority | null;
}

interface FilterSidebarProps {
  categories: Category[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const priorityColors: Record<Priority, string> = {
  high: 'bg-priority-high/20 text-priority-high border-priority-high/30',
  medium: 'bg-priority-medium/20 text-priority-medium border-priority-medium/30',
  low: 'bg-priority-low/20 text-priority-low border-priority-low/30',
  none: 'bg-priority-none/20 text-priority-none border-priority-none/30',
};

export function FilterSidebar({ categories, filters, onFilterChange }: FilterSidebarProps) {
  const hasFilters = filters.category || filters.priority;

  return (
    <div className="glass rounded-2xl p-5 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground/80 text-sm uppercase tracking-wider">Filters</h3>
        </div>
        {hasFilters && (
          <button
            onClick={() => onFilterChange({ category: null, priority: null })}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(c => (
            <Badge
              key={c.id}
              variant="outline"
              className={cn(
                "cursor-pointer text-xs transition-all",
                filters.category === c.id
                  ? cn(c.color + '/30', "border-white/30 text-foreground")
                  : "border-muted/30 text-muted-foreground hover:border-white/20"
              )}
              onClick={() => onFilterChange({
                ...filters,
                category: filters.category === c.id ? null : c.id,
              })}
            >
              {c.name}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Priority</p>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(PRIORITY_LABELS) as Priority[]).map(p => (
            <Badge
              key={p}
              variant="outline"
              className={cn(
                "cursor-pointer text-xs transition-all",
                filters.priority === p
                  ? priorityColors[p]
                  : "border-muted/30 text-muted-foreground hover:border-white/20"
              )}
              onClick={() => onFilterChange({
                ...filters,
                priority: filters.priority === p ? null : p,
              })}
            >
              {PRIORITY_LABELS[p]}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
