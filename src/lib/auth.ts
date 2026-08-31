import { AUTH_COOKIE, ROLE_COOKIE } from '@/lib/constants';
import { MOCK_USERS } from '@/lib/mockData';
import type { AuthResponse, LoginCredentials, Role } from '@/types/auth.types';

export function setAuthCookies(token: string, role: Role): void {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAuthCookies(): void {
  document.cookie = `${AUTH_COOKIE}=; Max-Age=0; path=/`;
  document.cookie = `${ROLE_COOKIE}=; Max-Age=0; path=/`;
}

export async function mockLogin(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 600));
  const entry = MOCK_USERS[credentials.email.toLowerCase()];
  if (!entry || entry.password !== credentials.password) {
    throw new Error('Invalid email or password');
  }
  return { user: entry.user, accessToken: entry.token };
}

export function getRedirectPath(role: Role): string {
  if (role === 'saas_admin') return '/saas/dashboard';
  return '/dashboard';
}
