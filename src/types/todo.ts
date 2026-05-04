export type Priority = 'high' | 'medium' | 'low' | 'none';
export type ColumnId = 'todo' | 'in-progress' | 'done';
export type CategoryId = 'work' | 'personal' | 'health' | 'learning' | string;

export interface Category {
  id: CategoryId;
  name: string;
  color: string; // tailwind class
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: CategoryId;
  column: ColumnId;
  dueDate?: string; // ISO string
  createdAt: string;
  completedAt?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: 'bg-category-work' },
  { id: 'personal', name: 'Personal', color: 'bg-category-personal' },
  { id: 'health', name: 'Health', color: 'bg-category-health' },
  { id: 'learning', name: 'Learning', color: 'bg-category-learning' },
];

export const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'None',
};
