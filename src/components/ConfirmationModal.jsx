import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="custom-modal-backdrop" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(15, 23, 42, 0.7)', // Darker backdrop
                backdropFilter: 'blur(4px)', // Glassmorphism effect
                zIndex: 9999, // Very high z-index
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }} onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="modal-dialog"
                    style={{ maxWidth: '400px', width: '90%', margin: 0 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="modal-content" style={{
                        borderRadius: '24px',
                        border: 'none',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        background: isDanger ? '#c8c7caff' : '#c8c7caff',
                        overflow: 'hidden'
                    }}>
                        {/* Icon Header */}
                        <div className="d-flex justify-content-center pt-4 pb-2">
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: isDanger ? '#FEE2E2' : '#DBEAFE',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isDanger ? '#DC2626' : '#2563EB',
                                fontSize: '1.5rem'
                            }}>
                                <i className={`bi ${isDanger ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'}`}></i>
                            </div>
                        </div>

                        <div className="modal-body text-center px-4 pt-2 pb-4">
                            <h4 className="fw-bold mb-2" style={{ color: '#1E293B' }}>{title}</h4>
                            <p className="mb-0" style={{ color: '#64748B', lineHeight: '1.6' }}>{message}</p>
                        </div>

                        <div className="modal-footer border-0 p-3 pt-0 d-flex gap-2 justify-content-center" style={{ background: 'transparent' }}>
                            <button
                                type="button"
                                className="btn px-4 py-2"
                                onClick={onClose}
                                style={{
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    background: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    color: '#64748B',
                                    transition: 'all 0.2s',
                                    flex: 1
                                }}
                            >
                                {cancelText}
                            </button>
                            <button
                                type="button"
                                className="btn px-4 py-2"
                                onClick={onConfirm}
                                style={{
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    minWidth: '100px',
                                    background: isDanger ? '#DC2626' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    boxShadow: isDanger ? '0 4px 12px rgba(220, 38, 38, 0.3)' : '0 4px 12px rgba(37, 99, 235, 0.3)',
                                    flex: 1
                                }}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
