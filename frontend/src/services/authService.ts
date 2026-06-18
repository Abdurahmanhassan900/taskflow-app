import { api } from '../lib/axios';

export interface MeResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt?: string;
}

export const getMe = async (): Promise<MeResponse> => {
  const response = await api.get('/auth/me');
  // Backend returns { user: {...} }; tolerate either shape.
  return response.data.user ?? response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await api.patch('/auth/me/password', { currentPassword, newPassword });
};
