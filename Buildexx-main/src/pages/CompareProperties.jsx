import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';

import { useState, useEffect } from 'react';
import { getPropertyById } from '../api/apiService';

const CompareProperties = ({ compareList, removeFromCompare }) => {
  const navigate = useNavigate();
  const [enrichedProperties, setEnrichedProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!compareList || compareList.length === 0) {
        setEnrichedProperties([]);
        return;
      }

      setLoading(true);
      try {
        const commands = compareList.map(async (p) => {
          try {
            // If we already have detailed fields like 'amenities' as array, maybe skip?
            // But to be safe, fetch fresh.
            const result = await getPropertyById(p.id);
            if (result.success) return result.data;
            return p;
          } catch (e) {
            return p;
          }
        });
        const results = await Promise.all(commands);
        setEnrichedProperties(results);
      } catch (error) {
        console.error("Error fetching compare details:", error);
        setEnrichedProperties(compareList);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [compareList]);

  // Use enriched properties for display
  const displayList = loading ? compareList : enrichedProperties;

  const formatCurrency = (value) => {
    if (!value) return '';
    const valStr = value.toString().replace(/,/g, '').replace('₹', '').replace(/\s/g, '');
    const num = parseFloat(valStr);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  if (compareList.length === 0) {
    return (
      <div className="compare-properties-page" style={{ minHeight: '100vh', background: 'var(--charcoal-slate)' }}>
        <div className="container-fluid py-4">
          {/* Page Header */}
          <div className="mb-4">
            <div style={{
              background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--section-divider) 100%)',
              borderRadius: '20px',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--card-shadow)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(200, 162, 74, 0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />

              <h1 className="fw-bold mb-2" style={{ color: 'var(--primary-text)' }}>
                <i className="bi bi-arrow-left-right me-3"></i>
                Compare Properties
              </h1>
              <p style={{ color: 'var(--secondary-text)', margin: 0 }}>
                Compare properties side by side to find your perfect match
              </p>
            </div>
          </div>

          <div className="text-center py-5" style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <i className="bi bi-arrow-left-right" style={{ fontSize: '3rem', color: '#3B82F6' }}></i>
            </div>
            <h4 style={{ color: 'var(--primary-text)' }}>No Properties to Compare</h4>
            <p style={{ color: 'var(--secondary-text)', maxWidth: '400px', margin: '0 auto 24px' }}>
              Add properties to compare them side by side and make informed decisions
            </p>
            <button
              className="btn"
              onClick={() => navigate('/property-list')}
              style={{
                background: 'linear-gradient(135deg, var(--construction-gold), var(--deep-bronze))',
                color: '#FFFFFF',
                padding: '12px 32px',
                borderRadius: '12px',
                fontWeight: '600',
                border: 'none'
              }}
            >
              <i className="bi bi-search me-2"></i>Browse Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-properties-page animate__animated animate__fadeIn" style={{ minHeight: '100vh', background: 'var(--charcoal-slate)' }}>
      <style>{`
        .compare-row { transition: background 0.3s ease; }
        .compare-row:hover { background: #334155 !important; }
        .compare-properties-page table th,
        .compare-properties-page table td {
          border-color: #475569 !important;
        }
        .compare-properties-page table {
          border: 1px solid #475569;
        }
      `}</style>
      <div className="container-fluid py-4">
        {/* Page Header */}
        <div className="mb-4">
          <div style={{
            background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--section-divider) 100%)',
            borderRadius: '20px',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(200, 162, 74, 0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />

            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="fw-bold mb-2" style={{ color: '#FFFFFF' }}>
                  <i className="bi bi-arrow-left-right me-3"></i>
                  Compare Properties
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                  Comparing {compareList.length} properties
                </p>
              </div>
              <button
                className="btn"
                onClick={() => navigate('/property-list')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(5px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>Add More
              </button>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid var(--section-divider)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <div className="table-responsive">
            <table className="table mb-0" style={{ borderCollapse: 'separate', background: '#1E293B' }}>
              <thead>
                <tr style={{ background: 'var(--card-bg)', borderBottom: '2px solid var(--section-divider)' }}>
                  <th style={{
                    color: 'var(--primary-text)',
                    fontWeight: '700',
                    padding: '24px',
                    fontSize: '1rem',
                    borderBottom: '2px solid var(--section-divider)',
                    minWidth: '150px',
                    background: '#1E293B'
                  }}>
                    Feature
                  </th>
                  {displayList.map(property => (
                    <th key={property.id} className="text-center" style={{
                      minWidth: '220px',
                      padding: '24px',
                      borderBottom: '2px solid var(--section-divider)',
                      background: '#1E293B'
                    }}>
                      <div className="d-flex flex-column align-items-center">
                        <button
                          className="btn btn-sm mb-3"
                          onClick={() => removeFromCompare(property.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#F87171',
                            borderRadius: '8px',
                            fontWeight: '600',
                            padding: '6px 16px',
                            fontSize: '0.85rem',
                            border: '1px solid #EF4444',
                            transition: 'all 0.2s'
                          }}
                        >
                          <i className="bi bi-x-lg me-1"></i>Remove
                        </button>
                        <span style={{ color: 'var(--primary-text)', fontWeight: '700', fontSize: '1.2rem' }}>{property.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Price', key: 'price', format: (p) => p.purpose?.toLowerCase() === 'rent' ? `${formatCurrency(p.rent || p.rentAmount || p.rent_amount)}/mo` : formatCurrency(p.price) },
                  { label: 'Type', key: 'type' },
                  { label: 'Purpose', key: 'purpose', badge: true },
                  { label: 'Area', key: 'area', format: (p) => p.area || p.areaSqft || p.area_sqft ? `${p.area || p.areaSqft || p.area_sqft} sq.ft` : 'N/A' },
                  { label: 'City', key: 'city', format: (p) => p.city || 'N/A' },
                  { label: 'Locality', key: 'locality', format: (p) => p.locality || (p.address && p.address.area) || 'N/A' },
                  { label: 'Possession', key: 'possession', format: (p) => p.possession || p.possessionYear || p.possession_year || 'N/A' },
                  {
                    label: 'Builder',
                    key: 'builder',
                    format: (p) => {
                      console.log('Render Builder:', p.builder_name, p.builder);
                      return p.builder_name || p.builder?.companyName || p.builder?.name || (typeof p.builder === 'string' ? p.builder : 'N/A');
                    }
                  },
                  {
                    label: 'Amenities', key: 'amenities', format: (p) => {
                      if (Array.isArray(p.amenities)) return p.amenities.filter(Boolean).join(', ');
                      if (typeof p.amenities === 'string') {
                        try {
                          const parsed = JSON.parse(p.amenities);
                          if (Array.isArray(parsed)) return parsed.filter(Boolean).join(', ');
                        } catch (e) {
                          return p.amenities.split(',').filter(Boolean).join(', ');
                        }
                        return p.amenities;
                      }
                      return 'N/A';
                    }
                  }
                ].map((row, idx) => (
                  <tr key={row.key} className="compare-row" style={{ background: idx % 2 === 0 ? 'var(--card-bg)' : 'var(--charcoal-slate)' }}>
                    <th style={{
                      color: 'var(--primary-text)',
                      fontWeight: '600',
                      padding: '20px 24px',
                      borderBottom: '1px solid var(--section-divider)',
                      verticalAlign: 'middle',
                      background: idx % 2 === 0 ? '#1E293B' : '#0F172A'
                    }}>
                      {row.label}
                    </th>
                    {displayList.map(property => (
                      <td key={property.id} className="text-center" style={{
                        padding: '20px',
                        borderBottom: '1px solid var(--section-divider)',
                        verticalAlign: 'middle',
                        background: idx % 2 === 0 ? '#1E293B' : '#0F172A'
                      }}>
                        {loading ? (
                          <span className="placeholder-glow">
                            <span className="placeholder col-6 rounded"></span>
                          </span>
                        ) : row.badge ? (
                          <span style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: property[row.key]?.toLowerCase() === 'buy' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: property[row.key]?.toLowerCase() === 'buy' ? '#34D399' : '#FBBF24',
                            border: property[row.key]?.toLowerCase() === 'buy' ? '1px solid #059669' : '1px solid #D97706'
                          }}>
                            {property[row.key]}
                          </span>
                        ) : row.highlight ? (
                          <span style={{ color: '#F5B700', fontWeight: '800', fontSize: '1.25rem' }}>
                            {row.format(property) || '-'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--secondary-text)', fontWeight: '500', fontSize: '1rem' }}>
                            {row.format ? row.format(property) : property[row.key] || '-'}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ background: '#1E293B' }}>
                  <th style={{
                    color: 'var(--primary-text)',
                    fontWeight: '600',
                    padding: '20px 24px',
                    background: '#1E293B'
                  }}>
                    Actions
                  </th>
                  {displayList.map(property => (
                    <td key={property.id} className="text-center" style={{ padding: '20px', background: '#1E293B' }}>
                      <button
                        className="btn"
                        onClick={() => navigate(`/property/${property.id}`)}
                        style={{
                          background: 'linear-gradient(135deg, var(--construction-gold), var(--deep-bronze))',
                          color: '#FFFFFF',
                          padding: '10px 24px',
                          borderRadius: '10px',
                          fontWeight: '600',
                          border: 'none'
                        }}
                      >
                        <i className="bi bi-eye me-2"></i>View Details
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareProperties;