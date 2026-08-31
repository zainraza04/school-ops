'use client';

import { useAuthStore } from '@/store/authStore';
import { hasPermission, type Permission, type Resource } from '@/lib/permissions';

export function usePermissions(): {
  can: (resource: Resource, permission: Permission) => boolean;
  role: ReturnType<typeof useAuthStore.getState>['user'] extends infer U
    ? U extends { role: infer R }
      ? R | null
      : null
    : null;
} {
  const user = useAuthStore((s) => s.user);

  const can = (resource: Resource, permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, resource, permission);
  };

  return { can, role: user?.role ?? null };
}
