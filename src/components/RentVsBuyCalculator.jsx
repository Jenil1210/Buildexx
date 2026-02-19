import React, { useState, useMemo } from 'react';

/**
 * RentVsBuyCalculator - Helps users decide: Should I rent or buy?
 * Compares total cost of renting vs buying over time
 */
const RentVsBuyCalculator = ({ propertyPrice = 0, monthlyRent = 0, onClose, inline = false }) => {
    const [price, setPrice] = useState(propertyPrice || 5000000);
    const [rent, setRent] = useState(monthlyRent || 25000);
    const [years, setYears] = useState(10);
    const [appreciation, setAppreciation] = useState(6); // Annual property appreciation %
    const [rentIncrease, setRentIncrease] = useState(5); // Annual rent increase %
    const [downPayment, setDownPayment] = useState(20); // Down payment %
    const [interestRate, setInterestRate] = useState(8.5);

    const calculation = useMemo(() => {
        // Buy Calculation
        const downPaymentAmount = (price * downPayment) / 100;
        const loanAmount = price - downPaymentAmount;
        const monthlyRate = interestRate / 100 / 12;
        const totalMonths = years * 12;

        // EMI Calculation
        const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1);
        const totalEMIPaid = emi * totalMonths;

        // Property value after appreciation
        const futureValue = price * Math.pow(1 + appreciation / 100, years);
        const equity = futureValue; // You own the property

        // Total cost of buying = Down payment + EMIs + Registration (~7%) - Equity
        const registrationCost = price * 0.07;
        const totalBuyCost = downPaymentAmount + totalEMIPaid + registrationCost;
        const netBuyCost = totalBuyCost - futureValue;

        // Rent Calculation
        let totalRentPaid = 0;
        let currentRent = rent;
        for (let year = 0; year < years; year++) {
            totalRentPaid += currentRent * 12;
            currentRent *= (1 + rentIncrease / 100);
        }

        // Investment of down payment (if renting) at 10% CAGR (equity mutual funds)
        const investmentReturns = downPaymentAmount * Math.pow(1.10, years);
        const netRentCost = totalRentPaid - (investmentReturns - downPaymentAmount);

        // Verdict
        const buyBetter = netBuyCost < netRentCost;
        const savings = Math.abs(netBuyCost - netRentCost);

        return {
            emi: Math.round(emi),
            totalEMIPaid: Math.round(totalEMIPaid),
            futureValue: Math.round(futureValue),
            totalBuyCost: Math.round(totalBuyCost),
            netBuyCost: Math.round(netBuyCost),
            totalRentPaid: Math.round(totalRentPaid),
            investmentReturns: Math.round(investmentReturns),
            netRentCost: Math.round(netRentCost),
            buyBetter,
            savings: Math.round(savings)
        };
    }, [price, rent, years, appreciation, rentIncrease, downPayment, interestRate]);

    const formatCurrency = (value) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <div style={{ padding: '24px' }}>
            <div className="row g-3">
                <div className="col-md-4">
                    <label style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                        Property Price
                    </label>
                    <div className="input-group">
                        <span className="input-group-text" style={{ background: '#1E293B', border: '1px solid #334155', color: '#94A3B8' }}>₹</span>
                        <input
                            type="number"
                            className="form-control"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', padding: '10px' }}
                        />
                    </div>
                </div>
                <div className="col-md-4">
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
                            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', padding: '10px' }}
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <label style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                        Time Horizon (Years)
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        value={years}
                        min={1}
                        max={30}
                        onChange={(e) => setYears(Number(e.target.value))}
                        style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', padding: '10px' }}
                    />
                </div>
            </div>

            {/* Advanced Settings */}
            <div style={{ marginTop: '16px', padding: '16px', background: '#1E293B', borderRadius: '10px', border: '1px solid #334155' }}>
                <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '12px' }}>
                    <i className="bi bi-sliders me-2"></i>Advanced Assumptions
                </div>
                <div className="row g-2">
                    <div className="col-6 col-md-3">
                        <label style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Down Payment %</label>
                        <input type="number" className="form-control form-control-sm" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))}
                            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }} />
                    </div>
                    <div className="col-6 col-md-3">
                        <label style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Loan Rate %</label>
                        <input type="number" className="form-control form-control-sm" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }} />
                    </div>
                    <div className="col-6 col-md-3">
                        <label style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Property Appreciation %</label>
                        <input type="number" className="form-control form-control-sm" step="0.5" value={appreciation} onChange={(e) => setAppreciation(Number(e.target.value))}
                            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }} />
                    </div>
                    <div className="col-6 col-md-3">
                        <label style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Rent Increase %/yr</label>
                        <input type="number" className="form-control form-control-sm" step="0.5" value={rentIncrease} onChange={(e) => setRentIncrease(Number(e.target.value))}
                            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' }} />
                    </div>
                </div>
            </div>

            {/* Comparison Results */}
            <div className="row g-3 mt-3">
                {/* Buy Column */}
                <div className="col-md-6">
                    <div style={{
                        padding: '20px',
                        background: calculation.buyBetter ? 'linear-gradient(135deg, #10B981, #059669)' : '#1E293B',
                        borderRadius: '12px',
                        border: calculation.buyBetter ? 'none' : '1px solid #334155',
                        color: calculation.buyBetter ? 'white' : '#F8FAFC'
                    }}>
                        <h6 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <i className="bi bi-house-door-fill"></i>
                            BUY
                            {calculation.buyBetter && <span className="badge bg-white text-success ms-2">Better</span>}
                        </h6>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>Net Cost after {years} years</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '16px' }}>{formatCurrency(calculation.netBuyCost)}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                            <div>EMI: {formatCurrency(calculation.emi)}/mo</div>
                            <div>Property Value: {formatCurrency(calculation.futureValue)}</div>
                        </div>
                    </div>
                </div>

                {/* Rent Column */}
                <div className="col-md-6">
                    <div style={{
                        padding: '20px',
                        background: !calculation.buyBetter ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' : '#1E293B',
                        borderRadius: '12px',
                        border: !calculation.buyBetter ? 'none' : '1px solid #334155',
                        color: !calculation.buyBetter ? 'white' : '#F8FAFC'
                    }}>
                        <h6 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <i className="bi bi-key-fill"></i>
                            RENT
                            {!calculation.buyBetter && <span className="badge bg-white text-purple ms-2">Better</span>}
                        </h6>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>Net Cost after {years} years</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '16px' }}>{formatCurrency(calculation.netRentCost)}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                            <div>Total Rent Paid: {formatCurrency(calculation.totalRentPaid)}</div>
                            <div>Investment Returns: {formatCurrency(calculation.investmentReturns)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verdict */}
            <div style={{ marginTop: '16px', padding: '16px', background: '#334155', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ color: '#F8FAFC', fontSize: '0.9rem' }}>
                    <i className="bi bi-lightbulb me-2" style={{ color: '#F59E0B' }}></i>
                    {calculation.buyBetter
                        ? `Buying saves you ${formatCurrency(calculation.savings)} over ${years} years!`
                        : `Renting + investing saves you ${formatCurrency(calculation.savings)} over ${years} years!`
                    }
                </div>
            </div>
        </div>
    );
};

export default RentVsBuyCalculator;
