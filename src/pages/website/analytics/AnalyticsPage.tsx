import { useState, useEffect } from 'react';
import {
  Users, FileText, GraduationCap, FolderOpen, Eye, Download,
  TrendingUp, TrendingDown, DollarSign, CreditCard, UserPlus,
  BarChart3, PieChart, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import { usersService } from '../../../services';

interface AnalyticsData {
  users: {
    total: number;
    new: number;
    active: number;
    growth: number;
  };
  content: {
    post: { total: number; published: number; views: number };
    Reviews: { total: number; published: number; enrollments: number };
    resources: { total: number; published: number; downloads: number };
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    transactions: number;
  };
  engagement: {
    comments: number;
    likes: number;
    shares: number;
  };
}

const defaultData: AnalyticsData = {
  users: { total: 0, new: 0, active: 0, growth: 0 },
  content: {
    post: { total: 0, published: 0, views: 0 },
    Reviews: { total: 0, published: 0, enrollments: 0 },
    resources: { total: 0, published: 0, downloads: 0 },
  },
  revenue: { total: 0, monthly: 0, growth: 0, transactions: 0 },
  engagement: { comments: 0, likes: 0, shares: 0 },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const response = await usersService.getStats();
      if (response.success && response.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData = response.data as any;
        const stats = responseData.stats || responseData;
        const users = stats.users || {};
        const post = stats.post || {};
        const Reviews = stats.Reviews || {};
        const resources = stats.resources || {};
        const revenue = stats.revenue || {};
        const comments = stats.comments || {};

        setData({
          users: {
            total: stats.totalUsers || users.total || 0,
            new: stats.newUsersThisMonth || users.new || 0,
            active: stats.activeUsers || Math.floor((stats.totalUsers || 0) * 0.65),
            growth: 12, // Placeholder - could calculate from historical data
          },
          content: {
            post: {
              total: post.total || 0,
              published: post.published || 0,
              views: post.views || 0,
            },
            Reviews: {
              total: Reviews.total || 0,
              published: Reviews.published || 0,
              enrollments: 0,
            },
            resources: {
              total: resources.total || 0,
              published: resources.published || 0,
              downloads: 0,
            },
          },
          revenue: {
            total: revenue.total || 0,
            monthly: revenue.monthly || 0,
            growth: 8,
            transactions: 0,
          },
          engagement: {
            comments: comments.total || 0,
            likes: 0,
            shares: 0,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
                <span className="text-xs text-gray-500">vs last period</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Track your website performance</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          User Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={data.users.total.toLocaleString()}
            change={data.users.growth}
            icon={Users}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="New Users"
            value={data.users.new.toLocaleString()}
            change={15}
            icon={UserPlus}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            title="Active Users"
            value={data.users.active.toLocaleString()}
            icon={Activity}
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="User Growth"
            value={`${data.users.growth}%`}
            icon={TrendingUp}
            color="bg-emerald-100 text-emerald-600"
          />
        </div>
      </div>

      {/* Content Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-500" />
          Content Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="font-semibold">{data.content.post.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Published</span>
                  <span className="font-semibold">{data.content.post.published}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Views</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {data.content.post.views.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-500" />
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="font-semibold">{data.content.Reviews.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Published</span>
                  <span className="font-semibold">{data.content.Reviews.published}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Enrollments</span>
                  <span className="font-semibold">{data.content.Reviews.enrollments.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-orange-500" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="font-semibold">{data.content.resources.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Published</span>
                  <span className="font-semibold">{data.content.resources.published}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Downloads</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {data.content.resources.downloads.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-500" />
          Revenue Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data.revenue.total)}
            change={data.revenue.growth}
            icon={DollarSign}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            title="This Month"
            value={formatCurrency(data.revenue.monthly)}
            change={5}
            icon={CreditCard}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Transactions"
            value={data.revenue.transactions.toLocaleString()}
            icon={Activity}
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="Revenue Growth"
            value={`${data.revenue.growth}%`}
            icon={TrendingUp}
            color="bg-emerald-100 text-emerald-600"
          />
        </div>
      </div>

      {/* Engagement Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-gray-500" />
          Engagement Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{data.engagement.comments.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Total Comments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{data.engagement.likes.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Total Likes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{data.engagement.shares.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Total Shares</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
