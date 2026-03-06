import { useState } from 'react';
import { Users, UserPlus, UserCheck, Activity, Calendar, Globe, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, Badge } from '../../../components/ui';

interface UserStats {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  avgSessionDuration: string;
  retentionRate: number;
}

const mockStats: UserStats = {
  totalUsers: 12458,
  newUsersThisMonth: 847,
  activeUsers: 3621,
  avgSessionDuration: '8m 32s',
  retentionRate: 72.5,
};

interface UserGrowth {
  period: string;
  newUsers: number;
  totalUsers: number;
}

const mockGrowthData: UserGrowth[] = [
  { period: 'Jan 2025', newUsers: 847, totalUsers: 12458 },
  { period: 'Dec 2024', newUsers: 923, totalUsers: 11611 },
  { period: 'Nov 2024', newUsers: 756, totalUsers: 10688 },
  { period: 'Oct 2024', newUsers: 689, totalUsers: 9932 },
  { period: 'Sep 2024', newUsers: 612, totalUsers: 9243 },
];

interface TopCountry {
  country: string;
  users: number;
  percentage: number;
}

const mockCountries: TopCountry[] = [
  { country: 'United States', users: 4235, percentage: 34 },
  { country: 'India', users: 2489, percentage: 20 },
  { country: 'United Kingdom', users: 1245, percentage: 10 },
  { country: 'Canada', users: 872, percentage: 7 },
  { country: 'Germany', users: 623, percentage: 5 },
];

interface UserActivity {
  hour: string;
  users: number;
}

const mockActivityByHour: UserActivity[] = [
  { hour: '00:00', users: 120 },
  { hour: '04:00', users: 85 },
  { hour: '08:00', users: 450 },
  { hour: '12:00', users: 680 },
  { hour: '16:00', users: 890 },
  { hour: '20:00', users: 720 },
];

export default function UsersAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');

  const growthRate = ((mockGrowthData[0].newUsers - mockGrowthData[1].newUsers) / mockGrowthData[1].newUsers * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Analytics</h1>
          <p className="text-gray-600">Track user growth, engagement, and demographics</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">New Users</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.newUsersThisMonth}</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  {growthRate}% growth
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.activeUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Session</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.avgSessionDuration}</p>
                <p className="text-sm text-gray-500">{mockStats.retentionRate}% retention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart visualization would go here
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Monthly Signups</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockGrowthData.map((data) => (
                <div key={data.period} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{data.period}</p>
                    <p className="text-sm text-gray-500">{data.totalUsers.toLocaleString()} total users</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{data.newUsers}</p>
                    <p className="text-sm text-gray-500">new users</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Users by Country</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCountries.map((country) => (
                <div key={country.country} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{country.country}</span>
                    <span className="text-sm text-gray-500">{country.users.toLocaleString()} ({country.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Activity by Time</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockActivityByHour.map((data) => (
                <div key={data.hour} className="flex items-center gap-4">
                  <span className="w-16 text-sm text-gray-500">{data.hour}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${(data.users / 890) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 text-sm text-right text-gray-600">{data.users}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">Peak activity at 16:00 UTC</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">User Segments</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Free Users</span>
                <Badge variant="default">8,234</Badge>
              </div>
              <p className="text-sm text-gray-500">66% of total users</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '66%' }} />
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Premium Users</span>
                <Badge variant="success">3,456</Badge>
              </div>
              <p className="text-sm text-gray-500">28% of total users</p>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Enterprise</span>
                <Badge variant="info">768</Badge>
              </div>
              <p className="text-sm text-gray-500">6% of total users</p>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '6%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
