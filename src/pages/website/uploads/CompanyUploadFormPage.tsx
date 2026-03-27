import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, FileText, CheckCircle2,
    Calendar, Info, UploadCloud, ChevronDown, ChevronUp
} from 'lucide-react';
import {
    Card, CardContent, Badge, FileUpload, Button
} from '../../../components/ui';
import { companiesService } from '../../../services';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../../config';

interface DocumentCategory {
    id: string;
    title: string;
    description?: string;
    requirements?: string[];
    dueDate?: string;
    formName?: string;
    type: 'compliance' | 'report';
}

interface DocumentTimingMeta {
    registeredAt: string;
    expiryDate: string;
    daysRemaining: number;
}

const CATEGORIES: DocumentCategory[] = [
    // Reports (10 categories as per request)
    { id: 'tds-report', title: 'TDS Report', description: 'Track TDS deductions, filings, and status.', type: 'report' },
    { id: 'pan-register', title: 'Company PAN Register Report', description: 'PAN-level registry and validation details.', type: 'report' },
    { id: 'document-register', title: 'Company Document Register', description: 'Compliance document submission history.', type: 'report' },
    { id: 'pending-tax', title: 'Pending Tax Report', description: 'Identify pending tax liabilities and due dates.', type: 'report' },
    { id: 'tax-payment-history', title: 'Tax Payment History', description: 'Audit completed tax payments and timelines.', type: 'report' },
    { id: 'compliance-status-report', title: 'Compliance Status Report', description: 'Ongoing and completed compliance status.', type: 'report' },
    { id: 'registration-report', title: 'Company Registration Report', description: 'Registered companies and status.', type: 'report' },
    { id: 'gst-filing-report', title: 'GST Filing Report', description: 'Track GST return filing period and status.', type: 'report' },
    { id: 'document-expiry-report', title: 'Document Expiry Report', description: 'Monitor expiring/expired documents.', type: 'report' },
    { id: 'audit-report', title: 'Audit Report', description: 'Review audit history and findings.', type: 'report' },
    { id: 'user-activity-report', title: 'User Activity Report', description: 'Track user actions and system logs.', type: 'report' },
    { id: 'roc-report', title: 'ROC MCA Report', description: 'Upload ROC and MCA filing/compliance report documents.', type: 'report' },

    // Compliance (13 categories as per request)
    {
        id: 'director-kyc',
        title: 'Director KYC',
        formName: 'DIR-3 KYC',
        requirements: ['PAN card of director', 'Aadhaar card', 'Address proof (bank statement / electricity bill)', 'Mobile number and email for OTP', 'Digital Signature Certificate (DSC)'],
        dueDate: '30 September',
        type: 'compliance'
    },
    {
        id: 'return-of-deposits',
        title: 'Return of Deposits',
        formName: 'DPT-3',
        requirements: ['Auditor certificate', 'Details of loans / deposits', 'List of lenders', 'Financial statement showing outstanding amount', 'Board resolution'],
        dueDate: '30 June',
        type: 'compliance'
    },
    {
        id: 'auditor-appointment',
        title: 'Auditor Appointment',
        formName: 'ADT-1',
        requirements: ['Auditor consent letter', 'Certificate of eligibility from auditor', 'Board resolution', 'Shareholder resolution (AGM)'],
        dueDate: 'Within 15 days of AGM',
        type: 'compliance'
    },
    {
        id: 'financial-statement',
        title: 'Financial Statement Filing',
        formName: 'AOC-4',
        requirements: ['Balance Sheet', 'Profit & Loss Statement', 'Cash Flow Statement', 'Director’s Report', 'Auditor’s Report', 'Notes to Accounts'],
        dueDate: 'Within 30 days of AGM',
        type: 'compliance'
    },
    {
        id: 'annual-return',
        title: 'Annual Return',
        formName: 'MGT-7 / MGT-7A',
        requirements: ['List of shareholders', 'List of directors and KMP', 'Shareholding pattern', 'Board meeting details', 'Certification from CA/CS (if required)'],
        dueDate: 'Within 60 days of AGM',
        type: 'compliance'
    },
    {
        id: 'commencement-business',
        title: 'Commencement of Business',
        formName: 'INC-20A',
        requirements: ['Bank statement of company account', 'Declaration of paid-up capital', 'Board resolution'],
        dueDate: 'Within 180 days of incorporation',
        type: 'compliance'
    },
    {
        id: 'msme-payment',
        title: 'MSME Payment Reporting',
        formName: 'MSME-1',
        requirements: ['Details of outstanding dues to MSME suppliers', 'Supplier list', 'Amount and delay details'],
        dueDate: 'April (Oct–Mar) / October (Apr–Sep)',
        type: 'compliance'
    },
    {
        id: 'beneficial-owner',
        title: 'Significant Beneficial Owner',
        formName: 'BEN-2',
        requirements: ['SBO declaration (BEN-1)', 'Identity proof of beneficial owner', 'Shareholding structure'],
        dueDate: 'Within 30 days of declaration',
        type: 'compliance'
    },
    {
        id: 'share-allotment',
        title: 'Share Allotment',
        formName: 'PAS-3',
        requirements: ['Board resolution', 'List of allottees', 'Shareholder approval', 'Valuation report (if applicable)'],
        dueDate: 'Within 30 days of allotment',
        type: 'compliance'
    },
    {
        id: 'change-directors',
        title: 'Change in Directors',
        formName: 'DIR-12',
        requirements: ['Director consent (DIR-2)', 'Resignation letter (if applicable)', 'Board resolution', 'Identity proof'],
        dueDate: 'Within 30 days of change',
        type: 'compliance'
    },
    {
        id: 'registered-office',
        title: 'Change of Registered Office',
        formName: 'INC-22',
        requirements: ['Rent agreement / ownership proof', 'Utility bill of premises', 'NOC from owner'],
        type: 'compliance'
    },
    {
        id: 'board-meetings',
        title: 'Board Meetings (Secretarial Compliance)',
        requirements: ['Board meeting notice', 'Agenda', 'Minutes of meeting', 'Attendance register'],
        dueDate: 'Minimum 4 meetings per year',
        type: 'compliance'
    },
    {
        id: 'agm',
        title: 'Annual General Meeting (AGM)',
        requirements: ['AGM notice', 'Director’s report', 'Auditor’s report', 'Financial statements', 'Attendance register', 'AGM minutes'],
        dueDate: 'Within 6 months after FY end',
        type: 'compliance'
    }
];

export default function CompanyUploadFormPage() {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState<any>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['director-kyc']));
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>({});
    const [documentMeta, setDocumentMeta] = useState<Record<string, DocumentTimingMeta>>({});
    const [uploadingByCategory, setUploadingByCategory] = useState<Record<string, boolean>>({});
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

    const getDaysLeftClass = (days: number) => {
        if (days < 15) return 'bg-red-100 text-red-700 border-red-200';
        if (days < 30) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-green-100 text-green-700 border-green-200';
    };

    const formatDateTime = (value?: string) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'N/A';
        return date.toLocaleString('en-IN');
    };

    useEffect(() => {
        console.log('[UploadDebug] Upload page mounted with route param companyId:', companyId);
        fetchCompanyDetails();
    }, [companyId]);

    const fetchCompanyDetails = async () => {
        try {
            if (!companyId) {
                console.error('[UploadDebug] Missing companyId in route params');
                toast.error('Invalid company route. Missing company ID.');
                navigate('/website/uploads');
                return;
            }

            const response = await companiesService.getById(companyId!);
            const c = response.data as any;
            
            if (!c) throw new Error('Company not found');

            // Map Company model to flat structure for the UI
            const mapped = {
                _id: c._id,
                name: c.companyData?.companyName || 'Unknown',
                email: c.companyData?.officialCompanyEmail || 'No email',
                role: c.tier
            };

            console.log('[UploadDebug] Company fetched for upload page:', {
                routeCompanyId: companyId,
                fetchedCompanyId: mapped._id,
                name: mapped.name,
                email: mapped.email,
                role: mapped.role
            });
            setCompany(mapped);
        } catch (error) {
            console.error('Failed to fetch company details:', error);
            toast.error('Company not found');
            navigate('/website/uploads');
        }
    };

    const toggleSection = (id: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleUpload = async (cat: DocumentCategory, file: File) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            toast.error('Authentication required');
            return;
        }

        console.log('[UploadDebug] Preparing upload request:', {
            routeCompanyId: companyId,
            selectedCategoryId: cat.id,
            selectedCategoryTitle: cat.title,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        });

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            setUploadErrors(prev => ({ ...prev, [cat.id]: 'Only PDF files are allowed.' }));
            toast.error('Only PDF files are allowed');
            return;
        }

        const maxBytes = 10 * 1024 * 1024;
        if (file.size > maxBytes) {
            setUploadErrors(prev => ({ ...prev, [cat.id]: 'File too large. Maximum size is 10MB.' }));
            toast.error('File too large. Maximum size is 10MB.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('categoryId', cat.id);
        formData.append('title', cat.title);
        formData.append('formName', cat.formName || '');
        formData.append('docType', cat.type);

        try {
            setUploadingByCategory(prev => ({ ...prev, [cat.id]: true }));
            setUploadErrors(prev => ({ ...prev, [cat.id]: '' }));

            const response = await fetch(`${API_BASE_URL}/documents/${companyId}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                console.error('[UploadDebug] Upload API non-200 response:', {
                    status: response.status,
                    payload
                });
                throw new Error(payload?.message || 'Upload failed');
            }

            const registration = payload?.registration || {};
            const document = payload?.document || {};

            setUploadedDocs(prev => ({ ...prev, [cat.id]: document.filePath || 'uploaded' }));
            setDocumentMeta(prev => ({
                ...prev,
                [cat.id]: {
                    registeredAt: registration.registeredAt || new Date().toISOString(),
                    expiryDate: registration.expiryDate || '',
                    daysRemaining: Number(registration.daysRemaining ?? 0)
                }
            }));

            toast.success(`${cat.title} uploaded successfully`);
        } catch (error: any) {
            const message = error?.message || `Failed to upload ${cat.title}`;
            setUploadErrors(prev => ({ ...prev, [cat.id]: message }));
            toast.error(message);
        } finally {
            setUploadingByCategory(prev => ({ ...prev, [cat.id]: false }));
        }
    };

    const handleSaveAll = () => {
        if (Object.keys(uploadedDocs).length === 0) {
            toast.error('No files uploaded to save');
            return;
        }
        // Simulation of saving
        console.log('Saving documents:', uploadedDocs);
        toast.success('All documents saved successfully!');
        navigate('/website/uploads');
    };

    if (!company) return <div className="flex items-center justify-center h-64 font-medium text-foreground">Loading company details...</div>;
    if (!company) return null;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => navigate('/website/uploads')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Companies
                </Button>
                <Button onClick={handleSaveAll} className="bg-primary hover:bg-primary/90">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Save All Uploads
                </Button>
            </div>

            <Card className="bg-gradient-to-r from-primary to-indigo-600 text-white border-none shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-bold ring-2 ring-white/30">
                                {company.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{company.name}</h1>
                                <div className="flex items-center gap-2 mt-1 opacity-90">
                                    <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                                        {company.role}
                                    </Badge>
                                    <span className="text-sm border-l border-white/30 pl-2 text-white/90">{company.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">
                {/* Compliance Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground border-l-4 border-amber-500 pl-3">Compliance Documents</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {CATEGORIES.filter(cat => cat.type === 'compliance').map((cat) => (
                            <Card key={cat.id} className="border-gray-200 hover:border-amber-200 transition-all overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50"
                                    onClick={() => toggleSection(cat.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${uploadedDocs[cat.id] ? 'bg-green-100' : 'bg-amber-100'}`}>
                                            {uploadedDocs[cat.id] ?
                                                <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                                <FileText className="w-5 h-5 text-amber-600" />
                                            }
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{cat.title}</h3>
                                            {cat.formName && <span className="text-xs font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded uppercase">{cat.formName}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {cat.dueDate && (
                                            <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Due: {cat.dueDate}
                                            </div>
                                        )}
                                        {expandedSections.has(cat.id) ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                                    </div>
                                </div>

                                {expandedSections.has(cat.id) && (
                                    <CardContent className="p-4 pt-0 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-2 text-sm text-foreground/80">
                                                    <Info className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-foreground">Requirements:</p>
                                                        <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                                                            {cat.requirements?.map((req, i) => <li key={i}>{req}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                                                <FileUpload
                                                    label="Upload Signed Document (PDF only)"
                                                    accept=".pdf"
                                                    maxSize={10}
                                                    value={uploadedDocs[cat.id]}
                                                    onFileSelect={(file) => handleUpload(cat, file)}
                                                    onChange={(url) => setUploadedDocs(prev => ({ ...prev, [cat.id]: url }))}
                                                    hint="Only PDF files are allowed (max 10MB)."
                                                    error={uploadErrors[cat.id]}
                                                    disabled={Boolean(uploadingByCategory[cat.id])}
                                                />
                                                {documentMeta[cat.id] && (
                                                    <div className="mt-3 rounded-lg border border-border bg-white p-3 text-xs space-y-2">
                                                        <div><span className="font-semibold">Document Register Date:</span> {formatDateTime(documentMeta[cat.id].registeredAt)}</div>
                                                        <div><span className="font-semibold">Expiry Date:</span> {formatDateTime(documentMeta[cat.id].expiryDate)}</div>
                                                        <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-semibold ${getDaysLeftClass(documentMeta[cat.id].daysRemaining)}`}>
                                                            Days Left: {documentMeta[cat.id].daysRemaining}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Reports Section */}
                <div className="space-y-4 pt-8">
                    <h2 className="text-xl font-bold text-foreground border-l-4 border-primary pl-3">Reports & Registers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CATEGORIES.filter(cat => cat.type === 'report').map((cat) => (
                            <Card key={cat.id} className="border-border hover:border-primary/20 hover:shadow-sm transition-all">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1 min-w-0">
                                            <h3 className="font-semibold text-foreground truncate">{cat.title}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                                        </div>
                                        <div className={`p-2 rounded-lg shrink-0 ${uploadedDocs[cat.id] ? 'bg-green-100' : 'bg-primary-50'}`}>
                                            {uploadedDocs[cat.id] ?
                                                <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                                                <UploadCloud className="w-5 h-5 text-primary-600" />
                                            }
                                        </div>
                                    </div>

                                    <FileUpload
                                        accept=".pdf"
                                        maxSize={10}
                                        value={uploadedDocs[cat.id]}
                                        onFileSelect={(file) => handleUpload(cat, file)}
                                        onChange={(url) => setUploadedDocs(prev => ({ ...prev, [cat.id]: url }))}
                                        hint="PDF only (max 10MB)"
                                        error={uploadErrors[cat.id]}
                                        disabled={Boolean(uploadingByCategory[cat.id])}
                                        showPreview={false}
                                    />

                                    {documentMeta[cat.id] && (
                                        <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs space-y-2">
                                            <div><span className="font-semibold">Document Register Date:</span> {formatDateTime(documentMeta[cat.id].registeredAt)}</div>
                                            <div><span className="font-semibold">Expiry Date:</span> {formatDateTime(documentMeta[cat.id].expiryDate)}</div>
                                            <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-semibold ${getDaysLeftClass(documentMeta[cat.id].daysRemaining)}`}>
                                                Days Left: {documentMeta[cat.id].daysRemaining}
                                            </div>
                                        </div>
                                    )}

                                    {uploadedDocs[cat.id] && (
                                        <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            File ready to save
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-72 bg-background/80 backdrop-blur-md border-t border-border p-4 flex justify-between items-center z-10 shadow-lg px-8">
                <div className="text-sm text-foreground">
                    <span className="font-bold text-primary">{Object.keys(uploadedDocs).length}</span> documents prepared
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/website/uploads')}>Cancel</Button>
                    <Button onClick={handleSaveAll} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                        Complete & Save All
                    </Button>
                </div>
            </div>
        </div>
    );
}
