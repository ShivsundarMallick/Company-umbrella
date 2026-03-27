import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, Download, FileSpreadsheet, FileText, IndianRupee, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import type { ReportCategoryKey, ReportRow } from './reportData';
import { downloadLocalReportExport, downloadReportExport, fetchReportById } from './reportService';

interface LocationState {
  selectedCompany?: ReportRow;
}

export default function ReportCompanyDetailsPage() {
  const { id, category } = useParams<{ id: string; category: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCompany } = (location.state || {}) as LocationState;

  const [report, setReport] = useState<ReportRow | null>(selectedCompany || null);
  const [loading, setLoading] = useState(!selectedCompany);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDetails = async () => {
      if (!id) return;
      const selectedIdentifier = selectedCompany?.reportId || selectedCompany?.id;
      if (selectedIdentifier === id && selectedCompany) {
        setReport(selectedCompany);
        setLoading(false);
        setError('');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await fetchReportById(id);
        if (!mounted) return;
        setReport(data);
      } catch (fetchError: any) {
        if (!mounted) return;
        const message = fetchError?.message || 'Failed to fetch company details.';
        setError(message);
        if (!selectedCompany) {
          setReport(null);
        }
        toast.error(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDetails();

    return () => {
      mounted = false;
    };
  }, [id, selectedCompany]);

  const handleBack = () => {
    navigate(category ? `/website/reports/${category}` : '/website/reports');
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!id || !category) return;

    try {
      await downloadReportExport(format, category as ReportCategoryKey, id);
      toast.success(`${format.toUpperCase()} download started`);
    } catch (exportError: any) {
      if (report) {
        downloadLocalReportExport(format, category as ReportCategoryKey, report);
        toast.success(`${format.toUpperCase()} downloaded from demo data`);
        return;
      }

      toast.error(exportError?.message || `Failed to download ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <FileText className="w-4 h-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="w-4 h-4" />
            Download Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Company Report Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading company details...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : report ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Company Name</p>
                <p className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" />{report.companyName}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">PAN</p>
                <p className="font-semibold">{report.pan}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Report Date</p>
                <p className="font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" />{report.reportDate}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Amount</p>
                <p className="font-semibold flex items-center gap-2"><IndianRupee className="w-4 h-4" />{report.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <p className="font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4" />{report.status}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Report Title</p>
                <p className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" />{report.title || report.categoryId || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No report details found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
