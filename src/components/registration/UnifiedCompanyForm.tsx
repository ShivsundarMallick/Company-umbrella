import '../../pages/website/css/CompanyForm.css';

const UnifiedCompanyForm = ({ formData, onFormChange, activeSection = 1, tier = 'Tier 1' }: any) => {
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    onFormChange({
      ...formData,
      [name]: value
    });
  };

  const inputField = (id: string, label: string, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        name={id}
        value={formData[id] || ''}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );

  const selectField = (id: string, label: string, options: string[]) => (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={id} value={formData[id] || ''} onChange={handleChange}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="company-form">
      <h3>Company Details - {tier}</h3>
      <div className="tier1-section-progress">Section {activeSection} of 4</div>

      {activeSection === 1 && (
        <div className="tier1-section-card">
          <div className="tier1-section-header">
            <span>1. Company Basic Information</span>
          </div>
          <div className="tier1-section-content">
            <div className="form-row">
              {inputField('companyName', 'Company Name', 'text', 'Enter company name')}
              {selectField('businessType', 'Business Type', ['Manufacturing', 'Services', 'Trading', 'IT', 'Other'])}
            </div>
            <div className="form-row">
              {selectField('companyType', 'Company Type', [
                'OPC - One Person Company',
                'SPC - Section 8 Company',
                'FPC - Farmer Company',
                'Pvt Ltd',
                'Ltd',
                'Trust',
                'Partnership'
                

              ])}
              {inputField('parentCompanyName', 'Parent Company Name', 'text', 'Enter parent company name')}
            </div>
            <div className="form-row">
              {inputField('numberOfEmployees', 'Number of Employees', 'number', 'Enter number of employees')}
              {inputField('numberOfBranches', 'Number of Branches', 'number', 'Enter number of branches')}
            </div>
            <div className="form-row">
              {inputField('headOfficeLocation', 'Register office loaction', 'text', 'Enter register office loaction')}
              {inputField('officialCompanyEmail', 'Official Company Email', 'email', 'Enter official company email')}
            </div>
            <div className="form-row">
              {inputField('companyContactNumber', 'Company Contact Number', 'tel', 'Enter company contact number')}
              {inputField('companyWebsite', 'Company Website', 'url', 'https://example.com')}
            </div>
          </div>
        </div>
      )}

      {activeSection === 2 && (
        <div className="tier1-section-card">
          <div className="tier1-section-header">
            <span>2. Legal & Registration Details</span>
          </div>
          <div className="tier1-section-content">
            <div className="form-row">
              {inputField('companyPanNumber', 'Company PAN Number', 'text', 'Enter company PAN number')}
              {inputField('companyCinNumber', 'CIN Number', 'text', 'Enter CIN number')}
            </div>
            <div className="form-row">
              {inputField('gstNumber', 'GST Number', 'text', 'Enter GST number')}
              {inputField('taxNumber', 'Tax Number', 'text', 'Enter tax number')}
            </div>
            <div className="form-row">
              {inputField('registrationDate', 'Company Registration Date', 'date')}
              <div className="form-group"></div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 3 && (
        <div className="tier1-section-card">
          <div className="tier1-section-header">
            <span>3. Financial Information</span>
          </div>
          <div className="tier1-section-content">
            <div className="form-row">
              {inputField('annualRevenue', 'Annual Revenue', 'number', 'Enter annual revenue')}
              {inputField('paidUpCapital', 'Paid-up Capital', 'number', 'Enter paid-up capital')}
            </div>
            <div className="form-row">
              {inputField('authorisedCapital', 'Authorised Capital', 'number', 'Enter authorised capital')}
              {inputField('lastYearTurnover', 'Last Year Turnover', 'number', 'Enter last year turnover')}
            </div>
          </div>
        </div>
      )}

      {activeSection === 4 && (
        <div className="tier1-section-card">
          <div className="tier1-section-header">
            <span>4. Compliance & Audit Details</span>
          </div>
          <div className="tier1-section-content">
            <div className="form-row">
              {inputField('complianceOfficerName', 'Compliance Officer Name', 'text', 'Enter compliance officer name')}
              {inputField('complianceOfficerEmail', 'Compliance Officer Email', 'email', 'Enter compliance officer email')}
            </div>
            <div className="form-row">
              {inputField('complianceOfficerPhone', 'Compliance Officer Phone', 'tel', 'Enter compliance officer phone')}
              {inputField('auditFirmName', 'Audit Firm Name', 'text', 'Enter audit firm name')}
            </div>
            <div className="form-row">
              {inputField('lastAuditDate', 'Last Audit Date', 'date')}
              <div className="form-group"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedCompanyForm;
