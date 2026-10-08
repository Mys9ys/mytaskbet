import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import AuthService, {User} from '../services/AuthService';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = await AuthService.getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const me = await AuthService.refreshMe();
      setUser(me);
    } catch {
      await AuthService.logout();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const login = useCallback(async (username: string, password: string) => {
    const me = await AuthService.login({username, password});
    setUser(me);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    await AuthService.register({username, email, password});
    await login(username, password);
  }, [login]);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({user, loading, login, register, logout, refreshUser}),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
