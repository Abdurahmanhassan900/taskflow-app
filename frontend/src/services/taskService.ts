import { api } from '../lib/axios';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks');
  return response.data;
};

export const createTask = async (title: string): Promise<Task> => {
  const response = await api.post<Task>('/tasks', { title });
  return response.data;
};

export const toggleTask = async (id: number, completed: boolean): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/${id}`, { completed });
  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};
