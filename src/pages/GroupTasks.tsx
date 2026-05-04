import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { COLUMNS, ColumnId, Priority, DEFAULT_CATEGORIES } from '@/types/todo';
import { KanbanColumn } from '@/components/todo/KanbanColumn';
import { AddTaskDialog } from '@/components/todo/AddTaskDialog';
import { FilterSidebar } from '@/components/todo/FilterSidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';

interface DbTask {
  id: string;
  user_id: string;
  title: string;
  priority: string;
  category: string;
  column_id: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

const GroupTasks = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ category: string | null; priority: Priority | null }>({ category: null, priority: null });
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  const fetchTasks = useCallback(async () => {
    if (!groupId) return;
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    setTasks(data || []);
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !user) return;
    
    const fetchGroup = async () => {
      const { data } = await supabase.from('groups').select('name').eq('id', groupId).single();
      setGroupName(data?.name || 'Group');
    };

    const fetchProfiles = async () => {
      const { data } = await supabase.from('profiles').select('user_id, display_name');
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(p => { map[p.user_id] = p.display_name; });
        setProfiles(map);
      }
    };

    Promise.all([fetchGroup(), fetchTasks(), fetchProfiles()]).then(() => setLoading(false));
  }, [groupId, user, fetchTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filters.category && t.category !== filters.category) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      return true;
    }).map(t => ({
      id: t.id,
      title: `${t.title} (${profiles[t.user_id] || 'Unknown'})`,
      priority: t.priority as Priority,
      category: t.category,
      column: t.column_id as ColumnId,
      dueDate: t.due_date || undefined,
      createdAt: t.created_at,
      completedAt: t.completed_at || undefined,
    }));
  }, [tasks, filters, profiles]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="text-primary animate-pulse" size={48} />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const addTask = async (task: { title: string; priority: Priority; category: string; column: ColumnId; dueDate?: string }) => {
    const { error } = await supabase.from('tasks').insert({
      title: task.title,
      priority: task.priority,
      category: task.category,
      column_id: task.column,
      due_date: task.dueDate || null,
      user_id: user.id,
      group_id: groupId!,
    });
    if (error) { toast.error(error.message); return; }
    await fetchTasks();
  };

  const deleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task?.user_id !== user.id) { toast.error("You can only delete your own tasks"); return; }
    await supabase.from('tasks').delete().eq('id', id);
    await fetchTasks();
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const task = tasks.find(t => t.id === draggableId);
    if (!task || task.user_id !== user.id) { toast.error("You can only move your own tasks"); return; }
    
    const newColumn = destination.droppableId as ColumnId;
    const updates: unknown = { column_id: newColumn };
    if (newColumn === 'done' && !task.completed_at) updates.completed_at = new Date().toISOString();
    else if (newColumn !== 'done') updates.completed_at = null;

    await supabase.from('tasks').update(updates).eq('id', draggableId);
    await fetchTasks();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="relative z-10 min-h-screen p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/groups')} className="text-foreground">
              <ArrowLeft size={20} />
            </Button>
            <Users className="text-primary" size={28} />
            <h1 className="font-display text-3xl font-bold glow-text text-foreground">{groupName}</h1>
          </div>
          <AddTaskDialog categories={DEFAULT_CATEGORIES} onAdd={addTask} />
        </header>

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
                    categories={DEFAULT_CATEGORIES}
                    onDeleteTask={deleteTask}
                  />
                ))}
              </div>
            </DragDropContext>
          </div>

          <div className="w-full lg:w-72 shrink-0">
            <FilterSidebar categories={DEFAULT_CATEGORIES} filters={filters} onFilterChange={setFilters} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupTasks;
