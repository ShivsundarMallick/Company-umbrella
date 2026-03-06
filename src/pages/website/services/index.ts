import { apiService, buildQueryString } from './api';
import type {
  conformation, Review,
  Contact, Newsletter, User, DashboardStats,
  ListParams, ContentStats,
  ContactStats, NewsletterStats
} from '@/types';

// conformation Service
export const conformationService = {
  getAll: (params?: ListParams) =>
    apiService.get<conformation[]>(`/conformation?${buildQueryString(params || {})}`),
  getById: (id: string) => apiService.get<conformation>(`/conformation/${id}`),
  create: (data: Partial<conformation>) => apiService.post<conformation>('/conformation', data),
  update: (id: string, data: Partial<conformation>) => apiService.put<conformation>(`/conformation/${id}`, data),
  delete: (id: string) => apiService.delete<void>(`/conformation/${id}`),
  togglePublish: (id: string) => apiService.put<conformation>(`/conformation/${id}/publish`),
  toggleFeatured: (id: string) => apiService.put<conformation>(`/conformation/${id}/featured`),
  getStats: () => apiService.get<ContentStats>('/conformation/admin/stats'),
};
export const articlesService = {
  getAll: (params?: ListParams) =>
    apiService.get<conformation[]>(`/article?${buildQueryString(params || {})}`),
  getById: (id: string) => apiService.get<conformation>(`/article/${id}`),
  create: (data: Partial<conformation>) => apiService.post<conformation>('/article', data),
  update: (id: string, data: Partial<conformation>) => apiService.put<conformation>(`/article/${id}`, data),
  delete: (id: string) => apiService.delete<void>(`/article/${id}`),
  togglePublish: (id: string) => apiService.put<conformation>(`/article/${id}/publish`),
  toggleFeatured: (id: string) => apiService.put<conformation>(`/article/${id}/featured`),
  getStats: () => apiService.get<ContentStats>('/article/admin/stats'),
};

// Reviews Service
export const ReviewsService = {
  getAll: (params?: ListParams) =>
    apiService.get<Review[]>(`/Reviews?${buildQueryString(params || {})}`),
  getById: (id: string) => apiService.get<Review>(`/Reviews/${id}`),
  create: (data: Partial<Review>) => apiService.post<Review>('/Reviews', data),
  update: (id: string, data: Partial<Review>) => apiService.put<Review>(`/Reviews/${id}`, data),
  delete: (id: string) => apiService.delete<void>(`/Reviews/${id}`),
  togglePublish: (id: string) => apiService.put<Review>(`/Reviews/${id}/publish`),
  toggleFeatured: (id: string) => apiService.put<Review>(`/Reviews/${id}/featured`),
  getStats: () => apiService.get<ContentStats>('/Reviews/admin/stats'),
};

// Contacts Service
export const contactsService = {
  getAll: (params?: ListParams) =>
    apiService.get<Contact[]>(`/contact?${buildQueryString(params || {})}`),
  getById: (id: string) => apiService.get<Contact>(`/contact/${id}`),
  updateStatus: (id: string, status: string, response?: string) =>
    apiService.put<Contact>(`/contact/${id}/status`, { status, response }),
  delete: (id: string) => apiService.delete<void>(`/contact/${id}`),
  getStats: () => apiService.get<ContactStats>('/contact/stats'),

  // Newsletter
  getSubscribers: (params?: ListParams) =>
    apiService.get<Newsletter[]>(`/contact/newsletter/subscribers?${buildQueryString(params || {})}`),
  exportSubscribers: () => apiService.get<Blob>('/contact/newsletter/export', { responseType: 'blob' as const }),
  deleteSubscriber: (id: string) => apiService.delete<void>(`/contact/newsletter/${id}`),
  getNewsletterStats: () => apiService.get<NewsletterStats>('/contact/newsletter/stats'),
};

// Email Campaigns Service
export const emailCampaignsService = {
  getAll: (params?: ListParams) =>
    apiService.get<any>(`/email-campaigns?${buildQueryString(params || {})}`),
  getById: (id: string) => apiService.get<any>(`/email-campaigns/${id}`),
  create: (data: any) => apiService.post<any>('/email-campaigns', data),
  update: (id: string, data: any) => apiService.put<any>(`/email-campaigns/${id}`, data),
  delete: (id: string) => apiService.delete<void>(`/email-campaigns/${id}`),
  send: (id: string) => apiService.post<any>(`/email-campaigns/${id}/send`),
  sendTest: (id: string, email: string) => apiService.post<any>(`/email-campaigns/${id}/test`, { email }),
  duplicate: (id: string) => apiService.post<any>(`/email-campaigns/${id}/duplicate`),
  getStats: () => apiService.get<any>('/email-campaigns/stats'),
  previewRecipients: (recipients: any) => apiService.post<any>('/email-campaigns/preview-recipients', { recipients }),
};

// Users Service
export const usersService = {
  getAll: (params?: ListParams) =>
    apiService.get<User[]>(`/users?${buildQueryString(params || {})}`),
  getById: (id: string) => apiService.get<User>(`/users/${id}`),
  updateRole: (id: string, role: string) => apiService.put<User>(`/users/${id}/role`, { role }),
  toggleStatus: (id: string) => apiService.put<User>(`/users/${id}/status`),
  delete: (id: string) => apiService.delete<void>(`/users/${id}`),
  getStats: () => apiService.get<DashboardStats>('/users/stats'),
};

// Payments Service
export const paymentsService = {
  // Transactions (admin)
  getAll: (params?: ListParams) =>
    apiService.get<any[]>(`/payments/admin/all?${buildQueryString(params || {})}`),
  getStats: () =>
    apiService.get<any>(`/payments/admin/stats`),

  // Invoices (admin)
  getInvoices: (params?: ListParams) =>
    apiService.get<any[]>(`/payments/admin/invoices?${buildQueryString(params || {})}`),
  getInvoiceById: (id: string) => apiService.get<any>(`/payments/invoices/${id}`),

  // Subscriptions (admin)
  getSubscriptions: (params?: ListParams) =>
    apiService.get<any[]>(`/payments/admin/subscriptions?${buildQueryString(params || {})}`),
  getSubscriptionById: (id: string) => apiService.get<any>(`/payments/subscriptions/${id}`),
  cancelSubscription: (id: string) => apiService.put<any>(`/payments/subscriptions/${id}/cancel`),

  // Refunds (admin)
  getRefunds: (params?: ListParams) =>
    apiService.get<any[]>(`/payments/admin/all?status=refunded&${buildQueryString(params || {})}`),
  processRefund: (paymentId: string, data: { reason: string; amount?: number }) =>
    apiService.post<any>(`/payments/admin/${paymentId}/refund`, data),
};

// Engagement Service
export const engagementService = {
  getStats: () => apiService.get<{ totalEngagements: number; byType: Array<{ _id: string; engagements: Array<{ type: string; count: number }> }> }>('/engagement/admin/stats'),
};

// Permissions Service
export const permissionsService = {
  getAll: (params?: ListParams) =>
    apiService.get<any[]>(`/roles/permissions?${buildQueryString(params || {})}`),
  getById: (id: string) => apiService.get<any>(`/roles/permissions/${id}`),
  create: (data: any) => apiService.post<any>('/roles/permissions', data),
  update: (id: string, data: any) => apiService.put<any>(`/roles/permissions/${id}`, data),
  delete: (id: string) => apiService.delete<void>(`/roles/permissions/${id}`),
  getByCategory: () => apiService.get<any>('/roles/permissions/by-category'),
};

// Roles Service (enhanced)
export const rolesService = {
  getAll: (params?: ListParams) =>
    apiService.get<any[]>(`/roles?${buildQueryString(params || {})}`),
  getById: (id: string) => apiService.get<any>(`/roles/${id}`),
  create: (data: any) => apiService.post<any>('/roles', data),
  update: (id: string, data: any) => apiService.put<any>(`/roles/${id}`, data),
  delete: (id: string) => apiService.delete<void>(`/roles/${id}`),
  getPermissions: (id: string) => apiService.get<any[]>(`/roles/${id}/permissions`),
  assignPermissions: (id: string, permissionIds: string[]) =>
    apiService.put<any>(`/roles/${id}/permissions`, { permissions: permissionIds }),
};

// Helper to get auth token from either storage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Upload Service
export const uploadService = {
  /**
   * Upload a single file to cloud storage
   * @param file - File to upload
   * @param folder - Folder category (avatars, thumbnails, resources, magazines, Reviews, conformation, resumes)
   * @returns Promise with uploaded file URL and metadata
   */
  uploadFile: async (file: File, folder: string = 'resources'): Promise<{ url: string; filename: string; size: number; mimeType: string }> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/${folder}`, {
      method: 'conformation',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Upload failed with status ${response.status}` }));
      throw new Error(error.message || 'Upload failed');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Upload multiple files to cloud storage
   * @param files - Files to upload
   * @param folder - Folder category
   */
  uploadMultiple: async (files: File[], folder: string = 'resources'): Promise<{ url: string; filename: string; size: number; mimeType: string }[]> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/${folder}/multiple`, {
      method: 'conformation',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Upload failed with status ${response.status}` }));
      throw new Error(error.message || 'Upload failed');
    }

    const result = await response.json();
    return result.data.files;
  },

  /**
   * Delete a file from cloud storage
   * @param url - URL of file to delete
   */
  deleteFile: async (url: string): Promise<void> => {
    await apiService.delete('/upload', { data: { url } } as any);
  },
};

// Support System Services

// Contact Messages Service
export const contactMessagesService = {
  submit: (data: any) => apiService.post<any>('/contact-messages', data),
  getAll: (params?: ListParams) =>
    apiService.get<any>(`/contact-messages/admin/messages?${buildQueryString(params || {})}`),
  getStats: () => apiService.get<any>('/contact-messages/admin/messages/stats'),
  getById: (id: string) => apiService.get<any>(`/contact-messages/admin/messages/${id}`),
  updateStatus: (id: string, status: string) =>
    apiService.put<any>(`/contact-messages/admin/messages/${id}/status`, { status }),
  assign: (id: string, adminId: string) =>
    apiService.put<any>(`/contact-messages/admin/messages/${id}/assign`, { adminId }),
  reply: (id: string, message: string) =>
    apiService.post<any>(`/contact-messages/admin/messages/${id}/reply`, { message }),
  convertToTicket: (id: string) =>
    apiService.post<any>(`/contact-messages/admin/messages/${id}/convert-ticket`),
  delete: (id: string) => apiService.delete<void>(`/contact-messages/admin/messages/${id}`),
  bulkUpdateStatus: (ids: string[], status: string) =>
    apiService.post<any>('/contact-messages/admin/messages/bulk-status', { ids, status }),
};

// Support Tickets Service
export const ticketsService = {
  // Customer
  create: (data: any) => apiService.post<any>('/support/tickets', data),
  getMy: (params?: ListParams) =>
    apiService.get<any>(`/support/tickets/my?${buildQueryString(params || {})}`),
  getById: (id: string) => apiService.get<any>(`/support/tickets/${id}`),
  addMessage: (id: string, data: any) =>
    apiService.post<any>(`/support/tickets/${id}/messages`, data),

  // Admin
  getAll: (params?: ListParams) =>
    apiService.get<any>(`/support/admin/tickets?${buildQueryString(params || {})}`),
  getStats: () => apiService.get<any>('/support/admin/tickets/stats'),
  update: (id: string, data: any) =>
    apiService.put<any>(`/support/admin/tickets/${id}`, data),
  assign: (id: string, agentId: string) =>
    apiService.put<any>(`/support/admin/tickets/${id}/assign`, { agentId }),
  close: (id: string, reason?: string) =>
    apiService.post<any>(`/support/admin/tickets/${id}/close`, { reason }),
  delete: (id: string) => apiService.delete<void>(`/support/admin/tickets/${id}`),
};

// Live Chat Service
export const chatService = {
  // Public
  startSession: (data: any) => apiService.post<any>('/support/chat/sessions', data),
  getSession: (sessionId: string) => apiService.get<any>(`/support/chat/sessions/${sessionId}`),
  endSession: (sessionId: string) => apiService.post<any>(`/support/chat/sessions/${sessionId}/end`),
  rateSession: (sessionId: string, rating: number, feedback?: string) =>
    apiService.post<any>(`/support/chat/sessions/${sessionId}/rate`, { rating, feedback }),

  // Admin
  getAllSessions: (params?: ListParams) =>
    apiService.get<any>(`/support/admin/chat/sessions?${buildQueryString(params || {})}`),
  getActiveSessions: () => apiService.get<any>('/support/admin/chat/sessions/active'),
  getStats: () => apiService.get<any>('/support/admin/chat/stats'),
  assignAgent: (sessionId: string) =>
    apiService.put<any>(`/support/admin/chat/sessions/${sessionId}/assign`),
  endSessionAsAgent: (sessionId: string) =>
    apiService.post<any>(`/support/admin/chat/sessions/${sessionId}/end`),
  convertToTicket: (sessionId: string) =>
    apiService.post<any>(`/support/admin/chat/sessions/${sessionId}/convert-ticket`),
  updateStatus: (online: boolean) =>
    apiService.put<any>('/support/admin/chat/status', { online }),
  sendMessage: (sessionId: string, content: string) =>
    apiService.post<any>(`/support/admin/chat/sessions/${sessionId}/messages`, { content }),
  getMessages: (sessionId: string, after?: string) =>
    apiService.get<any>(`/support/admin/chat/sessions/${sessionId}/messages${after ? `?after=${after}` : ''}`),
};

// FAQ Service
export const faqService = {
  // Public
  getActive: (category?: string) =>
    apiService.get<any>(`/support/faq${category ? `?category=${category}` : ''}`),
  getCategories: () => apiService.get<any>('/support/faq/categories'),
  search: (query: string) => apiService.get<any>(`/support/faq/search?q=${encodeURIComponent(query)}`),
  markHelpful: (id: string, helpful: boolean) =>
    apiService.post<any>(`/support/faq/${id}/helpful`, { helpful }),

  // Admin
  getAll: (params?: ListParams) =>
    apiService.get<any>(`/support/admin/faq?${buildQueryString(params || {})}`),
  getStats: () => apiService.get<any>('/support/admin/faq/stats'),
  create: (data: any) => apiService.post<any>('/support/admin/faq', data),
  update: (id: string, data: any) => apiService.put<any>(`/support/admin/faq/${id}`, data),
  delete: (id: string) => apiService.delete<void>(`/support/admin/faq/${id}`),
  reorder: (category: string, orderedIds: string[]) =>
    apiService.put<any>('/support/admin/faq/reorder', { category, orderedIds }),
};

// Email Templates Service
export const emailTemplatesService = {
  // Public
  getActive: (category?: string) =>
    apiService.get<any>(`/email-templates${category ? `?category=${category}` : ''}`),

  // Admin
  getAll: (params?: ListParams) =>
    apiService.get<any>(`/email-templates/all?${buildQueryString(params || {})}`),
  getById: (id: string) => apiService.get<any>(`/email-templates/${id}`),
  create: (data: any) => apiService.post<any>('/email-templates', data),
  update: (id: string, data: any) => apiService.put<any>(`/email-templates/${id}`, data),
  delete: (id: string) => apiService.delete<void>(`/email-templates/${id}`),
  preview: (id: string, content?: string) =>
    apiService.post<any>(`/email-templates/${id}/preview`, { content }),
  duplicate: (id: string) => apiService.post<any>(`/email-templates/${id}/duplicate`),
  setDefault: (id: string) => apiService.put<any>(`/email-templates/${id}/set-default`),
};

// Support Service (AI Chat & Documents)
export const supportService = {
  // AI Status
  getAIStatus: () => apiService.get<any>('/support/admin/ai/status'),

  // AI Documents
  getAIDocuments: (params?: ListParams) =>
    apiService.get<any>(`/support/admin/ai/documents?${buildQueryString(params || {})}`),
  createAIDocument: (data: any) => apiService.post<any>('/support/admin/ai/documents', data),
  updateAIDocument: (id: string, data: any) => apiService.put<any>(`/support/admin/ai/documents/${id}`, data),
  deleteAIDocument: (id: string) => apiService.delete<void>(`/support/admin/ai/documents/${id}`),
  reprocessAIDocument: (id: string) => apiService.post<any>(`/support/admin/ai/documents/${id}/reprocess`),

  // AI Chat (for testing)
  sendAIMessage: (data: { message: string; sessionId?: string; conversationHistory?: any[]; documentIds?: string[] }) =>
    apiService.post<any>('/support/ai/chat', data),
};

export { authService } from './auth.service';
