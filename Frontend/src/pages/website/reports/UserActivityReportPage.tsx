import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui';
import { exportAsCsv, exportAsExcel, exportAsPdf, type ExportColumn } from './reportExport';

interface UserActivityRow {
  id: string;
  userName: string;
  role: string;
  actionPerformed: string;
  moduleAccessed: string;
  dateTime: string;
  ipAddress: string;
}

const rows: UserActivityRow[] = [
  { id: 'ua-001', userName: 'Anita Das', role: 'Admin', actionPerformed: 'Exported report', moduleAccessed: 'Reports', dateTime: '2026-03-05 09:12', ipAddress: '10.10.2.18' },
  { id: 'ua-002', userName: 'Rohit Kumar', role: 'Manager', actionPerformed: 'Updated filing status', moduleAccessed: 'GST Filing', dateTime: '2026-03-05 11:42', ipAddress: '10.10.2.25' },
  { id: 'ua-003', userName: 'Meera Singh', role: 'Auditor', actionPerformed: 'Reviewed audit entry', moduleAccessed: 'Audit', dateTime: '2026-03-06 10:08', ipAddress: '10.10.4.11' },
  { id: 'ua-004', userName: 'Rahul Jain', role: 'Manager', actionPerformed: 'Viewed expiry report', moduleAccessed: 'Document Expiry', dateTime: '2026-03-06 12:27', ipAddress: '10.10.1.44' },
];

const exportColumns: ExportColumn<UserActivityRow>[] = [
  { label: 'User Name', value: (row) => row.userName },
  { label: 'Role', value: (row) => row.role },
  { label: 'Action Performed', value: (row) => row.actionPerformed },
  { label: 'Module Accessed', value: (row) => row.moduleAccessed },
  { label: 'Date and Time', value: (row) => row.dateTime },
  { label: 'IP Address', value: (row) => row.ipAddress },
];

export default function UserActivityReportPage() {
  const [userSearch, setUserSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const userMatch = row.userName.toLowerCase().includes(userSearch.toLowerCase().trim());
      const moduleMatch = moduleFilter === 'all' || row.moduleAccessed === moduleFilter;
      const rowDate = row.dateTime.slice(0, 10);
      const fromMatch = !fromDate || rowDate >= fromDate;
      const toMatch = !toDate || rowDate <= toDate;
      return userMatch && moduleMatch && fromMatch && toMatch;
    });
  }, [userSearch, moduleFilter, fromDate, toDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Activity Report</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor activities performed by users across system modules.</p>
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
            <Input label="User Name" placeholder="Filter by user" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} />
            <Select
              label="Module"
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              options={[
                { value: 'all', label: 'All Modules' },
                { value: 'Reports', label: 'Reports' },
                { value: 'GST Filing', label: 'GST Filing' },
                { value: 'Audit', label: 'Audit' },
                { value: 'Document Expiry', label: 'Document Expiry' },
              ]}
            />
            <Input label="From Date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            <Input label="To Date" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => { setUserSearch(''); setModuleFilter('all'); setFromDate(''); setToDate(''); }}><RotateCcw className="w-4 h-4" />Reset Filters</Button>
            <Button variant="outline" onClick={() => {
              if (!exportAsPdf('User Activity Report', filteredRows, exportColumns)) {
                toast.error('Enable pop-ups to export PDF');
                return;
              }
              toast.success('PDF export opened for print/save');
            }}><FileText className="w-4 h-4" />Export PDF</Button>
            <Button variant="outline" onClick={() => { exportAsExcel('user-activity-report.xls', filteredRows, exportColumns); toast.success('Excel export started'); }}><FileSpreadsheet className="w-4 h-4" />Export Excel</Button>
            <Button variant="outline" onClick={() => { exportAsCsv('user-activity-report.csv', filteredRows, exportColumns); toast.success('CSV export started'); }}><Download className="w-4 h-4" />Export CSV</Button>
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
                <TableHead>User Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action Performed</TableHead>
                <TableHead>Module Accessed</TableHead>
                <TableHead>Date and Time</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length > 0 ? filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.userName}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.actionPerformed}</TableCell>
                  <TableCell>{row.moduleAccessed}</TableCell>
                  <TableCell>{row.dateTime}</TableCell>
                  <TableCell>{row.ipAddress}</TableCell>
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

