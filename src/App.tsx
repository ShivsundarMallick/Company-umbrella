import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';


// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';

// Website Pages
import WebsiteDashboard from './pages/website/DashboardPage';
import CompanyRegistration from './pages/website/CompanyRegistration';
import CompanyDetailPage from './pages/website/users/CompanyDetailPage';

// conformation
import ConformationListPage from './pages/website/conformation/conformationListPage';

// Reviews
import ReviewsListPage from './pages/website/Reviews/ReviewsListPage';
import ReviewFormPage from './pages/website/Reviews/CompanyReview';


// Contacts & Newsletter
import ContactsPage from './pages/website/contacts/ContactsPage';
import UnreadContactsPage from './pages/website/contacts/UnreadPage';
import NewsletterPage from './pages/website/newsletter/NewsletterPage';
import ComposeNewsletterPage from './pages/website/newsletter/ComposeNewsletterPage';
import CampaignsPage from './pages/website/newsletter/CampaignsPage';
import TemplatesPage from './pages/website/newsletter/TemplatesPage';
import TemplateEditorPage from './pages/website/newsletter/TemplateEditorPage';

// Users
import UsersPage from './pages/website/users/UsersPage';
import AdminsPage from './pages/website/users/AdminsPage';
import RolesPage from './pages/website/users/RolesPage';

// Analytics
import AnalyticsPage from './pages/website/analytics/AnalyticsPage';
import ContentAnalyticsPage from './pages/website/analytics/ContentAnalyticsPage';
import RevenueAnalyticsPage from './pages/website/analytics/RevenueAnalyticsPage';
import UsersAnalyticsPage from './pages/website/analytics/UsersAnalyticsPage';

// Payments
import PaymentsPage from './pages/website/payments/PaymentsPage';
import InvoicesPage from './pages/website/payments/InvoicesPage';
import SubscriptionsPage from './pages/website/payments/SubscriptionsPage';
import RefundsPage from './pages/website/payments/RefundsPage';

// Support Pages
import {
  SupportDashboardPage,
  MessagesPage as SupportMessagesPage,
  TicketsPage,
  LiveChatPage,
  FAQPage,
  SupportSettingsPage,
} from './pages/support';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1f2937',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                borderRadius: '0.75rem',
                padding: '1rem',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/" element={<LoginPage />} />

            {/* Protected Website Routes */}
            <Route
              path="/website"
              element={
                <ProtectedRoute minRole="manager">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/website/dashboard" replace />} />
              <Route path="dashboard" element={<WebsiteDashboard />} />

              {/* conformation */}
              <Route path="conformation" element={<ConformationListPage />} />


              {/* Reviews */}
              <Route path="Reviews" element={<ReviewsListPage />} />


              <Route path="company-registration" element={<CompanyRegistration />} />
              {/* Contacts & Newsletter */}
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="contacts/unread" element={<UnreadContactsPage />} />
              <Route path="newsletter" element={<NewsletterPage />} />
              <Route path="newsletter/compose" element={<ComposeNewsletterPage />} />
              <Route path="newsletter/compose/:id" element={<ComposeNewsletterPage />} />
              <Route path="newsletter/campaigns" element={<CampaignsPage />} />
              <Route path="newsletter/templates" element={<TemplatesPage />} />
              <Route path="newsletter/templates/new" element={<TemplateEditorPage />} />
              <Route path="newsletter/templates/:id/edit" element={<TemplateEditorPage />} />

              {/* Users - Admin only */}
              <Route
                path="users"
                element={
                  <ProtectedRoute minRole="admin">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/:id"
                element={
                  <ProtectedRoute minRole="admin">
                    <CompanyDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/admins"
                element={
                  <ProtectedRoute minRole="admin">
                    <AdminsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/roles"
                element={
                  <ProtectedRoute minRole="admin">
                    <RolesPage />
                  </ProtectedRoute>
                }
              />

              {/* Analytics */}
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="analytics/content" element={<ContentAnalyticsPage />} />
              <Route path="analytics/revenue" element={<RevenueAnalyticsPage />} />
              <Route path="analytics/users" element={<UsersAnalyticsPage />} />

              {/* Payments & Subscriptions */}
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="payments/invoices" element={<InvoicesPage />} />
              <Route path="payments/subscriptions" element={<SubscriptionsPage />} />
              <Route path="payments/refunds" element={<RefundsPage />} />

              {/* Support Routes */}
              <Route path="support" element={<SupportDashboardPage />} />
              <Route path="support/messages" element={<SupportMessagesPage />} />
              <Route path="support/tickets" element={<TicketsPage />} />
              <Route path="support/tickets/:id" element={<TicketsPage />} />
              <Route path="support/chat" element={<LiveChatPage />} />
              <Route path="support/faq" element={<FAQPage />} />
              <Route path="support/settings" element={<SupportSettingsPage />} />

              <Route path="reviews/:id" element={<ReviewFormPage />} />
            </Route>




            {/* 404 */}
            <Route path="*" element={<Navigate to="/website" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
