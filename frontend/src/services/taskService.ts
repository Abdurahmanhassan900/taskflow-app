import { api } from '../lib/axios';

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  description: string;
}

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};
