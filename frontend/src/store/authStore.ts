import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MEMBER';
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  clearAuth: () => set({ token: null, user: null }),
  setToken: (token) => set({ token }),
}));
