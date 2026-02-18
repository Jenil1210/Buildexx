import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import TabLoading from '../components/TabLoading';
import {
  getAllBuilders,
  updateBuilderStatus,
  getAllProperties,
  updatePropertyStatus,
  deleteProperty,
  getAllComplaints,
  updatePropertyAvailability,
  updateComplaintStatus,
  verifyProperty,
  getAdminPayments,
  getAdminWithdrawals,
  updateWithdrawalStatus,
  getAdminEnquiries,
  deleteComplaint,
  deleteEnquiry,
  normalizeProperty
} from '../api/apiService';
import ConfirmationModal from '../components/ConfirmationModal';
import { getApiUrl } from '../config';
import { getImageUrl } from '../utils/imageUtils';
import '../DashboardStyles.css';
import { color } from 'framer-motion';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(localStorage.getItem('adminActiveTab') || 'overview');

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // New state

  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectAll = (items) => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) return;

    setLoading(true);
    try {
      if (activeTab === 'properties') {
        await Promise.all(selectedItems.map(id => deleteProperty(id)));
        setProperties(prev => prev.filter(p => !selectedItems.includes(p.id)));
        toast.success('Properties deleted successfully');
      } else if (activeTab === 'complaints') {
        await Promise.all(selectedItems.map(id => deleteComplaint(id)));
        setComplaints(prev => prev.filter(c => !selectedItems.includes(c.id)));
        toast.success('Complaints deleted successfully');
      } else if (activeTab === 'enquiries') {
        await Promise.all(selectedItems.map(id => deleteEnquiry(id)));
        setEnquiries(prev => prev.filter(e => !selectedItems.includes(e.id)));
        toast.success('Enquiries deleted successfully');
      }
    } catch (error) {
      console.error("Bulk delete error", error);
      toast.error("Failed to delete some items");
    } finally {
      setSelectedItems([]);
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (propertyId, newStatus) => {
    try {
      setUpdatingId(propertyId);
      const result = await updatePropertyAvailability(propertyId, newStatus.toUpperCase());

      if (result.success) {
        toast.success("Availability updated");
        setProperties(prev => prev.map(p =>
          p.id === propertyId ? { ...p, availability_status: newStatus } : p
        ));
      } else {
        toast.error("Failed to update");
      }
    } catch (e) {
      toast.error("Error updating");
    } finally {
      setUpdatingId(null);
    }
  };

  // ... (rest of code) ...



  // State management from database
  const [builders, setBuilders] = useState([]);
  const [properties, setProperties] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  // Fetch functions per tab
  const fetchBuilders = async () => {
    if (builders.length > 0) return; // Cache check
    setLoading(true);
    try {
      const result = await getAllBuilders();
      if (result.success) setBuilders(result.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchProperties = async () => {
    if (properties.length > 0) return;
    setLoading(true);
    try {
      const result = await getAllProperties();
      if (result.success) setProperties(result.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchEnquiries = async () => {
    if (enquiries.length > 0) return;
    setLoading(true);
    try {
      const result = await getAdminEnquiries();
      if (result.success) {
        setEnquiries(result.data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchComplaints = async () => {
    if (complaints.length > 0) return;
    setLoading(true);
    try {
      const result = await getAllComplaints();
      if (result.success) setComplaints(result.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);

  const fetchPayments = async () => {
    if (payments.length > 0) return;
    setIsPaymentsLoading(true);
    try {
      const result = await getAdminPayments();
      if (result.success) setPayments(result.data);
    } catch (e) { console.error(e); }
    finally { setIsPaymentsLoading(false); }
  };

  const fetchWithdrawals = async () => {
    if (withdrawals.length > 0) return;
    setLoading(true);
    try {
      const result = await getAdminWithdrawals();
      if (result.success) setWithdrawals(result.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Lazy load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'overview':
        // Overview needs minimal data from all, or dedicated stats endpoint. 
        // For now, load everything to populate stats.
        // In a real optimized app, you'd have getAdminStats()
        if (builders.length === 0) fetchBuilders();
        if (properties.length === 0) fetchProperties();
        if (complaints.length === 0) fetchComplaints();
        break;
      case 'builders': fetchBuilders(); break;
      case 'properties': fetchProperties(); break;
      case 'enquiries': fetchEnquiries(); break;
      case 'complaints': fetchComplaints(); break;
      case 'payments': fetchPayments(); break;
      case 'withdrawals': fetchWithdrawals(); break;
    }
  }, [activeTab]);


  // CRUD Operations...

  // Handle Withdrawal Approval
  const handleApproveWithdrawal = async (id, amount) => {
    // ... same content ...
    // Simulating simple logic: 5% commission
    const commission = amount * 0.05;
    const payout = amount - commission;

    if (window.confirm(`Approve withdrawal of ₹${amount}? \nSystem Commission (5%): ₹${commission} \nBuilder Payout: ₹${payout}`)) {
      try {
        const result = await updateWithdrawalStatus(id, 'approved', commission, payout);
        if (result.success) {
          setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'approved', commissionAmount: commission, payoutAmount: payout } : w));
        }
      } catch (error) {
        console.error('Error approving withdrawal:', error);
      }
    }
  };


  const handleVerifyBuilder = async (id) => {
    // ... same content ...
    try {
      const result = await updateBuilderStatus(id, 'active');
      if (result.success) {
        setBuilders(prev => prev.map(b => b.id === id ? { ...b, status: 'active' } : b));
      }
    } catch (error) {
      console.error('Error verifying builder:', error);
    }
  };

  const handleBlockBuilder = async (id) => {
    // ... same content ...
    try {
      const result = await updateBuilderStatus(id, 'blocked');
      if (result.success) {
        setBuilders(prev => prev.map(b => b.id === id ? { ...b, status: 'blocked' } : b));
      }
    } catch (error) {
      console.error('Error blocking builder:', error);
    }
  };

  const handleUnblockBuilder = async (id) => {
    // ... same content ...
    try {
      const result = await updateBuilderStatus(id, 'active');
      if (result.success) {
        setBuilders(prev => prev.map(b => b.id === id ? { ...b, status: 'active' } : b));
      }
    } catch (error) {
      console.error('Error unblocking builder:', error);
    }
  };


  // Updated Delete Handler using Modal
  const handleDeleteProperty = (id) => {
    setPropertyToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      const result = await deleteProperty(propertyToDelete);
      if (result.success) {
        toast.success('Property deleted successfully');
        setProperties(prev => prev.filter(p => p.id !== propertyToDelete));
      } else {
        toast.error(result.error || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('An error occurred while deleting');
    } finally {
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
    }
  };

  const handleResolveComplaint = async (id) => {
    try {
      const result = await updateComplaintStatus(id, 'RESOLVED');
      if (result.success) {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'RESOLVED' } : c));
        toast.success("Complaint resolved");
      }
    } catch (error) {
      console.error('Error resolving complaint:', error);
      toast.error("Failed to resolve complaint");
    }
  };

  const handleUpdateEnquiryStatus = async (id, status) => {
    try {
      const result = await updateEnquiryStatus(id, status);
      if (result.success) {
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: status.toUpperCase() } : e));
        toast.success(`Enquiry ${status}`);
      }
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      toast.error("Failed to update enquiry");
    }
  };

  const [verifyingId, setVerifyingId] = useState(null);

  const handleVerifyProperty = async (id) => {
    try {
      setVerifyingId(id);
      const result = await verifyProperty(id, true, currentUser.id);
      if (result.success) {
        setProperties(prev => prev.map(p => p.id === id ? result.data : p));
        toast.success("Property verified successfully");
      } else {
        toast.error('Failed to verify property');
      }
    } catch (error) {
      console.error('Error verifying property:', error);
      toast.error("An error occurred");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleUnverifyProperty = async (id) => {
    try {
      setVerifyingId(id);
      const result = await verifyProperty(id, false, currentUser.id);
      if (result.success) {
        setProperties(prev => prev.map(p => p.id === id ? result.data : p));
        toast.success("Property unverified successfully");
      } else {
        toast.error('Failed to unverify property');
      }
    } catch (error) {
      console.error('Error un-verifying property:', error);
      toast.error("An error occurred");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      await deleteEnquiry(id);
      setEnquiries(prev => prev.filter(e => e.id !== id));
      toast.success("Enquiry deleted");
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      toast.error("Failed to delete enquiry");
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await deleteComplaint(id);
      setComplaints(prev => prev.filter(c => c.id !== id));
      toast.success("Complaint deleted");
    } catch (error) {
      console.error("Error deleting complaint:", error);
      toast.error("Failed to delete complaint");
    }
  };

  const handleRejectWithdrawal = async (id) => {
    if (!window.confirm("Reject this withdrawal request?")) return;
    try {
      const result = await updateWithdrawalStatus(id, 'rejected', 0, 0); // Assuming 0 commission/payout for rejection
      if (result.success) {
        setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected' } : w));
        toast.success("Withdrawal rejected");
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast.error("Failed to reject withdrawal");
    }
  };


  const stats = {
    // ... same content ...
    totalBuilders: builders.length,
    pendingVerifications: builders.filter(b => b.status === 'pending' || b.status === 'pending_verification').length,
    totalProperties: properties.length,
    pendingProperties: properties.filter(p => !p.is_verified).length,
    openComplaints: complaints.filter(c => c.status === 'open' || !c.status || c.status === 'PENDING').length,
    pendingEnquiries: enquiries.filter(e => e.status === 'PENDING' || !e.status).length,
    totalRevenue: withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + parseFloat(w.commissionAmount || 0), 0)
  };

  const tabs = [
    // ... same content ...
    { id: 'overview', label: 'Overview', icon: 'bi-grid' },
    { id: 'builders', label: 'Builders', icon: 'bi-people' },
    { id: 'properties', label: 'Properties', icon: 'bi-building' },
    { id: 'enquiries', label: 'Enquiries', icon: 'bi-chat-left-text' },
    { id: 'complaints', label: 'Complaints', icon: 'bi-exclamation-triangle' },
    { id: 'payments', label: 'All Payments', icon: 'bi-cash' },
    { id: 'withdrawals', label: 'Withdrawals', icon: 'bi-wallet2' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-dashboard-page" style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteProperty}
        title="Delete Property"
        message="Are you sure you want to delete this property permanently? This will also delete all associated enquiries, complaints, and requests. This action cannot be undone."
        confirmText="Delete Property"
        isDanger={true}
      />

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
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />

              <div className="d-flex align-items-center gap-4">
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-shield-check fs-1" style={{ color: 'var(--construction-gold)' }}></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-1" style={{ color: 'var(--primary-text)' }}>
                    Admin Dashboard
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    Manage builders, properties, and resolve complaints
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="dashboard-tabs">
            {tabs.map(tab => (
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
          <TabLoading text={`Loading ${activeTab === 'overview' ? 'admin overview' : activeTab === 'builders' ? 'builders list' : activeTab === 'properties' ? 'properties' : activeTab === 'complaints' ? 'complaints' : activeTab === 'payments' ? 'payments' : 'withdrawals'}...`} />
        )}

        {/* Overview Tab */}
        {!loading && activeTab === 'overview' && (
          <div className="row g-4">
            {/* Stats Cards */}
            {[
              { label: 'Total Builders', value: stats.totalBuilders, icon: 'bi-people', color: '#7C3AED', bgColor: '#EDE9FE' },
              { label: 'Pending Verifications', value: stats.pendingVerifications, icon: 'bi-clock-history', color: '#F59E0B', bgColor: '#FEF3C7' },
              { label: 'Total Properties', value: stats.totalProperties, icon: 'bi-building', color: '#3B82F6', bgColor: '#DBEAFE' },
              { label: 'Pending Approvals', value: stats.pendingProperties, icon: 'bi-hourglass-split', color: '#10B981', bgColor: '#D1FAE5' },
              { label: 'Open Complaints', value: stats.openComplaints, icon: 'bi-exclamation-triangle', color: '#EF4444', bgColor: '#FEE2E2' }
            ].map((stat, index) => (
              <div className="col-md-4 col-6" key={index}>
                <div style={{
                  background: 'var(--card-bg)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: 'none',
                  boxShadow: 'var(--card-shadow)'
                }}>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: stat.bgColor,
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className={`bi ${stat.icon} fs-4`} style={{ color: stat.color }}></i>
                    </div>
                    <div>
                      <h3 className="fw-bold mb-0" style={{ color: 'var(--primary-text)', fontSize: '1.5rem' }}>{stat.value}</h3>
                      <p style={{ color: 'var(--secondary-text)', margin: 0, fontSize: '0.85rem' }}>{stat.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Builders Tab */}
        {!loading && activeTab === 'builders' && (
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0'
          }}>
            <h5 className="fw-bold mb-4" style={{ color: '#0F172A' }}>
              <i className="bi bi-people me-2" style={{ color: '#7C3AED' }}></i>
              Builder Management ({builders.length})
            </h5>

            {builders.length === 0 ? (
              <div className="text-center py-5">
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #EDE9FE20, #EDE9FE10)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <i className="bi bi-people" style={{ fontSize: '3rem', color: '#A78BFA' }}></i>
                </div>
                <h5 style={{ color: '#0F172A' }}>No registered builders</h5>
                <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>
                  When builders register on the platform, they will appear here for verification
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover" style={{ background: 'transparent' }}>
                  <thead>
                    <tr>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Builder Name</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Email</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Phone</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Properties</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Status</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {builders.map(builder => (
                      <tr key={builder.id}>
                        <td style={{ color: 'var(--primary-text)', fontWeight: '500' }}>{builder.full_name || builder.username}</td>
                        <td style={{ color: '#64748B' }}>{builder.email}</td>
                        <td style={{ color: '#64748B' }}>{builder.phoneNumber || builder.phone || '-'}</td>
                        <td style={{ color: '#64748B' }}>{builder.activeListings || builder.property_count || 0}</td>
                        <td>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            background: builder.status === 'active' ? '#D1FAE5' : builder.status === 'blocked' ? '#FEE2E2' : '#FEF3C7',
                            color: builder.status === 'active' ? '#059669' : builder.status === 'blocked' ? '#DC2626' : '#D97706'
                          }}>
                            {builder.status === 'active' ? 'Verified' : builder.status === 'blocked' ? 'Blocked' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          {builder.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-sm me-2"
                                style={{ background: '#10B981', color: 'white', borderRadius: '6px' }}
                                onClick={() => handleVerifyBuilder(builder.id)}
                              >
                                Verify
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{ background: '#EF4444', color: 'white', borderRadius: '6px' }}
                                onClick={() => handleBlockBuilder(builder.id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {builder.status === 'active' && (
                            <button
                              className="btn btn-sm"
                              style={{ background: '#EF4444', color: 'white', borderRadius: '6px' }}
                              onClick={() => handleBlockBuilder(builder.id)}
                            >
                              Block
                            </button>
                          )}
                          {builder.status === 'blocked' && (
                            <button
                              className="btn btn-sm"
                              style={{ background: '#10B981', color: 'white', borderRadius: '6px' }}
                              onClick={() => handleUnblockBuilder(builder.id)}
                            >
                              Unblock
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Properties Tab */}
        {!loading && activeTab === 'properties' && (
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: '#0F172A' }}>
                <i className="bi bi-building me-2" style={{ color: '#3B82F6' }}></i>
                Property Management ({properties.length})
              </h5>
              {selectedItems.length > 0 && activeTab === 'properties' && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleBulkDelete}
                >
                  <i className="bi bi-trash me-1"></i> Delete Selected ({selectedItems.length})
                </button>
              )}
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-5">
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #DBEAFE20, #DBEAFE10)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <i className="bi bi-building" style={{ fontSize: '3rem', color: '#60A5FA' }}></i>
                </div>
                <h5 style={{ color: '#0F172A' }}>No properties listed</h5>
                <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>
                  Properties added by builders will appear here for monitoring
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover" style={{ background: 'transparent' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          onChange={() => handleSelectAll(properties)}
                          checked={selectedItems.length === properties.length && properties.length > 0}
                        />
                      </th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Property</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Builder</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Type</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>City</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Legal Doc</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Availability</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Status</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(property => (
                      <tr key={property.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedItems.includes(property.id)}
                            onChange={() => handleSelectItem(property.id)}
                          />
                        </td>
                        <td style={{ color: 'var(--primary-text)', fontWeight: '500' }}>{property.name}</td>
                        <td style={{ color: '#64748B' }}>
                          {property.builder_name || property.builder?.companyName || property.builder?.fullName || '-'}
                        </td>
                        <td style={{ color: '#64748B' }}>{property.type}</td>
                        <td style={{ color: '#64748B' }}>{property.city || '-'}</td>
                        <td style={{ color: '#64748B' }}>
                          {property.legalDocumentUrl || property.legal_document_url || property.legal_document_path ? (
                            <a
                              href={`https://docs.google.com/gviewer?url=${encodeURIComponent(getImageUrl(property.legalDocumentUrl || property.legal_document_url || property.legal_document_path))}&embedded=true`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-decoration-none"
                              title="Click to view PDF"
                            >
                              <i className="bi bi-file-earmark-pdf me-1"></i> View
                            </a>
                          ) : (
                            <span className="text-muted small" style={{ color: "red" }}>Not Uploaded</span>
                          )}
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            style={{ width: '120px', cursor: 'pointer' }}
                            value={(property.availability_status || 'available').toLowerCase()}
                            onChange={(e) => handleAvailabilityChange(property.id, e.target.value)}
                            disabled={updatingId === property.id}
                          >
                            <option value="available">Available</option>
                            <option value="booked">Booked</option>
                            <option value="sold">Sold</option>
                            <option value="rented">Rented</option>
                          </select>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              background: property.is_verified ? '#D1FAE5' : '#FEF3C7',
                              color: property.is_verified ? '#059669' : '#D97706'
                            }}>
                              {property.is_verified ? 'Verified' : 'Pending Verification'}
                            </span>
                            {property.is_verified && (
                              <i className="bi bi-patch-check-fill text-primary" title="Verified Property"></i>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <a
                              href={`/property/${property.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm"
                              style={{ background: '#3B82F6', color: 'white', borderRadius: '6px', textDecoration: 'none' }}
                            >
                              <i className="bi bi-eye me-1"></i>View
                            </a>
                            {!property.is_verified ? (
                              <button
                                className="btn btn-sm"
                                style={{ background: '#10B981', color: 'white', borderRadius: '6px' }}
                                onClick={() => handleVerifyProperty(property.id)}
                                disabled={verifyingId === property.id}
                              >
                                {verifyingId === property.id ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    Verifying...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-check-circle me-1"></i>Verify
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm"
                                style={{ background: '#F59E0B', color: 'white', borderRadius: '6px' }}
                                onClick={() => handleUnverifyProperty(property.id)}
                                disabled={verifyingId === property.id}
                              >
                                {verifyingId === property.id ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    Unverifying...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-x-circle me-1"></i>Unverify
                                  </>
                                )}
                              </button>
                            )}
                            <button
                              className="btn btn-sm"
                              style={{ background: '#EF4444', color: 'white', borderRadius: '6px' }}
                              onClick={() => handleDeleteProperty(property.id)}
                            >
                              <i className="bi bi-trash me-1"></i>Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Enquiries Tab */}
        {!loading && activeTab === 'enquiries' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: '#0F172A' }}>
                <i className="bi bi-chat-left-text me-2" style={{ color: '#3B82F6' }}></i>
                Platform Enquiries ({enquiries.length})
              </h5>
              {selectedItems.length > 0 && activeTab === 'enquiries' && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleBulkDelete}
                >
                  <i className="bi bi-trash me-1"></i> Delete Selected ({selectedItems.length})
                </button>
              )}
            </div>
            <div className="table-responsive">
              <table className="table table-hover" style={{ background: 'transparent' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        onChange={() => handleSelectAll(enquiries)}
                        checked={selectedItems.length === enquiries.length && enquiries.length > 0}
                      />
                    </th>
                    <th style={{ color: 'var(--primary-text)' }}>Property</th>
                    <th style={{ color: 'var(--primary-text)' }}>Customer</th>
                    <th style={{ color: 'var(--primary-text)' }}>Type</th>
                    <th style={{ color: 'var(--primary-text)' }}>Date</th>
                    <th style={{ color: 'var(--primary-text)' }}>Status</th>
                    <th style={{ color: 'var(--primary-text)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map(e => (
                    <tr key={e.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedItems.includes(e.id)}
                          onChange={() => handleSelectItem(e.id)}
                        />
                      </td>
                      <td style={{ color: 'var(--primary-text)' }}>{e.property?.title || 'Deleted Property'}</td>
                      <td style={{ color: '#64748B' }}>
                        {e.name}<br />
                        <small>{e.email}</small>
                      </td>
                      <td style={{ color: '#64748B' }}>{e.enquiryType}</td>
                      <td style={{ color: '#64748B' }}>{formatDate(e.createdAt)}</td>
                      <td>
                        <span style={{
                          padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600',
                          background: e.status === 'APPROVED' ? '#D1FAE5' : e.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                          color: e.status === 'APPROVED' ? '#059669' : e.status === 'REJECTED' ? '#DC2626' : '#D97706'
                        }}>
                          {e.status || 'PENDING'}
                        </span>
                      </td>
                      <td>
                        {(e.status === 'PENDING' || !e.status) && (
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-success" onClick={() => handleUpdateEnquiryStatus(e.id, 'APPROVED')}>
                              <i className="bi bi-check-lg"></i>
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleUpdateEnquiryStatus(e.id, 'REJECTED')}>
                              <i className="bi bi-x-lg"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteEnquiry(e.id)} title="Delete">
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        )}
                        {e.status !== 'PENDING' && e.status && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteEnquiry(e.id)} title="Delete">
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {!loading && activeTab === 'complaints' && (
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0" style={{ color: '#0F172A' }}>
                <i className="bi bi-exclamation-triangle me-2" style={{ color: '#EF4444' }}></i>
                Complaints ({complaints.length})
              </h5>
              {selectedItems.length > 0 && activeTab === 'complaints' && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleBulkDelete}
                >
                  <i className="bi bi-trash me-1"></i> Delete Selected ({selectedItems.length})
                </button>
              )}
            </div>

            {complaints.length === 0 ? (
              <div className="text-center py-5">
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #D1FAE520, #D1FAE510)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <i className="bi bi-check-circle" style={{ fontSize: '3rem', color: '#34D399' }}></i>
                </div>
                <h5 style={{ color: '#0F172A' }}>No complaints</h5>
                <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>
                  Great! There are no pending complaints to review
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover" style={{ background: 'transparent' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          onChange={() => handleSelectAll(complaints)}
                          checked={selectedItems.length === complaints.length && complaints.length > 0}
                        />
                      </th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Property</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Complainant</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Issue</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Date</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Status</th>
                      <th style={{ color: 'var(--primary-text)', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(complaint => (
                      <tr key={complaint.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedItems.includes(complaint.id)}
                            onChange={() => handleSelectItem(complaint.id)}
                          />
                        </td>
                        <td style={{ color: 'var(--primary-text)', fontWeight: '500' }}>{complaint.property?.title || '-'}</td>
                        <td style={{ color: '#64748B' }}>
                          {complaint.user ? (complaint.user.fullName || complaint.user.username) : '-'}
                        </td>
                        <td style={{ color: '#64748B', maxWidth: '200px' }}>{complaint.description}</td>
                        <td style={{ color: '#64748B' }}>{formatDate(complaint.createdAt)}</td>
                        <td>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            background: (complaint.status === 'RESOLVED' || complaint.status === 'resolved') ? '#D1FAE5' : '#FEF3C7',
                            color: (complaint.status === 'RESOLVED' || complaint.status === 'resolved') ? '#059669' : '#D97706'
                          }}>
                            {complaint.status ? complaint.status.toUpperCase() : 'PENDING'}
                          </span>
                        </td>
                        <td>
                          {(!complaint.status || complaint.status === 'PENDING' || complaint.status === 'pending' || complaint.status === 'OPEN' || complaint.status === 'open') && (
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm"
                                style={{ background: '#10B981', color: 'white', borderRadius: '6px' }}
                                onClick={() => handleResolveComplaint(complaint.id)}
                              >
                                Resolve
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteComplaint(complaint.id)}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          )}
                          {(complaint.status === 'resolved' || complaint.status === 'RESOLVED') && (
                            <div className="d-flex align-items-center gap-2">
                              <span style={{ color: '#64748B', fontSize: '0.9rem' }}>Closed</span>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteComplaint(complaint.id)}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
            <h5 className="fw-bold mb-4" style={{ color: '#0F172A' }}>
              <i className="bi bi-cash me-2" style={{ color: '#10B981' }}></i>
              Received Payments ({payments.length})
              {isPaymentsLoading && <div className="spinner-border spinner-border-sm ms-2 text-primary" role="status"></div>}
            </h5>
            <div className="table-responsive">
              <table className="table table-hover" style={{ background: 'transparent' }}>
                <thead>
                  <tr>
                    <th style={{ color: 'var(--primary-text)' }}>Property</th>
                    <th style={{ color: 'var(--primary-text)' }}>User</th>
                    <th style={{ color: 'var(--primary-text)' }}>Builder</th>
                    <th style={{ color: 'var(--primary-text)' }}>Amount</th>
                    <th style={{ color: 'var(--primary-text)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4" style={{ color: '#64748B' }}>
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map(p => (
                      <tr key={p.id}>
                        <td style={{ color: 'var(--primary-text)' }}>{p.property?.title || '-'}</td>
                        <td style={{ color: '#64748B' }}>{p.user?.fullName || '-'}</td>
                        <td style={{ color: '#64748B' }}>{p.builder?.companyName || p.builder?.fullName || p.property?.builder?.companyName || p.property?.builder?.fullName || p.property?.builder?.username || '-'}</td>
                        <td style={{ color: '#10B981', fontWeight: 'bold' }}>₹{p.amount}</td>
                        <td style={{ color: '#64748B' }}>{formatDate(p.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {!loading && activeTab === 'withdrawals' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
            <h5 className="fw-bold mb-4" style={{ color: '#0F172A' }}>
              <i className="bi bi-wallet2 me-2" style={{ color: '#F59E0B' }}></i>
              Withdrawal Requests ({withdrawals.length})
            </h5>
            <div className="table-responsive">
              <table className="table table-hover" style={{ background: 'transparent' }}>
                <thead>
                  <tr>
                    <th style={{ color: '#FFFFFF' }}>Builder</th>
                    <th style={{ color: '#FFFFFF' }}>Requested Amount</th>
                    <th style={{ color: '#FFFFFF' }}>Commission (System)</th>
                    <th style={{ color: '#FFFFFF' }}>Payout</th>
                    <th style={{ color: '#FFFFFF' }}>Status</th>
                    <th style={{ color: '#FFFFFF' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4" style={{ color: '#FFFFFF' }}>
                        No withdrawal requests found.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map(w => {
                      // Calculate projected values for display if pending
                      const displayCommission = w.status === 'approved'
                        ? w.commissionAmount
                        : (w.amount * 0.05).toFixed(2);

                      const displayPayout = w.status === 'approved'
                        ? w.payoutAmount
                        : (w.amount * 0.95).toFixed(2);

                      return (
                        <tr key={w.id}>
                          <td style={{ color: '#FFFFFF' }}>
                            <span style={{ color: '#FFFFFF' }} className="fw-bold">{w.builder?.companyName}</span>
                            <span className="d-block small" style={{ color: '#FFFFFF' }}>{w.builder?.fullName}</span>
                          </td>
                          <td style={{ color: '#FFFFFF', fontWeight: 'bold' }}>₹{w.amount}</td>
                          <td style={{ color: '#EF4444' }}>
                            ₹{displayCommission}
                            {w.status?.toLowerCase() === 'pending' && <small className="text-muted fst-italic ms-1">(Est.)</small>}
                          </td>
                          <td style={{ color: '#10B981' }}>
                            ₹{displayPayout}
                            {w.status?.toLowerCase() === 'pending' && <small className="text-muted fst-italic ms-1">(Est.)</small>}
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600',
                              background: ['approved', 'resolved'].includes(w.status?.toLowerCase()) ? '#D1FAE5' : '#FEF3C7',
                              color: ['approved', 'resolved'].includes(w.status?.toLowerCase()) ? '#059669' : '#D97706'
                            }}>
                              {w.status ? w.status.toUpperCase() : 'PENDING'}
                            </span>
                          </td>
                          <td>
                            {(() => {
                              console.log('Withdrawal Status:', w.id, w.status); // Debugging
                              const status = (w.status || '').toLowerCase();
                              return (status === 'pending' || status === 'requested' || !w.status) ? (
                                <div className="d-flex gap-2">
                                  <button className="btn btn-sm btn-success" onClick={() => handleApproveWithdrawal(w.id, w.amount)}>
                                    Approve
                                  </button>
                                  <button className="btn btn-sm btn-danger" onClick={() => handleRejectWithdrawal(w.id)}>
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted small">
                                  {status === 'approved' ? 'Processed' : 'Rejected'}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default AdminDashboard;
