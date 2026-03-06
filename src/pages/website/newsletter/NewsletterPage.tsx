import { useState, useEffect } from 'react';
import { Search, Download, Trash2, Mail, Users, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Button, Badge, Card, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, ModalFooter
} from '../../../components/ui';
import { contactsService } from '../../../services';

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  isSubscribed: boolean;
  isActive?: boolean;
  subscribedAt: string;
  source?: string;
}

interface NewsletterStats {
  total: number;
  subscribed: number;
  unsubscribed: number;
  active?: number;
  thisMonth?: number;
  growth?: number;
}

interface NewsletterStatsResponse {
  stats?: NewsletterStats;
  total?: number;
  subscribed?: number;
  unsubscribed?: number;
  active?: number;
  thisMonth?: number;
  growth?: number;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState<NewsletterStats>({ total: 0, subscribed: 0, unsubscribed: 0, active: 0, thisMonth: 0, growth: 0 });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; subscriber: Subscriber | null }>({
    open: false,
    subscriber: null,
  });
  const [exporting, setExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, [search, statusFilter]);

  const fetchSubscribers = async () => {
    try {
      const params: Record<string, string | number> = { search, limit: 100 };
      if (statusFilter === 'active') params.isActive = 'true';
      if (statusFilter === 'inactive') params.isActive = 'false';

      const response = await contactsService.getSubscribers(params);
      if (response.success && response.data) {
        setSubscribers(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await contactsService.getNewsletterStats();
      if (response.success && response.data) {
        // Backend returns { stats: {...} } inside data
        const data = response.data as NewsletterStatsResponse;
        const statsData = data.stats || data;
        setStats({
          total: statsData.total ?? 0,
          subscribed: statsData.subscribed ?? 0,
          unsubscribed: statsData.unsubscribed ?? 0,
          active: statsData.active ?? 0,
          thisMonth: statsData.thisMonth ?? 0,
          growth: statsData.growth ?? 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await contactsService.exportSubscribers();
      if (response.data) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Subscribers exported successfully');
      }
    } catch (error) {
      console.error('Failed to export subscribers:', error);
      toast.error('Failed to export subscribers');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.subscriber) return;
    try {
      await contactsService.deleteSubscriber(deleteModal.subscriber._id);
      toast.success('Subscriber removed successfully');
      setDeleteModal({ open: false, subscriber: null });
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
      toast.error('Failed to remove subscriber');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => contactsService.deleteSubscriber(id)));
      toast.success(`${selectedIds.size} subscribers removed`);
      setBulkDeleteModal(false);
      setSelectedIds(new Set());
      fetchSubscribers();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete subscribers:', error);
      toast.error('Failed to remove subscribers');
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === subscribers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subscribers.map(s => s._id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your email subscribers</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { fetchSubscribers(); fetchStats(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} isLoading={exporting}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{(stats.active || stats.subscribed || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{(stats.thisMonth || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.growth || 0}%</p>
                <p className="text-xs text-gray-500">Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {selectedIds.size > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setBulkDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedIds.size})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={subscribers.length > 0 && selectedIds.size === subscribers.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No subscribers found
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber._id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(subscriber._id)}
                      onChange={() => toggleSelect(subscriber._id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{subscriber.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{subscriber.name || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={subscriber.isSubscribed ? 'success' : 'warning'}>
                      {subscriber.isSubscribed ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500 capitalize">{subscriber.source || 'Website'}</span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(subscriber.subscribedAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDeleteModal({ open: true, subscriber })}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, subscriber: null })}
        title="Remove Subscriber"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to remove <strong>{deleteModal.subscriber?.email}</strong> from the newsletter? They will no longer receive updates.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, subscriber: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Remove
          </Button>
        </ModalFooter>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        title="Remove Selected Subscribers"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to remove <strong>{selectedIds.size} subscribers</strong> from the newsletter? This action cannot be undone.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setBulkDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBulkDelete}>
            Remove All
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
