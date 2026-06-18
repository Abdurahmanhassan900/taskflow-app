import { api } from '../lib/axios';

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  description: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
}

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (input: TaskInput): Promise<Task> => {
  const response = await api.post('/tasks', input);
  return response.data;
};

export const updateTask = async (id: string, input: Partial<TaskInput>): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, input);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};
