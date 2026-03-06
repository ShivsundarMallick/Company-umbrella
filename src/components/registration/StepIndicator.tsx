import '../../pages/website/css/StepIndicator.css';

const StepIndicator = ({ currentStep }: any) => {
  const steps = [
    { id: 1, label: 'Login' },
    { id: 2, label: 'Select Tier' },
    { id: 3, label: 'Company Details' },
    { id: 4, label: 'Review & Submit' }
  ];

  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div key={step.id} className="step-item">
          <div className={`step-circle ${currentStep >= step.id ? 'active' : ''}`}>
            {currentStep > step.id ? '?' : step.id}
          </div>
          <div className={`step-label ${currentStep >= step.id ? 'active' : ''}`}>
            {step.label}
          </div>
          {index < steps.length - 1 && (
            <div className={`step-line ${currentStep > step.id ? 'active' : ''}`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
