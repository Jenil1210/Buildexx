import React, { useState, useEffect } from 'react';

/**
 * AffordabilityCalculator - calculates the property price range a user can afford
 * Based on monthly income, existing EMIs, interest rate, and loan tenure
 */
const AffordabilityCalculator = ({ onClose, inline = false }) => {
    const [monthlyIncome, setMonthlyIncome] = useState(100000);
    const [existingEMIs, setExistingEMIs] = useState(0);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(20);
    const [results, setResults] = useState({
        maxEMI: 0,
        affordablePrice: 0,
        loanAmount: 0
    });

    useEffect(() => {
        calculateAffordability();
    }, [monthlyIncome, existingEMIs, interestRate, tenure]);

    const calculateAffordability = () => {
        // Standard rule: EMI should not exceed 40% of monthly income
        const maxEMIAllowed = (monthlyIncome * 0.4) - existingEMIs;

        if (maxEMIAllowed <= 0) {
            setResults({ maxEMI: 0, affordablePrice: 0, loanAmount: 0 });
            return;
        }

        // Calculate loan amount from EMI using reverse EMI formula
        // P = EMI * [(1+R)^N - 1] / [R * (1+R)^N]
        const R = interestRate / 12 / 100;
        const N = tenure * 12;

        let loanAmount;
        if (R === 0) {
            loanAmount = maxEMIAllowed * N;
        } else {
            const denominator = R * Math.pow(1 + R, N);
            const numerator = Math.pow(1 + R, N) - 1;
            loanAmount = maxEMIAllowed * (numerator / denominator);
        }

        // Assuming 20% down payment, calculate affordable property price
        const affordablePrice = loanAmount / 0.8;

        setResults({
            maxEMI: Math.round(maxEMIAllowed),
            loanAmount: Math.round(loanAmount),
            affordablePrice: Math.round(affordablePrice)
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
                        <i className="bi bi-wallet2 me-2" style={{ color: '#10B981' }}></i>
                        Affordability Calculator
                    </h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                        Find out how much property you can afford
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
                {/* Monthly Income Slider */}
                <div style={{ marginBottom: '28px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label style={{ color: '#64748B', fontWeight: '500' }}>Monthly Income</label>
                        <span style={{
                            background: 'linear-gradient(135deg, #10B98120, #10B98110)',
                            color: '#059669',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '1rem'
                        }}>
                            {formatCurrency(monthlyIncome)}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="25000"
                        max="1000000"
                        step="5000"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(parseInt(e.target.value))}
                        style={{
                            width: '100%',
                            height: '8px',
                            borderRadius: '4px',
                            background: `linear-gradient(to right, #10B981 0%, #10B981 ${(monthlyIncome - 25000) / (1000000 - 25000) * 100}%, #334155 ${(monthlyIncome - 25000) / (1000000 - 25000) * 100}%, #334155 100%)`,
                            appearance: 'none',
                            cursor: 'pointer'
                        }}
                    />
                    <div className="d-flex justify-content-between mt-1">
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>₹25K</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>₹10 Lac</span>
                    </div>
                </div>

                {/* Existing EMIs Slider */}
                <div style={{ marginBottom: '28px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label style={{ color: '#64748B', fontWeight: '500' }}>Existing EMIs</label>
                        <span style={{
                            background: 'linear-gradient(135deg, #EF444420, #EF444410)',
                            color: '#DC2626',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '1rem'
                        }}>
                            {formatCurrency(existingEMIs)}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="200000"
                        step="1000"
                        value={existingEMIs}
                        onChange={(e) => setExistingEMIs(parseInt(e.target.value))}
                        style={{
                            width: '100%',
                            height: '8px',
                            borderRadius: '4px',
                            background: `linear-gradient(to right, #EF4444 0%, #EF4444 ${(existingEMIs) / 200000 * 100}%, #334155 ${(existingEMIs) / 200000 * 100}%, #334155 100%)`,
                            appearance: 'none',
                            cursor: 'pointer'
                        }}
                    />
                    <div className="d-flex justify-content-between mt-1">
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>₹0</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>₹2 Lac</span>
                    </div>
                </div>

                {/* Interest Rate Slider */}
                <div style={{ marginBottom: '28px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label style={{ color: '#64748B', fontWeight: '500' }}>Interest Rate (p.a.)</label>
                        <span style={{
                            background: 'linear-gradient(135deg, #3B82F620, #3B82F610)',
                            color: '#2563EB',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '1rem'
                        }}>
                            {interestRate}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="15"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                        style={{
                            width: '100%',
                            height: '8px',
                            borderRadius: '4px',
                            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(interestRate - 5) / 10 * 100}%, #334155 ${(interestRate - 5) / 10 * 100}%, #334155 100%)`,
                            appearance: 'none',
                            cursor: 'pointer'
                        }}
                    />
                    <div className="d-flex justify-content-between mt-1">
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>5%</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>15%</span>
                    </div>
                </div>

                {/* Loan Tenure Slider */}
                <div style={{ marginBottom: '32px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label style={{ color: '#64748B', fontWeight: '500' }}>Loan Tenure</label>
                        <span style={{
                            background: 'linear-gradient(135deg, #C8A24A20, #C8A24A10)',
                            color: '#9E7C2F',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '1rem'
                        }}>
                            {tenure} Years
                        </span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="30"
                        step="1"
                        value={tenure}
                        onChange={(e) => setTenure(parseInt(e.target.value))}
                        style={{
                            width: '100%',
                            height: '8px',
                            borderRadius: '4px',
                            background: `linear-gradient(to right, #C8A24A 0%, #C8A24A ${(tenure - 5) / 25 * 100}%, #334155 ${(tenure - 5) / 25 * 100}%, #334155 100%)`,
                            appearance: 'none',
                            cursor: 'pointer'
                        }}
                    />
                    <div className="d-flex justify-content-between mt-1">
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>5 Years</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>30 Years</span>
                    </div>
                </div>

                {/* Affordability Result */}
                <div style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    marginBottom: '24px'
                }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>
                        You Can Afford a Property Worth
                    </p>
                    <h2 style={{
                        color: '#10B981',
                        margin: 0,
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        textShadow: '0 2px 10px rgba(16,185,129,0.3)'
                    }}>
                        {results.affordablePrice > 0 ? formatCurrency(results.affordablePrice) : '₹0'}
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
                            <p style={{ color: '#94A3B8', margin: '0 0 4px 0', fontSize: '0.85rem' }}>Max EMI Capacity</p>
                            <h5 style={{ color: '#F8FAFC', margin: 0, fontWeight: '700' }}>
                                {results.maxEMI > 0 ? formatCurrency(results.maxEMI) : '₹0'}/mo
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
                            <p style={{ color: '#94A3B8', margin: '0 0 4px 0', fontSize: '0.85rem' }}>Loan Eligibility</p>
                            <h5 style={{ color: '#F8FAFC', margin: 0, fontWeight: '700' }}>
                                {results.loanAmount > 0 ? formatCurrency(results.loanAmount) : '₹0'}
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
                    Calculation assumes 40% of income for EMI and 20% down payment
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
                    border: 3px solid #10B981;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    transition: all 0.2s ease;
                }
                
                input[type="range"]::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(16,185,129,0.4);
                }
                
                input[type="range"]::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    background: #FFFFFF;
                    border: 3px solid #10B981;
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

export default AffordabilityCalculator;
