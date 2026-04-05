import React, { useState } from 'react';

/**
 * DepositCalculator - Calculates rental security deposit
 * Common in India: 2-6 months rent as deposit
 */
const DepositCalculator = ({ monthlyRent = 0, onClose, inline = false }) => {
    const [rent, setRent] = useState(monthlyRent || 25000);
    const [city, setCity] = useState('mumbai');

    // Deposit months by city (approximate standards)
    const cityDeposits = {
        mumbai: { min: 3, max: 6, typical: 4 },
        bangalore: { min: 10, max: 11, typical: 10 }, // Bangalore is famous for 10-month deposits
        delhi: { min: 2, max: 3, typical: 2 },
        hyderabad: { min: 2, max: 3, typical: 2 },
        chennai: { min: 3, max: 6, typical: 3 },
        pune: { min: 2, max: 4, typical: 3 },
        kolkata: { min: 2, max: 3, typical: 2 },
        ahmedabad: { min: 2, max: 3, typical: 2 }
    };

    const cityNames = {
        mumbai: 'Mumbai',
        bangalore: 'Bangalore',
        delhi: 'Delhi NCR',
        hyderabad: 'Hyderabad',
        chennai: 'Chennai',
        pune: 'Pune',
        kolkata: 'Kolkata',
        ahmedabad: 'Ahmedabad'
    };

    const cityData = cityDeposits[city] || cityDeposits.mumbai;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    };

    const minDeposit = rent * cityData.min;
    const maxDeposit = rent * cityData.max;
    const typicalDeposit = rent * cityData.typical;

    // Additional move-in costs estimate
    const brokerFee = rent; // 1 month
    const advanceRent = rent; // 1 month
    const totalMoveIn = typicalDeposit + brokerFee + advanceRent;

    return (
        <div style={{ padding: '24px' }}>
            <div className="row g-3">
                <div className="col-md-6">
                    <label style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                        Monthly Rent
                    </label>
                    <div className="input-group">
                        <span className="input-group-text" style={{ background: '#1E293B', border: '1px solid #334155', color: '#94A3B8' }}>₹</span>
                        <input
                            type="number"
                            className="form-control"
                            value={rent}
                            onChange={(e) => setRent(Number(e.target.value))}
                            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', fontSize: '1rem', padding: '12px' }}
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <label style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                        City
                    </label>
                    <select
                        className="form-select"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', fontSize: '1rem', padding: '12px' }}
                    >
                        {Object.entries(cityNames).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Deposit Range */}
            <div style={{ marginTop: '24px', padding: '20px', background: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
                <h6 style={{ color: '#F8FAFC', marginBottom: '16px' }}>
                    <i className="bi bi-shield-check me-2" style={{ color: '#10B981' }}></i>
                    Security Deposit Range in {cityNames[city]}
                </h6>
                <div className="row g-3">
                    <div className="col-4">
                        <div style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', border: '1px solid #334155', textAlign: 'center' }}>
                            <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginBottom: '4px' }}>Minimum</div>
                            <div style={{ color: '#F8FAFC', fontSize: '1.1rem', fontWeight: '700' }}>{formatCurrency(minDeposit)}</div>
                            <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{cityData.min} months</div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div style={{ padding: '16px', background: '#10B981', borderRadius: '10px', textAlign: 'center' }}>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginBottom: '4px' }}>Typical</div>
                            <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>{formatCurrency(typicalDeposit)}</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>{cityData.typical} months</div>
                        </div>
                    </div>
                    <div className="col-4">
                        <div style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', border: '1px solid #334155', textAlign: 'center' }}>
                            <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginBottom: '4px' }}>Maximum</div>
                            <div style={{ color: '#F8FAFC', fontSize: '1.1rem', fontWeight: '700' }}>{formatCurrency(maxDeposit)}</div>
                            <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{cityData.max} months</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Move-In Cost */}
            <div style={{ marginTop: '16px', padding: '20px', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', borderRadius: '12px' }}>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <i className="bi bi-wallet2 me-2"></i>Total Move-In Cost (Estimate)
                </div>
                <div style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '16px' }}>{formatCurrency(totalMoveIn)}</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                        <i className="bi bi-check2 me-1"></i>Deposit: {formatCurrency(typicalDeposit)}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                        <i className="bi bi-check2 me-1"></i>Advance: {formatCurrency(advanceRent)}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                        <i className="bi bi-check2 me-1"></i>Broker: {formatCurrency(brokerFee)}
                    </div>
                </div>
            </div>

            {city === 'bangalore' && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#334155', borderRadius: '8px', fontSize: '0.85rem', color: '#F59E0B' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Bangalore typically requires 10-11 months deposit. Negotiate if possible!
                </div>
            )}
        </div>
    );
};

export default DepositCalculator;
