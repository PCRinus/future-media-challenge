'use client';

import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';

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

// useSyncExternalStore reads the JWT from localStorage (an external store).
// - subscribe (noop): we don't need push notifications — re-renders from
//   queryClient.invalidateQueries() cause React to re-read the snapshot.
// - getSnapshot (getToken): reads the current token from localStorage.
// - getServerSnapshot (() => null): returns null during SSR (no localStorage),
//   letting React handle the server/client divergence without hydration errors.
const noop = () => () => {};

function useToken() {
  return useSyncExternalStore(noop, getToken, () => null);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const token = useToken();

  const { data: user, isLoading } = useUserControllerMe({
    query: {
      enabled: !!token,
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
