'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setAccessToken, getAccessToken } from '@/lib/api-client';

type User = {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  avatarUrl?: string | null;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  bio?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  githubUrl?: string | null;
};

type LoginResult = { requires2FA: boolean; tempToken?: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verify2FA: (tempToken: string, code: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithToken: (accessToken: string) => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      if (!getAccessToken()) {
        try {
          const res = await api.post('/auth/refresh');
          setAccessToken(res.data.accessToken);
          setUser(res.data.user);
        } catch {
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        await loadMe();
      }
    })();
  }, []);

  async function login(email: string, password: string): Promise<LoginResult> {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.requires2FA) {
      return { requires2FA: true, tempToken: res.data.tempToken };
    }
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return { requires2FA: false };
  }

  async function verify2FA(tempToken: string, code: string) {
    const res = await api.post('/auth/login/2fa', { tempToken, code });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  }

  async function register(email: string, password: string, name: string) {
    const res = await api.post('/auth/register', { email, password, name });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  }

  async function logout() {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
  }

  async function loginWithToken(accessToken: string) {
    setAccessToken(accessToken);
    await loadMe();
  }

  async function refreshMe() {
    await loadMe();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, verify2FA, register, logout, loginWithToken, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider');
  return ctx;
}