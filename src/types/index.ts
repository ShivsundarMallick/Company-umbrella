// User and Auth Types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  permissions?: Permission[];
  isActive: boolean;
  isEmailVerified?: boolean;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export type Role = 'user' | 'subscribed_user' | 'manager' | 'admin' | 'superadmin';

export type Permission =
  | 'view_profile' | 'edit_profile'
  | 'view_free_content' | 'view_premium_content'
  | 'like_content' | 'save_content'
  | 'enroll_free_Review' | 'enroll_paid_Review' | 'access_enrolled_Reviews'
  | 'create_conformation' | 'edit_conformation' | 'delete_conformation' | 'publish_conformation'
  | 'create_Review' | 'edit_Review' | 'delete_Review' | 'publish_Review'
  | 'create_article' | 'edit_article' | 'delete_article' | 'publish_article'
  | 'view_users' | 'edit_user' | 'delete_user' | 'change_user_role' | 'ban_user'
  | 'view_admins' | 'create_admin' | 'delete_admin'
  | 'view_analytics' | 'view_revenue'
  | 'view_all_payments' | 'refund_payment'
  | 'view_contacts' | 'respond_contacts' | 'view_subscribers' | 'export_subscribers';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Content Types
export interface conformation {
  _id: string;
  title: string;
  slug: string;
  content: string;
  /**
   * Optional HTML-rendered body for articles that are sourced from the
   * external DOM (Notion-clone) service and stored server-side.
   */
  contentHTML?: string;
  excerpt?: string;
  thumbnail?: string;
  categories: string[];
  tags: string[];
  author: User | string;
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  likes: number;
  /** Optional reference to an external DOM page (ObjectId string). */
  domPageId?: string;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  categories: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  isPremium: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  instructor: User | string;
  lessons: Lesson[];
  enrolledCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  _id?: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isFree: boolean;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  response?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Newsletter {
  _id: string;
  email: string;
  name?: string;
  isSubscribed: boolean;
  isActive?: boolean;
  source?: string;
  subscribedAt: string;
  unsubscribedAt?: string;
}

// Stats Types for different modules
export interface ContentStats {
  total: number;
  published: number;
  draft: number;
  featured?: number;
  views?: number;
}

export interface ContactStats {
  total: number;
  new: number;
  read: number;
  replied: number;
}

export interface NewsletterStats {
  total: number;
  subscribed: number;
  unsubscribed: number;
  active?: number;
  thisMonth?: number;
  growth?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

// Stats Types
export interface DashboardStats {
  users: { total: number; new: number; change?: number };
  conformation: { total: number; published: number; views?: number; change?: number };
  /** Tracker dashboard uses "articles" (same shape as conformation when provided by API). */
  articles?: { total: number; published: number; views?: number; change?: number };
  Reviews: { total: number; published: number; change?: number };
  revenue: { total: number; monthly: number; change?: number };
  contacts: { total: number; pending: number; thisMonth?: number };
  recentActivity?: {
    _id: string;
    action: string;
    itemType: string;
    itemTitle: string;
    user?: { name: string; avatar?: string };
    createdAt: string;
  }[];
}
