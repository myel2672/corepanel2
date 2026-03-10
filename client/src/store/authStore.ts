import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

function getUserFromToken(token: string | null): User | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id || payload.sub,
      name: payload.name || payload.fullName || payload.username || payload.email || '',
      email: payload.email,
      role: payload.role,
      businessId: payload.businessId || payload.business_id || undefined,
    } as User;
  } catch {
    return null;
  }
}

const storedToken = localStorage.getItem('token');
const storedRefreshToken = localStorage.getItem('refreshToken');

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  refreshToken: storedRefreshToken,
  user: getUserFromToken(storedToken),

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, token, refreshToken });
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token, user: getUserFromToken(token) });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    set({ user: null, token: null, refreshToken: null });
  },
}));