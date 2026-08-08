import { type ReactElement, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTasks } from '../services/taskService';
import { useAuth } from '../hooks/useAuth';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt?: string;
}

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: bg, border: `1px solid ${color}40` }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

const statusConfig = {
  TODO: { label: 'To Do', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.25)' },
  IN_PROGRESS: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  COMPLETED: { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
};

const priorityConfig = {
  LOW: { label: 'Low', color: '#6b7280' },
  MEDIUM: { label: 'Medium', color: '#f59e0b' },
  HIGH: { label: 'High', color: '#ef4444' },
};

export const Dashboard = (): ReactElement => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getTasks().then((data) => {
      setTasks(data as Task[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const todo = tasks.filter((t) => t.status === 'TODO').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const recentTasks = [...tasks].slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <div className="p-8 max-w-5xl mx-auto" style={{ color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-3xl font-black text-white">
          {greeting()}, {firstName} 👋
        </h1>
        <p className="text-base mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {total === 0
            ? "You're all clear. Create your first task to get started."
            : `You have ${todo} task${todo !== 1 ? 's' : ''} to do and ${inProgress} in progress.`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total tasks"
          value={total}
          color="#c084fc"
          bg="rgba(170,59,255,0.1)"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value={completed}
          color="#10b981"
          bg="rgba(16,185,129,0.1)"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        />
        <StatCard
          label="In progress"
          value={inProgress}
          color="#f59e0b"
          bg="rgba(245,158,11,0.1)"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Completion"
          value={`${completionRate}%`}
          color="#60a5fa"
          bg="rgba(96,165,250,0.1)"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          }
        />
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div
          className="p-5 rounded-2xl mb-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Overall progress</p>
            <p className="text-sm font-bold" style={{ color: '#aa3bff' }}>{completionRate}%</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${completionRate}%`,
                background: 'linear-gradient(90deg, #aa3bff, #7c3aed)',
                boxShadow: '0 0 10px rgba(170,59,255,0.5)',
              }}
            />
          </div>
          <div className="flex gap-6 mt-3">
            {[
              { label: 'To Do', count: todo, color: '#6b7280' },
              { label: 'In Progress', count: inProgress, color: '#f59e0b' },
              { label: 'Done', count: completed, color: '#10b981' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {s.label} ({s.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent tasks */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Recent tasks</h2>
        <Link
          to="/tasks"
          className="text-sm font-medium transition-colors"
          style={{ color: 'rgba(170,59,255,0.7)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#aa3bff')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(170,59,255,0.7)')}
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            />
          ))}
        </div>
      ) : recentTasks.length === 0 ? (
        <div
          className="py-16 text-center rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(170,59,255,0.1)', border: '1px solid rgba(170,59,255,0.2)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <p className="text-white font-semibold mb-1">No tasks yet</p>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Create your first task to get started
          </p>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'rgba(170,59,255,0.12)', color: '#c084fc', border: '1px solid rgba(170,59,255,0.25)' }}
          >
            Go to tasks →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {recentTasks.map((task) => {
            const sc = statusConfig[task.status];
            const pc = priorityConfig[task.priority];
            return (
              <div
                key={task.id}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                {/* Status dot */}
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sc.color }} />

                {/* Title */}
                <p
                  className="flex-1 text-sm font-medium truncate"
                  style={{
                    color: task.status === 'COMPLETED' ? 'rgba(255,255,255,0.35)' : '#fff',
                    textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </p>

                {/* Priority */}
                <span className="text-xs font-medium flex-shrink-0" style={{ color: pc.color }}>
                  {pc.label}
                </span>

                {/* Status badge */}
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                  style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                >
                  {sc.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
