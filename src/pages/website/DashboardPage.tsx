import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, FileText, GraduationCap, TrendingUp, TrendingDown,
  Mail, ArrowRight, Eye, Plus, RefreshCw,
  Calendar, Clock, BarChart3, Wallet, BadgeDollarSign, Bell, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { usersService } from '../../services';
import type { DashboardStats } from '../../types';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  href?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan';
  subtitle?: string;
}

const colorVariants = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  pink: 'bg-pink-50 text-pink-600 border-pink-100',
  cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
};

function StatCard({ title, value, change, icon: Icon, href, color = 'blue', subtitle }: StatCardProps) {
  const content = (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-white">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 ${colorVariants[color]}`} />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className="flex items-center gap-1 pt-1">
                {change >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className={`text-xs font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
                <span className="text-xs text-gray-400">vs last month</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorVariants[color]} border`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {href && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href} className="block">{content}</Link>;
  }
  return content;
}

interface QuickActionProps {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function QuickAction({ label, description, href, icon: Icon, color }: QuickActionProps) {
  const bgColors = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-emerald-500 hover:bg-emerald-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
  };

  return (
    <Link
      to={href}
      className={`flex items-center gap-4 p-4 rounded-xl ${bgColors[color]} text-white transition-all hover:shadow-lg hover:scale-[1.02] group`}
    >
      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-white/80">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const response = await usersService.getStats();
      if (response.success && response.data) {
        // API returns { stats: {...} } inside data
        const statsData = (response.data as any).stats || response.data;

        // Apply mock data as requested
        const mockStats = {
          ...statsData,
          users: { ...statsData.users, total: 121 },
          conformation: { ...statsData.conformation, published: '32.3L' },
          Reviews: { ...statsData.Reviews, published: '12L' },
          resources: { ...statsData.resources, total: 16, sent: 80 },
        };

        setStats(mockStats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Fallback to mock data even if API fails
      setStats({
        users: { total: 121, new: 5, change: 12 },
        conformation: { published: '32.3L', total: 45, change: 8 },
        Reviews: { published: '12L', total: 15, change: 4 },
        resources: { total: 16, sent: 80, change: 2 },
        testimonials: { pending: 3 },
        comments: { total: 156 },
        contacts: { pending: 12 },
        jobs: { applications: 8 }
      } as any);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const currentDate = new Date();
  const greeting = currentDate.getHours() < 12 ? 'Good morning' : currentDate.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-gray-100 animate-pulse rounded-xl" />
          <div className="h-80 bg-gray-100 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}!</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Companies Registered"
          value={(stats?.users?.total || 0).toLocaleString()}
          change={stats?.users?.change}
          icon={Users}
          href="/website/users"
          color="blue"

        />
        <StatCard
          title="Funding Pending"
          value={stats?.conformation?.published || 0}
          icon={Wallet}
          href="/website/Payments"
          color="green"

        />
        <StatCard
          title="Funding Secured"
          value={stats?.Reviews?.published || 0}
          change={stats?.Reviews?.change}
          icon={BadgeDollarSign}
          href="/website/Payments"
          color="purple"

        />
        <StatCard
          title="Notification Pending"
          value={stats?.Reviews?.published || 0}
          change={stats?.Reviews?.change}
          icon={Bell}
          href="/website/Payments"
          color="purple"

        />
        <StatCard
          title="Notification Sent"
          value={stats?.Reviews?.published || 0}
          change={stats?.Reviews?.change}
          icon={Send}
          href="/website/Payments"
          color="purple"

        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <QuickAction
            label="Register"
            description="Register as a company"
            href="/website/company-registration"
            icon={FileText}
            color="blue"
          />
          <QuickAction
            label="New Review"
            description="Add Review content"
            href="/website/Reviews/new"
            icon={GraduationCap}
            color="green"
          />
        </div>
      </div>

      {/* Secondary Stats & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Engagement Stats */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-gray-500" />
                Overview Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-gray-50">
                  <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{(stats?.conformation?.views || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Views</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50">
                  <Mail className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats?.contacts?.pending || 0}</p>
                  <p className="text-xs text-gray-500">New Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Items */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Contact Messages', count: stats?.contacts?.pending || 0, href: '/website/contacts', icon: Mail, color: 'text-blue-500' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.count > 0 && (
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                          {item.count}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-gray-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.recentActivity && stats.recentActivity.length > 0) ? (
                stats.recentActivity.map((activity: any) => {
                  const actionIcons: Record<string, React.ElementType> = {
                    view: Eye,
                    enroll: GraduationCap,
                    share: Mail,
                  };
                  const Icon = actionIcons[activity.action] || Eye;

                  const formatTime = (dateStr: string) => {
                    const date = new Date(dateStr);
                    const now = new Date();
                    const diff = now.getTime() - date.getTime();
                    const minutes = Math.floor(diff / 60000);
                    const hours = Math.floor(diff / 3600000);
                    const days = Math.floor(diff / 86400000);

                    if (minutes < 1) return 'Just now';
                    if (minutes < 60) return `${minutes} min ago`;
                    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                    return `${days} day${days > 1 ? 's' : ''} ago`;
                  };

                  const getActionText = (action: string, itemType: string, itemTitle: string) => {
                    const actions: Record<string, string> = {
                      view: `Viewed ${itemType?.toLowerCase() || 'item'}`,
                      like: `Liked ${itemType?.toLowerCase() || 'item'}`,
                      save: `Saved ${itemType?.toLowerCase() || 'item'}`,
                      comment: `Commented`,
                      enroll: `Enrolled in Review`,
                    };
                    return `${actions[action] || action}: ${itemTitle}`;
                  };

                  return (
                    <div key={activity._id} className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">
                          {activity.user?.name && <span className="font-medium">{activity.user.name} </span>}
                          {getActionText(activity.action, activity.itemType, activity.itemTitle)}
                        </p>
                        <p className="text-xs text-gray-400">{formatTime(activity.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No recent activity
                </div>
              )}
            </div>
            <Link
              to="/website/contacts"
              className="flex items-center justify-center gap-2 mt-4 pt-4 border-t text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all activity
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
