import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import type { Permission, Role } from '../../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  minRole?: Role;
}

export default function ProtectedRoute({
  children,
  permission,
  permissions,
  requireAll = false,
  minRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { can, canAny, canAll, isAtLeast } = usePermissions();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (minRole && !isAtLeast(minRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirement
  if (permission && !can(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasPermissions = requireAll ? canAll(permissions) : canAny(permissions);
    if (!hasPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
