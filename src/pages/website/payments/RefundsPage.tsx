import { useState, useEffect } from 'react';
import { RefreshCw, Search, Eye, Clock, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Button, Badge, Card, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, ModalFooter
} from '../../../components/ui';
import { paymentsService } from '../../../services';
import { format } from 'date-fns';

interface RefundedPayment {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  orderId: string;
  itemName?: string;
  itemType: string;
  amount: number;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  currency: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewModal, setViewModal] = useState<{ open: boolean; refund: RefundedPayment | null }>({
    open: false,
    refund: null,
  });
  const [totalRefunded, setTotalRefunded] = useState(0);

  useEffect(() => {
    fetchRefunds();
  }, [search]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await paymentsService.getRefunds({ search, limit: 50 });
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setRefunds(data);
        // Calculate total refunded
        const total = data.reduce((sum: number, r: RefundedPayment) => sum + (r.refundAmount || r.amount || 0), 0);
        setTotalRefunded(total);
      } else {
        setRefunds([]);
      }
    } catch (error) {
      console.error('Failed to fetch refunds:', error);
      toast.error('Failed to load refunds');
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
          <p className="text-gray-600">View processed refunds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Refunds</p>
                <p className="text-2xl font-bold text-gray-900">{refunds.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Refunded Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRefunded)}</p>
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
                placeholder="Search refunds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : refunds.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund) => (
                  <TableRow key={refund._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{refund.user?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{refund.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-sm">{refund.orderId || 'N/A'}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{refund.itemName || 'N/A'}</p>
                      <p className="text-xs text-gray-500 capitalize">{refund.itemType}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(refund.refundAmount || refund.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 line-clamp-1 max-w-xs">
                        {refund.refundReason || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        {refund.refundedAt ? format(new Date(refund.refundedAt), 'MMM d, yyyy') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewModal({ open: true, refund })}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No refunds found
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, refund: null })}
        title="Refund Details"
      >
        {viewModal.refund && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{viewModal.refund.user?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">{viewModal.refund.user?.email || 'N/A'}</p>
              </div>
              <Badge variant="warning">Refunded</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Refund Amount</p>
                <p className="font-semibold text-lg">{formatCurrency(viewModal.refund.refundAmount || viewModal.refund.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Original Amount</p>
                <p className="font-medium">{formatCurrency(viewModal.refund.amount)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-mono text-gray-700">{viewModal.refund.orderId || 'N/A'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Item Purchased</p>
              <p className="text-gray-700">{viewModal.refund.itemName || 'N/A'}</p>
              <p className="text-sm text-gray-500 capitalize">{viewModal.refund.itemType}</p>
            </div>

            {viewModal.refund.refundReason && (
              <div>
                <p className="text-sm text-gray-500">Reason for Refund</p>
                <p className="text-gray-700">{viewModal.refund.refundReason}</p>
              </div>
            )}

            <div className="text-sm text-gray-500">
              {viewModal.refund.paidAt && (
                <p>Original Payment: {format(new Date(viewModal.refund.paidAt), 'MMMM d, yyyy')}</p>
              )}
              {viewModal.refund.refundedAt && (
                <p>Refunded: {format(new Date(viewModal.refund.refundedAt), 'MMMM d, yyyy')}</p>
              )}
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setViewModal({ open: false, refund: null })}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
