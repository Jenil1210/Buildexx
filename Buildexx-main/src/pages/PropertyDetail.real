import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FinancialCalculators from '../components/FinancialCalculators';
import PropertyMap from '../components/PropertyMap';
import NearbyPlaces from '../components/NearbyPlaces';
import PanoramaViewer from '../components/PanoramaViewer';
import PaymentButton from '../components/PaymentButton';
import ReportListing from '../components/ReportListing';
import { createEnquiry, createRentRequest, createComplaint, getPropertyById, reportProperty } from '../../api/apiService';
import { getApiUrl } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const PropertyDetail = ({ addToCompare, addToWishlist }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [showRentForm, setShowRentForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showReportModal, setShowReportModal] = useState(false);

  // Caching refs to prevent repeated API calls
  const loadedPropertyIdRef = useRef(null);
  const cachedPropertyRef = useRef(null);

  // Handle report submission
  const handleReportSubmit = async (reportData) => {
    try {
      await reportProperty(reportData);
      return true;
    } catch (error) {
      console.error('Error reporting property:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      // 1. Check in-memory ref cache
      if (loadedPropertyIdRef.current === id && cachedPropertyRef.current) {
        console.log('[PropertyDetail] Using in-memory cached property data for ID:', id);
        setProperty(cachedPropertyRef.current);
        setIsLoading(false);
        return;
      }

      // 2. Check sessionStorage cache
      const sessionCache = sessionStorage.getItem(`property_detail_${id}`);
      if (sessionCache) {
        try {
          const { data, timestamp } = JSON.parse(sessionCache);
          // Valid for 5 minutes
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            console.log('[PropertyDetail] Using session cached property data for ID:', id);
            setProperty(data);
            cachedPropertyRef.current = data;
            loadedPropertyIdRef.current = id;
            setIsLoading(false);
            // Background refresh could be added here if needed, but for now we trust cache
            return;
          }
        } catch (e) {
          console.error('Error parsing session cache:', e);
          sessionStorage.removeItem(`property_detail_${id}`);
        }
      }

      setIsLoading(true);
      if (id) {
        const result = await getPropertyById(id);
        if (result.success) {
          setProperty(result.data);
          // Cache the data
          cachedPropertyRef.current = result.data;
          loadedPropertyIdRef.current = id;
          sessionStorage.setItem(`property_detail_${id}`, JSON.stringify({
            data: result.data,
            timestamp: Date.now()
          }));
        }
      }
      setIsLoading(false);
    };
    fetchProperty();
  }, [id]);

  const formatCurrency = (value) => {
    if (!value) return '';
    const valStr = value.toString().replace(/,/g, '').replace('₹', '').replace(/\s/g, '');
    const num = parseFloat(valStr);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  // Helper: Normalize purpose check (case-insensitive)
  const isBuyProperty = property && (property.purpose || '').toString().toLowerCase().trim() === 'buy';
  const isRentProperty = property && (property.purpose || '').toString().toLowerCase().trim() === 'rent';

  // Helper to convert Google Maps URL to embed URL
  const getEmbedMapUrl = (url) => {
    if (!url) return null;

    // If it's already an embed URL, return as is
    if (url.includes('google.com/maps/embed')) {
      return url;
    }

    try {
      // Method 1: Extract coordinates from URL (@lat,lng format)
      const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (coordMatch) {
        const lat = coordMatch[1];
        const lng = coordMatch[2];
        return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }

      // Method 2: Extract place name from /place/PlaceName format
      const placeMatch = url.match(/place\/([^/@]+)/);
      if (placeMatch) {
        const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }

      // Method 3: Extract query parameter
      const qMatch = url.match(/[?&]q=([^&]+)/);
      if (qMatch) {
        const query = qMatch[1];
        return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }

      // Method 4: If URL is just a location name (no http), use it directly
      if (!url.startsWith('http')) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }

      // Method 5: For goo.gl or maps.app short links, return null (can't embed short links)
      // User should paste location name instead
      if (url.includes('goo.gl') || url.includes('maps.app')) {
        console.warn('Short Google Maps URLs cannot be embedded. Please use a location name or full URL.');
        return null;
      }

      // Fallback: Return null to not render the map section
      return null;
    } catch (e) {
      console.error('Error parsing Google Maps URL:', e);
      return null;
    }
  };

  // Form states
  const [enquiryForm, setEnquiryForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });

  const [rentForm, setRentForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    moveInDate: '',
    message: ''
  });

  const [visitForm, setVisitForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    visitDate: '',
    message: ''
  });

  const toggleForm = (formName) => {
    if (formName === 'enquiry') {
      setShowEnquiryForm(!showEnquiryForm);
      setShowRentForm(false);
      setShowVisitForm(false);
      setShowEMICalculator(false);
    } else if (formName === 'rent') {
      setShowRentForm(!showRentForm);
      setShowEnquiryForm(false);
      setShowVisitForm(false);
      setShowEMICalculator(false);
    } else if (formName === 'visit') {
      setShowVisitForm(!showVisitForm);
      setShowEnquiryForm(false);
      setShowRentForm(false);
      setShowEMICalculator(false);
    } else if (formName === 'emi') {
      setShowEMICalculator(!showEMICalculator);
      setShowEnquiryForm(false);
      setShowRentForm(false);
      setShowVisitForm(false);
      setShowComplaintForm(false);
    } else if (formName === 'complaint') {
      setShowComplaintForm(!showComplaintForm);
      setShowEnquiryForm(false);
      setShowRentForm(false);
      setShowVisitForm(false);
      setShowEMICalculator(false);
    }
  };

  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ issue: '' });

  const handleComplaintChange = (e) => {
    setComplaintForm({ ...complaintForm, [e.target.name]: e.target.value });
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createComplaint({
        propertyId: property.id,
        userId: currentUser?.id,
        issue: complaintForm.issue
      });
      if (result.success) {
        setMessage({ type: 'success', text: 'Complaint reported successfully!' });
        setTimeout(() => {
          setShowComplaintForm(false);
          setMessage({ type: '', text: '' });
          setComplaintForm({ issue: '' });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to report complaint.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnquiryChange = (e) => {
    setEnquiryForm({ ...enquiryForm, [e.target.name]: e.target.value });
  };

  const handleRentChange = (e) => {
    setRentForm({ ...rentForm, [e.target.name]: e.target.value });
  };

  const handleVisitChange = (e) => {
    setVisitForm({ ...visitForm, [e.target.name]: e.target.value });
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const visitMessage = `[Visit Request for ${visitForm.visitDate}] ${visitForm.message}`;
      // Reuse createEnquiry for now, or createVisitRequest if API exists
      const result = await createEnquiry({
        propertyId: property.id,
        ...visitForm,
        message: visitMessage,
        userId: currentUser ? currentUser.id : null,
        enquiryType: 'visit'
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Visit scheduled successfully!' });
        setTimeout(() => {
          setShowVisitForm(false);
          setMessage({ type: '', text: '' });
          setVisitForm({ fullName: '', email: '', phone: '', visitDate: '', message: '' });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to schedule visit' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'An error occurred.' });
    }
    setSubmitting(false);
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createEnquiry({
        propertyId: property.id,
        userId: currentUser?.id,
        builderId: property.builder_id,
        ...enquiryForm,
        enquiryType: 'buy'
      });
      if (result.success) {
        setMessage({ type: 'success', text: 'Enquiry sent successfully!' });
        setTimeout(() => {
          setShowEnquiryForm(false);
          setMessage({ type: '', text: '' });
          setEnquiryForm({ fullName: '', email: '', phone: '', message: '' });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to send enquiry.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createRentRequest({
        propertyId: property.id,
        userId: currentUser?.id,
        builderId: property.builder_id,
        moveInDate: rentForm.moveInDate,
        message: rentForm.message,
        rentAmount: property.rent_amount || property.price || '0',
        applicantName: rentForm.fullName,
        email: rentForm.email,
        phone: rentForm.phone
      });
      // Also create an enquiry record for message tracking if needed, or just rely on rent request
      // Ideally rent request table should have message column or link to enquiry. 
      // Current schema for rent_requests doesn't have message, so let's send enquiry too or just ignore message for now?
      // Schema check: rent_requests has no message column. Enquiries does.
      // Let's create an enquiry of type 'rent' as well to store the message.
      await createEnquiry({
        propertyId: property.id,
        userId: currentUser?.id,
        builderId: property.builder_id,
        fullName: rentForm.fullName,
        email: rentForm.email,
        phone: rentForm.phone,
        message: rentForm.message,
        enquiryType: 'rent'
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Rent request sent successfully!' });
        setTimeout(() => {
          setShowRentForm(false);
          setMessage({ type: '', text: '' });
          setRentForm({ fullName: '', email: '', phone: '', moveInDate: '', message: '' });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to send request.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = `Check out ${property?.name} on Buildex`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      default:
        break;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container-fluid py-5" style={{ minHeight: '80vh', background: 'var(--page-bg)' }}>
        <div className="text-center" style={{ paddingTop: '100px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '4px solid rgba(200,162,74,0.2)',
            borderTop: '4px solid #C8A24A',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h4 style={{ color: '#C8A24A', marginBottom: '8px' }}>Loading Property Details</h4>
          <p style={{ color: '#64748B' }}>Please wait while we fetch the property information...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <h2>Property not found</h2>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/property-list')}>
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
    );
  };

  const getAvailabilityClass = (availability) => {
    const status = (availability || '').toLowerCase();
    switch (status) {
      case 'available': return 'bg-success';
      case 'booked': return 'bg-warning text-dark';
      case 'sold': return 'bg-danger';
      case 'rented': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  };

  const getAvailabilityText = (availability) => {
    const status = (availability || '').toLowerCase();
    switch (status) {
      case 'available': return 'Available';
      case 'booked': return 'Booked';
      case 'sold': return 'Sold';
      default: return availability || 'Unknown';
    }
  };

  return (
    <div className="property-detail-page animate__animated animate__fadeIn" style={{ minHeight: '100vh', background: 'var(--off-white)', color: 'var(--primary-text)' }}>
      <div className="container-fluid">
        {/* Back Button */}
        <div className="mb-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate('/property-list')}
            style={{
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              border: '1px solid var(--construction-gold)',
              color: 'var(--construction-gold)',
              background: 'transparent'
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
            ← Back to Properties
          </button>
        </div>

        {/* Property Header */}
        <div className="row mb-4 animate__animated animate__fadeInUp">
          <div className="col-md-8">
            <h1>{property.name}</h1>
            <p style={{ color: 'var(--secondary-text)' }}>
              {property.locality}, {property.city} • <span className="badge bg-secondary">{property.builder_name || 'Builder/Owner'}</span>
            </p>
          </div>
          <div className="col-md-4 text-md-end">
            <h2 style={{ color: '#C8A24A' }}>{property.purpose?.toLowerCase() === 'rent' ? `${formatCurrency(property.rent || property.rent_amount)}/mo` : formatCurrency(property.price)}</h2>
            <span className={`badge ${getAvailabilityClass(property.availability_status || property.availability)} fs-6`}>
              {getAvailabilityText(property.availability_status || property.availability)}
            </span>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="gallery-section mb-5 animate__animated animate__fadeInUp animate__delay-1s">
          <div className="gallery-container position-relative">
            {property.images && property.images.length > 0 ? (
              <>
                <img
                  src={property.images[currentImageIndex]}
                  className="property-gallery w-100"
                  alt={property.name}
                  style={{ borderRadius: '12px', height: '400px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/800x400?text=Image+Load+Error';
                  }}
                />
                {property.images.length > 1 && (
                  <>
                    <button
                      className="btn btn-primary position-absolute"
                      style={{
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(90deg, var(--construction-gold), var(--deep-bronze))',
                        border: 'none',
                        color: 'var(--primary-text)'
                      }}
                      onClick={prevImage}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      ‹
                    </button>
                    <button
                      className="btn btn-primary position-absolute"
                      style={{
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(90deg, var(--construction-gold), var(--deep-bronze))',
                        border: 'none',
                        color: 'var(--primary-text)'
                      }}
                      onClick={nextImage}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      ›
                    </button>
                  </>
                )}
                <div className="text-center mt-2">
                  <span className="badge bg-primary" style={{ backgroundColor: 'var(--construction-gold)', color: 'var(--primary-text)' }}>
                    {currentImageIndex + 1} of {property.images.length}
                  </span>
                </div>
              </>
            ) : (
              <div className="property-gallery bg-light d-flex align-items-center justify-content-center rounded" style={{ height: '400px' }}>
                <span className="text-muted">No Images Available</span>
              </div>
            )}
          </div>

          {/* Payment Button Section - Only show if available */}
          {!['booked', 'sold', 'rented'].includes((property.availability_status || property.availability || '').toLowerCase()) && (
            <div className="mt-4 mb-3 p-4" style={{
              background: 'linear-gradient(135deg, rgba(200,162,74,0.1) 0%, rgba(200,162,74,0.05) 100%)',
              borderRadius: '16px',
              border: '2px solid rgba(200,162,74,0.3)'
            }}>
              <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                <div>
                  <h5 className="mb-1" style={{ color: '#1E293B', fontWeight: '700' }}>
                    {property.purpose === 'Rent' ? 'Ready to Rent?' : 'Ready to Own?'}
                  </h5>
                  <p className="mb-0" style={{ color: '#64748B', fontSize: '0.9rem' }}>
                    {property.purpose === 'Rent'
                      ? 'Pay the first month rent to start your rental'
                      : 'Complete your purchase securely online'}
                  </p>
                </div>
                <PaymentButton
                  property={property}
                  paymentType={property.purpose === 'Rent' ? 'RENT' : 'BUY'}
                  onSuccess={(data) => {
                    const now = new Date();
                    const dateTime = now.toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    });
                    alert(`Payment Successful!\n\nTransaction Date & Time: ${dateTime}\nTransaction ID: ${data.razorpayPaymentId || 'N/A'}\n\nYour ${property.purpose === 'Rent' ? 'rental' : 'purchase'} has been confirmed.`);
                    // Instant update of availability status
                    setProperty(prev => ({
                      ...prev,
                      availability_status: property.purpose === 'Rent' ? 'rented' : 'booked'
                    }));
                    // Also invalidate cache
                    import('../../api/apiService').then(module => {
                      // Note: We can't easily import cacheInvalidate here if it's not exported, 
                      // but since we updated local state, the UI reflects it.
                      // Ideally we should assume the backend update is done.
                    });
                  }}
                  onFailure={(error) => {
                    console.error('Payment failed:', error);
                  }}
                />
              </div>
            </div>
          )}

          <div className="d-flex justify-content-between mt-3">
            <button
              className="btn btn-outline-primary"
              onClick={() => addToCompare(property)}
              style={{
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                border: '1px solid var(--construction-gold)',
                color: 'var(--construction-gold)',
                background: 'transparent'
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
              <i className="bi bi-arrow-left-right me-1"></i> Add to Compare
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={() => addToWishlist(property)}
              style={{
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                border: '1px solid #EF4444',
                color: '#EF4444',
                background: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#FEF2F2';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <i className="bi bi-heart me-1"></i> Add to Wishlist
            </button>
            {property.brochure_url && (
              <a
                href={property.brochure_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-secondary"
                style={{
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: '1px solid #94A3B8',
                  color: '#64748B',
                  background: 'transparent',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#F1F5F9';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(148, 163, 184, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <i className="bi bi-file-pdf me-1"></i> Brochure
              </a>
            )}
          </div>
        </div>

        <div className="row">
          {/* Details Section */}
          <div className="col-lg-8">
            <div className="details-section mb-5 animate__animated animate__fadeInUp animate__delay-2s">
              <h3>Property Details</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <p><strong>Property Type:</strong> {property.type}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Area:</strong> {property.area} sq.ft</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Possession:</strong> {property.possession}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Construction Status:</strong> {property.construction_status || property.constructionStatus}</p>
                </div>
                {property.bedrooms && (
                  <div className="col-md-6">
                    <p><strong>Bedrooms:</strong> {property.bedrooms} BHK</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="col-md-6">
                    <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
                  </div>
                )}
                <div className="col-md-6">
                  <p><strong>Purpose:</strong> {property.purpose}</p>
                </div>
                <div className="col-12 mt-3">
                  <h4>Description</h4>
                  <p style={{ lineHeight: '1.6', color: 'var(--secondary-text)' }}>{property.description || 'No description available.'}</p>
                </div>
              </div>

              <h4 className="mt-4">Amenities</h4>
              <div className="row g-2">
                {property.amenities && property.amenities.map((amenity, index) => (
                  <div className="col-auto" key={index}>
                    <span className="badge" style={{ backgroundColor: '#C8A24A', color: '#0B1220' }}>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Section - Using OpenStreetMap */}
            <div className="map-section mb-5 animate__animated animate__fadeInUp animate__delay-3s">
              <h3>
                <i className="bi bi-geo-alt-fill me-2" style={{ color: 'var(--construction-gold)' }}></i>
                Property Location
              </h3>
              {property.latitude && property.longitude ? (
                <PropertyMap
                  properties={[property]}
                  center={{ lat: property.latitude, lng: property.longitude }}
                  zoom={15}
                  height="350px"
                  showSingleProperty={true}
                />
              ) : (
                <div className="text-center p-5" style={{
                  background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                  borderRadius: '16px',
                  border: '2px solid var(--card-border)'
                }}>
                  <i className="bi bi-geo-alt" style={{ fontSize: '3rem', color: 'var(--secondary-text)' }}></i>
                  <p className="mt-3" style={{ color: 'var(--secondary-text)' }}>
                    📍 Location not available for this property.
                  </p>
                  {property.google_map_link && (
                    <a
                      href={property.google_map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn mt-2"
                      style={{
                        background: 'var(--construction-gold)',
                        color: '#0F172A',
                        border: 'none'
                      }}
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i>
                      Open Map Link
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Nearby Places Section */}
            <div className="nearby-section mb-5 animate__animated animate__fadeInUp animate__delay-3s">
              <NearbyPlaces property={property} height="350px" />
            </div>

            {/* 360° Virtual Tour Section - Using Pannellum */}
            <div className="view-section mb-5 animate__animated animate__fadeInUp animate__delay-4s">
              <h3>
                <i className="bi bi-badge-vr me-2" style={{ color: 'var(--construction-gold)' }}></i>
                360° Virtual Tour
              </h3>
              <PanoramaViewer
                imageUrl={
                  property.panorama_image_path
                    ? (property.panorama_image_path.startsWith('http')
                      ? property.panorama_image_path
                      : `http://localhost:8081${property.panorama_image_path.startsWith('/') ? '' : '/'}${property.panorama_image_path}`)
                    : (property.virtual_tour_link || null)
                }
                imageUrls={
                  property.panorama_images && property.panorama_images.length > 0
                    ? property.panorama_images.map(img =>
                      img.startsWith('http')
                        ? img
                        : `http://localhost:8081${img.startsWith('/') ? '' : '/'}${img}`
                    )
                    : (property.panorama_image_path
                      ? [(property.panorama_image_path.startsWith('http')
                        ? property.panorama_image_path
                        : `http://localhost:8081${property.panorama_image_path.startsWith('/') ? '' : '/'}${property.panorama_image_path}`)]
                      : [])
                }
                title={`360° View - ${property.name}`}
                height="450px"
              />
            </div>
          </div>

          {/* Action Panel */}
          <div className="col-lg-4">
            <div className="action-panel sticky-top animate__animated animate__fadeInUp animate__delay-2s">
              <div className="card" style={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                border: '1px solid #E2E8F0'
              }}>
                <div className="card-body">
                  <h4 className="card-title">Interested in this property?</h4>
                  <p className="card-text">Get in touch with our experts for more information.</p>

                  {isBuyProperty ? (
                    <>
                      <button
                        className="btn btn-primary w-100 mb-2"
                        onClick={() => toggleForm('enquiry')}
                        style={{
                          borderRadius: '8px',
                          fontWeight: '600',
                          padding: '12px',
                          transition: 'all 0.3s ease',
                          background: 'linear-gradient(90deg, #C8A24A, #9E7C2F)',
                          border: 'none',
                          color: '#0B1220'
                        }}
                      >
                        {showEnquiryForm ? 'Cancel Enquiry' : 'Send Buy Enquiry'}
                      </button>
                      <AnimatePresence>
                        {showEnquiryForm && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <form onSubmit={handleEnquirySubmit} className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--section-divider)' }}>
                              {message.text && (
                                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} py-2`}>
                                  {message.text}
                                </div>
                              )}
                              <input className="form-control mb-2" placeholder="Full Name" name="fullName" value={enquiryForm.fullName} onChange={handleEnquiryChange} required style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }} />
                              <input className="form-control mb-2" placeholder="Email" name="email" value={enquiryForm.email} onChange={handleEnquiryChange} required style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }} />
                              <input className="form-control mb-2" placeholder="Phone" name="phone" value={enquiryForm.phone} onChange={handleEnquiryChange} required style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }} />
                              <textarea className="form-control mb-2" placeholder="Message" name="message" value={enquiryForm.message} onChange={handleEnquiryChange} required rows="3" style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }}></textarea>
                              <button type="submit" className="btn btn-primary w-100" style={{ background: 'linear-gradient(90deg, #C8A24A, #9E7C2F)', border: 'none', color: '#0B1220' }} disabled={submitting}>Send Message</button>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-primary w-100 mb-2"
                        onClick={() => toggleForm('rent')}
                        style={{
                          borderRadius: '8px',
                          fontWeight: '600',
                          padding: '12px',
                          transition: 'all 0.3s ease',
                          background: 'linear-gradient(90deg, #C8A24A, #9E7C2F)',
                          border: 'none',
                          color: '#0B1220'
                        }}
                      >
                        {showRentForm ? 'Cancel Request' : 'Request for Rent'}
                      </button>
                      <AnimatePresence>
                        {showRentForm && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <form onSubmit={handleRentSubmit} className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--section-divider)' }}>
                              {message.text && (
                                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} py-2`}>
                                  {message.text}
                                </div>
                              )}
                              <input className="form-control mb-2" placeholder="Full Name" name="fullName" value={rentForm.fullName} onChange={handleRentChange} required style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }} />
                              <input className="form-control mb-2" placeholder="Email" name="email" value={rentForm.email} onChange={handleRentChange} required style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }} />
                              <input className="form-control mb-2" placeholder="Phone" name="phone" value={rentForm.phone} onChange={handleRentChange} required style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }} />
                              <div className="mb-2">
                                <small className="d-block mb-1" style={{ color: '#D4A437' }}>Move-in Date</small>
                                <input type="date" className="form-control" name="moveInDate" value={rentForm.moveInDate} onChange={handleRentChange} required style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }} />
                              </div>
                              <textarea className="form-control mb-2" placeholder="Message" name="message" value={rentForm.message} onChange={handleRentChange} required rows="3" style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }}></textarea>
                              <button type="submit" className="btn btn-primary w-100" style={{ background: 'linear-gradient(90deg, #C8A24A, #9E7C2F)', border: 'none', color: '#0B1220' }} disabled={submitting}>Submit Request</button>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}

                  <button
                    className="btn btn-outline-primary w-100 mb-2"
                    onClick={() => toggleForm('visit')}
                    style={{
                      borderRadius: '8px',
                      fontWeight: '600',
                      padding: '12px',
                      transition: 'all 0.3s ease',
                      border: '2px solid #C8A24A',
                      color: 'var(--primary-text)',
                      background: 'transparent'
                    }}
                  >
                    {showVisitForm ? 'Cancel Visit' : 'Schedule a Visit'}
                  </button>
                  <AnimatePresence>
                    {showVisitForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <form onSubmit={handleVisitSubmit} className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--section-divider)' }}>
                          {message.text && (
                            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} py-2`}>
                              {message.text}
                            </div>
                          )}
                          <input className="form-control mb-2" placeholder="Full Name" name="fullName" value={visitForm.fullName} onChange={handleVisitChange} required style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }} />
                          <input className="form-control mb-2" placeholder="Email" name="email" value={visitForm.email} onChange={handleVisitChange} required style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }} />
                          <input className="form-control mb-2" placeholder="Phone" name="phone" value={visitForm.phone} onChange={handleVisitChange} required style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }} />
                          <div className="mb-2">
                            <small className="d-block mb-1" style={{ color: '#D4A437' }}>Visit Date</small>
                            <input type="date" className="form-control" name="visitDate" value={visitForm.visitDate} onChange={handleVisitChange} required style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }} />
                          </div>
                          <textarea className="form-control mb-2" placeholder="Message" name="message" value={visitForm.message} onChange={handleVisitChange} rows="3" style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }}></textarea>
                          <button type="submit" className="btn btn-primary w-100" style={{ background: 'linear-gradient(90deg, #C8A24A, #9E7C2F)', border: 'none', color: '#0B1220' }} disabled={submitting}>Confirm Visit</button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Financial Tools Button - Context-aware for BUY/RENT */}
                  <button
                    className="btn w-100 mt-2"
                    onClick={() => toggleForm('emi')}
                    style={{
                      borderRadius: '8px',
                      fontWeight: '600',
                      padding: '12px',
                      transition: 'all 0.3s ease',
                      background: isBuyProperty
                        ? 'linear-gradient(135deg, #3B82F6, #2563EB)'
                        : 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                      border: 'none',
                      color: '#FFFFFF'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = isBuyProperty
                        ? '0 4px 12px rgba(59, 130, 246, 0.4)'
                        : '0 4px 12px rgba(139, 92, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <i className="bi bi-calculator me-2"></i>
                    {showEMICalculator
                      ? 'Hide Calculator'
                      : (isBuyProperty ? 'Buying Tools' : 'Rental Tools')}
                  </button>
                  <AnimatePresence>
                    {showEMICalculator && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="mt-3">
                          <FinancialCalculators
                            propertyPrice={property.price}
                            monthlyRent={property.rent || property.rent_amount || (property.price ? property.price / 300 : 25000)}
                            purpose={property.purpose?.toLowerCase() || 'buy'}
                            propertyType={property.property_type}
                            inline={true}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Complaint Button */}
                  <button
                    className="btn w-100 mt-2 btn-outline-danger"
                    onClick={() => toggleForm('complaint')}
                    style={{
                      borderRadius: '8px',
                      fontWeight: '600',
                      padding: '12px',
                      transition: 'all 0.3s ease',
                      border: '1px solid #EF4444',
                      color: '#EF4444',
                      background: 'transparent'
                    }}
                  >
                    <i className="bi bi-exclamation-triangle me-2"></i>{showComplaintForm ? 'Cancel Report' : 'Report Issue'}
                  </button>
                  <AnimatePresence>
                    {showComplaintForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <form onSubmit={handleComplaintSubmit} className="p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--section-divider)', marginTop: '10px' }}>
                          {message.text && (
                            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} py-2`}>
                              {message.text}
                            </div>
                          )}
                          <textarea className="form-control mb-2" placeholder="Describe the issue..." name="issue" value={complaintForm.issue} onChange={handleComplaintChange} required rows="3" style={{ background: '#1E293B', border: '1px solid #334155', color: '#F8FAFC' }}></textarea>
                          <button type="submit" className="btn btn-danger w-100" disabled={submitting}>Submit Complaint</button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Share Section */}
                  <div className="mt-4 pt-3" style={{ borderTop: '1px solid #E2E8F0' }}>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '12px' }}>
                      <i className="bi bi-share me-2"></i>Share this property
                    </p>
                    <div className="d-flex gap-2">
                      <button
                        className="btn flex-grow-1"
                        onClick={() => handleShare('whatsapp')}
                        style={{
                          background: '#25D366',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '10px',
                          border: 'none'
                        }}
                      >
                        <i className="bi bi-whatsapp"></i>
                      </button>
                      <button
                        className="btn flex-grow-1"
                        onClick={() => handleShare('facebook')}
                        style={{
                          background: '#1877F2',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '10px',
                          border: 'none'
                        }}
                      >
                        <i className="bi bi-facebook"></i>
                      </button>
                      <button
                        className="btn flex-grow-1"
                        onClick={() => handleShare('twitter')}
                        style={{
                          background: '#1DA1F2',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '10px',
                          border: 'none'
                        }}
                      >
                        <i className="bi bi-twitter"></i>
                      </button>
                      <button
                        className="btn flex-grow-1"
                        onClick={() => handleShare('copy')}
                        style={{
                          background: copied ? '#10B981' : '#64748B',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '10px',
                          border: 'none',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <i className={`bi ${copied ? 'bi-check' : 'bi-link-45deg'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >

      {/* Report Listing Modal - can be triggered from elsewhere if needed */}
      <ReportListing
        isOpen={showReportModal}
        propertyId={property?.id}
        propertyName={property?.name}
        onSubmit={handleReportSubmit}
        onClose={() => setShowReportModal(false)}
      />


    </div >
  );
};

export default PropertyDetail;
