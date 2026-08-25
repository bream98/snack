import { create } from 'zustand';
import { apiClient } from '../services/apiClient';

export interface User {
  ID: number | string;
  display_name: string;
  phone: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  token: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (displayName: string, phone: string, password: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  user: null,
  token: localStorage.getItem('token'),

  clearError: () => set({ error: null }),

  login: async (phone: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient<{ token: string; user: User }>('/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });

      localStorage.setItem('token', res.token);
      set({
        isAuthenticated: true,
        token: res.token,
        user: res.user,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Đăng nhập thất bại',
      });
      throw err;
    }
  },

  register: async (displayName: string, phone: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient('/register', {
        method: 'POST',
        body: JSON.stringify({
          display_name: displayName,
          phone,
          password,
        }),
      });

      set({ isLoading: false, error: null });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Đăng ký thất bại',
      });
      throw err;
    }
  },

  fetchMe: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await apiClient<User>('/me', { method: 'GET' });
      set({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      localStorage.removeItem('token');
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      error: null,
    });
  },
}));
