import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, RefreshCw, Calendar, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, Badge } from '../../../components/ui';

interface RevenueData {
  period: string;
  revenue: number;
  transactions: number;
  averageOrder: number;
}

const mockMonthlyData: RevenueData[] = [
  { period: 'Jan 2025', revenue: 45230, transactions: 156, averageOrder: 290 },
  { period: 'Dec 2024', revenue: 52100, transactions: 178, averageOrder: 293 },
  { period: 'Nov 2024', revenue: 38900, transactions: 142, averageOrder: 274 },
  { period: 'Oct 2024', revenue: 41500, transactions: 151, averageOrder: 275 },
  { period: 'Sep 2024', revenue: 35800, transactions: 128, averageOrder: 280 },
];

interface TopProduct {
  name: string;
  type: string;
  revenue: number;
  sales: number;
}

const mockTopProducts: TopProduct[] = [
  { name: 'Complete TypeScript Review', type: 'Review', revenue: 12450, sales: 89 },
  { name: 'React Masterclass', type: 'Review', revenue: 9870, sales: 72 },
  { name: 'Pro Membership', type: 'subscription', revenue: 8900, sales: 178 },
  { name: 'Node.js Advanced', type: 'Review', revenue: 6540, sales: 54 },
  { name: 'Premium Resources Pack', type: 'resource', revenue: 4320, sales: 86 },
];

export default function RevenueAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');

  const currentRevenue = mockMonthlyData[0].revenue;
  const previousRevenue = mockMonthlyData[1].revenue;
  const revenueChange = ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);
  const isPositive = Number(revenueChange) >= 0;

  const totalRefunds = 1230;
  // Net revenue calculated for potential future use
  const _netRevenue = currentRevenue - totalRefunds;
  void _netRevenue; // Suppress unused variable warning

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600">Track revenue, transactions, and financial metrics</p>
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
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentRevenue)}</p>
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(Number(revenueChange))}% vs last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{mockMonthlyData[0].transactions}</p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockMonthlyData[0].averageOrder)}</p>
                <p className="text-sm text-gray-500">Per transaction</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Refunds</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRefunds)}</p>
                <p className="text-sm text-gray-500">{((totalRefunds / currentRevenue) * 100).toFixed(1)}% of revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Revenue Over Time</h2>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart visualization would go here
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Monthly Breakdown</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockMonthlyData.map((data, idx) => (
                <div key={data.period} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{data.period}</p>
                    <p className="text-sm text-gray-500">{data.transactions} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(data.revenue)}</p>
                    {idx > 0 && (
                      <p className={`text-sm ${data.revenue > mockMonthlyData[idx - 1].revenue ? 'text-green-600' : 'text-red-600'}`}>
                        {data.revenue > mockMonthlyData[idx - 1].revenue ? '+' : ''}
                        {((data.revenue - mockMonthlyData[idx - 1].revenue) / mockMonthlyData[idx - 1].revenue * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Top Revenue Products</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Sales</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Avg. Price</th>
                </tr>
              </thead>
              <tbody>
                {mockTopProducts.map((product, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-medium">#{idx + 1}</span>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default">
                        {product.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right">{product.sales}</td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(product.revenue / product.sales)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
