'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '@/types/auth.types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser, token: string) => void;
  clearUser: () => void;
  updateSchoolInfo: (info: {
    schoolName?: string | null;
    schoolLogo?: string | null;
  }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setUser: (user, token) =>
        set({ user, accessToken: token, isAuthenticated: true }),
      clearUser: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
      updateSchoolInfo: (info) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                schoolName:
                  info.schoolName !== undefined
                    ? info.schoolName
                    : state.user.schoolName,
                schoolLogo:
                  info.schoolLogo !== undefined
                    ? info.schoolLogo
                    : state.user.schoolLogo,
              }
            : null,
        })),
    }),
    {
      name: 'schoolops-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
