import { useState, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTodos } from '@/hooks/useTodos';
import { COLUMNS, ColumnId, Priority } from '@/types/todo';
import { KanbanColumn } from '@/components/todo/KanbanColumn';
import { AddTaskDialog } from '@/components/todo/AddTaskDialog';
import { StatsBar } from '@/components/todo/StatsBar';
import { StatsPanel } from '@/components/todo/StatsPanel';
import { FilterSidebar } from '@/components/todo/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Sparkles, Users, LogOut } from 'lucide-react';

interface Filters {
  category: string | null;
  priority: Priority | null;
}

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { tasks, categories, addTask, deleteTask, moveTask, stats } = useTodos();
  const [filters, setFilters] = useState<Filters>({ category: null, priority: null });
  const navigate = useNavigate();

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filters.category && t.category !== filters.category) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      return true;
    });
  }, [tasks, filters]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    moveTask(draggableId, destination.droppableId as ColumnId, destination.index);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="text-primary animate-pulse" size={48} />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="relative z-10 min-h-screen p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="text-primary" size={28} />
            <h1 className="font-display text-3xl font-bold glow-text text-foreground">GlassDo</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/groups')} className="text-foreground gap-2 hover:bg-white/10">
              <Users size={18} /> Groups
            </Button>
            <AddTaskDialog categories={categories} onAdd={addTask} />
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut size={18} />
            </Button>
          </div>
        </header>

        <div className="mb-6">
          <StatsBar {...stats} />
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          <div className="flex-1 min-w-0">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {COLUMNS.map(col => (
                  <KanbanColumn
                    key={col.id}
                    columnId={col.id}
                    title={col.title}
                    tasks={filteredTasks.filter(t => t.column === col.id)}
                    categories={categories}
                    onDeleteTask={deleteTask}
                  />
                ))}
              </div>
            </DragDropContext>
          </div>

          <div className="w-full lg:w-72 space-y-4 shrink-0">
            <FilterSidebar categories={categories} filters={filters} onFilterChange={setFilters} />
            <StatsPanel tasks={tasks} categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
