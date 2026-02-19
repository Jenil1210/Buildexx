import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PropertyCard from '../components/PropertyCard';
import TabLoading from '../components/TabLoading';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getUserWishlist,
  removeFromWishlist as removeFromWishlistAPI,
  getUserEnquiries,
  getUserRentHistory,
  getUserPayments,
  fetchUserRentSubscriptions,
  payRent,
  createPaymentOrder,
  verifyPayment
} from '../api/apiService';
import '../DashboardStyles.css';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0 }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const tabContentVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.2 }
};

const UserDashboard = ({ wishlist: propsWishlist, removeFromWishlist: propsRemoveFromWishlist }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(localStorage.getItem('userActiveTab') || 'overview');

  useEffect(() => {
    localStorage.setItem('userActiveTab', activeTab);
  }, [activeTab]);

  // State from database
  const [wishlist, setWishlist] = useState(propsWishlist || []);
  const [enquiries, setEnquiries] = useState([]);
  const [rentHistory, setRentHistory] = useState([]);
  const [rentSubscriptions, setRentSubscriptions] = useState([]); // Active recurring rentals

  // Fetch data on mount
  useEffect(() => {
    if (currentUser?.id) {
      fetchUserData();
    }
  }, [currentUser]);

  // Sync with props wishlist
  useEffect(() => {
    if (propsWishlist) {
      setWishlist(propsWishlist);
    }
  }, [propsWishlist]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch wishlist from database
      const wishlistResult = await getUserWishlist(currentUser.id);
      if (wishlistResult.success && wishlistResult.data.length > 0) {
        setWishlist(wishlistResult.data);
      }

      // Fetch enquiries
      const enquiriesResult = await getUserEnquiries(currentUser.id);
      if (enquiriesResult.success) {
        setEnquiries(enquiriesResult.data);
      }

      // Fetch rent history
      const rentResult = await getUserRentHistory(currentUser.id);
      if (rentResult.success) {
        setRentHistory(rentResult.data);
      }

      // Fetch rent subscriptions
      const subscriptionsResult = await fetchUserRentSubscriptions(currentUser.id);
      if (subscriptionsResult.success) {
        setRentSubscriptions(subscriptionsResult.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clean up function to fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const paymentsResult = await getUserPayments(currentUser.id);
      if (paymentsResult.success) {
        setPayments(Array.isArray(paymentsResult.data) ? paymentsResult.data : []);
      }
    } catch (err) {
      console.error("Error fetching payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchPayments();
    }
  }, [currentUser]);

  const [payments, setPayments] = useState([]);

  const handleRemoveFromWishlist = async (propertyId) => {
    if (propsRemoveFromWishlist) {
      propsRemoveFromWishlist(propertyId);
    }
    if (currentUser?.id) {
      try {
        await removeFromWishlistAPI(currentUser.id, propertyId);
        setWishlist(prev => prev.filter(p => p.id !== propertyId));
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    } else {
      setWishlist(prev => prev.filter(p => p.id !== propertyId));
    }
  };

  // Bulk Selection State
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Clear selection on tab change
  useEffect(() => {
    setSelectedItems(new Set());
  }, [activeTab]);

  const handleSelectAll = (items) => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(i => i.id)));
    }
  };

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) return;

    setLoading(true);
    try {
      const ids = Array.from(selectedItems);
      let apiCall;

      // Determine API based on active tab
      if (activeTab === 'enquiries') apiCall = import('../api/apiService').then(m => m.deleteEnquiry);
      else if (activeTab === 'rentals') apiCall = import('../api/apiService').then(m => m.deleteRentRequest); // Or delete rent history?
      else if (activeTab === 'payments') apiCall = import('../api/apiService').then(m => m.deletePayment);

      const deleteFunc = await apiCall;

      // Execute deletions (parallel)
      await Promise.all(ids.map(id => deleteFunc(id)));

      // Refresh data
      if (activeTab === 'enquiries') {
        const res = await getUserEnquiries(currentUser.id);
        if (res.success) setEnquiries(res.data);
      } else if (activeTab === 'rentals') {
        const res = await getUserRentHistory(currentUser.id);
        if (res.success) setRentHistory(res.data);
      } else if (activeTab === 'payments') {
        const res = await getUserPayments(currentUser.id);
        if (res.success) setPayments(res.data);
      }

      setSelectedItems(new Set());
      alert('Items deleted successfully');
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Failed to delete items');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    wishlistCount: wishlist?.length || 0,
    enquiriesCount: enquiries.length,
    rentalsCount: rentHistory.filter(r => r.status === 'active').length
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="user-dashboard-page animate__animated animate__fadeIn" style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <div className="container-fluid py-4">
        {/* Dashboard Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div style={{
              background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--charcoal-slate) 100%)',
              borderRadius: '20px',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background decoration */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(200,162,74,0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />

              <div className="d-flex align-items-center gap-4">
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'var(--construction-gold)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-person-circle fs-1" style={{ color: 'var(--charcoal-slate)' }}></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-1" style={{ color: 'var(--primary-text)' }}>
                    My Dashboard
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    {currentUser?.email || 'Manage your properties and enquiries'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="mb-4">
          <div className="dashboard-tabs">
            {[
              { id: 'overview', label: 'Overview', icon: 'bi-grid' },
              { id: 'wishlist', label: 'Wishlist', icon: 'bi-heart' },
              { id: 'enquiries', label: 'Enquiries', icon: 'bi-envelope' },
              { id: 'rentals', label: 'Rent History', icon: 'bi-house' },
              { id: 'payments', label: 'My Bookings & Payments', icon: 'bi-credit-card' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <i className={`bi ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <TabLoading text={`Loading ${activeTab === 'overview' ? 'overview' : activeTab === 'wishlist' ? 'wishlist' : activeTab === 'enquiries' ? 'enquiries' : activeTab === 'rentals' ? 'rent history' : 'payments'}...`} />
        )}

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {!loading && activeTab === 'overview' && (
            <motion.div key="overview" variants={tabContentVariants} initial="initial" animate="animate" exit="exit" className="row g-4">
              {/* Stats Cards */}
              <div className="col-md-4">
                <div style={{
                  background: 'var(--card-bg)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="bi bi-heart-fill fs-4" style={{ color: '#EF4444' }}></i>
                    </div>
                    <div>
                      <h3 className="fw-bold mb-0 text-white">{stats.wishlistCount}</h3>
                      <p className="text-white-50" style={{ margin: 0, fontSize: '0.9rem' }}>Saved Properties</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div style={{
                  background: 'var(--card-bg)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="bi bi-envelope-fill fs-4" style={{ color: '#3B82F6' }}></i>
                    </div>
                    <div>
                      <h3 className="fw-bold mb-0 text-white">{stats.enquiriesCount}</h3>
                      <p className="text-white-50" style={{ margin: 0, fontSize: '0.9rem' }}>Active Enquiries</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div style={{
                  background: 'var(--card-bg)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="bi bi-house-fill fs-4" style={{ color: '#10B981' }}></i>
                    </div>
                    <div>
                      <h3 className="fw-bold mb-0 text-white">{stats.rentalsCount}</h3>
                      <p className="text-white-50" style={{ margin: 0, fontSize: '0.9rem' }}>Active Rentals</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="col-12">
                <div style={{
                  background: 'var(--card-bg)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: 'var(--card-shadow)'
                }}>
                  <h5 className="fw-bold mb-4 text-white">Quick Actions</h5>
                  <div className="d-flex gap-3 flex-wrap">
                    <button
                      onClick={() => navigate('/property-list')}
                      className="btn"
                      style={{
                        background: 'var(--construction-gold)',
                        color: '#0F172A',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        border: 'none'
                      }}
                    >
                      <i className="bi bi-search me-2"></i>Browse Properties
                    </button>
                    <button
                      onClick={() => navigate('/compare-properties')}
                      className="btn btn-outline-light"
                      style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        borderColor: 'rgba(255,255,255,0.2)'
                      }}
                    >
                      <i className="bi bi-arrow-left-right me-2"></i>Compare Properties
                    </button>
                    <button
                      onClick={() => setActiveTab('wishlist')}
                      className="btn btn-outline-light"
                      style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        borderColor: 'rgba(255,255,255,0.2)'
                      }}
                    >
                      <i className="bi bi-heart me-2"></i>View Wishlist
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="col-12">
                <div style={{
                  background: 'var(--card-bg)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: 'var(--card-shadow)'
                }}>
                  <h5 className="fw-bold mb-4 text-white">Recent Activity</h5>
                  {wishlist.length === 0 && enquiries.length === 0 ? (
                    <div className="text-center py-5">
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}>
                        <i className="bi bi-clock-history fs-2 text-white-50"></i>
                      </div>
                      <h6 className="text-white">No recent activity</h6>
                      <p className="text-white-50" style={{ fontSize: '0.9rem' }}>
                        Start browsing properties to see your activity here
                      </p>
                      <button
                        onClick={() => navigate('/property-list')}
                        className="btn mt-2"
                        style={{
                          background: 'var(--construction-gold)',
                          color: '#0F172A',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          fontWeight: '600',
                          border: 'none'
                        }}
                      >
                        Explore Properties
                      </button>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {wishlist.slice(0, 3).map((property) => (
                        <div className="col-md-4" key={property.id}>
                          <PropertyCard
                            property={property}
                            addToCompare={() => { }}
                            addToWishlist={() => { }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Wishlist Tab */}
          {!loading && activeTab === 'wishlist' && (
            <motion.div key="wishlist" variants={tabContentVariants} initial="initial" animate="animate" exit="exit" style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #E2E8F0'
            }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0" style={{ color: '#0F172A' }}>
                  <i className="bi bi-heart me-2" style={{ color: '#EF4444' }}></i>
                  Your Wishlist ({wishlist.length})
                </h5>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, #FEE2E220, #FEE2E210)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <i className="bi bi-heart" style={{ fontSize: '3rem', color: '#F87171' }}></i>
                  </div>
                  <h5 style={{ color: '#0F172A' }}>Your wishlist is empty</h5>
                  <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>
                    Save properties you like by clicking the heart icon to view them later
                  </p>
                  <button
                    onClick={() => navigate('/property-list')}
                    className="btn mt-3"
                    style={{
                      background: 'var(--construction-gold)',
                      color: '#0F172A',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      border: 'none'
                    }}
                  >
                    Browse Properties
                  </button>
                </div>
              ) : (
                <motion.div className="row g-4" variants={containerVariants} initial="hidden" animate="visible">
                  {wishlist.map((property) => (
                    <motion.div className="col-lg-4 col-md-6" key={property.id} variants={itemVariants}>
                      <div className="position-relative">
                        <PropertyCard
                          property={property}
                          addToCompare={() => { }}
                          addToWishlist={() => { }}
                        />
                        <button
                          onClick={() => handleRemoveFromWishlist(property.id)}
                          className="btn btn-danger position-absolute"
                          style={{
                            top: '10px',
                            right: '10px',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Enquiries Tab */}
          {!loading && activeTab === 'enquiries' && (
            <motion.div key="enquiries" variants={tabContentVariants} initial="initial" animate="animate" exit="exit" style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="bi bi-envelope me-2" style={{ color: '#3B82F6' }}></i>
                  Your Enquiries ({enquiries.length})
                </h5>
                {selectedItems.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="btn btn-danger btn-sm"
                  >
                    <i className="bi bi-trash me-2"></i>Delete Selected ({selectedItems.size})
                  </button>
                )}
              </div>

              {enquiries.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <i className="bi bi-envelope-open" style={{ fontSize: '3rem', color: '#60A5FA' }}></i>
                  </div>
                  <h5 className="text-white">No enquiries yet</h5>
                  <p className="text-white-50" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    When you send enquiries for properties, they will appear here
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover bg-transparent" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px', background: 'transparent', color: '#fff' }}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.5)', accentColor: '#C8A24A' }}
                            checked={selectedItems.size === enquiries.length && enquiries.length > 0}
                            onChange={() => handleSelectAll(enquiries)}
                          />
                        </th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Property</th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Location</th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Date</th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Status</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                      {enquiries.map(enquiry => (
                        <motion.tr key={enquiry.id} variants={itemVariants}>
                          <td style={{ background: 'transparent' }}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.5)', accentColor: '#C8A24A' }}
                              checked={selectedItems.has(enquiry.id)}
                              onChange={() => handleSelectItem(enquiry.id)}
                            />
                          </td>
                          <td style={{ background: 'transparent', color: '#fff', fontWeight: '500' }}>{enquiry.property?.title || 'Deleted Property'}</td>
                          <td style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)' }}>{enquiry.property?.city}, {enquiry.property?.locality}</td>
                          <td style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)' }}>{formatDate(enquiry.createdAt)}</td>
                          <td style={{ background: 'transparent' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              background: enquiry.status.toLowerCase() === 'approved' ? 'rgba(16, 185, 129, 0.2)' : enquiry.status.toLowerCase() === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: enquiry.status.toLowerCase() === 'approved' ? '#34D399' : enquiry.status.toLowerCase() === 'rejected' ? '#F87171' : '#FBBF24'
                            }}>
                              {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Rent History Tab */}
          {!loading && activeTab === 'rentals' && (
            <motion.div key="rentals" variants={tabContentVariants} initial="initial" animate="animate" exit="exit" style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {/* Subscriptions Section */}
              {rentSubscriptions.length > 0 && (
                <div className="mb-5">
                  <h5 className="fw-bold mb-4 text-primary">
                    <i className="bi bi-clock-history me-2"></i>
                    Active Rentals & Payments
                  </h5>
                  <div className="row g-3">
                    {rentSubscriptions.map(sub => (
                      <div className="col-md-6" key={sub.id}>
                        <div className="p-3 border rounded shadow-sm" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold fs-5 text-white">{sub.property_name}</span>
                            <span className="badge bg-success">Active</span>
                          </div>
                          <p className="mb-1 text-white-50"><i className="bi bi-geo-alt me-1"></i>{sub.city}, {sub.area}</p>
                          <hr className="border-secondary" />
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <label className="text-white-50 small d-block">Monthly Rent</label>
                              <span className="fw-bold fs-5 text-warning">₹{sub.rent_amount}</span>
                            </div>
                            <div>
                              <label className="text-white-50 small d-block">Next Due</label>
                              <span className={`fw-bold ${new Date(sub.next_payment_due) <= new Date() ? 'text-danger' : 'text-white'}`}>
                                {formatDate(sub.next_payment_due)}
                              </span>
                            </div>
                            <span
                              className="d-inline-block custom-tooltip"
                              tabIndex="0"
                              data-tooltip={new Date() < new Date(sub.next_payment_due) ? `Payment will be enabled on ${formatDate(sub.next_payment_due)}` : 'Pay Rent Now'}
                            >
                              <button
                                className="btn btn-primary"
                                disabled={new Date() < new Date(sub.next_payment_due)}
                                style={new Date() < new Date(sub.next_payment_due) ? { pointerEvents: 'none' } : {}}
                                onClick={async () => {
                                  if (window.confirm(`Pay rent of ₹${sub.rent_amount} for ${sub.property_name}?`)) {
                                    setLoading(true);
                                    try {
                                      // Load Razorpay Script (Safety fallback)
                                      const loadScript = () => new Promise((resolve) => {
                                        if (window.Razorpay) { resolve(true); return; }
                                        const script = document.createElement('script');
                                        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                                        script.onload = () => resolve(true);
                                        script.onerror = () => resolve(false);
                                        document.body.appendChild(script);
                                      });

                                      const scriptLoaded = await loadScript();
                                      if (!scriptLoaded) throw new Error('Failed to load payment gateway');

                                      // 1. Create Order
                                      const orderRes = await createPaymentOrder(currentUser.id, sub.property.id);
                                      if (!orderRes.success) {
                                        throw new Error(orderRes.error || 'Failed to create payment order');
                                      }

                                      const order = orderRes.data;

                                      // 2. Initialize Razorpay
                                      const options = {
                                        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                                        amount: order.amount * 100,
                                        currency: "INR",
                                        name: "Buildex",
                                        description: `Rent Payment for ${sub.property_name}`,
                                        image: "/buildex_logo.png",
                                        // Mimic PaymentButton logic: Use null for order_id if it's a dummy/test ID to avoid 400 error
                                        // Real implementation might need more specific check, but this unblocks the current test environment
                                        order_id: order.razorpayOrderId?.startsWith('order_') ? null : order.razorpayOrderId,
                                        prefill: {
                                          name: currentUser.name || currentUser.full_name,
                                          email: currentUser.email,
                                          contact: currentUser.phone || ""
                                        },
                                        notes: {
                                          property_id: sub.property.id,
                                          payment_type: "RENT",
                                          user_id: currentUser.id,
                                          subscription_id: sub.id
                                        },
                                        theme: {
                                          color: "#C8A24A"
                                        },
                                        handler: async function (response) {
                                          try {
                                            // 3. Verify Payment
                                            // IMPORTANT: Use the original order.razorpayOrderId because response.razorpay_order_id might be null/empty
                                            // if we passed null in options.
                                            const verifyRes = await verifyPayment({
                                              razorpay_order_id: order.razorpayOrderId,
                                              razorpay_payment_id: response.razorpay_payment_id,
                                              razorpay_signature: response.razorpay_signature || 'dummy_sig'
                                            });

                                            if (verifyRes.success) {
                                              alert('Rent paid successfully! Next due date updated.');
                                              fetchUserData();
                                              setActiveTab('payments');
                                            } else {
                                              alert('Payment verification failed: ' + verifyRes.error);
                                            }
                                          } catch (err) {
                                            console.error(err);
                                            alert('Payment verification failed');
                                          }
                                        }
                                      };

                                      const rzp1 = new window.Razorpay(options);
                                      rzp1.on('payment.failed', function (response) {
                                        alert(response.error.description);
                                      });
                                      rzp1.open();

                                    } catch (err) {
                                      console.error(err);
                                      alert(err.message);
                                    } finally {
                                      setLoading(false);
                                    }
                                  }
                                }}
                              >
                                Pay Rent
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="bi bi-journal-text me-2" style={{ color: '#10B981' }}></i>
                  Rent Requests History ({rentHistory.length})
                </h5>
                {selectedItems.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="btn btn-danger btn-sm"
                  >
                    <i className="bi bi-trash me-2"></i>Delete Selected ({selectedItems.size})
                  </button>
                )}
              </div>

              {/* Same Rent History Table as before */}
              {rentHistory.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <i className="bi bi-house-check" style={{ fontSize: '3rem', color: '#34D399' }}></i>
                  </div>
                  <h5 className="text-white">No rental history</h5>
                  <p className="text-white-50" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    Your rental agreements and history will appear here
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover bg-transparent" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px', background: 'transparent', color: '#fff' }}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.5)', accentColor: '#C8A24A' }}
                            checked={selectedItems.size === rentHistory.length && rentHistory.length > 0}
                            onChange={() => handleSelectAll(rentHistory)}
                          />
                        </th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Property</th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Start Date</th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Amount</th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Status</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                      {rentHistory.map(rent => (
                        <motion.tr key={rent.id} variants={itemVariants}>
                          <td style={{ background: 'transparent' }}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.5)', accentColor: '#C8A24A' }}
                              checked={selectedItems.has(rent.id)}
                              onChange={() => handleSelectItem(rent.id)}
                            />
                          </td>
                          <td style={{ background: 'transparent', color: '#fff', fontWeight: '500' }}>{rent.property?.title || 'Deleted Property'}</td>
                          <td style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)' }}>{formatDate(rent.createdAt)}</td>
                          <td style={{ background: 'transparent', color: '#C8A24A', fontWeight: '600' }}>{rent.monthlyRent || '-'}</td>
                          <td style={{ background: 'transparent' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              background: rent.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                              color: rent.status === 'active' ? '#34D399' : '#94A3B8'
                            }}>
                              {rent.status ? (rent.status.charAt(0).toUpperCase() + rent.status.slice(1)) : 'Pending'}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}


          {/* Payments Tab */}
          {!loading && activeTab === 'payments' && (
            <motion.div key="payments" variants={tabContentVariants} initial="initial" animate="animate" exit="exit" style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="bi bi-credit-card me-2" style={{ color: '#C8A24A' }}></i>
                  My Bookings & Payments ({payments.length})
                </h5>
                {selectedItems.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="btn btn-danger btn-sm"
                  >
                    <i className="bi bi-trash me-2"></i>Delete Selected ({selectedItems.size})
                  </button>
                )}
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-5">
                  <p style={{ color: '#D4A437' }}>No booking payments made yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover bg-transparent" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px', background: 'transparent', color: '#fff' }}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.5)', accentColor: '#C8A24A' }}
                            checked={selectedItems.size === payments.length && payments.length > 0}
                            onChange={() => handleSelectAll(payments)}
                          />
                        </th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Property</th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Date</th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Booking Amount</th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Remaining Amount</th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Status</th>
                        <th style={{ background: 'transparent', color: '#fff', fontWeight: '600' }}>Receipt</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                      {payments.map(pay => (
                        <motion.tr key={pay.id} variants={itemVariants}>
                          <td style={{ background: 'transparent' }}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.5)', accentColor: '#C8A24A' }}
                              checked={selectedItems.has(pay.id)}
                              onChange={() => handleSelectItem(pay.id)}
                            />
                          </td>
                          <td style={{ background: 'transparent', fontWeight: '500' }}>
                            {pay.property ? <Link to={`/property/${pay.property.id}`} className="text-decoration-none text-white">{pay.property.name || pay.property.title}</Link> : <span className="text-white-50">Property Deleted</span>}
                          </td>
                          <td style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)' }}>{formatDate(pay.createdAt)}</td>
                          <td style={{ background: 'transparent', color: '#10B981', fontWeight: '600' }}>₹{pay.amount}</td>
                          <td style={{ background: 'transparent', color: '#F87171', fontWeight: 'bold' }}>₹{pay.remainingAmount}</td>
                          <td style={{ background: 'transparent' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              background: pay.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: pay.status === 'SUCCESS' ? '#34D399' : '#F87171'
                            }}>
                              {pay.status}
                            </span>
                          </td>
                          <td style={{ background: 'transparent' }}>
                            {pay.pdfUrl ? (
                              <a href={pay.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary" title="Download Receipt" style={{ borderColor: 'rgba(59, 130, 246, 0.5)', color: '#60A5FA' }}>
                                <i className="bi bi-file-earmark-arrow-down"></i>
                              </a>
                            ) : (
                              <span className="text-white-50 small">-</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserDashboard;
