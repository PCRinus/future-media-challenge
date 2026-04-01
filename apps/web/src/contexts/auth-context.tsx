'use client';

import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo } from 'react';

import type { UserResponseDto } from '@/api/model';
import { getUserControllerMeQueryKey, useUserControllerMe } from '@/api/users/users';
import { clearToken, getToken, setToken } from '@/lib/api-client';

interface AuthContextValue {
  user: UserResponseDto | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useUserControllerMe({
    query: {
      enabled: !!getToken(),
      retry: false,
    },
  });

  const login = useCallback(
    (accessToken: string) => {
      setToken(accessToken);
      queryClient.invalidateQueries({ queryKey: getUserControllerMeQueryKey() });
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    clearToken();
    queryClient.setQueryData(getUserControllerMeQueryKey(), undefined);
    queryClient.removeQueries({ queryKey: getUserControllerMeQueryKey() });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
