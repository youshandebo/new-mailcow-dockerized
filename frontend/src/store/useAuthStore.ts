import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../api/auth';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { user, isAdmin } = await authApi.login(email, password);
      set({ user, isAdmin: !!isAdmin, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Login failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await authApi.logout().catch(() => {});
    set({ user: null, isAdmin: false, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    try {
      const { user, isAdmin } = await authApi.me();
      set({ user, isAdmin: !!isAdmin, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAdmin: false, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
