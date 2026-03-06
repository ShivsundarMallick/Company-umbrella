import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, User, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Button, Card, CardContent, Badge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../../components/ui';
import { ticketsService, usersService } from '../../services';

interface TicketItem {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  user?: { _id: string; name: string; email: string };
  guestName?: string;
  guestEmail?: string;
  assignedTo?: { _id: string; name: string; email: string };
  createdAt: string;
}

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  waitingCustomer: number;
  resolved: number;
  closed: number;
  today: number;
}

export default function TicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [agents, setAgents] = useState<any[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    fetchTickets();
    fetchStats();
    fetchAgents();
  }, [search, statusFilter, priorityFilter, categoryFilter, page]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;

      const response = await ticketsService.getAll(params);
      if (response.success && response.data) {
        setTickets(response.data.tickets || []);
        setPagination(response.data.pagination || { total: 0, pages: 1 });
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ticketsService.getStats();
      if (response.success && response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await usersService.getAll({ role: 'admin' });
      if (response.success && response.data) {
        const data = response.data as any;
        setAgents(data.users || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const handleAssign = async (ticketId: string, agentId: string) => {
    try {
      await ticketsService.assign(ticketId, agentId);
      toast.success('Ticket assigned');
      fetchTickets();
    } catch (error) {
      console.error('Failed to assign:', error);
      toast.error('Failed to assign ticket');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'warning' | 'info' | 'success' | 'danger'; label: string }> = {
      open: { variant: 'warning', label: 'Open' },
      in_progress: { variant: 'info', label: 'In Progress' },
      waiting_customer: { variant: 'info', label: 'Waiting' },
      waiting_internal: { variant: 'warning', label: 'Internal' },
      resolved: { variant: 'success', label: 'Resolved' },
      closed: { variant: 'danger', label: 'Closed' },
    };
    const { variant, label } = config[status] || { variant: 'info', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
      low: { variant: 'success', label: 'Low' },
      medium: { variant: 'info', label: 'Medium' },
      high: { variant: 'warning', label: 'High' },
      urgent: { variant: 'danger', label: 'Urgent' },
    };
    const { variant, label } = config[priority] || { variant: 'info', label: priority };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      technical: 'Technical',
      billing: 'Billing',
      account: 'Account',
      content: 'Content',
      feedback: 'Feedback',
      other: 'Other',
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer support tickets</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.open}</p>
              <p className="text-xs text-gray-500">Open</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.waitingCustomer}</p>
              <p className="text-xs text-gray-500">Waiting</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              <p className="text-xs text-gray-500">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
              <p className="text-xs text-gray-500">Closed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary-600">{stats.today}</p>
              <p className="text-xs text-gray-500">Today</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ticket number, subject..."
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
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_customer">Waiting Customer</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="account">Account</option>
              <option value="content">Content</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">No tickets found</TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow
                  key={ticket._id}
                  className={`cursor-pointer hover:bg-gray-50 ${ticket.priority === 'urgent' ? 'bg-red-50' : ''}`}
                  onClick={() => navigate(`/support/tickets/${ticket._id}`)}
                >
                  <TableCell>
                    <div>
                      <p className="font-mono text-sm text-gray-500">{ticket.ticketNumber}</p>
                      <p className="font-medium text-gray-900 truncate max-w-xs">{ticket.subject}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{ticket.user?.name || ticket.guestName || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{ticket.user?.email || ticket.guestEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{getCategoryLabel(ticket.category)}</span>
                  </TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {ticket.assignedTo ? (
                      <span className="text-sm text-gray-600">{ticket.assignedTo.name}</span>
                    ) : (
                      <select
                        onChange={(e) => e.target.value && handleAssign(ticket._id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        defaultValue=""
                      >
                        <option value="">Assign...</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>{agent.name}</option>
                        ))}
                      </select>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      <p>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-gray-400">{format(new Date(ticket.createdAt), 'h:mm a')}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
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
              Page {page} of {pagination.pages} ({pagination.total} tickets)
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
    </div>
  );
}
