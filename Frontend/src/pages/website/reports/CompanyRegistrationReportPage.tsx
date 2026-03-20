import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui';
import { exportAsCsv, exportAsExcel, exportAsPdf, type ExportColumn } from './reportExport';

interface CompanyRegistrationRow {
  id: string;
  companyName: string;
  registrationNumber: string;
  panNumber: string;
  gstNumber: string;
  registrationDate: string;
  status: 'Active' | 'Inactive';
}

const rows: CompanyRegistrationRow[] = [
  { id: 'cr-001', companyName: 'Apex Livelihood Pvt Ltd', registrationNumber: 'REG-2025-1102', panNumber: 'AAECA1234K', gstNumber: '27AAECA1234K1Z2', registrationDate: '2025-11-02', status: 'Active' },
  { id: 'cr-002', companyName: 'GreenField Agro Solutions', registrationNumber: 'REG-2025-1208', panNumber: 'AAFCG5678M', gstNumber: '19AAFCG5678M1Z1', registrationDate: '2025-12-08', status: 'Active' },
  { id: 'cr-003', companyName: 'Nova Rural Ventures', registrationNumber: 'REG-2026-0115', panNumber: 'AABCN9012P', gstNumber: '10AABCN9012P1ZQ', registrationDate: '2026-01-15', status: 'Inactive' },
  { id: 'cr-004', companyName: 'BlueSky Livelihood LLP', registrationNumber: 'REG-2026-0204', panNumber: 'AANFB3344T', gstNumber: '21AANFB3344T1Z9', registrationDate: '2026-02-04', status: 'Active' },
];

const exportColumns: ExportColumn<CompanyRegistrationRow>[] = [
  { label: 'Company Name', value: (row) => row.companyName },
  { label: 'Registration Number', value: (row) => row.registrationNumber },
  { label: 'PAN Number', value: (row) => row.panNumber },
  { label: 'GST Number', value: (row) => row.gstNumber },
  { label: 'Registration Date', value: (row) => row.registrationDate },
  { label: 'Status', value: (row) => row.status },
];

export default function CompanyRegistrationReportPage() {
  const [companySearch, setCompanySearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('all');

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const companyMatch = row.companyName.toLowerCase().includes(companySearch.toLowerCase().trim());
      const statusMatch = status === 'all' || row.status === status;
      const fromMatch = !fromDate || row.registrationDate >= fromDate;
      const toMatch = !toDate || row.registrationDate <= toDate;
      return companyMatch && statusMatch && fromMatch && toMatch;
    });
  }, [companySearch, fromDate, toDate, status]);

  const handleExportCsv = () => {
    exportAsCsv('company-registration-report.csv', filteredRows, exportColumns);
    toast.success('CSV export started');
  };

  const handleExportExcel = () => {
    exportAsExcel('company-registration-report.xls', filteredRows, exportColumns);
    toast.success('Excel export started');
  };

  const handleExportPdf = () => {
    if (!exportAsPdf('Company Registration Report', filteredRows, exportColumns)) {
      toast.error('Enable pop-ups to export PDF');
      return;
    }
    toast.success('PDF export opened for print/save');
  };

  const resetFilters = () => {
    setCompanySearch('');
    setFromDate('');
    setToDate('');
    setStatus('all');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Registration Report</h1>
        <p className="text-sm text-gray-500 mt-1">Display and manage all registered companies.</p>
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
            <Input label="Company Name" placeholder="Search by company name" value={companySearch} onChange={(event) => setCompanySearch(event.target.value)} />
            <Input label="From Registration Date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            <Input label="To Registration Date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
            <Select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={resetFilters}><RotateCcw className="w-4 h-4" />Reset Filters</Button>
            <Button variant="outline" onClick={handleExportPdf}><FileText className="w-4 h-4" />Export PDF</Button>
            <Button variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="w-4 h-4" />Export Excel</Button>
            <Button variant="outline" onClick={handleExportCsv}><Download className="w-4 h-4" />Export CSV</Button>
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
                <TableHead>Registration Number</TableHead>
                <TableHead>PAN Number</TableHead>
                <TableHead>GST Number</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length > 0 ? filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.companyName}</TableCell>
                  <TableCell>{row.registrationNumber}</TableCell>
                  <TableCell>{row.panNumber}</TableCell>
                  <TableCell>{row.gstNumber}</TableCell>
                  <TableCell>{row.registrationDate}</TableCell>
                  <TableCell>{row.status}</TableCell>
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

