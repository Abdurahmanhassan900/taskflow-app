import { type ReactElement, useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { getTasks, type Task } from '../services/taskService';

export const Tasks = (): ReactElement => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchTasks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-500 mt-1">Manage your team's tasks and progress.</p>
        </div>
        <Button>Create Task</Button>
      </div>

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
              <div className="mb-2 flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={task.title}>{task.title}</h3>
              </div>

              <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">{task.description}</p>

              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                  ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {task.status}
                </span>
                <span className={`text-xs font-medium
                  ${task.priority === 'High' ? 'text-red-600' :
                    task.priority === 'Medium' ? 'text-orange-500' :
                    'text-gray-500'}`}>
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
