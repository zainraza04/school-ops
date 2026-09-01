import type { Role } from '@/types/auth.types';

type Permission = 'view' | 'manage';
type Resource =
  | 'students'
  | 'admissions'
  | 'attendance'
  | 'fees'
  | 'staff'
  | 'payroll'
  | 'expenses'
  | 'exams'
  | 'results'
  | 'reports'
  | 'analytics'
  | 'settings'
  | 'saas_dashboard';

const PERMISSION_MATRIX: Record<Resource, Partial<Record<Permission, Role[]>>> = {
  students: { view: ['owner', 'admin', 'teacher'], manage: ['owner', 'admin'] },
  admissions: { manage: ['owner', 'admin'] },
  attendance: { view: ['owner', 'admin', 'teacher'], manage: ['owner', 'admin', 'teacher'] },
  fees: { view: ['owner', 'admin'], manage: ['owner', 'admin'] },
  staff: { view: ['owner', 'admin'], manage: ['owner'] },
  payroll: { view: ['owner'], manage: ['owner'] },
  expenses: { view: ['owner', 'admin'], manage: ['owner', 'admin'] },
  exams: { view: ['owner', 'admin', 'teacher'], manage: ['owner', 'admin'] },
  results: { view: ['owner', 'admin', 'teacher'], manage: ['owner', 'admin', 'teacher'] },
  reports: { view: ['owner', 'admin'] },
  analytics: { view: ['owner', 'admin'] },
  settings: { manage: ['owner'] },
  saas_dashboard: { view: ['saas_admin'] },
};

export function hasPermission(
  role: Role,
  resource: Resource,
  permission: Permission
): boolean {
  return PERMISSION_MATRIX[resource]?.[permission]?.includes(role) ?? false;
}

export type { Permission, Resource };
