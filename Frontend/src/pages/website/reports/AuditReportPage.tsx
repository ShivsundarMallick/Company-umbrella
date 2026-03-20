import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui';
import { exportAsCsv, exportAsExcel, exportAsPdf, type ExportColumn } from './reportExport';

interface AuditRow {
  id: string;
  companyName: string;
  auditorName: string;
  auditDate: string;
  auditType: string;
  findings: string;
  complianceStatus: 'Compliant' | 'Needs Action' | 'Non-Compliant';
}

const rows: AuditRow[] = [
  { id: 'ar-001', companyName: 'Apex Livelihood Pvt Ltd', auditorName: 'R. Sharma', auditDate: '2026-01-14', auditType: 'Internal', findings: 'Minor documentation gaps', complianceStatus: 'Needs Action' },
  { id: 'ar-002', companyName: 'GreenField Agro Solutions', auditorName: 'S. Iyer', auditDate: '2026-02-06', auditType: 'Statutory', findings: 'All controls verified', complianceStatus: 'Compliant' },
  { id: 'ar-003', companyName: 'Nova Rural Ventures', auditorName: 'R. Sharma', auditDate: '2026-02-25', auditType: 'Tax', findings: 'Delayed filing detected', complianceStatus: 'Non-Compliant' },
  { id: 'ar-004', companyName: 'BlueSky Livelihood LLP', auditorName: 'M. Gupta', auditDate: '2026-03-01', auditType: 'Internal', findings: 'No critical issues', complianceStatus: 'Compliant' },
];

const exportColumns: ExportColumn<AuditRow>[] = [
  { label: 'Company Name', value: (row) => row.companyName },
  { label: 'Auditor Name', value: (row) => row.auditorName },
  { label: 'Audit Date', value: (row) => row.auditDate },
  { label: 'Audit Type', value: (row) => row.auditType },
  { label: 'Findings', value: (row) => row.findings },
  { label: 'Compliance Status', value: (row) => row.complianceStatus },
];

export default function AuditReportPage() {
  const [auditorName, setAuditorName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const auditorMatch = row.auditorName.toLowerCase().includes(auditorName.toLowerCase().trim());
      const fromMatch = !fromDate || row.auditDate >= fromDate;
      const toMatch = !toDate || row.auditDate <= toDate;
      return auditorMatch && fromMatch && toMatch;
    });
  }, [auditorName, fromDate, toDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Report</h1>
        <p className="text-sm text-gray-500 mt-1">Track audit history, findings, and compliance outcomes.</p>
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
            <Input label="Auditor Name" placeholder="Filter by auditor name" value={auditorName} onChange={(event) => setAuditorName(event.target.value)} />
            <Input label="From Date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            <Input label="To Date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => { setAuditorName(''); setFromDate(''); setToDate(''); }}><RotateCcw className="w-4 h-4" />Reset Filters</Button>
            <Button variant="outline" onClick={() => {
              if (!exportAsPdf('Audit Report', filteredRows, exportColumns)) {
                toast.error('Enable pop-ups to export PDF');
                return;
              }
              toast.success('PDF export opened for print/save');
            }}><FileText className="w-4 h-4" />Export PDF</Button>
            <Button variant="outline" onClick={() => { exportAsExcel('audit-report.xls', filteredRows, exportColumns); toast.success('Excel export started'); }}><FileSpreadsheet className="w-4 h-4" />Export Excel</Button>
            <Button variant="outline" onClick={() => { exportAsCsv('audit-report.csv', filteredRows, exportColumns); toast.success('CSV export started'); }}><Download className="w-4 h-4" />Export CSV</Button>
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
                <TableHead>Auditor Name</TableHead>
                <TableHead>Audit Date</TableHead>
                <TableHead>Audit Type</TableHead>
                <TableHead>Findings</TableHead>
                <TableHead>Compliance Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length > 0 ? filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.companyName}</TableCell>
                  <TableCell>{row.auditorName}</TableCell>
                  <TableCell>{row.auditDate}</TableCell>
                  <TableCell>{row.auditType}</TableCell>
                  <TableCell>{row.findings}</TableCell>
                  <TableCell>{row.complianceStatus}</TableCell>
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

