import { type ReactElement, useState, useEffect, type FormEvent } from 'react';
import { toast } from '../lib/toast';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  type Task,
} from '../services/taskService';

const STATUSES = ['To Do', 'In Progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export const Tasks = (): ReactElement => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To Do');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setTasks(await getTasks());
      setError(null);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTask({ title, description, priority, status });
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('To Do');
      setShowForm(false);
      toast.success('Task created');
      await fetchTasks();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (task: Task) => {
    const next = task.status === 'Completed' ? 'To Do' : 'Completed';
    try {
      await updateTask(task.id, { status: next });
      await fetchTasks();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      await fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-500 mt-1">Manage your team's tasks and progress.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>Create Task</Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">No tasks found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <div className="mb-2 flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={task.title}>
                  {task.title}
                </h3>
              </div>

              <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">{task.description}</p>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium
                  ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'}`}
                >
                  {task.status}
                </span>
                <span
                  className={`text-xs font-medium
                  ${task.priority === 'High' ? 'text-red-600' :
                      task.priority === 'Medium' ? 'text-orange-500' :
                        'text-gray-500'}`}
                >
                  {task.priority} Priority
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  className="text-xs py-1 px-2 flex-1"
                  onClick={() => handleToggle(task)}
                >
                  {task.status === 'Completed' ? 'Reopen' : 'Mark Complete'}
                </Button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-xs py-1 px-2 rounded font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <Card padding="large" className="w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Task</h3>
            <form className="space-y-4" onSubmit={handleCreate}>
              <Input
                label="Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Write deployment runbook"
              />
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-text-dark">Priority</label>
                  <select
                    className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-text-dark">Status</label>
                  <select
                    className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
