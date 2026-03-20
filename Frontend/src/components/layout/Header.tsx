import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Search, ChevronRight, Home, X, Command } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

// Breadcrumb configuration
const breadcrumbLabels: Record<string, string> = {
  website: 'Website',

  post: 'post',
  Reviews: 'Reviews',
  resources: 'Resources',
  testimonials: 'Testimonials',
  updates: 'Updates',
  jobs: 'Jobs',
  applications: 'Applications',
  comments: 'Comments',
  contacts: 'Contacts',
  users: 'Users',
  settings: 'Settings',
  new: 'Create New',
  edit: 'Edit',
};

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Generate breadcrumbs from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    // Check if it's a dynamic segment (like an ID)
    const isDynamic = /^[a-f0-9]{24}$/.test(segment);
    const label = isDynamic ? 'Details' : (breadcrumbLabels[segment] || segment);
    return { label, path, isDynamic };
  });

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/80">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <Link
                to="/website"
                className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Home className="w-4 h-4" />
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center gap-1">
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-gray-900">{title || crumb.label}</span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile title */}
            {title && (
              <h1 className="md:hidden text-lg font-semibold text-gray-900">{title}</h1>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-3 px-4 py-2 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search...</span>
              <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium bg-white rounded border border-gray-200 text-gray-400">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>

            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* User avatar (desktop) */}
            <div className="hidden lg:flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center ring-2 ring-gray-100">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50"
            onClick={() => setSearchOpen(false)}
          />
          <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search post, Reviews, users..."
                  className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                {searchQuery ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Quick Links
                      </p>
                      <div className="space-y-1">
                        {[
                          { label: 'Create post', path: '/website/post/new' },
                          { label: 'View Users', path: '/website/users' },
                          { label: 'Contact Messages', path: '/website/contacts' },
                        ].map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Press ESC to close</span>
                  <span>
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200">Enter</kbd> to search
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
