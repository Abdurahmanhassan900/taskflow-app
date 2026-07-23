import { type ReactElement, useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { useAuth } from '../hooks/useAuth';
import { getTasks } from '../services/taskService';

export const Dashboard = (): ReactElement => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, todo: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const tasks = await getTasks();
        setStats({
          total: tasks.length,
          completed: tasks.filter((t) => t.status === 'Completed').length,
          inProgress: tasks.filter((t) => t.status === 'In Progress').length,
          todo: tasks.filter((t) => t.status === 'To Do').length,
        });
      } catch {
        // Dashboard remains usable with zeroed stats if fetch fails.
      }
    };
    load();
  }, []);

  const cards = [
    { label: 'Total Tasks', value: String(stats.total) },
    { label: 'Completed', value: String(stats.completed) },
    { label: 'In Progress', value: String(stats.inProgress) },
    { label: 'To Do', value: String(stats.todo) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Welcome back, {user?.fullName || 'User'}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <Card key={stat.label}>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <span className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
