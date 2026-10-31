import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (details: {
    name: string;
    email: string;
    password: string;
    companyName?: string;
    phone?: string;
    address?: string;
    role?: Role;
  }) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: Role) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('brightloop_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const savedToken = localStorage.getItem('brightloop_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await api.auth.getMe();
      setUser(currentUser);
    } catch (err) {
      console.warn('Session expired or server unavailable, clearing local auth cache.');
      localStorage.removeItem('brightloop_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api.auth.login({ email, password });
    localStorage.setItem('brightloop_token', result.token);
    setToken(result.token);
    setUser(result.user);
  };

  const register = async (details: {
    name: string;
    email: string;
    password: string;
    companyName?: string;
    phone?: string;
    address?: string;
    role?: Role;
  }) => {
    const result = await api.auth.register(details);
    localStorage.setItem('brightloop_token', result.token);
    setToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem('brightloop_token');
    setToken(null);
    setUser(null);
  };

  // Instant 1-click Demo Accounts for hackathon presentations
  const quickDemoLogin = async (role: Role) => {
    let email = 'customer@brightloop.com';
    let password = 'Password@123';

    if (role === 'STAFF') {
      email = 'staff@brightloop.com';
      password = 'Staff@12345';
    } else if (role === 'ADMIN') {
      email = 'admin@brightloop.com';
      password = 'Admin@12345';
    }

    await login(email, password);
  };

  const refreshProfile = async () => {
    try {
      const updated = await api.customer.getProfile();
      setUser(updated);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
