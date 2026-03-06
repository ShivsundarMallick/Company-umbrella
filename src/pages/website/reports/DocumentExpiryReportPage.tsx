import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui';
import { exportAsCsv, exportAsExcel, exportAsPdf, type ExportColumn } from './reportExport';

interface DocumentExpiryRow {
  id: string;
  companyName: string;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
}

const rows: DocumentExpiryRow[] = [
  { id: 'de-001', companyName: 'Apex Livelihood Pvt Ltd', documentType: 'PAN Certificate', documentNumber: 'PAN-22331', issueDate: '2021-01-11', expiryDate: '2027-01-10', daysRemaining: 310, status: 'Valid' },
  { id: 'de-002', companyName: 'GreenField Agro Solutions', documentType: 'GST Certificate', documentNumber: 'GST-11922', issueDate: '2021-09-07', expiryDate: '2026-03-20', daysRemaining: 14, status: 'Expiring Soon' },
  { id: 'de-003', companyName: 'Nova Rural Ventures', documentType: 'Trade License', documentNumber: 'TL-76820', issueDate: '2020-05-14', expiryDate: '2026-02-22', daysRemaining: -12, status: 'Expired' },
  { id: 'de-004', companyName: 'BlueSky Livelihood LLP', documentType: 'Incorporation Certificate', documentNumber: 'INC-00491', issueDate: '2019-08-21', expiryDate: '2026-05-04', daysRemaining: 59, status: 'Valid' },
];

const exportColumns: ExportColumn<DocumentExpiryRow>[] = [
  { label: 'Company Name', value: (row) => row.companyName },
  { label: 'Document Type', value: (row) => row.documentType },
  { label: 'Document Number', value: (row) => row.documentNumber },
  { label: 'Issue Date', value: (row) => row.issueDate },
  { label: 'Expiry Date', value: (row) => row.expiryDate },
  { label: 'Days Remaining', value: (row) => row.daysRemaining.toString() },
  { label: 'Status', value: (row) => row.status },
];

const statusStyles: Record<DocumentExpiryRow['status'], string> = {
  Valid: 'bg-green-50 text-green-700',
  'Expiring Soon': 'bg-amber-50 text-amber-700',
  Expired: 'bg-red-50 text-red-700',
};

export default function DocumentExpiryReportPage() {
  const [companySearch, setCompanySearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const companyMatch = row.companyName.toLowerCase().includes(companySearch.toLowerCase().trim());
      const fromMatch = !fromDate || row.expiryDate >= fromDate;
      const toMatch = !toDate || row.expiryDate <= toDate;
      return companyMatch && fromMatch && toMatch;
    });
  }, [companySearch, fromDate, toDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Expiry Report</h1>
        <p className="text-sm text-gray-500 mt-1">Track document expiry and highlight expired company documents.</p>
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
            <Input label="Expiry Date From" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            <Input label="Expiry Date To" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => { setCompanySearch(''); setFromDate(''); setToDate(''); }}><RotateCcw className="w-4 h-4" />Reset Filters</Button>
            <Button variant="outline" onClick={() => {
              if (!exportAsPdf('Document Expiry Report', filteredRows, exportColumns)) {
                toast.error('Enable pop-ups to export PDF');
                return;
              }
              toast.success('PDF export opened for print/save');
            }}><FileText className="w-4 h-4" />Export PDF</Button>
            <Button variant="outline" onClick={() => { exportAsExcel('document-expiry-report.xls', filteredRows, exportColumns); toast.success('Excel export started'); }}><FileSpreadsheet className="w-4 h-4" />Export Excel</Button>
            <Button variant="outline" onClick={() => { exportAsCsv('document-expiry-report.csv', filteredRows, exportColumns); toast.success('CSV export started'); }}><Download className="w-4 h-4" />Export CSV</Button>
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
                <TableHead>Document Type</TableHead>
                <TableHead>Document Number</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-right">Days Remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length > 0 ? filteredRows.map((row) => (
                <TableRow key={row.id} className={row.status === 'Expired' ? 'bg-red-50/40' : ''}>
                  <TableCell className="font-medium">{row.companyName}</TableCell>
                  <TableCell>{row.documentType}</TableCell>
                  <TableCell>{row.documentNumber}</TableCell>
                  <TableCell>{row.issueDate}</TableCell>
                  <TableCell>{row.expiryDate}</TableCell>
                  <TableCell className="text-right">{row.daysRemaining}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusStyles[row.status]}`}>
                      {row.status}
                    </span>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-10">No records found for selected filters.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

