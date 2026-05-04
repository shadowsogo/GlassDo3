import { Flame, CheckCircle2, ListTodo, TrendingUp } from 'lucide-react';

interface StatsBarProps {
  totalTasks: number;
  doneTasks: number;
  completedToday: number;
  streak: number;
}

export function StatsBar({ totalTasks, doneTasks, completedToday, streak }: StatsBarProps) {
  const stats = [
    { icon: ListTodo, label: 'Total', value: totalTasks, color: 'text-secondary' },
    { icon: CheckCircle2, label: 'Done', value: doneTasks, color: 'text-accent' },
    { icon: TrendingUp, label: 'Today', value: completedToday, color: 'text-primary' },
    { icon: Flame, label: 'Streak', value: `${streak}d`, color: 'text-priority-medium' },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {stats.map(s => (
        <div key={s.label} className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5 animate-fade-in">
          <s.icon size={16} className={s.color} />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-lg font-display font-bold text-foreground">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
