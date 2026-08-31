'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { clearAuthCookies, getRedirectPath, mockLogin, setAuthCookies } from '@/lib/auth';
import type { LoginCredentials } from '@/types/auth.types';

export function useAuth(): {
  user: ReturnType<typeof useAuthStore.getState>['user'];
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
} {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      const { user: authUser, accessToken } = await mockLogin(credentials);
      setUser(authUser, accessToken);
      setAuthCookies(accessToken, authUser.role);
      router.push(getRedirectPath(authUser.role));
    },
    [router, setUser]
  );

  const logout = useCallback((): void => {
    clearUser();
    clearAuthCookies();
    router.push('/login');
  }, [clearUser, router]);

  return { user, isAuthenticated, login, logout };
}
