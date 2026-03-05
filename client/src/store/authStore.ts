import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

// Token'ı localStorage'dan al, user bilgisini JWT'den çöz
function getUserFromToken(token: string | null): User | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id || payload.sub,
      // Backend'e göre name field'ı farklı gelebilir: name, fullName, username
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

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: getUserFromToken(storedToken),
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
