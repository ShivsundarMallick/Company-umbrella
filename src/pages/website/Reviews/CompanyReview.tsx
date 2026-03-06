import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Building2, ZoomIn, FileImage } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '../../../components/ui';

import { Dialog, DialogContent, DialogTrigger } from '../../../components/ui/dialog';
import { allMockCompanies } from '../../../data/mockCompanies';
import mockPanCard from '@/assets/mock-pan-card.jpg';
import mockGstCert from '@/assets/mock-gst-certificate.jpg';
import mockCinCert from '@/assets/mock-cin-certificate.jpg';
import mockItrDoc from '@/assets/mock-itr-document.jpg';
import mockTaxCert from '@/assets/mock-tax-certificate.jpg';
import mockAuditReport from '@/assets/mock-audit-report.jpg';
interface DetailField {
    label: string;
    key: string;
    format?: (v: string) => string;
    documentImage?: string;
    documentLabel?: string;
}

const formatCurrency = (v: string) => `₹${Number(v).toLocaleString('en-IN')}`;

// Tier 1 pages (split rich data across multiple pages, small fields grouped)
const tier1Pages: { title: string; fields: DetailField[] }[] = [
    {
        title: 'Company Information',
        fields: [
            { label: 'Company Name', key: 'companyName' },
            { label: 'Business Type', key: 'businessType' },
            { label: 'Industry Type', key: 'industryType' },
            { label: 'Company Type', key: 'companyType' },
            { label: 'Parent Company', key: 'parentCompanyName' },
            { label: 'Employees', key: 'numberOfEmployees' },
            { label: 'Branches', key: 'numberOfBranches' },
            { label: 'Head Office', key: 'headOfficeLocation' },
        ],
    },
    {
        title: 'Contact Details',
        fields: [
            { label: 'Official Email', key: 'officialCompanyEmail' },
            { label: 'Contact Number', key: 'companyContactNumber' },
            { label: 'Website', key: 'companyWebsite' },
        ],
    },
    {
        title: 'Legal & Registration',
        fields: [

            { label: 'PAN Number', key: 'companyPanNumber', documentImage: mockPanCard, documentLabel: 'PAN Card' },
            { label: 'CIN Number', key: 'companyCinNumber', documentImage: mockCinCert, documentLabel: 'Incorporation Certificate' },
            { label: 'GST Number', key: 'gstNumber', documentImage: mockGstCert, documentLabel: 'GST Certificate' },
            { label: 'Tax Number', key: 'taxNumber', documentImage: mockTaxCert, documentLabel: 'Tax Registration' },
            { label: 'ITR Number', key: 'itrNumber', documentImage: mockItrDoc, documentLabel: 'ITR Acknowledgement' },
            { label: 'Registration Date', key: 'registrationDate' },
            { label: 'Expiry Date', key: 'expiryDate' },
        ],
    },
    {
        title: 'Financial Information',
        fields: [
            { label: 'Annual Revenue', key: 'annualRevenue', format: formatCurrency },
            { label: 'Paid-up Capital', key: 'paidUpCapital', format: formatCurrency },
            { label: 'Net Worth', key: 'netWorth', format: formatCurrency },
            { label: 'Last Year Turnover', key: 'lastYearTurnover', format: formatCurrency },
        ],
    },
    {
        title: 'Compliance & Audit',
        fields: [
            { label: 'Compliance Officer', key: 'complianceOfficerName' },
            { label: 'Officer Email', key: 'complianceOfficerEmail' },
            { label: 'Officer Phone', key: 'complianceOfficerPhone' },
            { label: 'Audit Firm', key: 'auditFirmName', documentImage: mockAuditReport, documentLabel: 'Audit Report' },
            { label: 'Last Audit Date', key: 'lastAuditDate' },
        ],
    },
];

// Tier 2: fewer fields, 2 pages
const tier2Pages: { title: string; fields: DetailField[] }[] = [
    {
        title: 'Company Overview',
        fields: [
            { label: 'Company Name', key: 'companyName' },
            { label: 'Employees', key: 'numberOfEmployees' },
            { label: 'GST Number', key: 'gstNumber', documentImage: mockGstCert, documentLabel: 'GST Certificate' },
            { label: 'Annual Revenue', key: 'annualRevenue', format: formatCurrency },
        ],
    },
    {
        title: 'Registration & Tax',
        fields: [
            { label: 'Tax Number', key: 'taxNumber', documentImage: mockTaxCert, documentLabel: 'Tax Registration' },
            { label: 'ITR Number', key: 'itrNumber', documentImage: mockItrDoc, documentLabel: 'ITR Acknowledgement' },
            { label: 'Registration Date', key: 'registrationDate' },
            { label: 'Expiry Date', key: 'expiryDate' },
        ],
    },
];

// Tier 3: minimal, 1 page
const tier3Pages: { title: string; fields: DetailField[] }[] = [
    {
        title: 'Company Details',
        fields: [
            { label: 'Company Name', key: 'companyName' },
            { label: 'Employees', key: 'numberOfEmployees' },
            { label: 'Tax Number', key: 'taxNumber', documentImage: mockTaxCert, documentLabel: 'Tax Certificate' },
            { label: 'Registration Date', key: 'registrationDate' },
            { label: 'Expiry Date', key: 'expiryDate' },
        ],
    },
];

function getPagesForTier(role: string) {
    if (role === 'Tier 1') return tier1Pages;
    if (role === 'Tier 2') return tier2Pages;
    return tier3Pages;
} function DocumentProof({ image, label }: { image: string; label: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="group relative w-full rounded-lg border-2 border-dashed border-border hover:border-primary/50 overflow-hidden transition-all bg-muted/30 hover:bg-muted/50">
                    <img
                        src={image}
                        alt={label}
                        className="w-full h-24 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[1px]">
                        <div className="flex items-center gap-1.5 text-white text-xs font-medium bg-black/50 px-2.5 py-1 rounded-full">
                            <ZoomIn className="w-3 h-3" />
                            View
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                        <div className="flex items-center gap-1 text-white">
                            <FileImage className="w-3 h-3" />
                            <span className="text-[10px] font-medium">{label}</span>
                        </div>
                    </div>
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl p-2">
                <img src={image} alt={label} className="w-full rounded-lg" />
                <p className="text-center text-sm text-muted-foreground mt-2">{label}</p>
            </DialogContent>
        </Dialog>
    );
}
export default function CompanyReviewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const company = useMemo(() => allMockCompanies.find((c) => c._id === id), [id]);

    const pages = useMemo(() => (company ? getPagesForTier(company.role) : []), [company]);
    const totalPages = pages.length;

    const [currentPage, setCurrentPage] = useState(0);
    const [pageStatuses, setPageStatuses] = useState<Record<number, 'approved' | 'rejected' | null>>(
        () => Object.fromEntries(Array.from({ length: totalPages }, (_, i) => [i, null]))
    );

    if (!company) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <p className="text-muted-foreground">Company not found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/website/reviews')}>
                    Back to Reviews
                </Button>
            </div>
        );
    }

    const page = pages[currentPage];
    const pageStatus = pageStatuses[currentPage];
    const anyRejected = Object.values(pageStatuses).some((s) => s === 'rejected');
    const allApproved = Object.values(pageStatuses).every((s) => s === 'approved');

    const allDecided = Object.values(pageStatuses).every((s) => s !== null);

    const overallStatus = anyRejected ? 'rejected' : allApproved ? 'approved' : 'pending';

    const handleApprove = () => {
        setPageStatuses((prev) => ({ ...prev, [currentPage]: 'approved' }));
        if (currentPage < totalPages - 1) {
            setTimeout(() => setCurrentPage((p) => p + 1), 300);
        }
    };

    const handleReject = () => {
        setPageStatuses((prev) => ({ ...prev, [currentPage]: 'rejected' }));
    };

    const statusColors = {
        approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            {/* Back + Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/website/reviews/${company._id}`)} className="p-2 rounded-lg hover:bg-accent transition-colors">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground truncate">{company.name}</h1>
                            <p className="text-xs text-muted-foreground">{company.email}</p>
                        </div>
                    </div>
                </div>
                <Badge variant="outline" className={statusColors[overallStatus]}>
                    {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
                </Badge>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2">
                {pages.map((_, i) => {
                    const s = pageStatuses[i];
                    return (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center border-2 transition-all ${i === currentPage
                                ? 'border-primary bg-primary text-primary-foreground scale-110'
                                : s === 'approved'
                                    ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                                    : s === 'rejected'
                                        ? 'border-red-400 bg-red-100 text-red-700'
                                        : 'border-border bg-muted text-muted-foreground hover:border-primary/50'
                                }`}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>

            {/* Page content */}
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{page.title}</CardTitle>
                        <span className="text-xs text-muted-foreground">
                            Page {currentPage + 1} of {totalPages}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {page.fields.map((field) => {
                            const value = (company.details as any)[field.key];
                            if (!value && value !== 0) return null;
                            if (field.documentImage) {
                                return (
                                    <div key={field.key} className="flex items-stretch gap-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <div className="flex-1 flex flex-col justify-center space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{field.label}</p>
                                            <p className="text-sm font-semibold text-foreground font-mono">{field.format ? field.format(value) : value}</p>
                                        </div>
                                        <div className="w-40 flex-shrink-0">
                                            <DocumentProof image={field.documentImage} label={field.documentLabel || field.label} />
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={field.key} className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-3 py-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{field.label}</p>
                                    <p className="text-sm font-medium text-foreground">
                                        {field.format ? field.format(value) : value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Page status indicator */}
                    {pageStatus && (
                        <div className={`mt-6 p-3 rounded-lg border text-sm font-medium text-center ${statusColors[pageStatus]}`}>
                            {pageStatus === 'approved' ? '✓ This section has been approved' : '✗ This section has been rejected'}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation + Actions */}
            <div className="flex items-center justify-between gap-3">
                <Button
                    variant="outline"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </Button>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleReject}
                        className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                        <XCircle className="w-4 h-4" />
                        Reject
                    </Button>
                    <Button onClick={handleApprove} className="gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                    </Button>
                </div>

                <Button
                    variant="outline"
                    disabled={currentPage === totalPages - 1}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="gap-2"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Final summary when all decided */}
            {allDecided && (
                <Card className={`border-2 ${anyRejected ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50'}`}>
                    <CardContent className="p-6 text-center">
                        {anyRejected ? (
                            <>
                                <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                                <p className="font-semibold text-red-700 text-lg">Company Rejected</p>
                                <p className="text-sm text-red-600 mt-1">One or more sections were rejected.</p>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                                <p className="font-semibold text-emerald-700 text-lg">Company Approved</p>
                                <p className="text-sm text-emerald-600 mt-1">All sections have been approved.</p>
                            </>
                        )}
                        <Button variant="outline" className="mt-4" onClick={() => navigate('/website/reviews')}>
                            Back to Reviews
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
