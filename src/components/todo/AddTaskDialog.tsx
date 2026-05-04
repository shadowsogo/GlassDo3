import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Priority, Category, ColumnId, PRIORITY_LABELS } from '@/types/todo';

interface AddTaskDialogProps {
  categories: Category[];
  onAdd: (task: { title: string; priority: Priority; category: string; column: ColumnId; dueDate?: string }) => void;
}

export function AddTaskDialog({ categories, onAdd }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState(categories[0]?.id || 'work');
  const [dueDate, setDueDate] = useState<Date>();

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      priority,
      category,
      column: 'todo',
      dueDate: dueDate?.toISOString(),
    });
    setTitle('');
    setPriority('medium');
    setCategory(categories[0]?.id || 'work');
    setDueDate(undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="glass border-primary/30 hover:bg-primary/20 text-primary-foreground gap-2 font-display font-semibold">
          <Plus size={18} />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-white/10 text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl glow-text">New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-foreground/70 text-xs mb-1.5 block">Task Name</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="glass border-white/10 text-foreground placeholder:text-muted-foreground focus:ring-primary/50"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-foreground/70 text-xs mb-1.5 block">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="glass border-white/10 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/10 text-foreground">
                  {(Object.keys(PRIORITY_LABELS) as Priority[]).map(p => (
                    <SelectItem key={p} value={p} className="text-foreground hover:bg-white/10 focus:bg-white/10 focus:text-foreground">
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-foreground/70 text-xs mb-1.5 block">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="glass border-white/10 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/10 text-foreground">
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-foreground hover:bg-white/10 focus:bg-white/10 focus:text-foreground">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-foreground/70 text-xs mb-1.5 block">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(
                  "w-full justify-start text-left glass border-white/10",
                  !dueDate && "text-muted-foreground"
                )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-strong border-white/10" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="p-3 pointer-events-auto text-foreground"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-display font-semibold">
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
