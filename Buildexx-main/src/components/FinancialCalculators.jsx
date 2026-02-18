import React, { useState, useMemo } from 'react';
import EMICalculator from './EMICalculator';
import AffordabilityCalculator from './AffordabilityCalculator';
import EligibilityCalculator from './EligibilityCalculator';
import StampDutyCalculator from './StampDutyCalculator';
import DepositCalculator from './DepositCalculator';
import RentVsBuyCalculator from './RentVsBuyCalculator';

/**
 * FinancialCalculators - Smart context-aware financial tools
 * Shows different calculators based on purpose (BUY/RENT) and property type
 * 
 * BUY: EMI, Loan Eligibility, Affordability, Stamp Duty
 * RENT: Rent Affordability, Deposit, Rent vs Buy
 * 
 * CRITICAL: No cross-purpose calculators should ever render
 */
const FinancialCalculators = ({
    propertyPrice,
    monthlyRent,
    purpose = 'buy', // 'buy' or 'rent'
    propertyType = 'apartment',
    onClose,
    inline = false
}) => {
    // Normalize purpose to lowercase for consistent comparison
    const normalizedPurpose = (purpose || 'buy').toString().toLowerCase().trim();
    const isBuyProperty = normalizedPurpose === 'buy';
    const isRentProperty = normalizedPurpose === 'rent';

    // Determine available calculators based on purpose - STRICTLY separated
    const calculatorTabs = useMemo(() => {
        if (isRentProperty) {
            // RENT calculators ONLY
            return [
                { id: 'rent-afford', label: 'Rent Affordability', icon: 'bi-wallet2', color: '#10B981' },
                { id: 'deposit', label: 'Deposit Calculator', icon: 'bi-shield-check', color: '#8B5CF6' },
                { id: 'rent-vs-buy', label: 'Rent vs Buy', icon: 'bi-arrow-left-right', color: '#F59E0B' }
            ];
        } else {
            // BUY calculators ONLY (default)
            return [
                { id: 'emi', label: 'EMI Calculator', icon: 'bi-calculator', color: '#C8A24A' },
                { id: 'eligibility', label: 'Loan Eligibility', icon: 'bi-bank', color: '#8B5CF6' },
                { id: 'affordability', label: 'Affordability', icon: 'bi-wallet2', color: '#10B981' },
                { id: 'stamp-duty', label: 'Stamp Duty', icon: 'bi-receipt', color: '#F59E0B' }
            ];
        }
    }, [isRentProperty]);

    const [activeCalculator, setActiveCalculator] = useState(calculatorTabs[0]?.id || 'emi');

    // Reset active calculator when purpose changes
    React.useEffect(() => {
        setActiveCalculator(calculatorTabs[0]?.id || 'emi');
    }, [normalizedPurpose, calculatorTabs]);

    const headerText = isRentProperty ? 'Rental Tools' : 'Buying Tools';
    const subText = isRentProperty ? 'Plan your rental budget' : 'Plan your property purchase';
    const headerGradient = isRentProperty
        ? 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)'  // Purple for rent
        : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'; // Dark blue for buy

    const content = (
        <div style={{
            background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
            borderRadius: inline ? '16px' : '24px',
            maxWidth: inline ? '100%' : '700px',
            width: '100%',
            maxHeight: inline ? 'none' : '95vh',
            overflow: inline ? 'visible' : 'auto',
            boxShadow: inline ? '0 4px 20px rgba(0,0,0,0.3)' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: inline ? '1px solid #334155' : 'none'
        }}>
            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.4);
                }
                `}
            </style>
            {/* Header with Tabs */}
            <div style={{
                background: headerGradient,
                padding: '20px 24px',
                borderRadius: inline ? '16px 16px 0 0' : '24px 24px 0 0'
            }}>
                {/* Title Row */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 style={{ color: '#FFFFFF', margin: 0, fontWeight: '700' }}>
                            <i className={`bi ${isRentProperty ? 'bi-key-fill' : 'bi-house-door-fill'} me-2`} style={{ color: '#C8A24A' }}></i>
                            {headerText}
                        </h4>
                        <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                            {subText}
                        </p>
                    </div>
                    {/* Close button - always visible for inline mode */}
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
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Calculator Tabs */}
                <div className="d-flex gap-2 custom-scrollbar" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
                    {calculatorTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveCalculator(tab.id)}
                            style={{
                                flex: '1 0 auto',
                                minWidth: 'fit-content',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                background: activeCalculator === tab.id
                                    ? 'rgba(255,255,255,0.15)'
                                    : 'transparent',
                                color: activeCalculator === tab.id ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                position: 'relative',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <i className={`bi ${tab.icon}`} style={{
                                color: activeCalculator === tab.id ? tab.color : 'inherit',
                                fontSize: '1rem'
                            }}></i>
                            <span className="d-none d-sm-inline">{tab.label}</span>
                            {activeCalculator === tab.id && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    left: '20%',
                                    width: '60%',
                                    height: '3px',
                                    background: tab.color,
                                    borderRadius: '3px'
                                }}></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Calculator Content - Dark themed */}
            <div style={{
                padding: '24px',
                background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)'
            }}>
                {/* BUY Calculators - ONLY render if isBuyProperty */}
                {isBuyProperty && activeCalculator === 'emi' && (
                    <EMICalculator
                        propertyPrice={propertyPrice}
                        onClose={onClose}
                        inline={true}
                    />
                )}
                {isBuyProperty && activeCalculator === 'affordability' && (
                    <AffordabilityCalculator
                        onClose={onClose}
                        inline={true}
                    />
                )}
                {isBuyProperty && activeCalculator === 'eligibility' && (
                    <EligibilityCalculator
                        onClose={onClose}
                        inline={true}
                    />
                )}
                {isBuyProperty && activeCalculator === 'stamp-duty' && (
                    <StampDutyCalculator
                        propertyPrice={propertyPrice}
                        onClose={onClose}
                        inline={true}
                    />
                )}

                {/* RENT Calculators - ONLY render if isRentProperty */}
                {isRentProperty && activeCalculator === 'rent-afford' && (
                    <AffordabilityCalculator
                        onClose={onClose}
                        inline={true}
                        mode="rent"
                    />
                )}
                {isRentProperty && activeCalculator === 'deposit' && (
                    <DepositCalculator
                        monthlyRent={monthlyRent}
                        onClose={onClose}
                        inline={true}
                    />
                )}
                {isRentProperty && activeCalculator === 'rent-vs-buy' && (
                    <RentVsBuyCalculator
                        propertyPrice={propertyPrice}
                        monthlyRent={monthlyRent}
                        onClose={onClose}
                        inline={true}
                    />
                )}
            </div>
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

export default FinancialCalculators;
