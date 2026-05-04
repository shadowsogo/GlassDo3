import { useState, useEffect, useCallback } from 'react';
import { Task, ColumnId, Category, DEFAULT_CATEGORIES, Priority } from '@/types/todo';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useTodos() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const fetchTasks = useCallback(async () => {
    if (!user) { setTasks([]); return; }
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .is('group_id', null)
      .order('created_at', { ascending: false });

    setTasks((data || []).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || undefined,
      priority: t.priority as Priority,
      category: t.category,
      column: t.column_id as ColumnId,
      dueDate: t.due_date || undefined,
      createdAt: t.created_at,
      completedAt: t.completed_at || undefined,
    })));
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) return;
    await supabase.from('tasks').insert({
      title: task.title,
      priority: task.priority,
      category: task.category,
      column_id: task.column,
      due_date: task.dueDate || null,
      user_id: user.id,
    });
    await fetchTasks();
  }, [user, fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    await fetchTasks();
  }, [fetchTasks]);

  const moveTask = useCallback(async (taskId: string, newColumn: ColumnId, _newIndex?: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updates: unknown = { column_id: newColumn };
    if (newColumn === 'done' && !task.completedAt) updates.completed_at = new Date().toISOString();
    else if (newColumn !== 'done') updates.completed_at = null;
    await supabase.from('tasks').update(updates).eq('id', taskId);
    await fetchTasks();
  }, [tasks, fetchTasks]);

  const today = new Date().toDateString();
  const completedToday = tasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === today).length;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.column === 'done').length;

  const getStreak = () => {
    const completionDates = new Set(
      tasks.filter(t => t.completedAt).map(t => new Date(t.completedAt!).toDateString())
    );
    let streak = 0;
    const d = new Date();
    while (completionDates.has(d.toDateString())) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  };

  return {
    tasks, categories, addTask, deleteTask, moveTask,
    stats: { completedToday, totalTasks, doneTasks, streak: getStreak() },
  };
}
