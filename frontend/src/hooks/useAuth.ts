import { useState } from 'react';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { token, user, setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', credentials);
      const { accessToken, user } = response.data;
      setAuth(accessToken, user);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Login failed');
      } else {
        setError('Login failed');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      const { accessToken, user } = response.data;
      setAuth(accessToken, user);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || 'Registration failed');
      } else {
        setError('Registration failed');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Even if API logout fails, clear client state
      console.error('Logout API failed', err);
    } finally {
      clearAuth();
    }
  };

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    loading,
    error,
  };
};
