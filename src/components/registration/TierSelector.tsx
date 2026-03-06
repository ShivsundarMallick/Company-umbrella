import '../../pages/website/css/TierSelector.css';

const TierSelector = ({ selectedTier, onTierSelect }: any) => {
  const tiers = [
    { id: 'Tier 1', label: 'Tier 1', description: 'Large Company' },
    { id: 'Tier 2', label: 'Tier 2', description: 'Medium Company' },
    { id: 'Tier 3', label: 'Tier 3', description: 'Small Company' }
  ];
  const criteriaByTier = {
    'Tier 1': {
      title: 'Tier 1 - Large Company',
      rules: [
        'Employees greater than 500',
        'Annual revenue greater than $50M',
        'GST registration required',
        'Compliance officer required'
      ]
    },
    'Tier 2': {
      title: 'Tier 2 - Medium Company',
      rules: [
        'Employees between 50 and 500',
        'Revenue between $5M and $50M',
        'GST registration required',
        'Basic compliance'
      ]
    },
    'Tier 3': {
      title: 'Tier 3 - Small Company',
      rules: [
        'Employees less than 50',
        'Revenue less than $5M',
        'GST optional',
        'Simplified compliance'
      ]
    }
  };

  const selectedCriteria = (criteriaByTier as any)[selectedTier];

  return (
    <div className="tier-selector">
      <h3>Select Your Company Tier</h3>
      <div className="tier-options">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            className={`tier-button ${selectedTier === tier.id ? 'selected' : ''}`}
            onClick={() => onTierSelect(tier.id)}
          >
            <div className="tier-label">{tier.label}</div>
            <div className="tier-description">{tier.description}</div>
          </button>
        ))}
      </div>
      {selectedCriteria && (
        <div key={selectedTier} className="tier-criteria-card">
          <h4>{selectedCriteria.title} Criteria</h4>
          <ul className="tier-criteria-list">
            {selectedCriteria.rules.map((rule: any) => (
              <li key={rule}>
                <span className="criteria-check" aria-hidden="true">✓</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TierSelector;
