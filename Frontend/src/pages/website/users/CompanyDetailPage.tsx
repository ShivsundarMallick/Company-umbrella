import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Badge } from '../../../components/ui';
import { ArrowLeft, Building2, Globe, Mail, Phone, Shield, CreditCard, PieChart, Loader2 } from 'lucide-react';
import { companiesService } from '../../../services';
import { format } from 'date-fns';

const CompanyDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCompany = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await companiesService.getById(id);
                if (response.success && response.data) {
                    setCompany(response.data);
                } else {
                    setError('Company not found');
                }
            } catch (err) {
                console.error('Failed to fetch company details:', err);
                setError('Failed to load company details');
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <p className="text-gray-500 font-medium">Loading company details...</p>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Building2 className="w-8 h-8 text-red-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{error || 'Company Not Found'}</h2>
                    <p className="text-gray-500 mt-2">The company you are looking for could not be found or an error occurred.</p>
                </div>
                <Button onClick={() => navigate('/website/users')} className="mt-4">
                    Back to Companies
                </Button>
            </div>
        );
    }

    const details = company.companyData || {};
    const isActive = company.status === 'active' || company.status === 'registered';
    const name = details.companyName || 'Unknown';
    const role = company.tier || 'Unknown';
    const createdAt = company.createdAt || new Date().toISOString();

    const sectionHeader = (icon: any, title: string) => (
        <div className="flex items-center gap-2 pb-2 mb-4 border-b border-gray-100">
            {icon}
            <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
    );

    const dataField = (label: string, value: string | number | undefined) => (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
            <span className="text-gray-700">{value || '-'}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/website/users')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="default">{role}</Badge>
                            <Badge variant={isActive ? 'default' : 'destructive'}>
                                {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-sm text-gray-500">Joined {format(new Date(createdAt), 'MMM d, yyyy')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Edit Details</Button>
                    <Button variant="destructive">Disable Account</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Info */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-6">
                        {sectionHeader(<Building2 className="w-5 h-5 text-primary-600" />, "Basic Information")}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                            {(role === 'Tier 1') && (
                                <>
                                    {dataField("Business Type", details.businessType)}
                                    {dataField("Company Type", details.companyType)}
                                    {dataField("Parent Company", details.parentCompanyName)}
                                    {dataField("Employees", details.numberOfEmployees)}
                                    {dataField("Branches", details.numberOfBranches)}
                                    {dataField("Head Office", details.headOfficeLocation)}
                                    {dataField("Website", details.companyWebsite)}
                                </>
                            )}
                            {(role === 'Tier 2') && (
                                <>
                                    {dataField("Company Name", name)}
                                    {dataField("Employees", details.numberOfEmployees)}
                                    {dataField("GST Number", details.gstNumber)}
                                    {dataField("Annual Revenue", details.annualRevenue ? `₹${Number(details.annualRevenue).toLocaleString()}` : '-')}
                                </>
                            )}
                            {(role === 'Tier 3') && (
                                <>
                                    {dataField("Company Name", name)}
                                    {dataField("Employees", details.numberOfEmployees)}
                                    {dataField("Tax Number", details.taxNumber)}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                    <CardContent className="p-6">
                        {sectionHeader(<Mail className="w-5 h-5 text-blue-600" />, "Contact Details")}
                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-gray-400 mt-1" />
                                {dataField("Official Email", details.officialCompanyEmail)}
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-gray-400 mt-1" />
                                {dataField("Contact Number", details.companyContactNumber)}
                            </div>
                            <div className="flex items-start gap-3">
                                <Globe className="w-4 h-4 text-gray-400 mt-1" />
                                {dataField("Website", details.companyWebsite)}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Legal Details */}
                <Card className="lg:col-span-1">
                    <CardContent className="p-6">
                        {sectionHeader(<Shield className="w-5 h-5 text-green-600" />, "Registration Details")}
                        <div className="space-y-6">
                            {(role === 'Tier 1') && (
                                <>
                                    {dataField("PAN Number", details.companyPanNumber)}
                                    {dataField("CIN Number", details.companyCinNumber)}
                                    {dataField("GST Number", details.gstNumber)}
                                    {dataField("Tax Number", details.taxNumber)}
                                    {dataField("Registration Date", details.registrationDate)}
                                    {dataField("Authorised Capital", details.authorisedCapital ? `₹${Number(details.authorisedCapital).toLocaleString()}` : '-')}
                                </>
                            )}
                            {(role === 'Tier 2') && (
                                <>
                                    {dataField("Tax Number", details.taxNumber)}
                                    {dataField("ITR Number", details.itrNumber)}
                                    {dataField("Registration Date", details.registrationDate)}
                                </>
                            )}
                            {(role === 'Tier 3') && (
                                <>
                                    {dataField("Registration Date", details.registrationDate)}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Info - Tier 1 & 2 */}
                {(role === 'Tier 1' || role === 'Tier 2') && (
                    <Card className="lg:col-span-1">
                        <CardContent className="p-6">
                            {sectionHeader(<PieChart className="w-5 h-5 text-purple-600" />, "Financial Status")}
                            <div className="space-y-6">
                                {(role === 'Tier 1') && (
                                    <>
                                        {dataField("Annual Revenue", details.annualRevenue ? `₹${Number(details.annualRevenue).toLocaleString()}` : '-')}
                                        {dataField("Last Year Turnover", details.lastYearTurnover ? `₹${Number(details.lastYearTurnover).toLocaleString()}` : '-')}
                                        {dataField("Paid-up Capital", details.paidUpCapital ? `₹${Number(details.paidUpCapital).toLocaleString()}` : '-')}
                                        {dataField("Authorised Capital", details.authorisedCapital ? `₹${Number(details.authorisedCapital).toLocaleString()}` : '-')}
                                    </>
                                )}
                                {(role === 'Tier 2') && (
                                    <>
                                        {dataField("Annual Revenue", details.annualRevenue ? `₹${Number(details.annualRevenue).toLocaleString()}` : '-')}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Compliance - Tier 1 */}
                {(role === 'Tier 1') && (
                    <Card className="lg:col-span-1">
                        <CardContent className="p-6">
                            {sectionHeader(<CreditCard className="w-5 h-5 text-orange-600" />, "Compliance & Audit")}
                            <div className="space-y-6">
                                {dataField("Compliance Officer", details.complianceOfficerName)}
                                {dataField("Officer Email", details.complianceOfficerEmail)}
                                {dataField("Officer Phone", details.complianceOfficerPhone)}
                                {dataField("Audit Firm", details.auditFirmName)}
                                {dataField("Last Audit Date", details.lastAuditDate)}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default CompanyDetailPage;
