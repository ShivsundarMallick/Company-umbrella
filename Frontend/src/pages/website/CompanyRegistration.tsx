import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from '../../components/registration/StepIndicator';
import TierSelector from '../../components/registration/TierSelector';
import UnifiedCompanyForm from '../../components/registration/UnifiedCompanyForm';
import ReviewSubmit from '../../components/registration/ReviewSubmit';
import './css/CompanyRegistration.css';
import { API_BASE_URL } from '../../config';

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(2); // Start at step 2 (Select Tier)
  const [selectedTier, setSelectedTier] = useState('');
  const [formData, setFormData] = useState({});
  const [sectionStep, setSectionStep] = useState(1);

  const unifiedSections = {
    1: [
      'companyName',
      'businessType',
      'companyType',
      'parentCompanyName',
      'numberOfEmployees',
      'numberOfBranches',
      'headOfficeLocation',
      'officialCompanyEmail',
      'companyContactNumber',
      'companyWebsite'
    ],
    2: [
      'companyPanNumber',
      'companyCinNumber',
      'gstNumber',
      'taxNumber',
      'registrationDate'
    ],
    3: [
      'annualRevenue',
      'paidUpCapital',
      'authorisedCapital',
      'lastYearTurnover'
    ],
    4: [
      'complianceOfficerName',
      'complianceOfficerEmail',
      'complianceOfficerPhone',
      'auditFirmName',
      'lastAuditDate'
    ]
  };

  const handleTierSelect = (tier: any) => {
    setSelectedTier(tier);
    setFormData({});
    setSectionStep(1);
  };

  const handleFormChange = (nextData: any) => {
    setFormData(nextData);
  };

  const handleFinalSubmit = async (data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Registration failed');

      alert('Registration submitted successfully!');
      navigate('/website/uploads');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleNext = () => {
    if (currentStep === 2 && selectedTier) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const sectionFields = (unifiedSections as any)[sectionStep] || [];
      const totalSections = Object.keys(unifiedSections).length;

      if (sectionFields.length > 0) {
        const isSectionComplete = sectionFields.every(
          (field: any) => String((formData as any)[field] ?? '').trim() !== ''
        );

        if (!isSectionComplete) {
          alert('Please complete all fields in this section before continuing.');
          return;
        }

        if (sectionStep < totalSections) {
          setSectionStep(sectionStep + 1);
          return;
        }
      }

      const allRequiredFields = Object.values(unifiedSections).flat();
      const isComplete = allRequiredFields.every(
        (field: any) => String((formData as any)[field] ?? '').trim() !== ''
      );

      if (!isComplete) {
        alert('Please complete all required fields before continuing.');
        return;
      }

      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      if (sectionStep > 1) {
        setSectionStep(sectionStep - 1);
        return;
      }
    }

    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 2:
        return <TierSelector selectedTier={selectedTier} onTierSelect={handleTierSelect} />;
      case 3:
        return (
          <UnifiedCompanyForm
            formData={formData}
            onFormChange={handleFormChange}
            activeSection={sectionStep}
            tier={selectedTier}
          />
        );
      case 4:
        return <ReviewSubmit tier={selectedTier} formData={formData} onSubmit={handleFinalSubmit} />;
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 2) return !selectedTier;
    if (currentStep === 3) {
      const sectionFields = (unifiedSections as any)[sectionStep] || [];
      return !sectionFields.every(
        (field: any) => String((formData as any)[field] ?? '').trim() !== ''
      );
    }
    return false;
  };

  return (
    <div className="registration-page ds-page-shell">
      <div className="registration-bg-shape registration-bg-shape-one" aria-hidden="true"></div>
      <div className="registration-bg-shape registration-bg-shape-two" aria-hidden="true"></div>
      <div className="registration-container ds-card ds-card-wide">
        <StepIndicator currentStep={currentStep} />
        <div key={currentStep} className="step-content">
          {renderStepContent()}
        </div>
        <div className="navigation-buttons">
          <button
            className="back-button ds-btn-secondary"
            onClick={handleBack}
            disabled={currentStep === 2}
          >
            Back
          </button>
          {currentStep !== 4 && (
            <button
              className="next-button ds-btn-primary"
              onClick={handleNext}
              disabled={isNextDisabled()}
            >
              {currentStep === 3
                ? (() => {
                  const totalSections = Object.keys(unifiedSections).length;
                  if (sectionStep < totalSections) {
                    return `Next Section (${sectionStep + 1}/${totalSections})`;
                  }
                  return 'Review';
                })()
                : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistration;
