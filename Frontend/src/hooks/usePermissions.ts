import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Permission } from '../types';

export function usePermissions() {
  const { user, hasPermission, hasAnyPermission, isAtLeast } = useAuth();

  const role = user?.role || null;
  const permissions = user?.permissions || [];

  const can = (permission: Permission): boolean => hasPermission(permission);
  const canAny = (perms: Permission[]): boolean => hasAnyPermission(perms);
  const canAll = (perms: Permission[]): boolean => perms.every(p => hasPermission(p));

  const isManager = useMemo(() => isAtLeast('manager'), [isAtLeast]);
  const isAdmin = useMemo(() => isAtLeast('admin'), [isAtLeast]);
  const isSuperAdmin = useMemo(() => role === 'superadmin', [role]);

  return {
    role,
    permissions,
    can,
    canAny,
    canAll,
    isAtLeast,
    isManager,
    isAdmin,
    isSuperAdmin,
  };
}

export default usePermissions;
