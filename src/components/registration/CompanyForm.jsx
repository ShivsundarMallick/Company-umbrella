import { useState } from 'react';
import '../css/CompanyForm.css';

const CompanyForm = ({ tier, onFormSubmit }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    numberOfEmployees: '',
    taxNumber: '',
    registrationDate: '',
    expiryDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(formData);
  };

  const getTierDescription = () => {
    switch (tier) {
      case 'Tier 1': return 'Large Company';
      case 'Tier 2': return 'Medium Company';
      case 'Tier 3': return 'Small Company';
      default: return '';
    }
  };

  return (
    <div className="company-form">
      <h3>Company Details - {tier} ({getTierDescription()})</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="companyName">Company Name</label>
            <div className="form-input-wrap">
              <span className="form-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3.5 9L12 4L20.5 9V19.5H3.5V9Z" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M8.5 19.5V13H15.5V19.5" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </span>
              <input
                id="companyName"
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Enter company name"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="numberOfEmployees">Number of Employees</label>
            <div className="form-input-wrap">
              <span className="form-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="8" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="16" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M4.8 18C5.3 15.7 6.9 14.4 8.9 14.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M15.1 14.4C17.1 14.4 18.7 15.7 19.2 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="numberOfEmployees"
                type="number"
                name="numberOfEmployees"
                value={formData.numberOfEmployees}
                onChange={handleChange}
                required
                placeholder="Enter number of employees"
              />
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="taxNumber">Tax Number</label>
            <div className="form-input-wrap">
              <span className="form-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M8 9H16M8 13H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="taxNumber"
                type="text"
                name="taxNumber"
                value={formData.taxNumber}
                onChange={handleChange}
                required
                placeholder="Enter tax number"
              />
            </div>
          </div>
          <div className="form-group"></div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="registrationDate">Company Registration Date</label>
            <div className="form-input-wrap">
              <span className="form-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M8 3.8V6.2M16 3.8V6.2M4 9.5H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="registrationDate"
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <div className="form-input-wrap">
              <span className="form-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M8 3.8V6.2M16 3.8V6.2M4 9.5H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="expiryDate"
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;
