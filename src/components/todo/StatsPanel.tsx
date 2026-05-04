import { Task, Category } from '@/types/todo';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { useMemo } from 'react';

interface StatsPanelProps {
  tasks: Task[];
  categories: Category[];
}

const COLORS = ['hsl(220,80%,60%)', 'hsl(270,70%,60%)', 'hsl(150,70%,45%)', 'hsl(45,90%,55%)', 'hsl(330,80%,60%)'];

export function StatsPanel({ tasks, categories }: StatsPanelProps) {
  const categoryData = useMemo(() => {
    return categories.map((c, i) => ({
      name: c.name,
      value: tasks.filter(t => t.category === c.id).length,
      color: COLORS[i % COLORS.length],
    })).filter(d => d.value > 0);
  }, [tasks, categories]);

  const weeklyData = useMemo(() => {
    const days: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      days.push({
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        count: tasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === ds).length,
      });
    }
    return days;
  }, [tasks]);

  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.column === 'done').length / tasks.length) * 100)
    : 0;

  return (
    <div className="glass rounded-2xl p-5 space-y-6 animate-slide-up">
      <h3 className="font-display font-semibold text-foreground/80 text-sm uppercase tracking-wider">Progress & Stats</h3>

      {/* Completion Ring */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 relative">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={[{ value: completionRate }, { value: 100 - completionRate }]}
                innerRadius={25}
                outerRadius={35}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="hsl(270,80%,65%)" />
                <Cell fill="hsla(260,20%,30%,0.3)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-display font-bold text-foreground">{completionRate}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Completion Rate</p>
          <p className="text-xs text-muted-foreground">{tasks.filter(t => t.column === 'done').length} of {tasks.length} tasks</p>
        </div>
      </div>

      {/* Weekly Activity */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Weekly Activity</p>
        <div className="h-24">
          <ResponsiveContainer>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fill: 'hsl(260,10%,50%)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsla(260,30%,15%,0.9)',
                  border: '1px solid hsla(0,0%,100%,0.1)',
                  borderRadius: '8px',
                  color: 'hsl(0,0%,95%)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="hsl(270,80%,65%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">By Category</p>
          <div className="space-y-2">
            {categoryData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-xs text-foreground/70 flex-1">{d.name}</span>
                <span className="text-xs font-medium text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
