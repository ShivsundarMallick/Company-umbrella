import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { authService } from '../services';
import { ROLE_HIERARCHY, MIN_ADMIN_ROLE } from '../config';
import type { User, Role, Permission } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  isAtLeast: (role: Role) => boolean;
  mockLogin: (user: User, token: string, rememberMe?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage or sessionStorage on mount
  useEffect(() => {
    const loadUser = () => {
      // Check both storages - localStorage (remember me) and sessionStorage (session only)
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          setToken(storedToken);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        const { user: userData, accessToken } = response.data;

        // Check if user has admin access (manager+)
        const userRoleLevel = ROLE_HIERARCHY[userData.role] || 0;
        const minRoleLevel = ROLE_HIERARCHY[MIN_ADMIN_ROLE] || 0;

        if (userRoleLevel < minRoleLevel) {
          return { success: false, error: 'You do not have permission to access the admin dashboard.' };
        }

        setUser(userData);
        setToken(accessToken);

        // Use localStorage for "remember me", sessionStorage for session-only
        const storage = rememberMe ? localStorage : sessionStorage;
        // Clear both to avoid conflicts
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        // Store in the appropriate storage
        storage.setItem('token', accessToken);
        storage.setItem('user', JSON.stringify(userData));

        return { success: true };
      }

      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || 'An error occurred during login';
      return { success: false, error: message };
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      // Temporary frontend-only mode: backend auth is not ready yet.
      try {
        await authService.register({ name, email, password });
      } catch {
        // Ignore API failure and keep local auth flow.
      }

      const now = new Date().toISOString();
      const userData: User = {
        _id: `tmp-${Date.now()}`,
        name: name || email.split('@')[0] || 'User',
        email,
        role: 'manager',
        permissions: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      const accessToken = `temp-token-${Date.now()}`;

      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || 'An error occurred during signup';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  }, []);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    // Superadmin and admin have all permissions
    if (user.role === 'superadmin' || user.role === 'admin') return true;
    // Manager has most permissions except user management
    if (user.role === 'manager') {
      const adminOnlyPerms = ['view_admins', 'create_admin', 'delete_admin', 'change_user_role', 'edit_settings'];
      if (!adminOnlyPerms.includes(permission)) return true;
    }
    // Check explicit permissions
    return user.permissions?.includes(permission) || false;
  }, [user]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!user) return false;
    // Superadmin and admin have all permissions
    if (user.role === 'superadmin' || user.role === 'admin') return true;
    return permissions.some(p => hasPermission(p as Permission));
  }, [user, hasPermission]);

  const isAtLeast = useCallback((role: Role): boolean => {
    if (!user?.role) return false;
    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[role] || 0;
    return userLevel >= requiredLevel;
  }, [user]);

  const mockLogin = useCallback((userData: User, accessToken: string, rememberMe: boolean = true) => {
    setUser(userData);
    setToken(accessToken);
    const storage = rememberMe ? localStorage : sessionStorage;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    storage.setItem('token', accessToken);
    storage.setItem('user', JSON.stringify(userData));
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    signUp,
    logout,
    hasPermission,
    hasAnyPermission,
    isAtLeast,
    mockLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;

}

export default AuthContext;


