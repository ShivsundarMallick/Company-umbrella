import '../../pages/website/css/ReviewSubmit.css';

const ReviewSubmit = ({ tier, formData, onSubmit }: any) => {
  const fieldLabels = {
    companyName: 'Company Name',
    numberOfEmployees: 'Employees',
    taxNumber: 'Tax Number',
    companyPanNumber: 'Company PAN Number',
    companyCinNumber: 'Company CIN Number',
    itrNumber: 'ITR Number',
    gstNumber: 'GST Number',
    annualRevenue: 'Annual Revenue',
    businessType: 'Business Type',
    industryType: 'Industry Type',
    companyType: 'Company Type',
    parentCompanyName: 'Parent Company Name',
    numberOfBranches: 'Number of Branches',
    officialCompanyEmail: 'Official Company Email',
    companyContactNumber: 'Company Contact Number',
    companyWebsite: 'Company Website',
    headOfficeLocation: 'Head Office Location',
    complianceOfficerName: 'Compliance Officer Name',
    complianceOfficerEmail: 'Compliance Officer Email',
    complianceOfficerPhone: 'Compliance Officer Phone',
    auditFirmName: 'Audit Firm Name',
    lastAuditDate: 'Last Audit Date',
    paidUpCapital: 'Paid-up Capital',
    netWorth: 'Net Worth',
    lastYearTurnover: 'Last Year Turnover',
    registrationDate: 'Registration Date',
    expiryDate: 'Expiry Date'
  };

  const fieldsByTier = {
    'Tier 1': [
      'companyName',
      'numberOfEmployees',
      'taxNumber',
      'companyPanNumber',
      'companyCinNumber',
      'itrNumber',
      'gstNumber',
      'annualRevenue',
      'businessType',
      'industryType',
      'companyType',
      'parentCompanyName',
      'numberOfBranches',
      'officialCompanyEmail',
      'companyContactNumber',
      'companyWebsite',
      'headOfficeLocation',
      'complianceOfficerName',
      'complianceOfficerEmail',
      'complianceOfficerPhone',
      'auditFirmName',
      'lastAuditDate',
      'paidUpCapital',
      'netWorth',
      'lastYearTurnover',
      'registrationDate',
      'expiryDate'
    ],
    'Tier 2': [
      'companyName',
      'numberOfEmployees',
      'taxNumber',
      'itrNumber',
      'gstNumber',
      'annualRevenue',
      'registrationDate',
      'expiryDate'
    ],
    'Tier 3': [
      'companyName',
      'numberOfEmployees',
      'taxNumber',
      'registrationDate',
      'expiryDate'
    ]
  };

  const getTierDescription = () => {
    switch (tier) {
      case 'Tier 1': return 'Large Company';
      case 'Tier 2': return 'Medium Company';
      case 'Tier 3': return 'Small Company';
      default: return '';
    }
  };

  const handleSubmit = () => {
    onSubmit({ tier, ...formData });
  };

  const reviewFields = ((fieldsByTier as any)[tier] || []).map((field: any) => ({
    key: field,
    label: (fieldLabels as any)[field],
    value: (formData as any)[field]
  }));

  return (
    <div className="review-submit">
      <h3>Review Your Information</h3>
      <div className="review-content">
        <div className="review-section">
          <h4>Company Tier</h4>
          <div className="tier-summary-card">
            <span className="tier-pill">{tier}</span>
            <p>{getTierDescription()}</p>
          </div>
        </div>
        <div className="review-section">
          <h4>Company Details</h4>
          <div className="review-grid">
            {reviewFields.map((item: any) => (
              <div className="review-item" key={item.key}>
                <span className="label">{item.label}</span>
                <span className="value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="submit-section">
        <button className="submit-button" onClick={handleSubmit}>
          Submit Registration
        </button>
      </div>
    </div>
  );
};

export default ReviewSubmit;
