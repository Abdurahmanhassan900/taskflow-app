import { type ReactElement } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

// Mock data for initial UI development
const mockTasks = [
  { id: '1', title: 'Design Database Schema', status: 'In Progress', priority: 'High', description: 'Create Prisma schema for the new features.' },
  { id: '2', title: 'Setup Authentication', status: 'Completed', priority: 'High', description: 'Implement JWT based auth in backend.' },
  { id: '3', title: 'Build Dashboard UI', status: 'To Do', priority: 'Medium', description: 'Create responsive dashboard layout with Tailwind.' },
  { id: '4', title: 'Write Tests', status: 'To Do', priority: 'Low', description: 'Add unit tests for core services.' },
];

export const Tasks = (): ReactElement => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-500 mt-1">Manage your team's tasks and progress.</p>
        </div>
        <Button>Create Task</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockTasks.map((task) => (
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
    </div>
  );
};
