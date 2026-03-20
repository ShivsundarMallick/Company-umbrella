import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui';
import { REPORT_CATEGORIES, REPORT_DATA } from './reportData';

export default function ReportsDashboardPage() {
  const totalRecords = REPORT_CATEGORIES.reduce(
    (sum, category) => sum + (REPORT_DATA[category.key]?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Access operational and compliance reports with filtering and export options.
        </p>
      </div>

      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Report Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {REPORT_CATEGORIES.length} categories, {totalRecords} records
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {REPORT_CATEGORIES.map((category) => (
          <Link key={category.key} to={category.href} className="block">
            <Card className="h-full border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {(REPORT_DATA[category.key] || []).length} records
                </p>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

