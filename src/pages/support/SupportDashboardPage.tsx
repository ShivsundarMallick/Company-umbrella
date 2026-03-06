import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Ticket, Users, Clock, CheckCircle, AlertTriangle,
  TrendingUp, Activity, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, Badge } from '../../components/ui';
import { contactMessagesService, ticketsService, chatService, faqService } from '../../services';
import { format } from 'date-fns';

interface DashboardStats {
  messages: {
    total: number;
    new: number;
    thisWeek: number;
  };
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    avgResponseTimeMs: number;
  };
  chat: {
    active: number;
    waiting: number;
    today: number;
    avgRating: number;
  };
  faq: {
    total: number;
    active: number;
  };
}

export default function SupportDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [messageStats, ticketStats, chatStats, faqStats, tickets] = await Promise.all([
        contactMessagesService.getStats(),
        ticketsService.getStats(),
        chatService.getStats(),
        faqService.getStats(),
        ticketsService.getAll({ limit: 5 }),
      ]);

      setStats({
        messages: messageStats.data?.stats || { total: 0, new: 0, thisWeek: 0 },
        tickets: ticketStats.data?.stats || { total: 0, open: 0, inProgress: 0, avgResponseTimeMs: 0 },
        chat: chatStats.data?.stats || { active: 0, waiting: 0, today: 0, avgRating: 0 },
        faq: faqStats.data?.stats || { total: 0, active: 0 },
      });

      setRecentTickets(tickets.data?.tickets || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
    return `${Math.round(ms / 3600000)}h`;
  };

  const getTicketStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'warning' | 'info' | 'success' | 'danger'; label: string }> = {
      open: { variant: 'warning', label: 'Open' },
      in_progress: { variant: 'info', label: 'In Progress' },
      waiting_customer: { variant: 'info', label: 'Waiting' },
      resolved: { variant: 'success', label: 'Resolved' },
      closed: { variant: 'danger', label: 'Closed' },
    };
    const { variant, label } = config[status] || { variant: 'info', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of support activities and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Messages */}
        <div className="cursor-pointer" onClick={() => navigate('/support/messages')}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">New Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.messages.new || 0}</p>
                  <p className="text-xs text-gray-400 mt-1">{stats?.messages.thisWeek || 0} this week</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Tickets */}
        <div className="cursor-pointer" onClick={() => navigate('/support/tickets')}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Open Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.tickets.open || 0}</p>
                  <p className="text-xs text-gray-400 mt-1">{stats?.tickets.inProgress || 0} in progress</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Chats */}
        <div className="cursor-pointer" onClick={() => navigate('/support/chat')}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Chats</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.chat.active || 0}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    {stats?.chat.waiting ? `${stats.chat.waiting} waiting` : 'No waiting'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Time */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatResponseTime(stats?.tickets.avgResponseTimeMs || 0)}
                </p>
                <p className="text-xs text-gray-400 mt-1">First response</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => navigate('/support/messages')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">View Messages</span>
              </div>
              {stats?.messages.new ? (
                <Badge variant="danger">{stats.messages.new}</Badge>
              ) : (
                <ArrowRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            <button
              onClick={() => navigate('/support/tickets')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium">Manage Tickets</span>
              </div>
              {stats?.tickets.open ? (
                <Badge variant="warning">{stats.tickets.open}</Badge>
              ) : (
                <ArrowRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            <button
              onClick={() => navigate('/support/chat')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Live Chat</span>
              </div>
              {stats?.chat.waiting ? (
                <Badge variant="info">{stats.chat.waiting} waiting</Badge>
              ) : (
                <ArrowRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            <button
              onClick={() => navigate('/support/faq')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Manage FAQs</span>
              </div>
              <span className="text-xs text-gray-500">{stats?.faq.active || 0} active</span>
            </button>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Tickets</h2>
              <button
                onClick={() => navigate('/support/tickets')}
                className="text-sm text-primary-600 hover:underline"
              >
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No tickets yet</p>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => navigate(`/support/tickets/${ticket._id}`)}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-500">{ticket.ticketNumber}</span>
                        {getTicketStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate mt-1">{ticket.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {ticket.user?.name || ticket.guestName || 'Guest'} • {format(new Date(ticket.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-500">Total Resolved</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.tickets.total || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-500">Chat Rating</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.chat.avgRating ? stats.chat.avgRating.toFixed(1) : '-'}/5
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-500">Chats Today</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.chat.today || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
