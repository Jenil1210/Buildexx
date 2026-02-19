import React, { useState, useEffect } from 'react';

/**
 * EligibilityCalculator - calculates maximum loan eligibility
 * Based on income, age, employment type, and existing liabilities
 */
const EligibilityCalculator = ({ onClose, inline = false }) => {
    const [annualIncome, setAnnualIncome] = useState(1200000);
    const [age, setAge] = useState(30);
    const [employmentType, setEmploymentType] = useState('salaried');
    const [existingLiabilities, setExistingLiabilities] = useState(0);
    const [results, setResults] = useState({
        maxLoanEligibility: 0,
        maxTenure: 0,
        estimatedEMI: 0
    });

    useEffect(() => {
        calculateEligibility();
    }, [annualIncome, age, employmentType, existingLiabilities]);

    const calculateEligibility = () => {
        // Calculate maximum tenure based on retirement age (60 for salaried, 65 for self-employed)
        const retirementAge = employmentType === 'salaried' ? 60 : 65;
        const maxTenure = Math.min(30, Math.max(5, retirementAge - age));

        // Income multiplier based on employment type
        const incomeMultiplier = employmentType === 'salaried' ? 6 : 4;

        // Base eligibility = Annual Income × Multiplier
        let baseEligibility = annualIncome * incomeMultiplier;

        // Reduce by existing liabilities (assuming they reduce capacity)
        const liabilityImpact = existingLiabilities * 12 * maxTenure; // Total liability burden
        baseEligibility = Math.max(0, baseEligibility - liabilityImpact);

        // Tenure adjustment (shorter tenure = slightly lower eligibility)
        const tenureMultiplier = Math.min(1, maxTenure / 20);
        const finalEligibility = baseEligibility * tenureMultiplier;

        // Calculate estimated EMI at 8.5%
        const R = 8.5 / 12 / 100;
        const N = maxTenure * 12;
        const P = finalEligibility;
        let estimatedEMI = 0;

        if (R > 0 && P > 0) {
            estimatedEMI = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
        }

        setResults({
            maxLoanEligibility: Math.round(finalEligibility),
            maxTenure: maxTenure,
            estimatedEMI: Math.round(estimatedEMI)
        });
    };

    const formatCurrency = (amount) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} Lac`;
        } else {
            return `₹${amount.toLocaleString('en-IN')}`;
        }
    };

    const content = (
        <div style={{
            background: inline ? 'transparent' : '#0F172A',
            borderRadius: inline ? '12px' : '24px',
            maxWidth: inline ? '100%' : '600px',
            width: '100%',
            maxHeight: inline ? 'none' : '90vh',
            overflow: inline ? 'visible' : 'auto',
            boxShadow: inline ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: inline ? 'none' : '1px solid #334155'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                padding: '24px',
                borderRadius: inline ? '12px 12px 0 0' : '24px 24px 0 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h4 style={{ color: '#FFFFFF', margin: 0, fontWeight: '700' }}>
                        <i className="bi bi-bank me-2" style={{ color: '#8B5CF6' }}></i>
                        Eligibility Calculator
                    </h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                        Check your maximum loan eligibility
                    </p>
                </div>
                {!inline && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                )}
            </div>

            <div style={{ padding: '24px' }}>
                {/* Annual Income Slider */}
                <div style={{ marginBottom: '28px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label style={{ color: '#64748B', fontWeight: '500' }}>Annual Income</label>
                        <span style={{
                            background: 'linear-gradient(135deg, #8B5CF620, #8B5CF610)',
                            color: '#7C3AED',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '1rem'
                        }}>
                            {formatCurrency(annualIncome)}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="300000"
                        max="10000000"
                        step="50000"
                        value={annualIncome}
                        onChange={(e) => setAnnualIncome(parseInt(e.target.value))}
                        style={{
                            width: '100%',
                            height: '8px',
                            borderRadius: '4px',
                            background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${(annualIncome - 300000) / (10000000 - 300000) * 100}%, #334155 ${(annualIncome - 300000) / (10000000 - 300000) * 100}%, #334155 100%)`,
                            appearance: 'none',
                            cursor: 'pointer'
                        }}
                    />
                    <div className="d-flex justify-content-between mt-1">
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>₹3 Lac</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>₹1 Cr</span>
                    </div>
                </div>

                {/* Age Slider */}
                <div style={{ marginBottom: '28px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label style={{ color: '#64748B', fontWeight: '500' }}>Your Age</label>
                        <span style={{
                            background: 'linear-gradient(135deg, #3B82F620, #3B82F610)',
                            color: '#2563EB',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '1rem'
                        }}>
                            {age} Years
                        </span>
                    </div>
                    <input
                        type="range"
                        min="21"
                        max="55"
                        step="1"
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value))}
                        style={{
                            width: '100%',
                            height: '8px',
                            borderRadius: '4px',
                            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(age - 21) / (55 - 21) * 100}%, #334155 ${(age - 21) / (55 - 21) * 100}%, #334155 100%)`,
                            appearance: 'none',
                            cursor: 'pointer'
                        }}
                    />
                    <div className="d-flex justify-content-between mt-1">
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>21 Years</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>55 Years</span>
                    </div>
                </div>

                {/* Employment Type */}
                <div style={{ marginBottom: '28px' }}>
                    <label style={{ color: '#64748B', fontWeight: '500', display: 'block', marginBottom: '12px' }}>
                        Employment Type
                    </label>
                    <div className="d-flex gap-3">
                        <button
                            type="button"
                            onClick={() => setEmploymentType('salaried')}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                border: employmentType === 'salaried' ? 'none' : '1px solid #334155',
                                background: employmentType === 'salaried'
                                    ? 'linear-gradient(135deg, #C8A24A, #9E7C2F)'
                                    : '#1E293B',
                                color: employmentType === 'salaried' ? '#0F172A' : '#94A3B8',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <i className="bi bi-briefcase me-2"></i>
                            Salaried
                        </button>
                        <button
                            type="button"
                            onClick={() => setEmploymentType('self-employed')}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                border: employmentType === 'self-employed' ? 'none' : '1px solid #334155',
                                background: employmentType === 'self-employed'
                                    ? 'linear-gradient(135deg, #C8A24A, #9E7C2F)'
                                    : '#1E293B',
                                color: employmentType === 'self-employed' ? '#0F172A' : '#94A3B8',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <i className="bi bi-person-workspace me-2"></i>
                            Self-Employed
                        </button>
                    </div>
                </div>

                {/* Existing Liabilities Slider */}
                <div style={{ marginBottom: '32px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label style={{ color: '#64748B', fontWeight: '500' }}>Existing Monthly EMIs/Liabilities</label>
                        <span style={{
                            background: 'linear-gradient(135deg, #EF444420, #EF444410)',
                            color: '#DC2626',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '1rem'
                        }}>
                            {formatCurrency(existingLiabilities)}/mo
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="200000"
                        step="5000"
                        value={existingLiabilities}
                        onChange={(e) => setExistingLiabilities(parseInt(e.target.value))}
                        style={{
                            width: '100%',
                            height: '8px',
                            borderRadius: '4px',
                            background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${(existingLiabilities) / 200000 * 100}%, #334155 ${(existingLiabilities) / 200000 * 100}%, #334155 100%)`,
                            appearance: 'none',
                            cursor: 'pointer'
                        }}
                    />
                    <div className="d-flex justify-content-between mt-1">
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>₹0</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>₹2 Lac</span>
                    </div>
                </div>

                {/* Eligibility Result */}
                <div style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    marginBottom: '24px'
                }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>
                        Your Maximum Loan Eligibility
                    </p>
                    <h2 style={{
                        color: '#8B5CF6',
                        margin: 0,
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        textShadow: '0 2px 10px rgba(139,92,246,0.3)'
                    }}>
                        {results.maxLoanEligibility > 0 ? formatCurrency(results.maxLoanEligibility) : '₹0'}
                    </h2>
                </div>

                {/* Breakdown */}
                <div className="row g-3 mb-4">
                    <div className="col-6">
                        <div style={{
                            background: '#1E293B',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'center',
                            border: '1px solid #334155'
                        }}>
                            <p style={{ color: '#94A3B8', margin: '0 0 4px 0', fontSize: '0.85rem' }}>Max Tenure Available</p>
                            <h5 style={{ color: '#F8FAFC', margin: 0, fontWeight: '700' }}>
                                {results.maxTenure} Years
                            </h5>
                        </div>
                    </div>
                    <div className="col-6">
                        <div style={{
                            background: '#1E293B',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'center',
                            border: '1px solid #334155'
                        }}>
                            <p style={{ color: '#94A3B8', margin: '0 0 4px 0', fontSize: '0.85rem' }}>Estimated EMI @ 8.5%</p>
                            <h5 style={{ color: '#F8FAFC', margin: 0, fontWeight: '700' }}>
                                {results.estimatedEMI > 0 ? formatCurrency(results.estimatedEMI) : '₹0'}/mo
                            </h5>
                        </div>
                    </div>
                </div>

                {/* Info Note */}
                <p style={{
                    color: '#94A3B8',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    margin: 0,
                    padding: '12px',
                    background: '#1E293B',
                    borderRadius: '8px',
                    border: '1px solid #334155'
                }}>
                    <i className="bi bi-info-circle me-1"></i>
                    Eligibility varies by lender. {employmentType === 'salaried' ? 'Retirement at 60' : 'Retirement at 65'} assumed.
                </p>
            </div>

            {/* Custom range input styles */}
            <style>{`
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: #FFFFFF;
                    border: 3px solid #8B5CF6;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    transition: all 0.2s ease;
                }
                
                input[type="range"]::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(139,92,246,0.4);
                }
                
                input[type="range"]::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    background: #FFFFFF;
                    border: 3px solid #8B5CF6;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
            `}</style>
        </div>
    );

    if (inline) return content;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
        }}>
            {content}
        </div>
    );
};

export default EligibilityCalculator;
