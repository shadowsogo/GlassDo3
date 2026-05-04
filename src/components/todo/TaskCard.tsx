import { Draggable } from '@hello-pangea/dnd';
import { Task, Category, PRIORITY_LABELS } from '@/types/todo';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2 } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  index: number;
  categories: Category[];
  onDelete: (id: string) => void;
}

const priorityDotColor: Record<string, string> = {
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
  none: 'bg-priority-none',
};

export function TaskCard({ task, index, categories, onDelete }: TaskCardProps) {
  const cat = categories.find(c => c.id === task.category);
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.column !== 'done';

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "glass rounded-xl p-4 mb-3 cursor-grab active:cursor-grabbing transition-all duration-200 group",
            snapshot.isDragging && "scale-105 shadow-2xl ring-2 ring-primary/40",
            "hover:bg-white/[0.12] animate-scale-in"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("w-2 h-2 rounded-full shrink-0", priorityDotColor[task.priority])} />
                <h4 className={cn(
                  "font-medium text-sm truncate text-foreground",
                  task.column === 'done' && "line-through opacity-60"
                )}>
                  {task.title}
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {cat && (
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-none text-white/90", cat.color + '/30')}>
                    {cat.name}
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground border-muted/40">
                  {PRIORITY_LABELS[task.priority]}
                </Badge>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1 mt-2.5 text-[11px]",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}>
              <Calendar size={11} />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
              {isOverdue && <span className="font-medium">• Overdue</span>}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
