import { type ReactElement, useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask, type CreateTaskInput, type UpdateTaskInput } from '../services/taskService';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt?: string;
}

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { value: 'COMPLETED', label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: '#6b7280' },
  { value: 'MEDIUM', label: 'Medium', color: '#f59e0b' },
  { value: 'HIGH', label: 'High', color: '#ef4444' },
] as const;

function getStatusConfig(status: Task['status']) {
  return STATUS_OPTIONS.find((s) => s.value === status)!;
}

function getPriorityConfig(priority: Task['priority']) {
  return PRIORITY_OPTIONS.find((p) => p.value === priority)!;
}

/* ─── Create / Edit Modal ─────────────────────────────────────────────── */
function TaskModal({
  open,
  onClose,
  onSave,
  initial,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateTaskInput | UpdateTaskInput) => void;
  initial?: Task | null;
  loading: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<Task['status']>(initial?.status ?? 'TODO');
  const [priority, setPriority] = useState<Task['priority']>(initial?.priority ?? 'MEDIUM');

  useEffect(() => {
    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setStatus(initial?.status ?? 'TODO');
    setPriority(initial?.priority ?? 'MEDIUM');
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, status, priority });
  };

  const sc = getStatusConfig(status);
  const pc = getPriorityConfig(priority);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: '#0f0c1a',
          border: '1px solid rgba(170,59,255,0.2)',
          boxShadow: '0 0 60px rgba(170,59,255,0.15)',
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-base font-bold text-white">
            {initial ? 'Edit task' : 'New task'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
              TASK TITLE *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = 'rgba(170,59,255,0.5)';
                (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(170,59,255,0.1)';
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)';
                (e.target as HTMLInputElement).style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
              DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all resize-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxSizing: 'border-box',
                color: '#fff',
              }}
              onFocus={(e) => {
                (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(170,59,255,0.5)';
                (e.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(170,59,255,0.1)';
              }}
              onBlur={(e) => {
                (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.1)';
                (e.target as HTMLTextAreaElement).style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Status & Priority row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
                STATUS
              </label>
              <div className="flex flex-col gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left"
                    style={{
                      background: status === opt.value ? opt.bg : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${status === opt.value ? opt.color + '50' : 'rgba(255,255,255,0.07)'}`,
                      color: status === opt.value ? opt.color : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
                PRIORITY
              </label>
              <div className="flex flex-col gap-1.5">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left"
                    style={{
                      background: priority === opt.value ? opt.color + '18' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${priority === opt.value ? opt.color + '50' : 'rgba(255,255,255,0.07)'}`,
                      color: priority === opt.value ? opt.color : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill={priority === opt.value ? opt.color : 'none'} stroke={opt.color} strokeWidth="2.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview strip */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color }} />
            <span className="text-sm text-white flex-1 truncate">{title || 'Task preview'}</span>
            <span className="text-xs font-medium" style={{ color: pc.color }}>{pc.label}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: sc.bg, color: sc.color }}
            >
              {sc.label}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: loading || !title.trim() ? 'rgba(170,59,255,0.3)' : 'linear-gradient(135deg, #aa3bff, #7c3aed)',
                color: '#fff',
                boxShadow: loading || !title.trim() ? 'none' : '0 0 16px rgba(170,59,255,0.3)',
                cursor: loading || !title.trim() ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Saving...
                </span>
              ) : initial ? (
                'Save changes'
              ) : (
                'Create task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Task card ─────────────────────────────────────────────────────────── */
function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggle,
}: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (t: Task) => void;
}) {
  const sc = getStatusConfig(task.status);
  const pc = getPriorityConfig(task.priority);

  return (
    <div
      className="group p-4 rounded-xl transition-all"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
      }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task)}
          className="mt-0.5 w-4.5 h-4.5 rounded-md flex-shrink-0 flex items-center justify-center transition-all"
          style={{
            width: '18px',
            height: '18px',
            background: task.status === 'COMPLETED' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${task.status === 'COMPLETED' ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
          }}
        >
          {task.status === 'COMPLETED' && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium mb-1"
            style={{
              color: task.status === 'COMPLETED' ? 'rgba(255,255,255,0.3)' : '#fff',
              textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs line-clamp-2 mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30` }}
            >
              {sc.label}
            </span>
            <span className="text-xs font-medium" style={{ color: pc.color }}>
              {pc.label} priority
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(170,59,255,0.15)';
              (e.currentTarget as HTMLButtonElement).style.color = '#c084fc';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)';
              (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Tasks page ───────────────────────────────────────────────────── */
export const Tasks = (): ReactElement => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'ALL' | Task['status']>('ALL');
  const [search, setSearch] = useState('');

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data as Task[]);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleSave = async (data: CreateTaskInput | UpdateTaskInput) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data as UpdateTaskInput);
      } else {
        await createTask(data as CreateTaskInput);
      }
      await loadTasks();
      setModalOpen(false);
      setEditingTask(null);
    } catch {
      setError('Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Failed to delete task.');
    }
  };

  const handleToggle = async (task: Task) => {
    const nextStatus: Task['status'] = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      await updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    } catch {
      setError('Failed to update task.');
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const filtered = tasks.filter((t) => {
    const matchesFilter = filter === 'ALL' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    ALL: tasks.length,
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED').length,
  };

  return (
    <div className="p-8 max-w-3xl mx-auto" style={{ color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .search-input::placeholder { color: rgba(255,255,255,0.25); }
        .search-input { outline: none; }
        .search-input:focus { border-color: rgba(170,59,255,0.4) !important; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Tasks</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #aa3bff, #7c3aed)',
            color: '#fff',
            boxShadow: '0 0 16px rgba(170,59,255,0.3)',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(170,59,255,0.5)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(170,59,255,0.3)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New task
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="search-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {(['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'] as const).map((f) => {
            const labels: Record<typeof f, string> = {
              ALL: 'All',
              TODO: 'To Do',
              IN_PROGRESS: 'Active',
              COMPLETED: 'Done',
            };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: filter === f ? 'rgba(170,59,255,0.15)' : 'transparent',
                  color: filter === f ? '#c084fc' : 'rgba(255,255,255,0.4)',
                  border: filter === f ? '1px solid rgba(170,59,255,0.25)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {labels[f]} {counts[f] > 0 && <span style={{ opacity: 0.6 }}>({counts[f]})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button onClick={() => setError(null)} className="ml-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>✕</button>
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="py-20 text-center rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(170,59,255,0.08)', border: '1px solid rgba(170,59,255,0.15)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="text-white font-semibold mb-1">
            {search ? 'No tasks match your search' : 'No tasks yet'}
          </p>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {search ? 'Try a different search term' : 'Create your first task to get started'}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: 'rgba(170,59,255,0.12)',
                color: '#c084fc',
                border: '1px solid rgba(170,59,255,0.25)',
                cursor: 'pointer',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSave}
        initial={editingTask}
        loading={submitting}
      />
    </div>
  );
};
