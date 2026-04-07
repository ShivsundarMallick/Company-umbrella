export const tier2MockCompanies = [
    {
        _id: 't2-001',
        name: 'BuildRight Construction',
        email: 'contact@buildright.com',
        role: 'Tier 2',
        isActive: true,
        createdAt: new Date('2023-04-10').toISOString(),
        updatedAt: new Date('2023-04-10').toISOString(),
        details: {
            companyName: 'BuildRight Construction',
            numberOfEmployees: '250',
            gstNumber: '29ABCDE1234F1Z5',
            annualRevenue: '150000000',
            taxNumber: 'TAX-BR202301',
            registrationDate: '2015-06-15',
            expiryDate: '2030-06-15'
        }
    },
    {
        _id: 't2-002',
        name: 'Sunrise Logistics',
        email: 'info@sunriselogistics.in',
        role: 'Tier 2',
        isActive: true,
        createdAt: new Date('2022-09-25').toISOString(),
        updatedAt: new Date('2023-01-05').toISOString(),
        details: {
            companyName: 'Sunrise Logistics',
            numberOfEmployees: '180',
            gstNumber: '27FGHIJ5678K1Y6',
            annualRevenue: '95000000',
            taxNumber: 'TAX-SL202209',
            registrationDate: '2018-02-20',
            expiryDate: '2028-02-20'
        }
    },
    {
        _id: 't2-003',
        name: 'MediCare Equipment Providers',
        email: 'sales@medicareequip.com',
        role: 'Tier 2',
        isActive: true,
        createdAt: new Date('2024-01-12').toISOString(),
        updatedAt: new Date('2024-01-12').toISOString(),
        details: {
            companyName: 'MediCare Equipment Providers',
            numberOfEmployees: '320',
            gstNumber: '33KLMNO9012P1X7',
            annualRevenue: '210000000',
            taxNumber: 'TAX-ME202401',
            registrationDate: '2012-11-05',
            expiryDate: '2032-11-05'
        }
    }
];
