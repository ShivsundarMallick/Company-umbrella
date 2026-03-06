import '../../pages/website/css/CompanyForm.css';

const Tier2Form = ({ formData, onFormChange, activeSection = 1 }: any) => {
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    onFormChange({
      ...formData,
      [name]: value
    });
  };

  return (
    <div className="company-form">
      <h3>Company Details - Tier 2 (Medium Company)</h3>
      <div className="tier1-section-progress">Section {activeSection} of 2</div>

      {activeSection === 1 && (
        <div className="tier1-section-card">
          <div className="tier1-section-header">
            <span>1. Company & Revenue Information</span>
          </div>
          <div className="tier1-section-content">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input id="companyName" type="text" name="companyName" value={formData.companyName || ''} onChange={handleChange} placeholder="Enter company name" />
              </div>
              <div className="form-group">
                <label htmlFor="numberOfEmployees">Number of Employees</label>
                <input id="numberOfEmployees" type="number" name="numberOfEmployees" value={formData.numberOfEmployees || ''} onChange={handleChange} placeholder="Enter number of employees" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gstNumber">GST Number</label>
                <input id="gstNumber" type="text" name="gstNumber" value={formData.gstNumber || ''} onChange={handleChange} placeholder="Enter GST number" />
              </div>
              <div className="form-group">
                <label htmlFor="annualRevenue">Annual Revenue</label>
                <input id="annualRevenue" type="number" name="annualRevenue" value={formData.annualRevenue || ''} onChange={handleChange} placeholder="Enter annual revenue" />
              </div>
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
              <div className="form-group">
                <label htmlFor="taxNumber">Tax Number</label>
                <input id="taxNumber" type="text" name="taxNumber" value={formData.taxNumber || ''} onChange={handleChange} placeholder="Enter tax number" />
              </div>
              <div className="form-group">
                <label htmlFor="itrNumber">ITR Number</label>
                <input id="itrNumber" type="text" name="itrNumber" value={formData.itrNumber || ''} onChange={handleChange} placeholder="Enter ITR number" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="registrationDate">Registration Date</label>
                <input id="registrationDate" type="date" name="registrationDate" value={formData.registrationDate || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date</label>
                <input id="expiryDate" type="date" name="expiryDate" value={formData.expiryDate || ''} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tier2Form;
