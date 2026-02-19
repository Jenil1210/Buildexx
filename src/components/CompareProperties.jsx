import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUtils';
import { getPropertyById } from '../api/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * CompareProperties - Side-by-side comparison of 2-3 properties
 * Comparison fields: Price, Area, Bedrooms, Bathrooms, Amenities, Location, Status
 */
const CompareProperties = ({ properties, onRemove, onClose, isOpen }) => {
    const navigate = useNavigate();
    const [enrichedProperties, setEnrichedProperties] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!properties || properties.length === 0) {
                setEnrichedProperties([]);
                return;
            }

            // If the modal is not open, strictly don't fetch to save bandwidth, 
            // unless we want to pre-fetch. Let's fetch only when open or properties change.
            if (!isOpen) return;

            setLoading(true);
            try {
                // Fetch full details for each property
                const commands = properties.map(async (p) => {
                    // Slight optimization: if we think we already have full details (e.g. amenities is array), maybe skip?
                    // But to be safe and solve the "NA" issue definitely, let's fetch.
                    // Or check if p has a specific field that only full details have, like 'images' array with many items?
                    // Actually, let's just fetch to be sure.
                    try {
                        const result = await getPropertyById(p.id);
                        if (result.success) {
                            return result.data;
                        }
                        return p; // Fallback to existing data
                    } catch (e) {
                        return p;
                    }
                });

                const results = await Promise.all(commands);
                setEnrichedProperties(results);
            } catch (error) {
                console.error("Error fetching comparison details:", error);
                setEnrichedProperties(properties);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [properties, isOpen]);

    // Use enrichedProperties for display, or fallback to properties while loading (or show loader)
    const displayProperties = loading ? properties : enrichedProperties;

    const formatCurrency = (value) => {
        if (!value) return 'N/A';
        const num = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
        if (isNaN(num)) return value;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
    };

    const formatPricePerSqft = (price, area) => {
        if (!price || !area) return 'N/A';
        const priceNum = parseFloat(price.toString().replace(/[^0-9.-]/g, ''));
        const areaNum = parseFloat(area);
        if (isNaN(priceNum) || isNaN(areaNum) || areaNum === 0) return 'N/A';
        return formatCurrency(priceNum / areaNum) + '/sq.ft';
    };

    const comparisonFields = [
        { label: 'Price', getValue: (p) => (p.purpose?.toLowerCase() === 'rent' ? `${formatCurrency(p.rent || p.rentAmount || p.rent_amount)}/mo` : formatCurrency(p.price)) },
        { label: 'Price/Sq.ft', getValue: (p) => formatPricePerSqft(p.price, p.area || p.areaSqft || p.area_sqft) },
        { label: 'Area', getValue: (p) => p.area || p.areaSqft || p.area_sqft ? `${p.area || p.areaSqft || p.area_sqft} sq.ft` : 'N/A' },
        { label: 'Bedrooms', getValue: (p) => p.bedrooms || 'N/A' },
        { label: 'Bathrooms', getValue: (p) => p.bathrooms || 'N/A' },
        { label: 'Type', getValue: (p) => p.type || p.property_type || 'N/A' },
        { label: 'Purpose', getValue: (p) => p.purpose || 'N/A' },
        { label: 'Construction', getValue: (p) => p.constructionStatus || p.construction_status || p.status || 'N/A' },
        { label: 'Possession', getValue: (p) => p.possession || p.possessionYear || p.possession_year || 'N/A' },
        { label: 'Location', getValue: (p) => [p.locality || p.area, p.city].filter(Boolean).join(', ') || 'N/A' },
        { label: 'Status', getValue: (p) => p.availability || p.availability_status || 'Available' },
        { label: 'Builder', getValue: (p) => p.builderName || p.builder_name || (p.builder && (p.builder.companyName || p.builder.username || p.builder.name)) || 'N/A' },
        {
            label: 'Verified',
            getValue: (p) => p.is_verified || p.isVerified ? '✅ Yes' : '❌ No',
            isHighlight: true
        }
    ];

    // Get amenities union for comparison
    const getAmenitiesList = (properties) => {
        const allAmenities = new Set();
        properties.forEach(p => {
            const amenities = p.amenities || [];
            // Parse string amenities if needed (e.g. "Gym, Pool")
            // Also handle if backend sends it as JSON string
            let amenitiesArr = [];
            if (Array.isArray(amenities)) {
                amenitiesArr = amenities;
            } else if (typeof amenities === 'string') {
                // Try parsing as JSON first, then split by comma
                try {
                    const parsed = JSON.parse(amenities);
                    if (Array.isArray(parsed)) amenitiesArr = parsed;
                    else amenitiesArr = amenities.split(',').map(a => a.trim());
                } catch (e) {
                    amenitiesArr = amenities.split(',').map(a => a.trim());
                }
            }
            amenitiesArr.forEach(a => allAmenities.add(a));
        });
        return Array.from(allAmenities).filter(a => a && a !== "[]");
    };

    if (!isOpen || properties.length === 0) return null;

    const allAmenities = getAmenitiesList(properties);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050,
                    padding: '20px'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                        background: '#0F1E33',
                        borderRadius: '20px',
                        padding: '0',
                        maxWidth: '95vw',
                        width: properties.length > 2 ? '1200px' : '900px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #112A46, #0F1E33)',
                        padding: '24px 32px',
                        borderBottom: '1px solid rgba(200, 162, 74, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <i className="bi bi-layout-split" style={{ color: '#C8A24A' }}></i>
                                Compare Properties
                            </h3>
                            <p style={{ color: '#94A3B8', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                                {properties.length} of 3 properties selected
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#94A3B8',
                                fontSize: '1.5rem',
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <div style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 100px)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                            {/* Property Headers */}
                            <thead>
                                <tr>
                                    <th style={{
                                        background: '#112A46',
                                        padding: '20px',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 10,
                                        width: '180px', // Fixed label width
                                        minWidth: '180px',
                                        borderRight: '1px solid rgba(200, 162, 74, 0.1)',
                                        boxSizing: 'border-box'
                                    }}></th>
                                    {properties.map((property, idx) => (
                                        <th key={property.id || idx} style={{
                                            background: '#112A46',
                                            padding: '20px',
                                            position: 'sticky',
                                            top: 0,
                                            zIndex: 10,
                                            width: `${100 / properties.length}%`, // Equal width distribution
                                            minWidth: '250px',
                                            borderRight: idx < properties.length - 1 ? '1px solid rgba(200, 162, 74, 0.1)' : 'none',
                                            boxSizing: 'border-box',
                                            verticalAlign: 'top'
                                        }}>
                                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                {/* Remove button */}
                                                <button
                                                    onClick={() => onRemove(property.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-10px',
                                                        right: '-10px',
                                                        background: '#EF4444',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '26px',
                                                        height: '26px',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        zIndex: 20,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                                                    }}
                                                >
                                                    <i className="bi bi-x" style={{ fontSize: '18px' }}></i>
                                                </button>

                                                {/* Property Image */}
                                                <div style={{
                                                    width: '100%',
                                                    height: '220px', // Fixed Height
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    marginBottom: '16px',
                                                    background: '#1E3A5F'
                                                }}>
                                                    {property.images && property.images[0] ? (
                                                        <img
                                                            src={getImageUrl(property.images[0])}
                                                            alt={property.name}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                display: 'block'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <i className="bi bi-image" style={{ color: '#64748B', fontSize: '2rem' }}></i>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Property Name */}
                                                <h5 style={{
                                                    color: '#FFFFFF',
                                                    margin: '0 0 12px 0',
                                                    fontSize: '1.1rem',
                                                    lineHeight: '1.4',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '100%'
                                                }} title={property.name}>
                                                    {property.name || 'Untitled Property'}
                                                </h5>

                                                {/* View Button */}
                                                <button
                                                    onClick={() => {
                                                        onClose();
                                                        navigate(`/property/${property.id}`);
                                                    }}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '10px 16px',
                                                        color: '#0F172A',
                                                        fontWeight: '600',
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer',
                                                        width: '100%',
                                                        marginTop: 'auto' // Pushes button to bottom if height varies
                                                    }}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Comparison Rows */}
                            <tbody>
                                {comparisonFields.map((field) => (
                                    <tr key={field.label} style={{ background: field.isHighlight ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                                        <td style={{
                                            padding: '16px',
                                            color: '#94A3B8',
                                            fontSize: '0.9rem',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                            fontWeight: '500'
                                        }}>
                                            {field.label}
                                        </td>
                                        {displayProperties.map((property, idx) => (
                                            <td key={property.id || idx} style={{
                                                padding: '16px',
                                                color: 'white',
                                                fontSize: '1rem',
                                                fontWeight: field.isHighlight ? '600' : '400',
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                                textAlign: 'center'
                                            }}>
                                                {field.getValue(property)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {/* Amenities Row - Horizontal Scroll or List */}
                                <tr>
                                    <td style={{ padding: '16px', color: '#94A3B8', fontSize: '0.9rem', fontWeight: '500', verticalAlign: 'top' }}>
                                        Amenities
                                    </td>
                                    {displayProperties.map((property, idx) => (
                                        <td key={property.id || idx} style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                                                {/* Use getAmenitiesList logic or just map property amenities */}
                                                {(() => {
                                                    const pAmenities = property.amenities || [];
                                                    let list = [];
                                                    if (Array.isArray(pAmenities)) {
                                                        list = pAmenities;
                                                    } else if (typeof pAmenities === 'string') {
                                                        try {
                                                            const parsed = JSON.parse(pAmenities);
                                                            if (Array.isArray(parsed)) list = parsed;
                                                            else list = pAmenities.split(',').map(a => a.trim());
                                                        } catch (e) {
                                                            list = pAmenities.split(',').map(a => a.trim());
                                                        }
                                                    }
                                                    return list.filter(a => a && a !== "[]").map(am => (
                                                        <span key={am} style={{
                                                            fontSize: '0.75rem',
                                                            background: 'rgba(255,255,255,0.1)',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px'
                                                        }}>
                                                            {am}
                                                        </span>
                                                    ));
                                                })()}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CompareProperties;
