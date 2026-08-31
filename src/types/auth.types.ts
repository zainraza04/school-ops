export type Role = 'saas_admin' | 'owner' | 'admin' | 'teacher';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  schoolId: string | null;
  schoolName: string | null;
  schoolLogo: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}
