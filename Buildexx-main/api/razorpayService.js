/**
 * Razorpay Payment Service
 * Handles payment order creation and verification
 * NOTE: This file runs on the server-side only
 */

import sql from './db.js';

// Razorpay configuration - these will be set from environment or config
// For frontend, we'll use a separate config
const RAZORPAY_KEY_ID = 'rzp_test_your_key_id'; // Replace with actual key
const RAZORPAY_KEY_SECRET = 'your_key_secret'; // Replace with actual secret

// Check if we're in Node.js environment (has access to require)
let Razorpay = null;
let razorpayInstance = null;
let crypto = null;

// Only initialize Razorpay in Node.js environment
const isNodeEnv = typeof window === 'undefined';

if (isNodeEnv) {
    try {
        // Dynamic import for server-side only
        const RazorpayModule = await import('razorpay');
        Razorpay = RazorpayModule.default;
        crypto = await import('crypto');

        razorpayInstance = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET
        });
    } catch (error) {
        console.warn('Razorpay initialization skipped (browser environment or missing module):', error.message);
    }
}

/**
 * Create a Razorpay order for payment
 */
export async function createRazorpayOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    if (!razorpayInstance) {
        // In browser, we'll call the API endpoint instead
        return { success: false, error: 'Razorpay not available. Use API endpoint.' };
    }

    try {
        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt,
            notes
        };

        const order = await razorpayInstance.orders.create(options);
        return { success: true, data: order };
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(orderId, paymentId, signature) {
    if (!crypto) {
        return { success: false, error: 'Crypto not available in browser' };
    }

    try {
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isValid = expectedSignature === signature;
        return { success: true, isValid };
    } catch (error) {
        console.error('Signature verification failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a payment record in database
 */
export async function createPayment({
    userId,
    propertyId,
    builderId,
    paymentType,
    amount,
    razorpayOrderId,
    description = ''
}) {
    try {
        const result = await sql`
            INSERT INTO payments (
                user_id, property_id, builder_id, payment_type, 
                amount, razorpay_order_id, status, description
            )
            VALUES (
                ${userId}, ${propertyId}, ${builderId}, ${paymentType},
                ${amount}, ${razorpayOrderId}, 'pending', ${description}
            )
            RETURNING *
        `;
        return { success: true, data: result[0] };
    } catch (error) {
        console.error('Create payment error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update payment status after verification
 */
export async function updatePaymentStatus(paymentId, status, razorpayPaymentId, razorpaySignature) {
    try {
        const result = await sql`
            UPDATE payments
            SET 
                status = ${status},
                razorpay_payment_id = ${razorpayPaymentId},
                razorpay_signature = ${razorpaySignature},
                payment_date = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${paymentId}
            RETURNING *
        `;
        return { success: true, data: result[0] };
    } catch (error) {
        console.error('Update payment status error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get payment by Razorpay order ID
 */
export async function getPaymentByOrderId(razorpayOrderId) {
    try {
        const result = await sql`
            SELECT * FROM payments WHERE razorpay_order_id = ${razorpayOrderId}
        `;
        if (result.length === 0) {
            return { success: false, error: 'Payment not found' };
        }
        return { success: true, data: result[0] };
    } catch (error) {
        console.error('Get payment error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's payment history
 */
export async function getUserPayments(userId) {
    try {
        const result = await sql`
            SELECT p.*, 
                   pr.title as property_name, pr.city, pr.images,
                   u.full_name as builder_name
            FROM payments p
            LEFT JOIN properties pr ON p.property_id = pr.id
            LEFT JOIN users u ON p.builder_id = u.id
            WHERE p.user_id = ${userId}
            ORDER BY p.created_at DESC
        `;
        return { success: true, data: result };
    } catch (error) {
        console.error('Get user payments error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get builder's received payments
 */
export async function getBuilderPayments(builderId) {
    try {
        const result = await sql`
            SELECT p.*, 
                   pr.title as property_name, pr.city,
                   u.full_name as user_name, u.email as user_email
            FROM payments p
            LEFT JOIN properties pr ON p.property_id = pr.id
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.builder_id = ${builderId}
            ORDER BY p.created_at DESC
        `;
        return { success: true, data: result };
    } catch (error) {
        console.error('Get builder payments error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a rent subscription
 */
export async function createRentSubscription({
    userId,
    propertyId,
    builderId,
    monthlyRent,
    startDate,
    paymentId
}) {
    try {
        const nextDue = new Date(startDate);
        nextDue.setMonth(nextDue.getMonth() + 1);

        const result = await sql`
            INSERT INTO rent_subscriptions (
                user_id, property_id, builder_id, monthly_rent,
                start_date, next_payment_due, last_payment_id, last_payment_date, is_active
            )
            VALUES (
                ${userId}, ${propertyId}, ${builderId}, ${monthlyRent},
                ${startDate}, ${nextDue.toISOString().split('T')[0]}, ${paymentId}, ${startDate}, true
            )
            RETURNING *
        `;
        return { success: true, data: result[0] };
    } catch (error) {
        console.error('Create rent subscription error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's active rent subscriptions
 */
export async function getUserRentSubscriptions(userId) {
    try {
        const result = await sql`
            SELECT rs.*, 
                   p.title as property_name, p.city, p.area, p.images,
                   u.full_name as builder_name, u.phone as builder_phone
            FROM rent_subscriptions rs
            LEFT JOIN properties p ON rs.property_id = p.id
            LEFT JOIN users u ON rs.builder_id = u.id
            WHERE rs.user_id = ${userId}
            ORDER BY rs.is_active DESC, rs.next_payment_due ASC
        `;
        return { success: true, data: result };
    } catch (error) {
        console.error('Get user rent subscriptions error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update rent subscription after monthly payment
 */
export async function updateRentSubscription(subscriptionId, paymentId) {
    try {
        const today = new Date();
        const nextDue = new Date();
        nextDue.setMonth(nextDue.getMonth() + 1);

        const result = await sql`
            UPDATE rent_subscriptions
            SET 
                next_payment_due = ${nextDue.toISOString().split('T')[0]},
                last_payment_id = ${paymentId},
                last_payment_date = ${today.toISOString().split('T')[0]},
                is_active = true,
                status = 'active',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${subscriptionId}
            RETURNING *
        `;
        return { success: true, data: result[0] };
    } catch (error) {
        console.error('Update rent subscription error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Mark property as sold after purchase
 */
export async function markPropertyAsSold(propertyId) {
    try {
        const result = await sql`
            UPDATE properties
            SET availability_status = 'SOLD', updated_at = CURRENT_TIMESTAMP
            WHERE id = ${propertyId}
            RETURNING *
        `;
        return { success: true, data: result[0] };
    } catch (error) {
        console.error('Mark property as sold error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Mark property as rented
 */
export async function markPropertyAsRented(propertyId) {
    try {
        const result = await sql`
            UPDATE properties
            SET availability_status = 'RENTED', updated_at = CURRENT_TIMESTAMP
            WHERE id = ${propertyId}
            RETURNING *
        `;
        return { success: true, data: result[0] };
    } catch (error) {
        console.error('Mark property as rented error:', error);
        return { success: false, error: error.message };
    }
}

// Export Razorpay key for frontend (public key only)
export function getRazorpayKeyId() {
    return RAZORPAY_KEY_ID;
}
