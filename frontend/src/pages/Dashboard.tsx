import { type ReactElement, useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { useAuth } from '../hooks/useAuth';
import { getTasks, type Task } from '../services/taskService';

export const Dashboard = (): ReactElement => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Tasks', value: tasks.length },
    { label: 'Completed', value: tasks.filter((t) => t.status === 'Completed').length },
    { label: 'In Progress', value: tasks.filter((t) => t.status === 'In Progress').length },
    { label: 'To Do', value: tasks.filter((t) => t.status === 'To Do').length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Welcome back, {user?.fullName || 'User'}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <span className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '—' : stat.value}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-64 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Recent Activity Chart Placeholder</p>
        </Card>
        <Card className="h-64 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Task Completion Placeholder</p>
        </Card>
      </div>
    </div>
  );
};
