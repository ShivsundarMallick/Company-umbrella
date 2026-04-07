export interface CompanyDetails {
    companyName: string;
    businessType?: string;
    industryType?: string;
    companyType?: string;
    parentCompanyName?: string;
    numberOfEmployees: string;
    numberOfBranches?: string;
    headOfficeLocation?: string;
    officialCompanyEmail?: string;
    companyContactNumber?: string;
    companyWebsite?: string;
    companyPanNumber?: string;
    companyCinNumber?: string;
    gstNumber?: string;
    taxNumber?: string;
    registrationDate: string;
    expiryDate: string;
    annualRevenue?: string;
    paidUpCapital?: string;
    netWorth?: string;
    lastYearTurnover?: string;
    complianceOfficerName?: string;
    complianceOfficerEmail?: string;
    complianceOfficerPhone?: string;
    auditFirmName?: string;
    lastAuditDate?: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Company {
    _id: string;
    name: string;
    email: string;
    role: 'Tier 1' | 'Tier 2' | 'Tier 3';
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    status: ReviewStatus;
    details: CompanyDetails;
}

export const tier1MockCompanies: Company[] = [
    {
        _id: 't1-001',
        name: 'Global Tech Solutions',
        email: 'info@globaltech.com',
        role: 'Tier 1',
        isActive: true,
        status: 'pending',
        createdAt: new Date('2023-01-15').toISOString(),
        updatedAt: new Date('2023-01-15').toISOString(),
        details: {
            companyName: 'Global Tech Solutions',
            businessType: 'Technology',
            industryType: 'IT',
            companyType: 'Public',
            parentCompanyName: 'Global Holdings Corp',
            numberOfEmployees: '5000',
            numberOfBranches: '25',
            headOfficeLocation: 'San Francisco, CA',
            officialCompanyEmail: 'corporate@globaltech.com',
            companyContactNumber: '+1-555-0101',
            companyWebsite: 'https://globaltech.com',
            companyPanNumber: 'ABCDE1234F',
            companyCinNumber: 'L12345KA2010PLC054321',
            gstNumber: '22AAAAA0000A1Z5',
            taxNumber: 'TAX-987654321',
            registrationDate: '2010-05-20',
            expiryDate: '2030-05-20',
            annualRevenue: '1000000000',
            paidUpCapital: '50000000',
            netWorth: '200000000',
            lastYearTurnover: '950000000',
            complianceOfficerName: 'John Doe',
            complianceOfficerEmail: 'john.doe@globaltech.com',
            complianceOfficerPhone: '+1-555-0202',
            auditFirmName: 'Price & Waters',
            lastAuditDate: '2023-12-01',
        },
    },
    {
        _id: 't1-002',
        name: 'Industrial Manufacturing Inc.',
        email: 'contact@industrialmfg.com',
        role: 'Tier 1',
        isActive: true,
        status: 'approved',
        createdAt: new Date('2022-11-20').toISOString(),
        details: {
            companyName: 'Industrial Manufacturing Inc.',
            businessType: 'Manufacturing',
            industryType: 'Manufacturing',
            companyType: 'Private',
            parentCompanyName: 'Heavy Industries Group',
            numberOfEmployees: '2500',
            numberOfBranches: '12',
            headOfficeLocation: 'Chicago, IL',
            officialCompanyEmail: 'ops@industrialmfg.com',
            companyContactNumber: '+1-555-0303',
            companyWebsite: 'https://industrialmfg.com',
            companyPanNumber: 'FGHIJ5678K',
            companyCinNumber: 'U56789IL2005PTC067890',
            gstNumber: '17BBBBB1111B2Y6',
            taxNumber: 'TAX-123456789',
            registrationDate: '2005-09-12',
            expiryDate: '2025-09-12',
            annualRevenue: '500000000',
            paidUpCapital: '30000000',
            netWorth: '120000000',
            lastYearTurnover: '480000000',
            complianceOfficerName: 'Jane Smith',
            complianceOfficerEmail: 'jane.smith@industrialmfg.com',
            complianceOfficerPhone: '+1-555-0404',
            auditFirmName: 'Everest Audit Co.',
            lastAuditDate: '2023-10-15',
        },
    },
    {
        _id: 't1-003',
        name: 'Future Financials Ltd.',
        email: 'hello@futurefinancials.com',
        role: 'Tier 1',
        isActive: true,
        status: 'rejected',
        createdAt: new Date('2024-02-05').toISOString(),
        details: {
            companyName: 'Future Financials Ltd.',
            businessType: 'Services',
            industryType: 'Finance',
            companyType: 'Public',
            parentCompanyName: 'Future Wealth Group',
            numberOfEmployees: '1200',
            numberOfBranches: '8',
            headOfficeLocation: 'New York, NY',
            officialCompanyEmail: 'legal@futurefinancials.com',
            companyContactNumber: '+1-555-0505',
            companyWebsite: 'https://futurefinancials.com',
            companyPanNumber: 'KLMNO9012P',
            companyCinNumber: 'L90123NY2015PLC090123',
            gstNumber: '36CCCCC2222C3X7',
            taxNumber: 'TAX-445566778',
            registrationDate: '2015-03-30',
            expiryDate: '2035-03-30',
            annualRevenue: '750000000',
            paidUpCapital: '40000000',
            netWorth: '150000000',
            lastYearTurnover: '700000000',
            complianceOfficerName: 'Robert Brown',
            complianceOfficerEmail: 'robert.brown@futurefinancials.com',
            complianceOfficerPhone: '+1-555-0606',
            auditFirmName: 'Guardian Audits',
            lastAuditDate: '2023-11-20',
        },
    },
];

export const tier2MockCompanies: Company[] = [
    {
        _id: 't2-001',
        name: 'BuildRight Construction',
        email: 'contact@buildright.com',
        role: 'Tier 2',
        isActive: true,
        status: 'pending',
        createdAt: new Date('2023-04-10').toISOString(),
        updatedAt: new Date('2023-04-10').toISOString(),
        details: {
            companyName: 'BuildRight Construction',
            numberOfEmployees: '250',
            gstNumber: '29ABCDE1234F1Z5',
            annualRevenue: '150000000',
            taxNumber: 'TAX-BR202301',
            registrationDate: '2015-06-15',
            expiryDate: '2030-06-15',
        },
    },
    {
        _id: 't2-002',
        name: 'Sunrise Logistics',
        email: 'info@sunriselogistics.in',
        role: 'Tier 2',
        isActive: true,
        status: 'approved',
        createdAt: new Date('2022-09-25').toISOString(),
        updatedAt: new Date('2023-01-05').toISOString(),
        details: {
            companyName: 'Sunrise Logistics',
            numberOfEmployees: '180',
            gstNumber: '27FGHIJ5678K1Y6',
            annualRevenue: '95000000',
            taxNumber: 'TAX-SL202209',
            registrationDate: '2018-02-20',
            expiryDate: '2028-02-20',
        },
    },
    {
        _id: 't2-003',
        name: 'MediCare Equipment Providers',
        email: 'sales@medicareequip.com',
        role: 'Tier 2',
        isActive: true,
        status: 'pending',
        createdAt: new Date('2024-01-12').toISOString(),
        updatedAt: new Date('2024-01-12').toISOString(),
        details: {
            companyName: 'MediCare Equipment Providers',
            numberOfEmployees: '320',
            gstNumber: '33KLMNO9012P1X7',
            annualRevenue: '210000000',
            taxNumber: 'TAX-ME202401',
            registrationDate: '2012-11-05',
            expiryDate: '2032-11-05',
        },
    },
];

export const tier3MockCompanies: Company[] = [
    {
        _id: 't3-001',
        name: 'FreshBake Bakery',
        email: 'orders@freshbake.local',
        role: 'Tier 3',
        isActive: true,
        status: 'pending',
        createdAt: new Date('2023-08-05').toISOString(),
        updatedAt: new Date('2023-08-05').toISOString(),
        details: {
            companyName: 'FreshBake Bakery',
            numberOfEmployees: '15',
            taxNumber: 'TAX-FB2023',
            registrationDate: '2020-03-10',
            expiryDate: '2025-03-10',
        },
    },
    {
        _id: 't3-002',
        name: 'QuickFix Auto Repair',
        email: 'service@quickfixauto.com',
        role: 'Tier 3',
        isActive: true,
        status: 'rejected',
        createdAt: new Date('2022-12-18').toISOString(),
        updatedAt: new Date('2023-05-20').toISOString(),
        details: {
            companyName: 'QuickFix Auto Repair',
            numberOfEmployees: '8',
            taxNumber: 'TAX-QF2022',
            registrationDate: '2019-07-22',
            expiryDate: '2024-07-22',
        },
    },
    {
        _id: 't3-003',
        name: 'GreenThumb Landscaping',
        email: 'info@greenthumb.net',
        role: 'Tier 3',
        isActive: true,
        status: 'approved',
        createdAt: new Date('2024-03-01').toISOString(),
        updatedAt: new Date('2024-03-01').toISOString(),
        details: {
            companyName: 'GreenThumb Landscaping',
            numberOfEmployees: '12',
            taxNumber: 'TAX-GT2024',
            registrationDate: '2021-01-15',
            expiryDate: '2026-01-15',
        },
    },
];

export const allMockCompanies: Company[] = [
    ...tier1MockCompanies,
    ...tier2MockCompanies,
    ...tier3MockCompanies,
];
