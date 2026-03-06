import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Mail, MailOpen, MessageSquare,
  Reply, Ticket, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Button, Card, CardContent, Badge, Modal, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../../components/ui';
import { contactMessagesService, usersService } from '../../services';

interface Message {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  assignedTo?: { _id: string; name: string; email: string };
  replies: Array<{ message: string; sentBy: { name: string }; sentAt: string }>;
  convertedToTicket?: { _id: string; ticketNumber: string };
  createdAt: string;
}

interface Stats {
  total: number;
  new: number;
  read: number;
  replied: number;
  thisWeek: number;
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [admins, setAdmins] = useState<any[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modals
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [replyModal, setReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchStats();
    fetchAdmins();
  }, [search, statusFilter, categoryFilter, page]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const response = await contactMessagesService.getAll(params);
      if (response.success && response.data) {
        setMessages(response.data.messages || []);
        setPagination(response.data.pagination || { total: 0, pages: 1 });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await contactMessagesService.getStats();
      if (response.success && response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await usersService.getAll({ role: 'admin' });
      if (response.success && response.data) {
        const data = response.data as any;
        setAdmins(data.users || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  };

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setViewModal(true);

    // Mark as read if new
    if (message.status === 'new') {
      try {
        await contactMessagesService.updateStatus(message._id, 'read');
        fetchMessages();
        fetchStats();
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setSending(true);
    try {
      await contactMessagesService.reply(selectedMessage._id, replyText);
      toast.success('Reply sent successfully');
      setReplyModal(false);
      setReplyText('');
      fetchMessages();
      fetchStats();
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleConvertToTicket = async (message: Message) => {
    try {
      const response = await contactMessagesService.convertToTicket(message._id);
      if (response.success && response.data?.ticket) {
        toast.success('Converted to support ticket');
        navigate(`/support/tickets/${response.data.ticket._id}`);
      }
    } catch (error: any) {
      console.error('Failed to convert:', error);
      toast.error(error.message || 'Failed to convert to ticket');
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;

    setDeleting(true);
    try {
      await contactMessagesService.delete(selectedMessage._id);
      toast.success('Message deleted');
      setDeleteModal(false);
      setSelectedMessage(null);
      fetchMessages();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete message');
    } finally {
      setDeleting(false);
    }
  };

  const handleAssign = async (messageId: string, adminId: string) => {
    try {
      await contactMessagesService.assign(messageId, adminId);
      toast.success('Message assigned');
      fetchMessages();
    } catch (error) {
      console.error('Failed to assign:', error);
      toast.error('Failed to assign message');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'danger' | 'warning' | 'success' | 'info'; label: string }> = {
      new: { variant: 'danger', label: 'New' },
      read: { variant: 'warning', label: 'Read' },
      replied: { variant: 'success', label: 'Replied' },
      archived: { variant: 'info', label: 'Archived' },
    };
    const { variant, label } = config[status] || { variant: 'info', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: 'General',
      support: 'Support',
      sales: 'Sales',
      feedback: 'Feedback',
      partnership: 'Partnership',
      other: 'Other',
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-sm text-gray-500 mt-1">Manage messages from the contact form</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.new}</p>
              <p className="text-xs text-gray-500">New</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.read}</p>
              <p className="text-xs text-gray-500">Read</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
              <p className="text-xs text-gray-500">Replied</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
              <p className="text-xs text-gray-500">This Week</p>
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
                placeholder="Search by name, email, subject..."
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
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="support">Support</option>
              <option value="sales">Sales</option>
              <option value="feedback">Feedback</option>
              <option value="partnership">Partnership</option>
              <option value="other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">No messages found</TableCell>
              </TableRow>
            ) : (
              messages.map((message) => (
                <TableRow key={message._id} className={message.status === 'new' ? 'bg-red-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {message.status === 'new' ? (
                        <Mail className="w-4 h-4 text-red-600" />
                      ) : (
                        <MailOpen className="w-4 h-4 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{message.name}</p>
                        <p className="text-xs text-gray-500">{message.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-900 truncate max-w-xs">{message.subject}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{getCategoryLabel(message.category)}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(message.status)}</TableCell>
                  <TableCell>
                    {message.assignedTo ? (
                      <span className="text-sm text-gray-600">{message.assignedTo.name}</span>
                    ) : (
                      <select
                        onChange={(e) => e.target.value && handleAssign(message._id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        defaultValue=""
                      >
                        <option value="">Assign...</option>
                        {admins.map((admin) => (
                          <option key={admin._id} value={admin._id}>{admin.name}</option>
                        ))}
                      </select>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      <p>{format(new Date(message.createdAt), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-gray-400">{format(new Date(message.createdAt), 'h:mm a')}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewMessage(message)}
                        className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      {message.status !== 'replied' && (
                        <button
                          onClick={() => { setSelectedMessage(message); setReplyModal(true); }}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded"
                          title="Reply"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                      )}
                      {!message.convertedToTicket && (
                        <button
                          onClick={() => handleConvertToTicket(message)}
                          className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-gray-100 rounded"
                          title="Convert to Ticket"
                        >
                          <Ticket className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => { setSelectedMessage(message); setDeleteModal(true); }}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                        title="Delete"
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Page {page} of {pagination.pages} ({pagination.total} messages)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Message Modal */}
      <Modal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        title="Message Details"
        size="lg"
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">From</p>
                <p className="font-medium">{selectedMessage.name}</p>
                <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                {selectedMessage.phone && (
                  <p className="text-sm text-gray-600">{selectedMessage.phone}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">Details</p>
                <p className="text-sm">Category: {getCategoryLabel(selectedMessage.category)}</p>
                <p className="text-sm">Status: {selectedMessage.status}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(selectedMessage.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Subject</p>
              <p className="font-medium">{selectedMessage.subject}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Message</p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {selectedMessage.replies.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Replies</p>
                <div className="space-y-2">
                  {selectedMessage.replies.map((reply, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {reply.sentBy.name} • {format(new Date(reply.sentAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMessage.convertedToTicket && (
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  Converted to ticket: {selectedMessage.convertedToTicket.ticketNumber}
                </p>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setViewModal(false)}>Close</Button>
          {selectedMessage && selectedMessage.status !== 'replied' && (
            <Button onClick={() => { setViewModal(false); setReplyModal(true); }}>
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* Reply Modal */}
      <Modal
        isOpen={replyModal}
        onClose={() => setReplyModal(false)}
        title={`Reply to ${selectedMessage?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium">{selectedMessage?.subject}</p>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{selectedMessage?.message}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={6}
              placeholder="Type your reply..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setReplyModal(false)}>Cancel</Button>
          <Button onClick={handleReply} isLoading={sending} disabled={!replyText.trim()}>
            Send Reply
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Message"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to delete this message from <strong>{selectedMessage?.name}</strong>?
          This action cannot be undone.
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleting}>Delete</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
