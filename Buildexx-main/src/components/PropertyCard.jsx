import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getImageUrl } from '../utils/imageUtils';

const PropertyCard = ({ property, addToCompare, addToWishlist, index = 0 }) => {
  const navigate = useNavigate();

  const formatCurrency = (value) => {
    if (!value) return '';
    const valStr = value.toString().replace(/,/g, '').replace('₹', '').replace(/\s/g, '');
    const num = parseFloat(valStr);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };
  const getAvailabilityClass = (availability, property) => {
    const status = (availability || property?.availabilityStatus || property?.availability_status || '').toLowerCase();
    switch (status) {
      case 'available': return 'badge-available';
      case 'booked': return 'badge-booked';
      case 'sold': return 'badge-sold';
      case 'rented': return 'badge-rented';
      default: return 'badge-secondary';
    }
  };

  const getAvailabilityText = (availability, property) => {
    const status = (availability || property?.availabilityStatus || property?.availability_status || '').toLowerCase();
    switch (status) {
      case 'available': return 'Available';
      case 'booked': return '🔄 Under Process';
      case 'sold': return 'Sold';
      case 'rented': return 'Rented';
      default: return availability || property?.availabilityStatus || 'Unknown';
    }
  };

  // Debounced prefetch to prevent flooding the backend on mouse-sweep
  const prefetchTimerRef = React.useRef(null);

  const prefetchDetails = () => {
    if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);

    prefetchTimerRef.current = setTimeout(() => {
      // If we have an API service that caches (like ours does with getPropertyById)
      // calling it on hover will warm the cache.
      import('../api/apiService').then(m => {
        m.getPropertyById(property.id);
      });
    }, 150); // 150ms delay
  };

  const cancelPrefetch = () => {
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.05 }}
      className="property-card card h-100"
      style={{ cursor: 'pointer', overflow: 'hidden' }}
      onMouseEnter={prefetchDetails}
      onMouseLeave={cancelPrefetch}
    >
      <div className="position-relative">
        <div className="property-image-wrapper" style={{ height: '250px', overflow: 'hidden', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          {property.thumbnail || (property.images && property.images.length > 0) ? (
            <motion.img
              src={getImageUrl(property.thumbnail || property.images[0])}
              className="property-image card-img-top"
              alt={property.name}
              style={{ height: '100%', width: '100%', objectFit: 'cover' }}
              loading="lazy"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'tween', duration: 0.4 }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<div class="property-image bg-light d-flex align-items-center justify-content-center" style="height: 100%; width: 100%"><span>Image Error</span></div>';
              }}
            />
          ) : (
            <div className="property-image bg-light d-flex align-items-center justify-content-center" style={{ height: '100%', width: '100%' }}>
              <span>No Image</span>
            </div>
          )}
        </div>
        <span className={`availability-badge ${getAvailabilityClass(property.availability, property)}`}>
          {getAvailabilityText(property.availability, property)}
        </span>
        {/* Verified Badge */}
        {(property.is_verified || property.isVerified) && (
          <span style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
          }}>
            <i className="bi bi-patch-check-fill"></i> Verified
          </span>
        )}
      </div>

      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{property.title || property.name}</h5>
        <p className="card-text small">
          {[property.locality, property.city].filter(Boolean).length > 0 ? [property.locality, property.city].filter(Boolean).join(', ') : 'Location N/A'}
          {/* Builder name with verified indicator */}
          {property.builder_name && (
            <span style={{ display: 'block', marginTop: '4px', color: '#64748B' }}>
              <i className="bi bi-person-fill me-1"></i>
              {property.builder_name}
              {(property.is_verified || property.isVerified) && (
                <i className="bi bi-patch-check-fill ms-1" style={{ color: '#10B981', fontSize: '0.8rem' }} title="Verified Builder"></i>
              )}
            </span>
          )}
        </p>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold fs-5">
              {(property.purpose || '').toLowerCase() === 'rent'
                ? (() => {
                  const rentValue = property.rent || property.rentAmount || property.rent_amount;
                  const rentNum = rentValue ? parseFloat(String(rentValue).replace(/[^0-9.]/g, '')) : 0;
                  return rentNum > 0 ? `${formatCurrency(rentNum)}/mo` : 'Rent on Request';
                })()
                : formatCurrency(property.price || 0)}
            </span>
            <span className="badge" style={{ backgroundColor: 'var(--construction-gold)', color: 'var(--primary-text)' }}>{property.type}</span>
          </div>

          <div className="d-flex justify-content-between mt-3">
            <motion.button
              className="btn btn-primary"
              onClick={() => navigate(`/property/${property.id}`)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{
                background: 'linear-gradient(90deg, var(--construction-gold), var(--deep-bronze))',
                border: 'none',
                color: 'var(--primary-text)',
                borderRadius: '6px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--deep-bronze)';
                e.target.style.boxShadow = '0 4px 12px rgba(158, 124, 47, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(90deg, var(--construction-gold), var(--deep-bronze))';
                e.target.style.boxShadow = '0 4px 12px rgba(158, 124, 47, 0.3)';
              }}
            >
              View Details
            </motion.button>
            <div className="btn-group" role="group">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => addToCompare(property)}
                style={{
                  border: '1px solid var(--construction-gold)',
                  color: 'var(--construction-gold)',
                  background: 'transparent',
                  borderRadius: '6px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  marginLeft: '10px',
                  marginRight: '10px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#F5F0E6';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(200, 162, 74, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Compare
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => addToWishlist(property)}
                style={{
                  border: '1px solid var(--construction-gold)',
                  color: 'var(--construction-gold)',
                  background: 'transparent',
                  borderRadius: '6px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#F5F0E6';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(200, 162, 74, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <i className="bi bi-heart"></i>
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  // Use Backend Share URL
                  const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';
                  const url = `${backendBase}/share/property/${property.id}`;

                  if (navigator.share) {
                    navigator.share({
                      title: `Check out ${property.name} on Buildex`,
                      text: `Look at this property: ${property.name}`,
                      url: url
                    }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(url)
                      .then(() => alert('Link copied to clipboard!'))
                      .catch(() => alert('Failed to copy link'));
                  }
                }}
                style={{
                  border: '1px solid var(--construction-gold)',
                  color: 'var(--construction-gold)',
                  background: 'transparent',
                  borderRadius: '6px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  marginLeft: '10px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#F5F0E6';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(200, 162, 74, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
                title="Share Property"
              >
                <i className="bi bi-share"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div >
  );
};

export default PropertyCard;