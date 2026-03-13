export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROLES = {
  USER: 'user',
  SUBSCRIBED_USER: 'subscribed_user',
  MANAGER: 'manager',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
} as const;

export const ROLE_HIERARCHY: Record<string, number> = {
  [ROLES.USER]: 1,
  [ROLES.SUBSCRIBED_USER]: 2,
  [ROLES.MANAGER]: 3,
  [ROLES.ADMIN]: 4,
  [ROLES.SUPERADMIN]: 5,
};

// Minimum role required for admin dashboard access
export const MIN_ADMIN_ROLE = ROLES.MANAGER;

export const PERMISSIONS = {
  // Content management
  CREATE_post: 'create_post',
  EDIT_post: 'edit_post',
  DELETE_post: 'delete_post',
  PUBLISH_post: 'publish_post',
  CREATE_Review: 'create_Review',
  EDIT_Review: 'edit_Review',
  DELETE_Review: 'delete_Review',
  PUBLISH_Review: 'publish_Review',
  CREATE_RESOURCE: 'create_resource',
  CREATE_ARTICLE: 'create_article',
  EDIT_RESOURCE: 'edit_resource',
  DELETE_RESOURCE: 'delete_resource',
  PUBLISH_RESOURCE: 'publish_resource',
  CREATE_UPDATE: 'create_update',
  EDIT_UPDATE: 'edit_update',
  DELETE_UPDATE: 'delete_update',
  APPROVE_TESTIMONIAL: 'approve_testimonial',
  DELETE_TESTIMONIAL: 'delete_testimonial',
  MODERATE_COMMENTS: 'moderate_comments',

  // Job management
  CREATE_JOB: 'create_job',
  EDIT_JOB: 'edit_job',
  DELETE_JOB: 'delete_job',
  VIEW_APPLICATIONS: 'view_applications',
  MANAGE_APPLICATIONS: 'manage_applications',

  // User management
  VIEW_USERS: 'view_users',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  CHANGE_USER_ROLE: 'change_user_role',
  BAN_USER: 'ban_user',
  VIEW_ADMINS: 'view_admins',
  CREATE_ADMIN: 'create_admin',
  DELETE_ADMIN: 'delete_admin',

  // Settings
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',

  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_REVENUE: 'view_revenue',

  // Payments
  VIEW_ALL_PAYMENTS: 'view_all_payments',
  REFUND_PAYMENT: 'refund_payment',

  // Contact/Newsletter
  VIEW_CONTACTS: 'view_contacts',
  RESPOND_CONTACTS: 'respond_contacts',
  VIEW_SUBSCRIBERS: 'view_subscribers',
  EXPORT_SUBSCRIBERS: 'export_subscribers',
} as const;

// Navigation item type with children support
export interface NavItem {
  name: string;
  href: string;
  icon: string;
  permission: string | null;
  children?: NavItem[];
  badge?: string; // For showing counts like "5 new"
}

// Navigation configuration with hierarchical structure
export const NAVIGATION: Record<string, NavItem[]> = {
  website: [
    // Dashboard
    {
      name: 'Dashboard',
      href: '/website/dashboard',
      icon: 'LayoutDashboard',
      permission: null
    },

    // Reviews
    {
      name: 'Reviews',
      href: '/website/Reviews',
      icon: 'UserStar',
      permission: PERMISSIONS.CREATE_Review,
    },
    {
      name: 'Upload',
      href: '/website/uploads',
      icon: 'Upload',
      permission: PERMISSIONS.VIEW_USERS,
    },

    // Users & Access
    {
      name: 'Companies',
      href: '/website/users',
      icon: 'Users',
      permission: PERMISSIONS.VIEW_USERS,
      children: [
        { name: 'All Companies', href: '/website/users', icon: 'List', permission: PERMISSIONS.VIEW_USERS },
        { name: 'Admins', href: '/website/users/admins', icon: 'Shield', permission: PERMISSIONS.VIEW_ADMINS },
        { name: 'Tiers', href: '/website/users/roles', icon: 'Key', permission: PERMISSIONS.VIEW_ADMINS },
      ]
    },

    // Reports
    {
      name: 'Reports',
      href: '/website/reports',
      icon: 'BarChart3',
      permission: PERMISSIONS.VIEW_ANALYTICS,
      children: [
        { name: 'Overview', href: '/website/reports', icon: 'PieChart', permission: PERMISSIONS.VIEW_ANALYTICS },
        { name: 'TDS Report', href: '/website/reports/tds', icon: 'FileText', permission: PERMISSIONS.VIEW_ANALYTICS },
        { name: 'Company PAN Register Report', href: '/website/reports/company-pan-register', icon: 'FileCheck', permission: PERMISSIONS.VIEW_ANALYTICS },
        { name: 'Company Document Register', href: '/website/reports/company-document-register', icon: 'FolderTree', permission: PERMISSIONS.VIEW_ANALYTICS },
        { name: 'Pending Tax Report', href: '/website/reports/pending-tax', icon: 'Clock', permission: PERMISSIONS.VIEW_ANALYTICS },
        { name: 'Tax Payment History', href: '/website/reports/tax-payment-history', icon: 'Receipt', permission: PERMISSIONS.VIEW_REVENUE },
        { name: 'Compliance Status Report', href: '/website/reports/compliance-status', icon: 'ToggleLeft', permission: PERMISSIONS.VIEW_ANALYTICS },
        { name: 'Company Registration Report', href: '/website/reports/company-registration', icon: 'FileText', permission: PERMISSIONS.VIEW_ANALYTICS },
        { name: 'GST Filing Report', href: '/website/reports/gst-filing', icon: 'Receipt', permission: PERMISSIONS.VIEW_REVENUE },
        { name: 'Document Expiry Report', href: '/website/reports/document-expiry', icon: 'Clock', permission: PERMISSIONS.VIEW_ANALYTICS },
        { name: 'Audit Report', href: '/website/reports/audit', icon: 'FileCheck', permission: PERMISSIONS.VIEW_ANALYTICS },
        { name: 'User Activity Report', href: '/website/reports/user-activity', icon: 'Users', permission: PERMISSIONS.VIEW_ANALYTICS },
      ]
    },
  ],
  tracker: [
    { name: 'Dashboard', href: '/tracker', icon: 'LayoutDashboard', permission: null },
    {
      name: 'articles',
      href: '/tracker/articles',
      icon: 'FileText',
      permission: PERMISSIONS.CREATE_ARTICLE,
    },
    { name: 'Users', href: '/tracker/users', icon: 'Users', permission: PERMISSIONS.VIEW_USERS },
    { name: 'Analytics', href: '/tracker/analytics', icon: 'BarChart3', permission: PERMISSIONS.VIEW_ANALYTICS },
    { name: 'Settings', href: '/tracker/settings', icon: 'Settings', permission: PERMISSIONS.VIEW_SETTINGS },
  ],
};

// Categories for content types - must match backend constants exactly
export const ARTICLE_CATEGORIES = [
  { value: 'Current Affairs', label: 'Current Affairs' },
  { value: 'Strategy', label: 'Strategy' },
  { value: 'Study Tips', label: 'Study Tips' },
  { value: 'Test Series', label: 'Test Series' },
  { value: 'Free Classes', label: 'Free Classes' },
  { value: 'Polity', label: 'Polity' },
  { value: 'History', label: 'History' },
  { value: 'Geography', label: 'Geography' },
  { value: 'Economy', label: 'Economy' },
  { value: 'Science', label: 'Science' },
  { value: 'Environment', label: 'Environment' },
  { value: 'Ethics', label: 'Ethics' },
];
export const post_CATEGORIES = [
  { value: 'Current Affairs', label: 'Current Affairs' },
  { value: 'Strategy', label: 'Strategy' },
  { value: 'Study Tips', label: 'Study Tips' },
  { value: 'Test Series', label: 'Test Series' },
  { value: 'Free Classes', label: 'Free Classes' },
  { value: 'Polity', label: 'Polity' },
  { value: 'History', label: 'History' },
  { value: 'Geography', label: 'Geography' },
  { value: 'Economy', label: 'Economy' },
  { value: 'Science', label: 'Science' },
  { value: 'Environment', label: 'Environment' },
  { value: 'Ethics', label: 'Ethics' },
];

export const Review_CATEGORIES = [
  { value: 'UPSC CSE', label: 'UPSC CSE' },
  { value: 'Prelims', label: 'Prelims' },
  { value: 'Mains', label: 'Mains' },
  { value: 'Optional', label: 'Optional' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Foundation', label: 'Foundation' },
  { value: 'Test Series', label: 'Test Series' },
  { value: 'Crash Review', label: 'Crash Review' },
];

export const RESOURCE_TYPES = [
  { value: 'PDF', label: 'PDF' },
  { value: 'Video', label: 'Video' },
  { value: 'Notes', label: 'Notes' },
  { value: 'WAM', label: 'WAM' },
  { value: 'Link', label: 'External Link' },
];

// Values must match backend constants exactly
export const JOB_DEPARTMENTS = [
  { value: 'Content Team', label: 'Content Team' },
  { value: 'Media Team', label: 'Media Team' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Academic', label: 'Academic' },
];

export const JOB_TYPES = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Internship', label: 'Internship' },
];

export const APPLICATION_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'reviewing', label: 'Reviewing', color: 'blue' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'yellow' },
  { value: 'hired', label: 'Hired', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
];

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'gray' },
];

export const SUBSCRIPTION_PLANS = [
  { value: 'basic', label: 'Basic', color: 'gray' },
  { value: 'pro', label: 'Pro', color: 'blue' },
  { value: 'premium', label: 'Premium', color: 'purple' },
  { value: 'tracker_pro', label: 'Tracker Pro', color: 'green' },
];
