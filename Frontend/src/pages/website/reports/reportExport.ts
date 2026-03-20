export interface ExportColumn<T> {
  label: string;
  value: (row: T) => string;
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

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function exportAsCsv<T>(fileName: string, rows: T[], columns: ExportColumn<T>[]) {
  const header = columns.map((column) => `"${column.label.replace(/"/g, '""')}"`).join(',');
  const body = rows.map((row) => {
    return columns
      .map((column) => `"${column.value(row).replace(/"/g, '""')}"`)
      .join(',');
  });
  downloadBlob([header, ...body].join('\n'), fileName, 'text/csv;charset=utf-8;');
}

export function exportAsExcel<T>(fileName: string, rows: T[], columns: ExportColumn<T>[]) {
  const header = columns.map((column) => column.label).join('\t');
  const body = rows.map((row) => columns.map((column) => column.value(row)).join('\t'));
  downloadBlob([header, ...body].join('\n'), fileName, 'application/vnd.ms-excel;charset=utf-8;');
}

export function exportAsPdf<T>(title: string, rows: T[], columns: ExportColumn<T>[]) {
  const popup = window.open('', '_blank');
  if (!popup) return false;

  const header = columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('');
  const body = rows.map((row) => {
    return `<tr>${columns.map((column) => `<td>${escapeHtml(column.value(row))}</td>`).join('')}</tr>`;
  }).join('');

  popup.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)} Export</title>
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
        <h1>${escapeHtml(title)}</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
        <table>
          <thead>
            <tr>${header}</tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
  return true;
}

