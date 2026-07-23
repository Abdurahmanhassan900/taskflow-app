import { type ReactElement, useState, useEffect, type FormEvent } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { createTask, deleteTask, getTasks, type Task } from '../services/taskService';

const statusClass = (status: string) => {
  if (status === 'Completed') return 'bg-green-100 text-green-800';
  if (status === 'In Progress') return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-800';
};

const priorityClass = (priority: string) => {
  if (priority === 'High') return 'text-red-600';
  if (priority === 'Medium') return 'text-orange-500';
  return 'text-gray-500';
};

export const Tasks = (): ReactElement => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Failed to load tasks');
      } else {
        setError('Failed to load tasks');
      }
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
    setError(null);

    try {
      await createTask({ title, description });
      setTitle('');
      setDescription('');
      setShowForm(false);
      await fetchTasks();
    } catch (err: unknown) {
      if (err instanceof Error && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Failed to create task');
      } else {
        setError('Failed to create task');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      await fetchTasks();
    } catch {
      setError('Failed to delete task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-500 mt-1">Manage your team's tasks and progress.</p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cancel' : 'Create Task'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Task title"
            />
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Task'}
            </Button>
          </form>
        </Card>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : !error && tasks.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">No tasks found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <div className="mb-2 flex justify-between items-start gap-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={task.title}>
                  {task.title}
                </h3>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>

              <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">{task.description}</p>

              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(task.status)}`}>
                  {task.status}
                </span>
                <span className={`text-xs font-medium ${priorityClass(task.priority)}`}>
                  {task.priority} Priority
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
