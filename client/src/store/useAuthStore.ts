import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true, // Default to true for easy dev preview
  user: {
    id: 'usr-1',
    name: 'Nam Luong',
    email: 'nam.luong@example.com',
  },
  login: (email: string) =>
    set({
      isAuthenticated: true,
      user: {
        id: 'usr-1',
        name: email.split('@')[0] || 'User',
        email,
      },
    }),
  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
    }),
}));
