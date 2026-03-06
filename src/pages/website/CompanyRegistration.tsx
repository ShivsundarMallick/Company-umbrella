import { useState } from 'react';
import StepIndicator from '../../components/registration/StepIndicator';
import TierSelector from '../../components/registration/TierSelector';
import Tier1Form from '../../components/registration/Tier1Form';
import Tier2Form from '../../components/registration/Tier2Form';
import Tier3Form from '../../components/registration/Tier3Form';
import ReviewSubmit from '../../components/registration/ReviewSubmit';
import './css/CompanyRegistration.css';

const CompanyRegistration = () => {
  const [currentStep, setCurrentStep] = useState(2); // Start at step 2 (Select Tier)
  const [selectedTier, setSelectedTier] = useState('');
  const [formData, setFormData] = useState({});
  const [tier1SectionStep, setTier1SectionStep] = useState(1);
  const [tier2SectionStep, setTier2SectionStep] = useState(1);
  const [tier3SectionStep, setTier3SectionStep] = useState(1);

  const tierSectionFields = {
    'Tier 1': {
      1: [
        'companyName',
        'businessType',
        'industryType',
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
        'itrNumber',
        'registrationDate',
        'expiryDate'
      ],
      3: [
        'annualRevenue',
        'paidUpCapital',
        'netWorth',
        'lastYearTurnover'
      ],
      4: [
        'complianceOfficerName',
        'complianceOfficerEmail',
        'complianceOfficerPhone',
        'auditFirmName',
        'lastAuditDate'
      ]
    },
    'Tier 2': {
      1: [
        'companyName',
        'numberOfEmployees',
        'gstNumber',
        'annualRevenue'
      ],
      2: [
        'taxNumber',
        'itrNumber',
        'registrationDate',
        'expiryDate'
      ]
    },
    'Tier 3': {
      1: [
        'companyName',
        'numberOfEmployees',
        'taxNumber'
      ],
      2: [
        'registrationDate',
        'expiryDate'
      ]
    }
  };

  const handleTierSelect = (tier: any) => {
    setSelectedTier(tier);
    setFormData({});
    setTier1SectionStep(1);
    setTier2SectionStep(1);
    setTier3SectionStep(1);
  };

  const handleFormChange = (nextData: any) => {
    setFormData(nextData);
  };

  const getCurrentTierSection = () => {
    if (selectedTier === 'Tier 1') return tier1SectionStep;
    if (selectedTier === 'Tier 2') return tier2SectionStep;
    if (selectedTier === 'Tier 3') return tier3SectionStep;
    return 1;
  };

  const setCurrentTierSection = (nextSection: any) => {
    if (selectedTier === 'Tier 1') setTier1SectionStep(nextSection);
    if (selectedTier === 'Tier 2') setTier2SectionStep(nextSection);
    if (selectedTier === 'Tier 3') setTier3SectionStep(nextSection);
  };

  const handleFinalSubmit = (data: any) => {
    console.log('Final submission:', data);
    alert('Registration submitted successfully!');
    // Here you would typically send data to backend
  };

  const handleNext = () => {
    if (currentStep === 2 && selectedTier) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const sectionConfig: any = tierSectionFields[selectedTier as keyof typeof tierSectionFields] || {};
      const currentTierSection = getCurrentTierSection();
      const sectionFields = sectionConfig[currentTierSection] || [];
      const totalSections = Object.keys(sectionConfig).length;

      if (sectionFields.length > 0) {
        const isSectionComplete = sectionFields.every(
          (field: any) => String((formData as any)[field] ?? '').trim() !== ''
        );

        if (!isSectionComplete) {
          alert('Please complete all fields in this section before continuing.');
          return;
        }

        if (currentTierSection < totalSections) {
          setCurrentTierSection(currentTierSection + 1);
          return;
        }
      }

      const requiredFieldsByTier: any = {
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

      const requiredFields = requiredFieldsByTier[selectedTier as keyof typeof requiredFieldsByTier] || [];
      const isComplete = requiredFields.every(
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
      const currentTierSection = getCurrentTierSection();
      if (currentTierSection > 1) {
        setCurrentTierSection(currentTierSection - 1);
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
        if (selectedTier === 'Tier 1') {
          return (
            <Tier1Form
              formData={formData}
              onFormChange={handleFormChange}
              activeSection={tier1SectionStep}
            />
          );
        }
        if (selectedTier === 'Tier 2') {
          return (
            <Tier2Form
              formData={formData}
              onFormChange={handleFormChange}
              activeSection={tier2SectionStep}
            />
          );
        }
        return (
          <Tier3Form
            formData={formData}
            onFormChange={handleFormChange}
            activeSection={tier3SectionStep}
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
      const sectionConfig: any = tierSectionFields[selectedTier as keyof typeof tierSectionFields] || {};
      const currentTierSection = getCurrentTierSection();
      const fields = sectionConfig[currentTierSection] || [];
      return !fields.every(
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
                  const currentTierSection = getCurrentTierSection();
                  const totalSections = Object.keys(tierSectionFields[selectedTier as keyof typeof tierSectionFields] || {}).length;
                  if (currentTierSection < totalSections) {
                    return `Next Section (${currentTierSection + 1}/${totalSections})`;
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
