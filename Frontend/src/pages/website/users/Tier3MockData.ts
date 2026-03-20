export const tier3MockCompanies = [
    {
        _id: 't3-001',
        name: 'FreshBake Bakery',
        email: 'orders@freshbake.local',
        role: 'Tier 3',
        isActive: true,
        createdAt: new Date('2023-08-05').toISOString(),
        updatedAt: new Date('2023-08-05').toISOString(),
        details: {
            companyName: 'FreshBake Bakery',
            numberOfEmployees: '15',
            taxNumber: 'TAX-FB2023',
            registrationDate: '2020-03-10',
            expiryDate: '2025-03-10'
        }
    },
    {
        _id: 't3-002',
        name: 'QuickFix Auto Repair',
        email: 'service@quickfixauto.com',
        role: 'Tier 3',
        isActive: true,
        createdAt: new Date('2022-12-18').toISOString(),
        updatedAt: new Date('2023-05-20').toISOString(),
        details: {
            companyName: 'QuickFix Auto Repair',
            numberOfEmployees: '8',
            taxNumber: 'TAX-QF2022',
            registrationDate: '2019-07-22',
            expiryDate: '2024-07-22'
        }
    },
    {
        _id: 't3-003',
        name: 'GreenThumb Landscaping',
        email: 'info@greenthumb.net',
        role: 'Tier 3',
        isActive: true,
        createdAt: new Date('2024-03-01').toISOString(),
        updatedAt: new Date('2024-03-01').toISOString(),
        details: {
            companyName: 'GreenThumb Landscaping',
            numberOfEmployees: '12',
            taxNumber: 'TAX-GT2024',
            registrationDate: '2021-01-15',
            expiryDate: '2026-01-15'
        }
    }
];
