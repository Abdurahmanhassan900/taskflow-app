import { type ReactElement, useState, useEffect, type FormEvent } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
  getTasks,
  createTask,
  toggleTask,
  deleteTask,
  type Task,
} from '../services/taskService';

export const Tasks = (): ReactElement => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch {
      setError('Could not load tasks. Is the backend running on port 3000?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setSubmitting(true);
    try {
      const task = await createTask(title);
      setTasks((prev) => [...prev, task]);
      setNewTitle('');
      setError(null);
    } catch {
      setError('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (task: Task) => {
    try {
      const updated = await toggleTask(task.id, !task.completed);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError('Failed to update task');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Failed to delete task');
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <p className="text-gray-500 mt-1">
          {tasks.length === 0
            ? 'Add your first task below.'
            : `${completedCount} of ${tasks.length} completed`}
        </p>
      </div>

      <Card>
        <form onSubmit={handleCreate} className="flex gap-3 items-end">
          <Input
            label="New task"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1"
          />
          <Button type="submit" disabled={submitting || !newTitle.trim()}>
            Add
          </Button>
        </form>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-8">Loading tasks...</p>
      ) : tasks.length === 0 && !error ? (
        <p className="text-gray-500 text-center py-8">No tasks yet.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <Card className="flex items-center gap-3 py-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task)}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span
                  className={`flex-1 ${
                    task.completed ? 'line-through text-gray-400' : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="text-sm text-red-600 hover:text-red-800 px-2 py-1"
                >
                  Delete
                </button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
