import { useState, useEffect } from 'react';
import { FileText, Download, Search, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Button, Badge, Card, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, ModalFooter
} from '../../../components/ui';
import { paymentsService } from '../../../services';
import { format } from 'date-fns';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  payment?: {
    orderId: string;
    razorpayPaymentId: string;
  };
  items?: {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  total: number;
  currency: string;
  status: string;
  paidDate?: string;
  createdAt: string;
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  paid: 'success',
  cancelled: 'danger',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewModal, setViewModal] = useState<{ open: boolean; invoice: Invoice | null }>({
    open: false,
    invoice: null,
  });

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { limit: 50 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await paymentsService.getInvoices(params);
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setInvoices(data);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to load invoices');
      setInvoices([]);
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
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">View customer invoices</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
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
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{invoice.invoiceNumber || 'N/A'}</p>
                          <p className="text-sm text-gray-500">
                            {invoice.createdAt ? format(new Date(invoice.createdAt), 'MMM d, yyyy') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{invoice.user?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{invoice.user?.email || 'N/A'}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        {(invoice.items || []).slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-sm">{item.name} x{item.quantity}</p>
                        ))}
                        {(invoice.items || []).length > 2 && (
                          <p className="text-xs text-gray-400">+{(invoice.items || []).length - 2} more</p>
                        )}
                        {(!invoice.items || invoice.items.length === 0) && <span className="text-gray-400">-</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(invoice.total)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[invoice.status] || 'default'}>
                        {invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {invoice.paidDate ? format(new Date(invoice.paidDate), 'MMM d, yyyy') : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewModal({ open: true, invoice })}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No invoices found
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, invoice: null })}
        title={`Invoice ${viewModal.invoice?.invoiceNumber || ''}`}
      >
        {viewModal.invoice && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Bill To</p>
                <p className="font-medium">{viewModal.invoice.user?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">{viewModal.invoice.user?.email || 'N/A'}</p>
              </div>
              <Badge variant={statusColors[viewModal.invoice.status] || 'default'}>
                {viewModal.invoice.status ? viewModal.invoice.status.charAt(0).toUpperCase() + viewModal.invoice.status.slice(1) : 'Unknown'}
              </Badge>
            </div>

            {viewModal.invoice.payment && (
              <div className="text-sm">
                <p className="text-gray-500">Order ID: <span className="font-mono">{viewModal.invoice.payment.orderId}</span></p>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2">Item</th>
                    <th className="text-right px-4 py-2">Qty</th>
                    <th className="text-right px-4 py-2">Price</th>
                    <th className="text-right px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewModal.invoice.items || []).map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="text-right px-4 py-2">{item.quantity}</td>
                      <td className="text-right px-4 py-2">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right px-4 py-2">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="border-t">
                    <td colSpan={3} className="text-right px-4 py-2">Subtotal</td>
                    <td className="text-right px-4 py-2">{formatCurrency(viewModal.invoice.subtotal)}</td>
                  </tr>
                  <tr className="font-semibold">
                    <td colSpan={3} className="text-right px-4 py-2">Total</td>
                    <td className="text-right px-4 py-2">{formatCurrency(viewModal.invoice.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="text-sm text-gray-500">
              {viewModal.invoice.paidDate && (
                <p>Paid: {format(new Date(viewModal.invoice.paidDate), 'MMMM d, yyyy')}</p>
              )}
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setViewModal({ open: false, invoice: null })}>
            Close
          </Button>
          <Button variant="primary">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
