import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, GraduationCap, FolderOpen, MessageSquare,
  Bell, Briefcase, MessageCircle, Mail, Users, Settings, CreditCard,
  BarChart3, LogOut, ChevronDown, ChevronRight, X, Star,
  List, Plus, FolderTree, UserCheck, Megaphone, Newspaper, Clock, Flag,
  Inbox, MailWarning, Send, Shield, Key, Receipt, RefreshCw, RotateCcw,
  PieChart, TrendingUp, DollarSign, UserPlus, Settings2, Search, Share2,
  FileCheck, ToggleLeft, BookOpen, HelpCircle, Ticket
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { NAVIGATION, type NavItem } from '../../config';
import { useState, useEffect } from 'react';
import type { Permission } from '../../types';

// Extended icon map for all navigation icons
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, FileText, GraduationCap, FolderOpen, MessageSquare,
  Bell, Briefcase, MessageCircle, Mail, Users, Settings, CreditCard,
  BarChart3, List, Plus, FolderTree, UserCheck, Megaphone, Newspaper,
  Clock, Flag, Inbox, MailWarning, Send, Shield, Key, Receipt, RefreshCw,
  RotateCcw, PieChart, TrendingUp, DollarSign, UserPlus, Settings2,
  Search, Share2, FileCheck, ToggleLeft, Star, BookOpen, HelpCircle, Ticket,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const location = useLocation();

  const [loggingOut, setLoggingOut] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-expand parent item when child is active
  useEffect(() => {
    Object.values(NAVIGATION).flat().forEach((item) => {
      if (item.children?.some(child => location.pathname.startsWith(child.href))) {
        setExpandedItems(prev => new Set(prev).add(item.name));
      }
    });
  }, [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const filteredNavigation = NAVIGATION.website.filter(
    item => !item.permission || can(item.permission as Permission)
  );

  const isItemActive = (item: NavItem): boolean => {
    if (item.href === '/website') {
      return location.pathname === item.href;
    }
    return location.pathname.startsWith(item.href);
  };

  const renderNavItem = (item: NavItem, isChild = false) => {
    const Icon = iconMap[item.icon] || LayoutDashboard;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.name);
    const isActive = isItemActive(item);
    const childIsActive = hasChildren && item.children?.some(child => isItemActive(child));

    // Filter children by permission
    const filteredChildren = item.children?.filter(
      child => !child.permission || can(child.permission as Permission)
    );

    if (hasChildren && filteredChildren && filteredChildren.length > 0) {
      // Parent with children - render as expandable
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive || childIsActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
              isActive || childIsActive ? 'bg-primary-100' : 'bg-gray-100'
            )}>
              <Icon className={cn(
                'w-4 h-4 transition-colors',
                isActive || childIsActive ? 'text-primary-600' : 'text-gray-500'
              )} />
            </div>
            <span className="flex-1 text-left">{item.name}</span>
            <ChevronDown className={cn(
              'w-4 h-4 transition-transform duration-200',
              isExpanded ? 'rotate-180' : ''
            )} />
          </button>

          {/* Children */}
          <div className={cn(
            'overflow-hidden transition-all duration-200',
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}>
            <div className="ml-4 pl-4 border-l-2 border-gray-100 mt-1 space-y-1">
              {filteredChildren.map(child => renderNavItem(child, true))}
            </div>
          </div>
        </div>
      );
    }

    // Leaf item or item without children
    return (
      <NavLink
        key={item.href}
        to={item.href}
        end={item.href === '/website/dashboard'}
        onClick={() => window.innerWidth < 1024 && onClose()}
        className={({ isActive: navIsActive }) =>
          cn(
            'group flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200',
            isChild ? 'py-2' : 'py-2.5',
            navIsActive
              ? isChild
                ? 'bg-primary-50 text-primary-700'
                : 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )
        }
      >
        {({ isActive: navIsActive }) => (
          <>
            {!isChild && (
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                navIsActive ? 'bg-primary-100' : 'bg-gray-100 group-hover:bg-gray-200'
              )}>
                <Icon className={cn(
                  'w-4 h-4 transition-colors',
                  navIsActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                )} />
              </div>
            )}
            {isChild && (
              <Icon className={cn(
                'w-4 h-4 transition-colors',
                navIsActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
              )} />
            )}
            <span className="flex-1">{item.name}</span>
            {!isChild && !hasChildren && (
              <ChevronRight className={cn(
                'w-4 h-4 transition-all duration-200',
                navIsActive
                  ? 'text-primary-400 opacity-100'
                  : 'text-gray-300 opacity-0 group-hover:opacity-100'
              )} />
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-72 bg-white border-r border-gray-200 shadow-xl lg:shadow-none transition-all duration-300 ease-in-out flex flex-col',
          'lg:translate-x-0 lg:fixed lg:z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>

              <span className="text-xs text-gray-500 block -mt-0.5">Admin Panel</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {filteredNavigation.map((item) => renderNavItem(item))}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 p-4 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center ring-2 ring-white">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <div className="flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            <LogOut className={cn('w-4 h-4', loggingOut && 'animate-pulse')} />
            {loggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>
    </>
  );
}
