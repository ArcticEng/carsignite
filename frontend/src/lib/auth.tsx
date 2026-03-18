'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from './api';

interface Member {
  id: string; email: string; first_name: string; last_name: string;
  phone: string; tier: string; role: string; status: string;
  city?: string; province?: string; created_at?: string;
}

interface AuthState {
  member: Member | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Member>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await api<{ member: Member }>('/auth/me');
      setMember(r.member);
    } catch { logout(); }
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('ci_token');
    if (t) {
      setToken(t);
      refresh().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refresh]);

  const login = async (email: string, password: string): Promise<Member> => {
    const r = await api<{ token: string; member: Member }>('/auth/login', {
      method: 'POST', body: { email, password },
    });
    localStorage.setItem('ci_token', r.token);
    setToken(r.token);
    setMember(r.member);
    return r.member;
  };

  const register = async (data: any) => {
    const r = await api<{ token: string; member: Member }>('/auth/register', {
      method: 'POST', body: data,
    });
    localStorage.setItem('ci_token', r.token);
    setToken(r.token);
    setMember(r.member);
  };

  const logout = () => {
    localStorage.removeItem('ci_token');
    setToken(null);
    setMember(null);
  };

  return (
    <AuthContext.Provider value={{
      member, token, loading, login, register, logout, refresh,
      isAdmin: member?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
