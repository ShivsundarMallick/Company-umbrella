import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui';
import { REPORT_CATEGORIES, REPORT_DATA, type ReportCategoryKey, type ReportRow } from './reportData';

interface ReportTablePageProps {
  categoryKey: ReportCategoryKey;
}

function downloadBlob(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function toCsvRows(rows: ReportRow[]) {
  const header = ['Company Name', 'PAN', 'Report Date', 'Amount (INR)', 'Status'];
  const lines = rows.map((row) => [
    row.companyName,
    row.pan,
    row.reportDate,
    row.amount.toString(),
    row.status,
  ]);

  return [header, ...lines]
    .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export default function ReportTablePage({ categoryKey }: ReportTablePageProps) {
  const category = REPORT_CATEGORIES.find((item) => item.key === categoryKey);
  const rows = REPORT_DATA[categoryKey] || [];

  const [companyName, setCompanyName] = useState('');
  const [pan, setPan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const exportAsCsv = () => {
    const csv = toCsvRows(filteredRows);
    downloadBlob(csv, `${categoryKey}-report.csv`, 'text/csv;charset=utf-8;');
    toast.success('CSV export started');
  };

  const exportAsExcel = () => {
    const lines = [
      ['Company Name', 'PAN', 'Report Date', 'Amount (INR)', 'Status'].join('\t'),
      ...filteredRows.map((row) => [
        row.companyName,
        row.pan,
        row.reportDate,
        row.amount.toString(),
        row.status,
      ].join('\t')),
    ].join('\n');

    downloadBlob(lines, `${categoryKey}-report.xls`, 'application/vnd.ms-excel;charset=utf-8;');
    toast.success('Excel export started');
  };

  const exportAsPdf = () => {
    const popup = window.open('', '_blank');
    if (!popup) {
      toast.error('Enable pop-ups to export PDF');
      return;
    }

    const tableRows = filteredRows.map((row) => `
      <tr>
        <td>${row.companyName}</td>
        <td>${row.pan}</td>
        <td>${row.reportDate}</td>
        <td>INR ${row.amount.toLocaleString()}</td>
        <td>${row.status}</td>
      </tr>
    `).join('');

    popup.document.write(`
      <html>
        <head>
          <title>${category?.title || 'Report'} Export</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            p { margin-top: 0; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>${category?.title || 'Report'}</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
          <table>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>PAN</th>
                <th>Report Date</th>
                <th>Amount (INR)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
    toast.success('PDF export opened for print/save');
  };

  const resetFilters = () => {
    setCompanyName('');
    setPan('');
    setStartDate('');
    setEndDate('');
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
            <Button variant="outline" onClick={exportAsPdf}>
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={exportAsExcel}>
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={exportAsCsv}>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
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
                <TableHead>PAN</TableHead>
                <TableHead>Report Date</TableHead>
                <TableHead className="text-right">Amount (INR)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.companyName}</TableCell>
                    <TableCell>{row.pan}</TableCell>
                    <TableCell>{row.reportDate}</TableCell>
                    <TableCell className="text-right">INR {row.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-10">
                    No records found for selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

