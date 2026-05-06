import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  voterId: string;
  role: 'voter' | 'admin';
  hasVoted: boolean;
  isFlagged: boolean;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('electra_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem('electra_user');
      }
    }
    setLoading(false);
  }, []);

  const persistUser = (userData: User, tokenStr: string) => {
    setUser(userData);
    setToken(tokenStr);
    localStorage.setItem('electra_user', JSON.stringify({ user: userData, token: tokenStr }));
  };

  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password });
    if (!data.success) throw new Error(data.message);
    persistUser(data.user, data.token);
  };

  const register = async (formData: any) => {
    const { data } = await authAPI.register(formData);
    if (!data.success) throw new Error(data.message);
    persistUser(data.user, data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('electra_user');
  };

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.profile();
      if (data.success && token) persistUser(data.user, token);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
