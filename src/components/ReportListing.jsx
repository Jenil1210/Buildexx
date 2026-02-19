import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ReportListing - Modal component for users to report property listings
 * Reasons: Fake listing, Wrong price/details, Duplicate, Spam/inappropriate
 */
const ReportListing = ({ propertyId, propertyName, onSubmit, onClose, isOpen }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const reportReasons = [
        { value: 'fake', label: 'Fake Listing', icon: 'bi-x-octagon', description: 'This property does not exist or information is fabricated' },
        { value: 'wrong_price', label: 'Wrong Price/Details', icon: 'bi-exclamation-triangle', description: 'Price or other details are incorrect' },
        { value: 'duplicate', label: 'Duplicate Listing', icon: 'bi-files', description: 'This property is listed multiple times' },
        { value: 'spam', label: 'Spam/Inappropriate', icon: 'bi-spam', description: 'Contains spam content or inappropriate material' },
        { value: 'unavailable', label: 'No Longer Available', icon: 'bi-house-slash', description: 'Property has been sold/rented but still showing' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) return;

        setSubmitting(true);
        try {
            await onSubmit({
                propertyId,
                reason,
                description
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setReason('');
                setDescription('');
            }, 2000);
        } catch (error) {
            console.error('Error submitting report:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

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
                    background: 'rgba(0, 0, 0, 0.7)',
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
                        background: '#112A46',
                        borderRadius: '20px',
                        padding: '32px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {success ? (
                        <div className="text-center py-4">
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'rgba(16, 185, 129, 0.2)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}>
                                <i className="bi bi-check-lg" style={{ fontSize: '3rem', color: '#10B981' }}></i>
                            </div>
                            <h4 style={{ color: '#FFFFFF', marginBottom: '8px' }}>Report Submitted</h4>
                            <p style={{ color: '#94A3B8' }}>Thank you for helping us maintain quality listings</p>
                        </div>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 style={{ color: '#FFFFFF', margin: 0 }}>
                                    <i className="bi bi-flag me-2" style={{ color: '#EF4444' }}></i>
                                    Report Listing
                                </h4>
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#94A3B8',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>

                            <p style={{ color: '#94A3B8', marginBottom: '20px' }}>
                                Reporting: <strong style={{ color: '#C8A24A' }}>{propertyName}</strong>
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label style={{ color: '#E2E8F0', marginBottom: '12px', display: 'block', fontWeight: '600' }}>
                                        Why are you reporting this listing?
                                    </label>
                                    <div className="d-flex flex-column gap-2">
                                        {reportReasons.map((item) => (
                                            <div
                                                key={item.value}
                                                onClick={() => setReason(item.value)}
                                                style={{
                                                    background: reason === item.value ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                    border: reason === item.value ? '2px solid #EF4444' : '2px solid transparent',
                                                    borderRadius: '12px',
                                                    padding: '14px 16px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <i className={`bi ${item.icon}`} style={{
                                                        color: reason === item.value ? '#EF4444' : '#94A3B8',
                                                        fontSize: '1.2rem'
                                                    }}></i>
                                                    <div>
                                                        <div style={{ color: '#FFFFFF', fontWeight: '600' }}>{item.label}</div>
                                                        <small style={{ color: '#64748B' }}>{item.description}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label style={{ color: '#E2E8F0', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                                        Additional Details (Optional)
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Provide any additional information that might help us review this listing..."
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(226, 232, 240, 0.1)',
                                            borderRadius: '12px',
                                            padding: '14px',
                                            color: '#FFFFFF',
                                            resize: 'none'
                                        }}
                                    />
                                </div>

                                <div className="d-flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(226, 232, 240, 0.2)',
                                            background: 'transparent',
                                            color: '#94A3B8',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!reason || submitting}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: reason ? 'linear-gradient(135deg, #EF4444, #DC2626)' : '#374151',
                                            color: 'white',
                                            fontWeight: '600',
                                            cursor: reason ? 'pointer' : 'not-allowed',
                                            opacity: submitting ? 0.7 : 1
                                        }}
                                    >
                                        {submitting ? (
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                        ) : (
                                            <i className="bi bi-flag-fill me-2"></i>
                                        )}
                                        Submit Report
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ReportListing;
