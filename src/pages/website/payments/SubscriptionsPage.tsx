import { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, XCircle, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Button, Badge, Card, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, ModalFooter
} from '../../../components/ui';
import { paymentsService } from '../../../services';
import { format } from 'date-fns';

interface Subscription {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  plan: string;
  planName?: string;
  billingCycle: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  nextBillingDate?: string;
  status: string;
  autoRenew: boolean;
  createdAt: string;
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  active: 'success',
  expired: 'warning',
  cancelled: 'danger',
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState<{ open: boolean; subscription: Subscription | null }>({
    open: false,
    subscription: null,
  });

  // Stats
  const [stats, setStats] = useState({
    active: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchSubscriptions();
  }, [search, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { limit: 50 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await paymentsService.getSubscriptions(params);
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setSubscriptions(data);

        // Calculate stats
        const active = data.filter((s: Subscription) => s.status === 'active').length;
        const totalRevenue = data
          .filter((s: Subscription) => s.status === 'active')
          .reduce((sum: number, s: Subscription) => sum + (s.amount || 0), 0);
        setStats({ active, totalRevenue });
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast.error('Failed to load subscriptions');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal.subscription) return;
    try {
      await paymentsService.cancelSubscription(cancelModal.subscription._id);
      toast.success('Subscription cancelled successfully');
      setCancelModal({ open: false, subscription: null });
      fetchSubscriptions();
    } catch {
      toast.error('Failed to cancel subscription');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatBillingCycle = (cycle: string) => {
    const cycleMap: Record<string, string> = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
      lifetime: 'Lifetime',
      'one-time': 'One-time',
    };
    return cycleMap[cycle] || cycle;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-gray-600">Manage customer subscriptions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Subscription Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : subscriptions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {subscription.user?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{subscription.user?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{subscription.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{subscription.planName || subscription.plan || 'N/A'}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">
                        {formatBillingCycle(subscription.billingCycle)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{formatCurrency(subscription.amount)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[subscription.status] || 'default'}>
                        {subscription.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : 'Unknown'}
                      </Badge>
                      {subscription.autoRenew && subscription.status === 'active' && (
                        <p className="text-xs text-gray-500 mt-1">Auto-renew</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-gray-600">
                          {subscription.startDate ? format(new Date(subscription.startDate), 'MMM d, yyyy') : 'N/A'}
                        </p>
                        <p className="text-gray-400">
                          to {subscription.endDate ? format(new Date(subscription.endDate), 'MMM d, yyyy') : 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {subscription.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancelModal({ open: true, subscription })}
                            className="text-red-600 hover:text-red-700"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No subscriptions found
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, subscription: null })}
        title="Cancel Subscription"
      >
        <p className="text-gray-600">
          Are you sure you want to cancel this subscription? The customer will retain access until the end of the current billing period.
        </p>
        {cancelModal.subscription && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">{cancelModal.subscription.user?.name}</p>
            <p className="text-sm text-gray-500">{cancelModal.subscription.planName || cancelModal.subscription.plan}</p>
            <p className="text-sm text-gray-500">
              Ends: {cancelModal.subscription.endDate ? format(new Date(cancelModal.subscription.endDate), 'MMM d, yyyy') : 'N/A'}
            </p>
          </div>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setCancelModal({ open: false, subscription: null })}>
            Keep Subscription
          </Button>
          <Button
            variant="primary"
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700"
          >
            Cancel Subscription
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
