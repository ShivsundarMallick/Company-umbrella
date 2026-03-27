export type ReportCategoryKey =
  | 'roc'
  | 'tds'
  | 'company-pan-register'
  | 'company-document-register'
  | 'pending-tax'
  | 'tax-payment-history'
  | 'compliance-status'
  | 'company-registration'
  | 'gst-filing'
  | 'document-expiry'
  | 'audit'
  | 'user-activity';

export interface ReportRow {
  id: string;
  reportId?: string | null;
  companyId?: string | null;
  categoryId?: string;
  title?: string;
  companyName: string;
  pan: string;
  reportDate: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Overdue' | 'In Progress';
  uploadedAt?: string;
  registeredAt?: string;
  expiryDate?: string;
  fileName?: string;
  filePath?: string;
  mimeType?: string;
  size?: number;
  tier?: string | null;
  companyEmail?: string | null;
}

export interface ReportCategory {
  key: ReportCategoryKey;
  title: string;
  description: string;
  href: string;
}

export const REPORT_CATEGORIES: ReportCategory[] = [
  {
    key: 'tds',
    title: 'TDS Report',
    description: 'Track TDS deductions, filings, and status by company.',
    href: '/website/reports/tds',
  },
  {
    key: 'company-pan-register',
    title: 'Company PAN Register Report',
    description: 'Maintain PAN-level registry and validation details.',
    href: '/website/reports/company-pan-register',
  },
  {
    key: 'company-document-register',
    title: 'Company Document Register',
    description: 'Review company compliance document submission history.',
    href: '/website/reports/company-document-register',
  },
  {
    key: 'pending-tax',
    title: 'Pending Tax Report',
    description: 'Identify pending tax liabilities and due dates.',
    href: '/website/reports/pending-tax',
  },
  {
    key: 'tax-payment-history',
    title: 'Tax Payment History',
    description: 'Audit completed tax payments and transaction timelines.',
    href: '/website/reports/tax-payment-history',
  },
  {
    key: 'compliance-status',
    title: 'Compliance Status Report',
    description: 'View ongoing and completed compliance status by company.',
    href: '/website/reports/compliance-status',
  },
  {
    key: 'company-registration',
    title: 'Company Registration Report',
    description: 'Display all registered companies and current registration status.',
    href: '/website/reports/company-registration',
  },
  {
    key: 'gst-filing',
    title: 'GST Filing Report',
    description: 'Track GST return filing period, status, and late fee details.',
    href: '/website/reports/gst-filing',
  },
  {
    key: 'document-expiry',
    title: 'Document Expiry Report',
    description: 'Monitor expiring and expired company compliance documents.',
    href: '/website/reports/document-expiry',
  },
  {
    key: 'audit',
    title: 'Audit Report',
    description: 'Review audit history, findings, and compliance status.',
    href: '/website/reports/audit',
  },
  {
    key: 'user-activity',
    title: 'User Activity Report',
    description: 'Track user actions, modules accessed, and system activity logs.',
    href: '/website/reports/user-activity',
  },
  {
    key: 'roc',
    title: 'ROC MCA Report',
    description: 'Track ROC filings and Ministry of Corporate Affairs compliance status.',
    href: '/website/reports/roc',
  },
];

const sharedRows: ReportRow[] = [
  {
    id: 'rpt-001',
    companyName: 'Apex Livelihood Pvt Ltd',
    pan: 'AAECA1234K',
    reportDate: '2026-02-12',
    amount: 124500,
    status: 'Completed',
  },
  {
    id: 'rpt-002',
    companyName: 'GreenField Agro Solutions',
    pan: 'AAFCG5678M',
    reportDate: '2026-02-16',
    amount: 87500,
    status: 'Pending',
  },
  {
    id: 'rpt-003',
    companyName: 'Nova Rural Ventures',
    pan: 'AABCN9012P',
    reportDate: '2026-02-21',
    amount: 239900,
    status: 'In Progress',
  },
  {
    id: 'rpt-004',
    companyName: 'BlueSky Livelihood LLP',
    pan: 'AANFB3344T',
    reportDate: '2026-02-25',
    amount: 45200,
    status: 'Completed',
  },
  {
    id: 'rpt-005',
    companyName: 'NorthBridge Producer Co.',
    pan: 'AAJCN7788R',
    reportDate: '2026-03-01',
    amount: 167300,
    status: 'Overdue',
  },
  {
    id: 'rpt-006',
    companyName: 'Sahara Skill Development',
    pan: 'AAICS4567Q',
    reportDate: '2026-03-03',
    amount: 56400,
    status: 'Pending',
  },
];

export const REPORT_DATA: Record<ReportCategoryKey, ReportRow[]> = {
  roc: sharedRows,
  tds: sharedRows,
  'company-pan-register': sharedRows,
  'company-document-register': sharedRows,
  'pending-tax': sharedRows,
  'tax-payment-history': sharedRows,
  'compliance-status': sharedRows,
  'company-registration': sharedRows,
  'gst-filing': sharedRows,
  'document-expiry': sharedRows,
  audit: sharedRows,
  'user-activity': sharedRows,
};
