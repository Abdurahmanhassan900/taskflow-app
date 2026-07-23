import { api } from '../lib/axios';

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  description: string;
  statusValue?: string;
  priorityValue?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
}

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (data: CreateTaskInput): Promise<Task> => {
  const response = await api.post('/tasks', data);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};
