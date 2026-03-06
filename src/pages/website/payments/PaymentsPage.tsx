import { useState, useEffect } from 'react';
import {
  Search, CreditCard, Receipt, RefreshCw, RotateCcw, Eye, Download,
  CheckCircle, XCircle, Clock, AlertCircle, IndianRupee, TrendingUp, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Button, Badge, Card, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, ModalFooter, Input
} from '../../../components/ui';
import { format } from 'date-fns';
import { apiService } from '../../../services/api';

interface Payment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderId: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentGateway: string;
  itemType: 'Review' | 'Subscription' | 'Plan';
  itemId: string;
  itemName?: string;
  paidAt?: string;
  createdAt: string;
  refundId?: string;
  refundAmount?: number;
  refundedAt?: string;
  refundReason?: string;
}

interface Subscription {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  plan: string;
  planName: string;
  billingCycle: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
  createdAt: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  payment?: {
    orderId: string;
    razorpayPaymentId: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled';
  paidDate?: string;
  createdAt: string;
}

type TabType = 'transactions' | 'subscriptions' | 'invoices';

const paymentStatusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  failed: { color: 'bg-red-100 text-red-700', icon: XCircle },
  refunded: { color: 'bg-gray-100 text-gray-700', icon: RotateCcw },
};

const subscriptionStatusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  active: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  expired: { color: 'bg-gray-100 text-gray-700', icon: Clock },
  cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle },
};

const invoiceStatusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  paid: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle },
};

const defaultStatusConfig = { color: 'bg-gray-100 text-gray-700', icon: Clock };

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewModal, setViewModal] = useState<{ open: boolean; payment: Payment | null }>({
    open: false,
    payment: null,
  });
  const [refundModal, setRefundModal] = useState<{ open: boolean; payment: Payment | null }>({
    open: false,
    payment: null,
  });
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    successRate: 0,
  });

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', '50');
      const queryString = params.toString();

      if (activeTab === 'transactions') {
        const response = await apiService.get<Payment[]>(`/payments/admin/all?${queryString}`);
        if (response.success && response.data) {
          const paymentsData = Array.isArray(response.data) ? response.data : [];
          setPayments(paymentsData);
        } else {
          setPayments([]);
        }
      } else if (activeTab === 'subscriptions') {
        const response = await apiService.get<Subscription[]>(`/payments/admin/subscriptions?${queryString}`);
        if (response.success && response.data) {
          const subsData = Array.isArray(response.data) ? response.data : [];
          setSubscriptions(subsData);
        } else {
          setSubscriptions([]);
        }
      } else if (activeTab === 'invoices') {
        const response = await apiService.get<Invoice[]>(`/payments/admin/invoices?${queryString}`);
        if (response.success && response.data) {
          const invoicesData = Array.isArray(response.data) ? response.data : [];
          setInvoices(invoicesData);
        } else {
          setInvoices([]);
        }
      }

      // Fetch stats (only once, not per tab)
      if (activeTab === 'transactions') {
        try {
          const statsResponse = await apiService.get<{ stats: { totalRevenue: number; monthlyRevenue: number; totalTransactions: number; successRate: number } }>('/payments/admin/stats');
          if (statsResponse.success && statsResponse.data?.stats) {
            setStats({
              totalRevenue: statsResponse.data.stats.totalRevenue || 0,
              monthlyRevenue: statsResponse.data.stats.monthlyRevenue || 0,
              totalTransactions: statsResponse.data.stats.totalTransactions || 0,
              successRate: statsResponse.data.stats.successRate || 0,
            });
          }
        } catch (statsError) {
          console.error('Failed to fetch payment stats:', statsError);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundModal.payment) return;
    try {
      await apiService.post(`/payments/admin/${refundModal.payment._id}/refund`, {
        reason: refundReason,
        amount: parseFloat(refundAmount),
      });
      toast.success('Refund initiated successfully');
      setRefundModal({ open: false, payment: null });
      setRefundAmount('');
      setRefundReason('');
      fetchData();
    } catch (error) {
      console.error('Failed to process refund:', error);
      toast.error('Failed to process refund');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const tabs = [
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
    { id: 'invoices', label: 'Invoices', icon: FileText },
  ] as const;

  const getStatusOptions = () => {
    if (activeTab === 'transactions') {
      return ['completed', 'pending', 'failed', 'refunded'];
    } else if (activeTab === 'subscriptions') {
      return ['active', 'expired', 'cancelled'];
    } else {
      return ['paid', 'pending', 'cancelled'];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Manage transactions, subscriptions, and invoices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-xs text-gray-500">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
                <p className="text-xs text-gray-500">Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                <p className="text-xs text-gray-500">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 -mb-px">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setStatusFilter('');
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              {getStatusOptions().map(status => (
                <option key={status} value={status} className="capitalize">{status}</option>
              ))}
            </select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {activeTab === 'transactions' && (
                <>
                  <TableHead>Order ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </>
              )}
              {activeTab === 'subscriptions' && (
                <>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </>
              )}
              {activeTab === 'invoices' && (
                <>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : activeTab === 'transactions' ? (
              payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => {
                  const status = paymentStatusConfig[payment.status] || defaultStatusConfig;
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={payment._id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm font-medium">{payment.orderId}</p>
                          {payment.transactionId && (
                            <p className="text-xs text-gray-500">{payment.transactionId}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{payment.user?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{payment.user?.email || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-gray-900">{payment.itemName || 'N/A'}</p>
                          <p className="text-xs text-gray-500 capitalize">{payment.itemType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.paidAt || payment.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewModal({ open: true, payment })}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {payment.status === 'completed' && (
                            <button
                              onClick={() => {
                                setRefundModal({ open: true, payment });
                                setRefundAmount(payment.amount.toString());
                              }}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                              title="Refund"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )
            ) : activeTab === 'subscriptions' ? (
              subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => {
                  const status = subscriptionStatusConfig[sub.status] || defaultStatusConfig;
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={sub._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{sub.user?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{sub.user?.email || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{sub.planName || sub.plan || 'N/A'}</p>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{sub.billingCycle || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{formatCurrency(sub.amount || 0)}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sub.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {sub.startDate ? format(new Date(sub.startDate), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {sub.endDate ? format(new Date(sub.endDate), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )
            ) : (
              invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => {
                  const status = invoiceStatusConfig[invoice.status] || defaultStatusConfig;
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={invoice._id}>
                      <TableCell>
                        <p className="font-mono text-sm font-medium">{invoice.invoiceNumber || 'N/A'}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{invoice.user?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{invoice.user?.email || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {(invoice.items || []).map((item, idx) => (
                            <p key={idx} className="text-sm">{item.name} x{item.quantity}</p>
                          ))}
                          {(!invoice.items || invoice.items.length === 0) && <span className="text-gray-400">-</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{formatCurrency(invoice.total || 0)}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {invoice.paidDate || invoice.createdAt ? format(new Date(invoice.paidDate || invoice.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                            title="Download Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )
            )}
          </TableBody>
        </Table>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, payment: null })}
        title="Payment Details"
      >
        {viewModal.payment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Order ID</label>
                <p className="font-mono">{viewModal.payment.orderId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                <p className="font-mono">{viewModal.payment.transactionId || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="font-semibold">{formatCurrency(viewModal.payment.amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge variant={viewModal.payment.status === 'completed' ? 'success' : 'warning'}>
                  {viewModal.payment.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Method</label>
                <p>{viewModal.payment.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gateway</label>
                <p>{viewModal.payment.paymentGateway}</p>
              </div>
            </div>
            <hr />
            <div>
              <label className="text-sm font-medium text-gray-500">Customer</label>
              <p>{viewModal.payment.user?.name || 'N/A'}</p>
              <p className="text-sm text-gray-500">{viewModal.payment.user?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Item Purchased</label>
              <p>{viewModal.payment.itemName}</p>
              <p className="text-sm text-gray-500 capitalize">{viewModal.payment.itemType}</p>
            </div>
            {viewModal.payment.status === 'refunded' && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-sm font-medium text-gray-500">Refund Details</label>
                <p>Amount: {formatCurrency(viewModal.payment.refundAmount || 0)}</p>
                <p className="text-sm text-gray-500">Reason: {viewModal.payment.refundReason || 'N/A'}</p>
                {viewModal.payment.refundedAt && (
                  <p className="text-sm text-gray-500">Date: {format(new Date(viewModal.payment.refundedAt), 'MMM d, yyyy')}</p>
                )}
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setViewModal({ open: false, payment: null })}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={refundModal.open}
        onClose={() => setRefundModal({ open: false, payment: null })}
        title="Process Refund"
        size="sm"
      >
        {refundModal.payment && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                This action will refund the payment to the customer's original payment method.
              </p>
            </div>
            <Input
              label="Refund Amount (₹)"
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              max={refundModal.payment.amount}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Reason for refund..."
              />
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setRefundModal({ open: false, payment: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRefund}>
            Process Refund
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
