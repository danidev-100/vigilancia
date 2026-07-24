import * as React from 'react';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import { api, setTokens, clearTokens, setOnUnauthorized } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshUser = React.useCallback(async () => {
    try {
      const res = await api.get<User>('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  React.useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  React.useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      clearTokens();
    });
  }, []);

  const login = React.useCallback(async (data: LoginRequest) => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    if (res.success && res.data) {
      setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
    }
  }, []);

  const register = React.useCallback(async (data: RegisterRequest) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    if (res.success && res.data) {
      setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
    clearTokens();
    setUser(null);
  }, []);

  const googleLogin = React.useCallback(async (credential: string) => {
    const res = await api.post<AuthResponse>('/auth/google', {
      credential,
    });
    if (res.success && res.data) {
      setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
    }
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
      googleLogin,
    }),
    [user, isLoading, login, register, logout, refreshUser, googleLogin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
