import React, { useState } from 'react';

/**
 * StampDutyCalculator - Calculates stamp duty and registration charges
 * Based on Indian real estate stamp duty rates (state-wise variation)
 */
const StampDutyCalculator = ({ propertyPrice = 0, onClose, inline = false }) => {
    const [price, setPrice] = useState(propertyPrice || 5000000);
    const [state, setState] = useState('maharashtra');
    const [propertyType, setPropertyType] = useState('residential');
    const [gender, setGender] = useState('male');

    // Stamp duty rates by state (simplified)
    // Stamp duty rates by state (Approximate values)
    const stateRates = {
        maharashtra: { male: 6, female: 5, registration: 1 },
        karnataka: { male: 5.6, female: 5.6, registration: 1 },
        delhi: { male: 6, female: 4, registration: 1 },
        tamilnadu: { male: 7, female: 7, registration: 1 },
        gujarat: { male: 4.9, female: 4.9, registration: 1 },
        rajasthan: { male: 6, female: 5, registration: 1 },
        telangana: { male: 6, female: 6, registration: 0.5 },
        westbengal: { male: 7, female: 6, registration: 1 },
        uttarpradesh: { male: 7, female: 6, registration: 1 },
        haryana: { male: 7, female: 5, registration: 1 },
        kerala: { male: 8, female: 8, registration: 2 },
        andhrapradesh: { male: 7.5, female: 7.5, registration: 1 },
        madhyapradesh: { male: 7.5, female: 7.5, registration: 1 },
        punjab: { male: 7, female: 7, registration: 1 },
        bihar: { male: 6, female: 5.7, registration: 2 },
        odisha: { male: 5, female: 4, registration: 1 },
        goa: { male: 4, female: 3.5, registration: 1 },
        assam: { male: 8, female: 8, registration: 1 },
        chhattisgarh: { male: 5, female: 4, registration: 1 },
        jharkhand: { male: 4, female: 4, registration: 1 },
        uttarakhand: { male: 5, female: 3.75, registration: 2 },
        himachalpradesh: { male: 6, female: 4, registration: 1 },
        tripura: { male: 5, female: 5, registration: 1 },
        meghalaya: { male: 9.9, female: 9.9, registration: 1 }, // High due to local laws logic
        manipur: { male: 7, female: 7, registration: 1 },
        nagaland: { male: 8.25, female: 8.25, registration: 1 },
        arunachalpradesh: { male: 6, female: 6, registration: 1 },
        mizoram: { male: 9, female: 9, registration: 1 },
        sikkim: { male: 5, female: 4, registration: 1 },
        jammukashmir: { male: 7, female: 5, registration: 1 }, // UT
        chandigarh: { male: 6, female: 6, registration: 1 } // UT
    };

    const stateNames = {
        maharashtra: 'Maharashtra',
        karnataka: 'Karnataka',
        delhi: 'Delhi NCR',
        tamilnadu: 'Tamil Nadu',
        gujarat: 'Gujarat',
        rajasthan: 'Rajasthan',
        telangana: 'Telangana',
        westbengal: 'West Bengal',
        uttarpradesh: 'Uttar Pradesh',
        haryana: 'Haryana',
        kerala: 'Kerala',
        andhrapradesh: 'Andhra Pradesh',
        madhyapradesh: 'Madhya Pradesh',
        punjab: 'Punjab',
        bihar: 'Bihar',
        odisha: 'Odisha',
        goa: 'Goa',
        assam: 'Assam',
        chhattisgarh: 'Chhattisgarh',
        jharkhand: 'Jharkhand',
        uttarakhand: 'Uttarakhand',
        himachalpradesh: 'Himachal Pradesh',
        tripura: 'Tripura',
        meghalaya: 'Meghalaya',
        manipur: 'Manipur',
        nagaland: 'Nagaland',
        arunachalpradesh: 'Arunachal Pradesh',
        mizoram: 'Mizoram',
        sikkim: 'Sikkim',
        jammukashmir: 'Jammu & Kashmir',
        chandigarh: 'Chandigarh'
    };

    const calculateStampDuty = () => {
        const rates = stateRates[state] || stateRates.maharashtra;
        const stampDutyRate = gender === 'female' ? rates.female : rates.male;
        const stampDuty = (price * stampDutyRate) / 100;
        const registration = (price * rates.registration) / 100;
        return { stampDuty, registration, total: stampDuty + registration };
    };

    const result = calculateStampDuty();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <div style={{ padding: '24px' }}>
            <div className="row g-3">
                <div className="col-md-6">
                    <label style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                        Property Value
                    </label>
                    <div className="input-group">
                        <span className="input-group-text" style={{ background: '#1E293B', border: '1px solid #334155', color: '#94A3B8' }}>₹</span>
                        <input
                            type="number"
                            className="form-control"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', fontSize: '1rem', padding: '12px' }}
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <label style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                        State
                    </label>
                    <select
                        className="form-select"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', fontSize: '1rem', padding: '12px' }}
                    >
                        {Object.entries(stateNames).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-6">
                    <label style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                        Property Type
                    </label>
                    <select
                        className="form-select"
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', fontSize: '1rem', padding: '12px' }}
                    >
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>
                        Buyer Gender
                    </label>
                    <select
                        className="form-select"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        style={{ background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', fontSize: '1rem', padding: '12px' }}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
            </div>

            {/* Results */}
            <div style={{ marginTop: '24px', padding: '20px', background: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
                <div className="row g-3">
                    <div className="col-6">
                        <div style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', border: '1px solid #334155' }}>
                            <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginBottom: '4px' }}>Stamp Duty</div>
                            <div style={{ color: '#F8FAFC', fontSize: '1.3rem', fontWeight: '700' }}>{formatCurrency(result.stampDuty)}</div>
                            <div style={{ color: '#10B981', fontSize: '0.8rem' }}>
                                @ {gender === 'female' ? stateRates[state].female : stateRates[state].male}%
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', border: '1px solid #334155' }}>
                            <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginBottom: '4px' }}>Registration</div>
                            <div style={{ color: '#F8FAFC', fontSize: '1.3rem', fontWeight: '700' }}>{formatCurrency(result.registration)}</div>
                            <div style={{ color: '#8B5CF6', fontSize: '0.8rem' }}>@ {stateRates[state].registration}%</div>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: '16px', padding: '20px', background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)', borderRadius: '12px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>Total Additional Cost</div>
                    <div style={{ color: 'white', fontSize: '2rem', fontWeight: '700' }}>{formatCurrency(result.total)}</div>
                </div>
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: '#1E293B', borderRadius: '8px', fontSize: '0.85rem', color: '#94A3B8', border: '1px solid #334155' }}>
                <i className="bi bi-info-circle me-2"></i>
                Rates vary by property location and may have additional charges. Consult a local expert.
            </div>
        </div>
    );
};

export default StampDutyCalculator;
