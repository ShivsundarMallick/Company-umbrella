import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Send, Mail, Clock, CheckCircle, AlertCircle,
  Trash2, Copy, Eye, Users, TrendingUp, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Button, Badge, Card, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, ModalFooter
} from '../../../components/ui';
import { emailCampaignsService } from '../../../services';

interface Campaign {
  _id: string;
  subject: string;
  previewText?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  stats: {
    totalRecipients: number;
    sent: number;
    failed: number;
    opened: number;
    clicked: number;
  };
  createdBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
  sentAt?: string;
}

interface CampaignStats {
  totalCampaigns: number;
  sentCampaigns: number;
  draftCampaigns: number;
  totalEmailsSent: number;
}

export default function CampaignsPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; campaign: Campaign | null }>({
    open: false,
    campaign: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, [search, statusFilter]);

  const fetchCampaigns = async () => {
    try {
      const params: Record<string, string | number> = { search };
      if (statusFilter) params.status = statusFilter;

      const response = await emailCampaignsService.getAll(params);
      if (response.success && response.data) {
        setCampaigns(response.data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await emailCampaignsService.getStats();
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.campaign) return;
    setDeleting(true);
    try {
      await emailCampaignsService.delete(deleteModal.campaign._id);
      toast.success('Campaign deleted');
      setDeleteModal({ open: false, campaign: null });
      fetchCampaigns();
      fetchStats();
    } catch (error: any) {
      console.error('Failed to delete campaign:', error);
      toast.error(error.message || 'Failed to delete campaign');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      const response = await emailCampaignsService.duplicate(campaign._id);
      if (response.success && response.data?.campaign) {
        toast.success('Campaign duplicated');
        navigate(`/website/newsletter/compose/${response.data.campaign._id}`);
      }
    } catch (error) {
      console.error('Failed to duplicate campaign:', error);
      toast.error('Failed to duplicate campaign');
    }
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const config = {
      draft: { variant: 'warning' as const, icon: FileText, label: 'Draft' },
      scheduled: { variant: 'info' as const, icon: Clock, label: 'Scheduled' },
      sending: { variant: 'info' as const, icon: Send, label: 'Sending' },
      sent: { variant: 'success' as const, icon: CheckCircle, label: 'Sent' },
      failed: { variant: 'danger' as const, icon: AlertCircle, label: 'Failed' },
    };
    const { variant, icon: Icon, label } = config[status];
    return (
      <Badge variant={variant}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your newsletter campaigns</p>
        </div>
        <Button onClick={() => navigate('/website/newsletter/compose')}>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
                  <p className="text-xs text-gray-500">Total Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.sentCampaigns}</p>
                  <p className="text-xs text-gray-500">Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.draftCampaigns}</p>
                  <p className="text-xs text-gray-500">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmailsSent.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Emails Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No campaigns found
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{campaign.subject}</p>
                      {campaign.previewText && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">{campaign.previewText}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {campaign.stats.totalRecipients.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {campaign.status === 'sent' ? (
                      <div className="text-sm">
                        <span className="text-green-600">{campaign.stats.sent}</span>
                        {campaign.stats.failed > 0 && (
                          <span className="text-red-600 ml-1">/ {campaign.stats.failed} failed</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {campaign.sentAt ? (
                        <>
                          <p>Sent {format(new Date(campaign.sentAt), 'MMM d, yyyy')}</p>
                          <p className="text-xs text-gray-400">{format(new Date(campaign.sentAt), 'h:mm a')}</p>
                        </>
                      ) : (
                        <p>Created {format(new Date(campaign.createdAt), 'MMM d, yyyy')}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => navigate(`/website/newsletter/compose/${campaign._id}`)}
                          className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicate(campaign)}
                        className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {campaign.status !== 'sending' && (
                        <button
                          onClick={() => setDeleteModal({ open: true, campaign })}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
        onClose={() => setDeleteModal({ open: false, campaign: null })}
        title="Delete Campaign"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to delete the campaign "<strong>{deleteModal.campaign?.subject}</strong>"?
          This action cannot be undone.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, campaign: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
