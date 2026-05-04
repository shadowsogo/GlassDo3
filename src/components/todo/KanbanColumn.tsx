import { Droppable } from '@hello-pangea/dnd';
import { Task, Category, ColumnId } from '@/types/todo';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  columnId: ColumnId;
  title: string;
  tasks: Task[];
  categories: Category[];
  onDeleteTask: (id: string) => void;
}

const columnAccent: Record<ColumnId, string> = {
  'todo': 'from-secondary/20',
  'in-progress': 'from-primary/20',
  'done': 'from-accent/20',
};

export function KanbanColumn({ columnId, title, tasks, categories, onDeleteTask }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] flex-1">
      <div className={cn("flex items-center gap-2 mb-4 px-1")}>
        <div className={cn("w-2 h-2 rounded-full bg-gradient-to-r", columnAccent[columnId], "to-transparent")} />
        <h3 className="font-display font-semibold text-sm text-foreground/80 uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground ml-auto glass rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 rounded-2xl p-3 min-h-[200px] transition-colors duration-200",
              snapshot.isDraggingOver ? "glass-strong" : "glass"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                categories={categories}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground/50">
                Drop tasks here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
