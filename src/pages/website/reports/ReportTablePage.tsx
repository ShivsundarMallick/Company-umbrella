import { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink, FileSpreadsheet, FileText, RotateCcw, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui';
import { REPORT_CATEGORIES, REPORT_DATA, type ReportCategoryKey, type ReportRow } from './reportData';
import { downloadReportExport, fetchReports } from './reportService';

interface ReportTablePageProps {
  categoryKey: ReportCategoryKey;
}

export default function ReportTablePage({ categoryKey }: ReportTablePageProps) {
  const navigate = useNavigate();
  const category = REPORT_CATEGORIES.find((item) => item.key === categoryKey);

  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [pan, setPan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedCompany, setSelectedCompany] = useState<ReportRow | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let mounted = true;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError('');
        const apiRows = await fetchReports(categoryKey);
        if (!mounted) return;

        if (Array.isArray(apiRows) && apiRows.length) {
          setRows(apiRows);
        } else {
          setRows(REPORT_DATA[categoryKey] || []);
        }
      } catch (loadError: any) {
        if (!mounted) return;
        setError(loadError?.message || 'Failed to fetch reports.');
        setRows(REPORT_DATA[categoryKey] || []);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadReports();

    return () => {
      mounted = false;
    };
  }, [categoryKey]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const companyMatch = row.companyName.toLowerCase().includes(companyName.toLowerCase().trim());
      const panMatch = row.pan.toLowerCase().includes(pan.toLowerCase().trim());
      const rowDate = row.reportDate;
      const startMatch = !startDate || rowDate >= startDate;
      const endMatch = !endDate || rowDate <= endDate;

      return companyMatch && panMatch && startMatch && endMatch;
    });
  }, [companyName, pan, startDate, endDate, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const selectedId = selectedCompany?.reportId || selectedCompany?.id;
      await downloadReportExport(format, categoryKey, selectedId);
      toast.success(
        selectedCompany
          ? `${format.toUpperCase()} export for selected company started`
          : `${format.toUpperCase()} export for all records started`
      );
    } catch (exportError: any) {
      toast.error(exportError?.message || `Failed to export ${format.toUpperCase()}`);
    }
  };

  const resetFilters = () => {
    setCompanyName('');
    setPan('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const onRowClick = (row: ReportRow) => {
    setSelectedCompany(row);
    setSelectedId(row.id);
    const targetId = row.reportId || row.id;
    navigate(`/website/reports/${categoryKey}/${targetId}`, {
      state: { selectedCompany: row }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">{category?.title || 'Report'}</h1>
        <p className="text-sm text-gray-500">{category?.description || 'Report details and downloadable exports.'}</p>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-500" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Company Name"
              placeholder="Search by company"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
            <Input
              label="PAN"
              placeholder="Search by PAN"
              value={pan}
              onChange={(event) => setPan(event.target.value)}
            />
            <Input
              label="From Date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {selectedCompany && (
            <div className="flex items-center justify-between rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary-800">
              <span>
                Selected: <strong>{selectedCompany.companyName}</strong> ({selectedCompany.pan})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCompany(null);
                  setSelectedId(null);
                }}
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Report Data</CardTitle>
          <p className="text-sm text-gray-500">{filteredRows.length} records</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-sm text-gray-500">Loading reports...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead>Report Date</TableHead>
                  <TableHead className="text-right">Amount (INR)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => {
                    const isSelected = selectedId === row.id;

                    return (
                      <TableRow
                        key={row.id}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary-50/80' : 'hover:bg-gray-50'}`}
                        onClick={() => onRowClick(row)}
                      >
                        <TableCell className="font-medium">{row.companyName}</TableCell>
                        <TableCell>{row.pan}</TableCell>
                        <TableCell>{row.reportDate}</TableCell>
                        <TableCell className="text-right">INR {row.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                      {error || 'No records found for selected filters.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {!loading && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
