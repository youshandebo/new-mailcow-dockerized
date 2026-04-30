import client from './client';
import { User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; isAdmin: boolean }> => {
    const res = await client.post('/auth/login', { email, password });
    return res.data;
  },

  logout: async (): Promise<void> => {
    await client.post('/auth/logout');
  },

  me: async (): Promise<{ user: User; isAdmin: boolean }> => {
    const res = await client.get('/auth/me');
    return res.data;
  },
};
