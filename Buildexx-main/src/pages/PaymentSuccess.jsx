import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaymentById, normalizeProperty } from '../api/apiService';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const result = await getPaymentById(paymentId);
                if (result.success) {
                    setPayment(result.data);
                } else {
                    setError(result.error || 'Failed to fetch payment details');
                }
            } catch (err) {
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (paymentId) {
            fetchPayment();
        }
    }, [paymentId]);

    // ... loading and error states ...

    if (loading) {
        return (
            <div className="container py-5 text-center" style={{ minHeight: '80vh' }}>
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading payment details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5 text-center" style={{ minHeight: '80vh' }}>
                <div className="text-danger mb-4">
                    <i className="bi bi-exclamation-circle" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3>Payment Verification Failed</h3>
                <p className="text-muted">{error}</p>
                <button className="btn btn-primary mt-3" onClick={() => navigate('/user-dashboard')}>
                    Go to Dashboard
                </button>
            </div>
        );
    }

    if (!payment) return null;

    const property = payment.property ? normalizeProperty(payment.property) : null;
    const isRent = payment.paymentType === 'RENT';

    return (
        <div className="container py-5 animate__animated animate__fadeIn" style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        {/* Header */}
                        <div className="card-header bg-success text-white text-center py-4" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                            <div className="mb-3 d-flex justify-content-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        background: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <svg width="50" height="50" viewBox="0 0 50 50">
                                        <motion.path
                                            d="M10 25 L20 35 L40 15"
                                            fill="transparent"
                                            stroke="#10B981"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                        />
                                    </svg>
                                </motion.div>
                            </div>
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-0"
                            >
                                Payment Successful!
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.75 }}
                                transition={{ delay: 0.4 }}
                                className="mb-0"
                            >
                                Transaction ID: {payment.transactionId || payment.razorpayPaymentId}
                            </motion.p>
                        </div>

                        {/* Body */}
                        <div className="card-body p-4 p-md-5">
                            <div className="text-center mb-4">
                                <h5 className="text-white-50 text-uppercase small mb-1">Amount Paid</h5>
                                <h1 className="display-4 fw-bold text-white">
                                    ₹{parseFloat(payment.amount).toLocaleString('en-IN')}
                                </h1>
                                <span className={`badge ${isRent ? 'bg-info text-dark' : 'bg-warning text-dark'} px-3 py-2 rounded-pill`}>
                                    {isRent ? 'RENT PAYMENT' : 'PROPERTY PURCHASE'}
                                </span>
                            </div>

                            {/* Property Details */}
                            {property && (
                                <div className="d-flex align-items-center p-3 rounded-3 mb-4 border border-secondary" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#2C3E50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {getImageUrl(property.thumbnail || (property.images && property.images.length > 0 ? property.images[0] : property.imageUrl)) ? (
                                            <img
                                                src={getImageUrl(property.images[0])}
                                                alt={property.title}
                                                className="w-100 h-100 object-fit-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : (
                                            <i className="bi bi-building" style={{ fontSize: '2rem', color: '#64748B' }}></i>
                                        )}
                                        <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="bi bi-building" style={{ fontSize: '2rem', color: '#64748B' }}></i>
                                        </div>
                                    </div>
                                    <div className="ms-3">
                                        <h6 className="mb-1 text-white fw-bold">{property.title}</h6>
                                        <p className="mb-0 text-white-50 small">
                                            {property.locality}, {property.city}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Info Grid */}
                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <div className="p-3 border border-secondary rounded-3 text-center h-100" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                        <p className="text-white-50 small mb-1">Date</p>
                                        <p className="mb-0 fw-semibold text-white">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-3 border border-secondary rounded-3 text-center h-100" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                        <p className="text-white-50 small mb-1">Method</p>
                                        <p className="mb-0 fw-semibold text-white">Online (Razorpay)</p>
                                    </div>
                                </div>
                                {isRent && (
                                    <div className="col-12">
                                        <div className="p-3 border border-secondary rounded-3 text-center" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                                            <p className="text-white-50 small mb-1">Next Due Date</p>
                                            <p className="mb-0 fw-semibold text-danger">
                                                {new Date(payment.nextDueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="d-grid gap-3">
                                {payment.pdfUrl && (
                                    <a
                                        href={payment.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-light btn-lg d-flex align-items-center justify-content-center"
                                        style={{ borderColor: 'var(--construction-gold)', color: 'var(--construction-gold)' }}
                                    >
                                        <i className="bi bi-file-earmark-pdf me-2"></i> Download Receipt
                                    </a>
                                )}

                                <button
                                    onClick={() => navigate('/user-dashboard')}
                                    className="btn btn-primary btn-lg fw-bold"
                                    style={{
                                        background: 'var(--construction-gold)',
                                        border: 'none',
                                        color: '#0B1C30' // Dark text on gold button for contrast
                                    }}
                                >
                                    Go to Dashboard
                                </button>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="card-footer text-center py-3 border-top border-secondary" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                            <p className="text-white-50 small mb-0">
                                A confirmation email has been sent to <strong className="text-white">{currentUser?.email}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
