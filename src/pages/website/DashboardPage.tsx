import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, FileText, GraduationCap, TrendingUp, TrendingDown,
  Mail, ArrowRight, Eye, Plus, RefreshCw,
  Calendar, Clock, BarChart3, Wallet, BadgeDollarSign, Bell, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
// import { usersService } from '../../services';
// import type { DashboardStats } from '../../types';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import Chatbot from '../../components/Chatbot';

interface DashboardStats {
  users: { total: number; new: number; change: number };
  post: { published: string; total: number; change: number; views?: number };
  Reviews: { published: string; total: number; change: number };
  resources: { total: number; sent: number; change: number };
  testimonials: { pending: number };
  comments: { total: number };
  contacts: { pending: number };
  jobs: { applications: number };
  recentActivity?: any[];
}

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
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-card">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 ${colorVariants[color]}`} />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
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
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorVariants[color]} border`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {href && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
  if (href) return <Link to={href} className="block">{content}</Link>;
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
    <Link to={href} className={`flex items-center gap-4 p-4 rounded-xl ${bgColors[color]} text-white transition-all hover:shadow-lg hover:scale-[1.02] group`}>
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

// Pie chart data – tiers adding up to 121
const tierData = [
  { name: 'Tier 1', value: 45, color: 'hsl(221, 83%, 53%)' },
  { name: 'Tier 2', value: 48, color: 'hsl(142, 71%, 45%)' },
  { name: 'Tier 3', value: 28, color: 'hsl(262, 83%, 58%)' },
];

// Bar chart data – top companies funding comparison
const fundingData = [
  { name: 'Acme Corp', secured: 8.2, pending: 3.1 },
  { name: 'Nova Ltd', secured: 6.5, pending: 4.8 },
  { name: 'Zenith Inc', secured: 5.9, pending: 2.3 },
  { name: 'Apex Tech', secured: 4.7, pending: 5.1 },
  { name: 'Orbit Co', secured: 3.8, pending: 1.9 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      // Use mock data directly
      setStats({
        users: { total: 121, new: 5, change: 12 },
        post: { published: '32.3L', total: 45, change: 8, views: 1240 },
        Reviews: { published: '12L', total: 15, change: 4 },
        resources: { total: 16, sent: 80, change: 2 },
        testimonials: { pending: 3 },
        comments: { total: 156 },
        contacts: { pending: 12 },
        jobs: { applications: 8 },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const currentDate = new Date();
  const greeting = currentDate.getHours() < 12 ? 'Good morning' : currentDate.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-36 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting}!</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-card rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Companies Registered"
          value={121}
          change={stats?.users?.change}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Funding Pending"
          value={stats?.post?.published || 0}
          icon={Wallet}
          color="green"
        />
        <StatCard
          title="Funding Secured"
          value={stats?.Reviews?.published || 0}
          change={stats?.Reviews?.change}
          icon={BadgeDollarSign}
          color="purple"
        />
        <StatCard
          title="Notification Pending"
          value={19}
          icon={Bell}
          color="orange"
        />
        <StatCard
          title="Notification Sent"
          value={23}
          icon={Send}
          color="cyan"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart – Company Tiers */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              Companies by Tier (Total: 121)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart – Top Companies Funding */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              Top Companies – Funding Margins (in Lakhs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fundingData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="secured" name="Secured" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickAction label="Register" description="Register as a company" href="/website/company-registration" icon={FileText} color="blue" />
          <QuickAction label="Review Companies" description="for admins" href="/website/reviews" icon={GraduationCap} color="green" />
        </div>
      </div>

      {/* Secondary Stats & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
                Overview Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{(stats?.post?.views || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <Mail className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats?.contacts?.pending || 0}</p>
                  <p className="text-xs text-muted-foreground">New Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/website/contacts" className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-accent transition-colors group">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-foreground">Contact Messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(stats?.contacts?.pending || 0) > 0 && (
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                        {stats?.contacts?.pending}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-muted-foreground text-sm">
              No recent activity
            </div>
            <Link to="/website/contacts" className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border text-sm text-primary hover:opacity-80 font-medium">
              View all activity
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
