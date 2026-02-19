import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createPaymentOrder, verifyPayment, checkBookingStatus } from '../api/apiService'; // Updated imports

/**
 * PaymentButton Component
 * Handles Razorpay payments for Buy and Rent properties (Booking Amount Only)
 */
const PaymentButton = ({
    property,
    paymentType = 'BUY', // 'BUY' or 'RENT'
    onSuccess = () => { },
    onFailure = () => { },
    buttonText = null,
    className = '',
    style = {},
    amount = null // Added amount prop
}) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get Razorpay key from environment
    const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo';

    // Token amount is 5% of the total price/rent
    const totalAmount = paymentType === 'RENT'
        ? (property.min_rent_amount || property.rent_amount || property.rentAmount || property.rent || property.price || 0)
        : (property.price || 0);

    const numericTotal = typeof totalAmount === 'string'
        ? parseFloat(totalAmount.replace(/[^0-9.]/g, ''))
        : Number(totalAmount);

    const TOKEN_PERCENTAGE = 0.05;
    const calculatedToken = numericTotal * TOKEN_PERCENTAGE;

    const paymentAmount = amount || calculatedToken;

    const numericAmount = typeof paymentAmount === 'string'
        ? parseFloat(paymentAmount.replace(/[^0-9.]/g, ''))
        : Number(paymentAmount);

    const defaultButtonText = paymentType === 'RENT'
        ? `Pay Rent (5% Booking) ₹${numericAmount.toLocaleString('en-IN')}`
        : `Pay Booking Token (5%) ₹${numericAmount.toLocaleString('en-IN')}`;



    // Load Razorpay script dynamically
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Create payment record in database
    const createPaymentRecord = async (orderId) => {
        try {
            const result = await sql`
                INSERT INTO payments (
                    user_id, property_id, builder_id, payment_type, 
                    amount, razorpay_order_id, status, description
                )
                VALUES (
                    ${currentUser.id}, ${property.id}, ${property.builder_id}, ${paymentType},
                    ${numericAmount}, ${orderId}, 'pending', ${`Payment for ${property.name || property.title}`}
                )
                RETURNING *
            `;
            return result[0];
        } catch (err) {
            console.error('Error creating payment record:', err);
            throw err;
        }
    };

    // Update payment status after completion
    const updatePaymentRecord = async (paymentId, status, razorpayPaymentId) => {
        try {
            await sql`
                UPDATE payments
                SET 
                    status = ${status},
                    razorpay_payment_id = ${razorpayPaymentId},
                    payment_date = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${paymentId}
            `;

            // If payment successful, update property status
            if (status === 'completed') {
                if (paymentType === 'BUY') {
                    await sql`
                        UPDATE properties 
                        SET availability_status = 'SOLD', updated_at = CURRENT_TIMESTAMP 
                        WHERE id = ${property.id}
                    `;
                } else if (paymentType === 'RENT') {
                    await sql`
                        UPDATE properties 
                        SET availability_status = 'RENTED', updated_at = CURRENT_TIMESTAMP 
                        WHERE id = ${property.id}
                    `;

                    // Create rent subscription
                    const today = new Date().toISOString().split('T')[0];
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);

                    await sql`
                        INSERT INTO rent_subscriptions (
                            user_id, property_id, builder_id, monthly_rent,
                            start_date, next_payment_due, last_payment_id, is_active
                        )
                        VALUES (
                            ${currentUser.id}, ${property.id}, ${property.builder_id}, 
                            ${numericAmount}, ${today}, ${nextMonth.toISOString().split('T')[0]}, 
                            ${paymentId}, true
                        )
                        ON CONFLICT (user_id, property_id) 
                        DO UPDATE SET 
                            next_payment_due = ${nextMonth.toISOString().split('T')[0]},
                            last_payment_id = ${paymentId},
                            is_active = true,
                            updated_at = CURRENT_TIMESTAMP
                    `;
                }
            }
        } catch (err) {
            console.error('Error updating payment record:', err);
        }
    };

    const navigate = useNavigate();

    // Check booking status on mount
    React.useEffect(() => {
        if (currentUser && property) {
            checkBookingStatus(currentUser.id, property.id).then(res => {
                if (res.isBooked) {
                    setIsBooked(true);
                }
            });
        }
    }, [currentUser, property]);

    const [isBooked, setIsBooked] = useState(false);

    // Dynamic Text based on booking - MOVED inside component to avoid redeclaration if multiple instances
    const bookingAmountText = property.purpose?.toLowerCase() === 'rent'
        ? 'Pay Rent (15% Booking)'
        : 'Pay Booking Token (15%)';

    // Calculate display text once using all state
    const currentDisplayText = isBooked
        ? 'Already Booked'
        : (buttonText || defaultButtonText);

    // Clean up loading state if component unmounts
    useEffect(() => {
        return () => setLoading(false);
    }, []);

    const handlePayment = async () => {
        if (!currentUser) {
            const confirmLogin = window.confirm("You need to verify your account to proceed with payment. Would you like to login/register now?");
            if (confirmLogin) {
                navigate('/login', { state: { returnUrl: `/property/${property.id}` } });
            }
            return;
        }

        if (isBooked) return;

        setLoading(true);
        setError(null);

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) throw new Error('Failed to load payment gateway');

            // Create Order on Backend
            const orderData = await createPaymentOrder(currentUser.id, property.id);
            if (orderData.error) throw new Error(orderData.error);

            const { razorpayOrderId, amount: bookingAmount } = orderData.data; // backend returns { success: true, data: Payment }

            // Configure Razorpay options
            const options = {
                key: RAZORPAY_KEY_ID,
                amount: Math.round(bookingAmount * 100), // Convert to paisa (Backend amount is in currency unit)
                currency: 'INR',
                name: 'BuildEx',
                description: paymentType === 'RENT'
                    ? `Booking Request for Rent: ${property.name || property.title}`
                    : `Booking Token for Buy: ${property.name || property.title}`,
                order_id: razorpayOrderId?.startsWith('order_') ? null : razorpayOrderId, // Use real order ID if valid, else null for test
                prefill: {
                    name: currentUser.full_name || currentUser.username,
                    email: currentUser.email,
                    contact: currentUser.phone || ''
                },
                notes: {
                    property_id: property.id,
                    payment_type: paymentType,
                    user_id: currentUser.id
                },
                theme: { color: '#C8A24A' },
                handler: async function (response) {
                    try {
                        // Verify on Backend
                        const verifyRes = await verifyPayment({
                            razorpay_order_id: razorpayOrderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature || 'dummy_sig'
                        });

                        if (verifyRes.error) {
                            setError(verifyRes.error);
                            onFailure({ message: verifyRes.error });
                        } else {
                            // Clear cache to force refresh of status
                            sessionStorage.removeItem(`property_detail_${property.id}`);
                            sessionStorage.removeItem('cached_properties');

                            setIsBooked(true); // Disable button immediately
                            onSuccess(verifyRes.data);
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        setError(err.message);
                        onFailure(err);
                    } finally {
                        setLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response) {
                setError(response.error.description);
                onFailure(response.error);
                setLoading(false);
            });
            razorpay.open();

        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message);
            onFailure(err);
            setLoading(false);
        }
    };

    return (
        <div className={`payment-button-wrapper ${className}`}>
            <button
                onClick={handlePayment}
                disabled={loading || !numericAmount || numericAmount <= 0}
                style={{
                    background: paymentType === 'RENT'
                        ? 'linear-gradient(135deg, #10B981, #059669)'
                        : 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
                    color: paymentType === 'RENT' ? 'white' : '#0F172A',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    ...style
                }}
            >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Processing...
                    </>
                ) : (
                    <>
                        <i className={`bi ${paymentType === 'RENT' ? 'bi-key' : 'bi-credit-card'}`}></i>
                        {currentDisplayText}
                    </>
                )}
            </button>

            {error && (
                <div className="mt-2 text-center" style={{
                    color: '#DC2626',
                    fontSize: '0.85rem',
                    background: 'rgba(220,38,38,0.1)',
                    padding: '8px 12px',
                    borderRadius: '8px'
                }}>
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    {error}
                </div>
            )}

            <p className="mt-2 text-center" style={{ fontSize: '0.75rem', color: '#64748B' }}>
                <i className="bi bi-shield-check me-1"></i>
                Secure payment powered by Razorpay
            </p>
        </div>
    );
};

export default PaymentButton;
