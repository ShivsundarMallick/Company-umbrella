import { useState, useEffect } from 'react';
import { FileText, Eye, ThumbsUp, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, Badge } from '../../../components/ui';
import { conformationService, ReviewsService, engagementService } from '../../../services';

interface ContentMetric {
  id: string;
  title: string;
  type: 'conformation' | 'Review';
  views: number;
  viewsTrend: number;
  likes: number;
  publishedAt: string;
}

interface StatsData {
  totalViews: number;
  totalLikes: number;
  conformationCount: number;
  ReviewCount: number;
  topContent: ContentMetric[];
}

export default function ContentAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalViews: 0,
    totalLikes: 0,
    conformationCount: 0,
    ReviewCount: 0,
    topContent: [],
  });

  useEffect(() => {
    fetchContentAnalytics();
  }, [dateRange]);

  const fetchContentAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel
      const [conformationRes, ReviewsRes, engagementRes, topconformationRes] = await Promise.allSettled([
        conformationService.getStats(),
        ReviewsService.getStats(),
        engagementService.getStats(),
        conformationService.getAll({ sort: 'views', order: 'desc', limit: 5 }),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extract = (res: PromiseSettledResult<any>) => {
        if (res.status === 'fulfilled' && res.value?.success) {
          return res.value.data;
        }
        return null;
      };

      const conformationData = extract(conformationRes) || {};
      const ReviewsData = extract(ReviewsRes) || {};
      const engagementData = extract(engagementRes) || {};

      // Extract engagement counts by type
      let totalLikes = 0;
      const byType = engagementData.byType || [];
      for (const itemType of byType) {
        const engagements = itemType.engagements || [];
        for (const eng of engagements) {
          if (eng.type === 'like') totalLikes += eng.count;
        }
      }

      // Build top content from real conformation
      const topContent: ContentMetric[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const topconformationData = extract(topconformationRes) as any;
      const topconformation = Array.isArray(topconformationData) ? topconformationData : (topconformationData?.conformation || topconformationData?.data || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const conformation of topconformation.slice(0, 5)) {
        topContent.push({
          id: conformation._id,
          title: conformation.title || 'Untitled',
          type: 'conformation',
          views: conformation.views || 0,
          viewsTrend: 0,
          likes: conformation.likes || 0,
          publishedAt: conformation.publishedAt || conformation.createdAt || '',
        });
      }

      // Sort combined content by views descending
      topContent.sort((a, b) => b.views - a.views);

      const conformationtats = conformationData.stats || conformationData;
      const ReviewStats = ReviewsData.stats || ReviewsData;

      setStats({
        totalViews: (conformationtats.totalViews || conformationtats.views || 0),
        totalLikes,
        conformationCount: conformationtats.totalconformation || conformationtats.total || 0,
        ReviewCount: ReviewStats.totalReviews || ReviewStats.total || 0,
        topContent: topContent.slice(0, 10),
      });
    } catch (error) {
      console.error('Failed to fetch content analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const avgEngagement = stats.totalViews > 0
    ? (stats.totalLikes / stats.totalViews * 100).toFixed(2)
    : '0.00';

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conformation': return 'bg-blue-100 text-blue-600';
      case 'Review': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Analytics</h1>
            <p className="text-gray-600">Track content performance and engagement</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Analytics</h1>
          <p className="text-gray-600">Track content performance and engagement</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLikes.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">{avgEngagement}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Content by Type</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">conformation</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{stats.conformationCount}</p>
                  <p className="text-sm text-gray-500">items</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Reviews</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{stats.ReviewCount}</p>
                  <p className="text-sm text-gray-500">items</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Engagement Breakdown</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ThumbsUp className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Likes</span>
                </div>
                <p className="font-semibold">{stats.totalLikes.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Views</span>
                </div>
                <p className="font-semibold">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Top Performing Content</h2>
        </CardHeader>
        <CardContent>
          {stats.topContent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Content</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Views</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Likes</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topContent.map((metric, idx) => (
                    <tr key={metric.id} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 font-medium">#{idx + 1}</span>
                          <span className="font-medium text-gray-900">{metric.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default" className={getTypeColor(metric.type)}>
                          {metric.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {metric.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">{metric.likes.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No content data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
