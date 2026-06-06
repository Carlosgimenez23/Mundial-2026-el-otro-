'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface Account {
  id: string;
  username: string;
  color: string;
  isAdmin: boolean;
}

interface AuthState {
  user: Account | null;
  ready: boolean;
  register: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (active) setUser(d.user ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const post = async (url: string, body: unknown) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  };

  const register: AuthState['register'] = async (username, password) => {
    const { res, data } = await post('/api/auth/register', { username, password });
    if (!res.ok) return { ok: false, error: data.error ?? 'Could not create account.' };
    setUser(data.user);
    return { ok: true };
  };

  const login: AuthState['login'] = async (username, password) => {
    const { res, data } = await post('/api/auth/login', { username, password });
    if (!res.ok) return { ok: false, error: data.error ?? 'Could not sign in.' };
    setUser(data.user);
    return { ok: true };
  };

  const logout: AuthState['logout'] = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, ready, register, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
