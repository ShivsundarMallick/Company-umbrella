import { API_BASE_URL } from '../../../config';
import type { ReportCategoryKey, ReportRow } from './reportData';

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}

function buildUrl(path: string, categoryKey?: ReportCategoryKey) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (categoryKey) {
    url.searchParams.set('category', categoryKey);
  }
  return url.toString();
}

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.message) {
        errorMessage = payload.message;
      }
    } catch {
      // Keep default fallback message
    }
    throw new Error(errorMessage);
  }

  const payload = await response.json();
  return payload?.data as T;
}

export async function fetchReports(categoryKey: ReportCategoryKey): Promise<ReportRow[]> {
  return requestJson<ReportRow[]>(buildUrl('/reports', categoryKey));
}

export async function fetchReportById(id: string): Promise<ReportRow> {
  return requestJson<ReportRow>(buildUrl(`/reports/${id}`));
}

export async function downloadReportExport(
  format: 'pdf' | 'excel' | 'csv',
  categoryKey: ReportCategoryKey,
  reportId?: string
) {
  const endpoint = format === 'excel' ? 'excel' : format;
  const idPath = reportId ? `/${reportId}` : '';
  const url = buildUrl(`/reports/export/${endpoint}${idPath}`, categoryKey);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Export failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const suffix = reportId ? 'selected' : 'all';
  const extension = format === 'excel' ? 'xls' : format;

  anchor.href = objectUrl;
  anchor.download = `${categoryKey}-${suffix}.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function utf8Length(value: string) {
  return new TextEncoder().encode(value).length;
}

function buildSimplePdf(rows: ReportRow[], title: string): Blob {
  const printableRows = rows.length
    ? rows
    : [{ companyName: 'No data', pan: '-', reportDate: '-', amount: 0, status: 'In Progress' } as ReportRow];

  const lines = printableRows.slice(0, 28).map((row, index) => {
    const amount = Number(row.amount || 0).toLocaleString('en-IN');
    return `${index + 1}. ${row.companyName} | ${row.pan} | ${row.reportDate} | INR ${amount} | ${row.status}`;
  });

  const contentParts = ['BT', '/F1 12 Tf', '50 790 Td', `(${escapePdfText(title)}) Tj`, '/F1 10 Tf'];
  lines.forEach((line) => {
    contentParts.push('0 -18 Td');
    contentParts.push(`(${escapePdfText(line)}) Tj`);
  });
  contentParts.push('ET');

  const stream = contentParts.join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${utf8Length(stream)} >>\nstream\n${stream}\nendstream\nendobj\n`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const object of objects) {
    offsets.push(utf8Length(pdf));
    pdf += object;
  }

  const xrefStart = utf8Length(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export function downloadLocalReportExport(
  format: 'pdf' | 'excel' | 'csv',
  categoryKey: ReportCategoryKey,
  row: ReportRow
) {
  const safeCategory = categoryKey || 'report';

  if (format === 'pdf') {
    const pdfBlob = buildSimplePdf([row], 'Company Report Export');
    triggerDownload(pdfBlob, `${safeCategory}-selected.pdf`);
    return;
  }

  const header = ['Company Name', 'PAN', 'Report Date', 'Amount (INR)', 'Status', 'Category'];
  const values = [
    row.companyName || '',
    row.pan || '',
    row.reportDate || '',
    String(row.amount ?? 0),
    row.status || '',
    row.title || row.categoryId || ''
  ];

  const content =
    format === 'excel'
      ? [header, values].map((line) => line.join('\t')).join('\n')
      : [header, values]
          .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
          .join('\n');

  const blobType = format === 'excel' ? 'application/vnd.ms-excel; charset=utf-8' : 'text/csv; charset=utf-8';
  const ext = format === 'excel' ? 'xls' : 'csv';
  triggerDownload(new Blob([content], { type: blobType }), `${safeCategory}-selected.${ext}`);
}
