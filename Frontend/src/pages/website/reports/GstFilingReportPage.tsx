import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, CardContent, CardHeader, CardTitle, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui';
import { exportAsCsv, exportAsExcel, exportAsPdf, type ExportColumn } from './reportExport';

interface GstFilingRow {
  id: string;
  companyName: string;
  gstNumber: string;
  filingPeriod: string;
  filingStatus: 'Filed' | 'Pending';
  filingDate: string;
  lateFee: number;
}

const rows: GstFilingRow[] = [
  { id: 'gst-001', companyName: 'Apex Livelihood Pvt Ltd', gstNumber: '27AAECA1234K1Z2', filingPeriod: '2026-Q1', filingStatus: 'Filed', filingDate: '2026-01-28', lateFee: 0 },
  { id: 'gst-002', companyName: 'GreenField Agro Solutions', gstNumber: '19AAFCG5678M1Z1', filingPeriod: '2026-Q1', filingStatus: 'Pending', filingDate: '-', lateFee: 1200 },
  { id: 'gst-003', companyName: 'Nova Rural Ventures', gstNumber: '10AABCN9012P1ZQ', filingPeriod: '2026-02', filingStatus: 'Filed', filingDate: '2026-02-21', lateFee: 0 },
  { id: 'gst-004', companyName: 'BlueSky Livelihood LLP', gstNumber: '21AANFB3344T1Z9', filingPeriod: '2026-02', filingStatus: 'Pending', filingDate: '-', lateFee: 800 },
];

const exportColumns: ExportColumn<GstFilingRow>[] = [
  { label: 'Company Name', value: (row) => row.companyName },
  { label: 'GST Number', value: (row) => row.gstNumber },
  { label: 'Filing Period', value: (row) => row.filingPeriod },
  { label: 'Filing Status', value: (row) => row.filingStatus },
  { label: 'Filing Date', value: (row) => row.filingDate },
  { label: 'Late Fee', value: (row) => row.lateFee.toString() },
];

const periodOptions = [
  { value: 'all', label: 'All' },
  { value: '2026-Q1', label: '2026 Quarter 1' },
  { value: '2026-02', label: 'February 2026' },
];

export default function GstFilingReportPage() {
  const [period, setPeriod] = useState('all');
  const [status, setStatus] = useState('all');

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const periodMatch = period === 'all' || row.filingPeriod === period;
      const statusMatch = status === 'all' || row.filingStatus === status;
      return periodMatch && statusMatch;
    });
  }, [period, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">GST Filing Report</h1>
        <p className="text-sm text-gray-500 mt-1">Track GST filing details and pending submissions across companies.</p>
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
            <Select label="Filing Period" value={period} onChange={(event) => setPeriod(event.target.value)} options={periodOptions} />
            <Select
              label="Filing Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'Filed', label: 'Filed' },
                { value: 'Pending', label: 'Pending' },
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => { setPeriod('all'); setStatus('all'); }}><RotateCcw className="w-4 h-4" />Reset Filters</Button>
            <Button variant="outline" onClick={() => {
              if (!exportAsPdf('GST Filing Report', filteredRows, exportColumns)) {
                toast.error('Enable pop-ups to export PDF');
                return;
              }
              toast.success('PDF export opened for print/save');
            }}><FileText className="w-4 h-4" />Export PDF</Button>
            <Button variant="outline" onClick={() => { exportAsExcel('gst-filing-report.xls', filteredRows, exportColumns); toast.success('Excel export started'); }}><FileSpreadsheet className="w-4 h-4" />Export Excel</Button>
            <Button variant="outline" onClick={() => { exportAsCsv('gst-filing-report.csv', filteredRows, exportColumns); toast.success('CSV export started'); }}><Download className="w-4 h-4" />Export CSV</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Report Data</CardTitle>
          <p className="text-sm text-gray-500">{filteredRows.length} records</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>GST Number</TableHead>
                <TableHead>Filing Period</TableHead>
                <TableHead>Filing Status</TableHead>
                <TableHead>Filing Date</TableHead>
                <TableHead className="text-right">Late Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length > 0 ? filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.companyName}</TableCell>
                  <TableCell>{row.gstNumber}</TableCell>
                  <TableCell>{row.filingPeriod}</TableCell>
                  <TableCell>{row.filingStatus}</TableCell>
                  <TableCell>{row.filingDate}</TableCell>
                  <TableCell className="text-right">INR {row.lateFee.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-10">No records found for selected filters.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

