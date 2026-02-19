/**
 * Email Service - Resend Integration
 * Handles all email notifications for BuildEx platform using Resend API
 * 
 * Sender Emails:
 * - security@buildexx.app - OTP, Password Reset
 * - onboarding@buildexx.app - Welcome, Verification Success
 * - notifications@buildexx.app - Enquiries, Bookings, Property Updates
 * - admin@buildexx.app - Admin Notifications
 */

import sql from './db.js';

// Resend API Configuration
const RESEND_API_KEY = 're_isWBNR3v_Dfsw1V2yzQc57ykm4SA8WTJa';
const RESEND_API_URL = 'https://api.resend.com/emails';

// Sender Email Addresses
const SENDERS = {
    security: 'Buildex Security <security@buildexx.app>',
    onboarding: 'Buildex <onboarding@buildexx.app>',
    notifications: 'Buildex Notifications <notifications@buildexx.app>',
    admin: 'Buildex Admin <admin@buildexx.app>',
    support: 'Buildex Support <support@buildexx.app>'
};

// Premium Email Template Wrapper
const wrapHtmlContent = (title, heading, content, themeColor = '#D4AF37', ctaText = 'Visit Buildex', ctaUrl = 'https://buildexx.app') => {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin-top: 40px; margin-bottom: 40px; }
    .header { background: linear-gradient(135deg, #0B1C30 0%, #1a365d 100%); padding: 40px 0; text-align: center; position: relative; }
    .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, ${themeColor}, #ffffff); }
    .brand { color: #D4AF37; font-size: 28px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .tagline { color: #a0aec0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
    .content { padding: 40px; }
    .heading { color: #1a202c; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #edf2f7; padding-bottom: 15px; }
    .text { color: #4a5568; line-height: 1.7; font-size: 16px; }
    .footer { background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #edf2f7; }
    .footer-text { color: #718096; font-size: 13px; margin: 5px 0; }
    .btn { display: inline-block; background-color: ${themeColor}; color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 25px; transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(0,0,0, 0.2); }
    .highlight-box { background-color: #f8fafc; border-left: 4px solid ${themeColor}; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
    .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .data-cell { padding: 12px 0; border-bottom: 1px solid #edf2f7; color: #4a5568; }
    .label-cell { width: 35%; color: #718096; font-weight: 500; }
    .value-cell { font-weight: 600; color: #2d3748; }
    .otp-box { text-align: center; margin: 30px 0; }
    .otp-code { font-size: 36px; font-weight: 800; color: #2d3748; letter-spacing: 12px; background: #EDF2F7; padding: 20px 40px; border-radius: 12px; display: inline-block; border-bottom: 4px solid ${themeColor}; }
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-success { background-color: #d1fae5; color: #047857; border: 1px solid #047857; }
    .badge-warning { background-color: #fef3c7; color: #92400e; border: 1px solid #f59e0b; }
    .badge-info { background-color: #dbeafe; color: #1e40af; border: 1px solid #3b82f6; }
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1 class="brand">BUILDEX</h1>
        <div class="tagline">Premium Real Estate Marketplace</div>
    </div>
    <div class="content">
        <h2 class="heading">${heading}</h2>
        <div class="text">${content}</div>
        ${ctaText ? `<div style="text-align: center;"><a href="${ctaUrl}" class="btn">${ctaText}</a></div>` : ''}
    </div>
    <div class="footer">
        <p class="footer-text">&copy; 2026 Buildex Real Estate. All rights reserved.</p>
        <p class="footer-text">support@buildexx.app</p>
    </div>
</div>
</body>
</html>`;
};

/**
 * Send email via Resend API
 */
async function sendResendEmail(from, to, subject, html, replyTo = null) {
    try {
        const payload = {
            from,
            to: Array.isArray(to) ? to : [to],
            subject,
            html
        };

        if (replyTo) {
            payload.reply_to = replyTo;
        }

        const response = await fetch(RESEND_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('❌ Resend API error:', result);
            return { success: false, error: result.message || 'Failed to send email' };
        }

        console.log(`✅ Email sent via Resend: ${subject} to ${to}`);
        return { success: true, messageId: result.id };
    } catch (error) {
        console.error('❌ Resend API error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// AUTHENTICATION & SECURITY EMAILS
// ============================================

/**
 * 1. Email Verification OTP
 */
export async function sendOtpEmail(toEmail, otp, userName = 'User') {
    const content = `
        <p>Hello ${userName},</p>
        <p>Thank you for registering with Buildex. Please use the code below to verify your email address:</p>
        <div class="otp-box">
            <div class="otp-code">${otp}</div>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
    `;

    const html = wrapHtmlContent('Verify Email', 'Verify Your Email Address', content, '#D4AF37', null);
    return sendResendEmail(SENDERS.security, toEmail, 'Verify your email – Buildex', html);
}

/**
 * 2. Email Verified Confirmation
 */
export async function sendEmailVerifiedEmail(toEmail, userName) {
    const content = `
        <p>Hello ${userName},</p>
        <p>Your email address has been successfully verified. You now have full access to all Buildex features.</p>
        <div class="highlight-box">
            <p style="margin:0"><span class="status-badge badge-success">✓ VERIFIED</span></p>
        </div>
        <p>Start exploring premium properties today!</p>
    `;

    const html = wrapHtmlContent('Email Verified', 'Email Verified Successfully', content, '#047857', 'Browse Properties', 'https://buildexx.app/property-list');
    return sendResendEmail(SENDERS.onboarding, toEmail, 'Your email has been verified – Buildex', html);
}

/**
 * 3. Forgot Password Request
 */
export async function sendPasswordResetEmail(toEmail, resetLink, userName = 'User') {
    const content = `
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background-color: #e53e3e; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in <strong>15 minutes</strong>.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
    `;

    const html = wrapHtmlContent('Password Reset', 'Reset Your Password', content, '#e53e3e', null);
    return sendResendEmail(SENDERS.security, toEmail, 'Reset your password – Buildex', html);
}

/**
 * 4. Password Reset Success
 */
export async function sendPasswordChangedEmail(toEmail, userName) {
    const content = `
        <p>Hello ${userName},</p>
        <p>Your password has been successfully changed.</p>
        <div class="highlight-box" style="border-left-color: #047857;">
            <p style="margin:0"><strong>Security Notice:</strong> If you did not make this change, please contact us immediately.</p>
        </div>
        <p>You can now login with your new password.</p>
    `;

    const html = wrapHtmlContent('Password Changed', 'Password Changed Successfully', content, '#047857', 'Login Now', 'https://buildexx.app/login');
    return sendResendEmail(SENDERS.security, toEmail, 'Your password was changed – Buildex', html);
}

/**
 * 5. Welcome Email
 */
export async function sendWelcomeEmail(toEmail, userName, role = 'user') {
    const roleMessage = role === 'builder'
        ? '<p>As a builder, you can list properties, manage enquiries, and connect with buyers.</p>'
        : '<p>Explore premium properties, save favorites, and connect with trusted builders.</p>';

    const content = `
        <p>Dear ${userName},</p>
        <p>Welcome to the <strong>Buildex</strong> family! We're excited to have you on board.</p>
        <div class="highlight-box">
            <p style="margin:0">Account Type: <strong style="text-transform:uppercase;">${role}</strong></p>
        </div>
        ${roleMessage}
        <p>Start your premium real estate journey today!</p>
    `;

    const html = wrapHtmlContent('Welcome', 'Welcome to Buildex! 🏠', content, '#1a365d', 'Explore Dashboard', 'https://buildexx.app');
    return sendResendEmail(SENDERS.onboarding, toEmail, 'Welcome to Buildex 🏡', html);
}

// ============================================
// PROPERTY & BUILDER EMAILS
// ============================================

/**
 * 6. Property Submitted for Review
 */
export async function sendPropertySubmittedEmail(toEmail, builderName, propertyName) {
    const content = `
        <p>Dear ${builderName},</p>
        <p>Your property has been submitted successfully and is now under review.</p>
        <table class="data-table">
            <tr><td class="data-cell label-cell">Property</td><td class="data-cell value-cell">${propertyName}</td></tr>
            <tr><td class="data-cell label-cell">Status</td><td class="data-cell value-cell"><span class="status-badge badge-warning">UNDER REVIEW</span></td></tr>
        </table>
        <p>Our team will review your property within 24-48 hours.</p>
    `;

    const html = wrapHtmlContent('Property Submitted', 'Property Submitted for Review', content, '#f59e0b', 'View Dashboard', 'https://buildexx.app/builder-dashboard');
    return sendResendEmail(SENDERS.notifications, toEmail, 'Property submitted successfully – Buildex', html);
}

/**
 * 7. Property Approved
 */
export async function sendPropertyApprovedEmail(toEmail, builderName, propertyName, propertyId) {
    const content = `
        <p>Dear ${builderName},</p>
        <p>Great news! Your property has been approved and is now live on Buildex.</p>
        <table class="data-table">
            <tr><td class="data-cell label-cell">Property</td><td class="data-cell value-cell">${propertyName}</td></tr>
            <tr><td class="data-cell label-cell">Status</td><td class="data-cell value-cell"><span class="status-badge badge-success">LIVE</span></td></tr>
        </table>
        <p>Potential buyers can now view and enquire about your property!</p>
    `;

    const html = wrapHtmlContent('Property Approved', 'Your Property is Live! 🎉', content, '#047857', 'View Property', `https://buildexx.app/property/${propertyId}`);
    return sendResendEmail(SENDERS.notifications, toEmail, 'Your property is live 🎉 – Buildex', html);
}

/**
 * 8. Property Rejected
 */
export async function sendPropertyRejectedEmail(toEmail, builderName, propertyName, reason) {
    const content = `
        <p>Dear ${builderName},</p>
        <p>Unfortunately, your property submission requires some changes before it can be approved.</p>
        <table class="data-table">
            <tr><td class="data-cell label-cell">Property</td><td class="data-cell value-cell">${propertyName}</td></tr>
            <tr><td class="data-cell label-cell">Status</td><td class="data-cell value-cell"><span style="background:#fef2f2; color:#dc2626; padding:4px 12px; border-radius:20px; font-size:12px;">NEEDS CHANGES</span></td></tr>
        </table>
        <div class="highlight-box" style="border-left-color: #dc2626; background-color: #fef2f2;">
            <p style="margin:0"><strong>Reason:</strong> ${reason || 'Please review and update property details.'}</p>
        </div>
        <p>Please make the necessary changes and resubmit.</p>
    `;

    const html = wrapHtmlContent('Property Rejected', 'Property Needs Changes', content, '#dc2626', 'Edit Property', 'https://buildexx.app/builder-dashboard');
    return sendResendEmail(SENDERS.notifications, toEmail, 'Property needs changes – Buildex', html);
}

// ============================================
// ENQUIRY / BOOKING EMAILS
// ============================================

/**
 * 9. Enquiry Confirmation (User)
 */
export async function sendEnquiryConfirmationEmail(toEmail, userName, propertyName, builderName) {
    const content = `
        <p>Dear ${userName},</p>
        <p>Your enquiry has been sent successfully. The builder will contact you soon.</p>
        <table class="data-table">
            <tr><td class="data-cell label-cell">Property</td><td class="data-cell value-cell">${propertyName}</td></tr>
            <tr><td class="data-cell label-cell">Builder</td><td class="data-cell value-cell">${builderName}</td></tr>
        </table>
        <p>Expect a response within 24-48 hours.</p>
    `;

    const html = wrapHtmlContent('Enquiry Sent', 'We Received Your Enquiry', content, '#3b82f6', 'Browse More Properties', 'https://buildexx.app/property-list');
    return sendResendEmail(SENDERS.notifications, toEmail, 'We received your enquiry – Buildex', html);
}

/**
 * 10. New Enquiry Notification (Builder)
 */
export async function sendNewEnquiryEmail(toEmail, builderName, customerName, customerEmail, customerPhone, propertyName, message) {
    const content = `
        <p>Dear ${builderName},</p>
        <p>You have received a new enquiry for <strong>${propertyName}</strong>.</p>
        <table class="data-table">
            <tr><td class="data-cell label-cell">Customer</td><td class="data-cell value-cell">${customerName}</td></tr>
            <tr><td class="data-cell label-cell">Email</td><td class="data-cell value-cell"><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
            <tr><td class="data-cell label-cell">Phone</td><td class="data-cell value-cell">${customerPhone}</td></tr>
        </table>
        <div style="background: #fff; padding: 15px; border-left: 4px solid #805ad5; font-style: italic; background-color:#faf5ff; margin: 20px 0;">
            "${message}"
        </div>
        <p>Respond promptly to convert this lead!</p>
    `;

    const html = wrapHtmlContent('New Enquiry', 'New Lead Received! 📬', content, '#805ad5', 'View in Dashboard', 'https://buildexx.app/builder-dashboard');
    return sendResendEmail(SENDERS.notifications, toEmail, `New enquiry for ${propertyName} – Buildex`, html, customerEmail);
}

/**
 * 11. Booking Confirmation (User)
 */
export async function sendBookingConfirmationEmail(toEmail, userName, propertyName, bookingType, amount, builderName, transactionId) {
    const content = `
        <p>Dear ${userName},</p>
        <p>Your booking has been confirmed! 🎉</p>
        <div style="text-align: center; margin: 25px 0;">
            <div style="background-color: #047857; color: white; padding: 15px 40px; border-radius: 50px; display: inline-block; font-weight: bold;">
                ${bookingType.toUpperCase()} CONFIRMED
            </div>
        </div>
        <table class="data-table">
            <tr><td class="data-cell label-cell">Property</td><td class="data-cell value-cell">${propertyName}</td></tr>
            <tr><td class="data-cell label-cell">Amount</td><td class="data-cell value-cell">₹${Number(amount).toLocaleString('en-IN')}</td></tr>
            <tr><td class="data-cell label-cell">Transaction ID</td><td class="data-cell value-cell" style="font-family:monospace">${transactionId}</td></tr>
            <tr><td class="data-cell label-cell">Builder</td><td class="data-cell value-cell">${builderName}</td></tr>
        </table>
        <p>Thank you for choosing Buildex!</p>
    `;

    const html = wrapHtmlContent('Booking Confirmed', 'Booking Confirmed! 🎉', content, '#047857', 'View Dashboard', 'https://buildexx.app/user-dashboard');
    return sendResendEmail(SENDERS.notifications, toEmail, 'Booking confirmed – Buildex', html);
}

/**
 * 12. Booking Notification (Builder)
 */
export async function sendBookingNotificationEmail(toEmail, builderName, customerName, propertyName, bookingType, amount) {
    const content = `
        <p>Dear ${builderName},</p>
        <p>Great news! You have a new booking for your property.</p>
        <div class="highlight-box" style="border-left-color: #047857;">
            <h2 style="margin:0; color:#047857;">₹${Number(amount).toLocaleString('en-IN')}</h2>
            <p style="margin:5px 0 0; font-size:12px; color:#718096;">PAYMENT RECEIVED</p>
        </div>
        <table class="data-table">
            <tr><td class="data-cell label-cell">Property</td><td class="data-cell value-cell">${propertyName}</td></tr>
            <tr><td class="data-cell label-cell">Customer</td><td class="data-cell value-cell">${customerName}</td></tr>
            <tr><td class="data-cell label-cell">Type</td><td class="data-cell value-cell">${bookingType}</td></tr>
        </table>
    `;

    const html = wrapHtmlContent('New Booking', 'New Booking Received! 💰', content, '#047857', 'View Dashboard', 'https://buildexx.app/builder-dashboard');
    return sendResendEmail(SENDERS.notifications, toEmail, 'New booking confirmed – Buildex', html);
}

// ============================================
// ADMIN EMAILS
// ============================================

/**
 * 13. New Property Awaiting Approval (Admin)
 */
export async function sendAdminPropertyPendingEmail(adminEmail, builderName, propertyName, propertyId) {
    const content = `
        <p>A new property has been submitted and is awaiting approval.</p>
        <table class="data-table">
            <tr><td class="data-cell label-cell">Property</td><td class="data-cell value-cell">${propertyName}</td></tr>
            <tr><td class="data-cell label-cell">Builder</td><td class="data-cell value-cell">${builderName}</td></tr>
            <tr><td class="data-cell label-cell">Status</td><td class="data-cell value-cell"><span class="status-badge badge-warning">PENDING REVIEW</span></td></tr>
        </table>
    `;

    const html = wrapHtmlContent('Property Pending', 'New Property Awaiting Approval', content, '#f59e0b', 'Review Property', `https://buildexx.app/admin-dashboard?property=${propertyId}`);
    return sendResendEmail(SENDERS.admin, adminEmail, 'New property pending approval – Buildex Admin', html);
}

/**
 * 14. Legal Document Uploaded (Admin)
 */
export async function sendAdminLegalDocUploadedEmail(adminEmail, builderName, propertyName, documentType) {
    const content = `
        <p>A legal document has been uploaded and requires verification.</p>
        <table class="data-table">
            <tr><td class="data-cell label-cell">Property</td><td class="data-cell value-cell">${propertyName}</td></tr>
            <tr><td class="data-cell label-cell">Builder</td><td class="data-cell value-cell">${builderName}</td></tr>
            <tr><td class="data-cell label-cell">Document Type</td><td class="data-cell value-cell">${documentType}</td></tr>
        </table>
    `;

    const html = wrapHtmlContent('Document Uploaded', 'Legal Document Awaiting Verification', content, '#3b82f6', 'Review Document', 'https://buildexx.app/admin-dashboard');
    return sendResendEmail(SENDERS.admin, adminEmail, 'Legal document uploaded for verification – Buildex Admin', html);
}

/**
 * 15. New Complaint Reported (Admin)
 */
export async function sendAdminComplaintEmail(adminEmail, userName, propertyName, issue) {
    const content = `
        <p>A new complaint has been reported.</p>
        <table class="data-table">
            <tr><td class="data-cell label-cell">Property</td><td class="data-cell value-cell">${propertyName}</td></tr>
            <tr><td class="data-cell label-cell">User</td><td class="data-cell value-cell">${userName}</td></tr>
            <tr><td class="data-cell label-cell">Issue</td><td class="data-cell value-cell">${issue}</td></tr>
        </table>
    `;

    const html = wrapHtmlContent('New Complaint', 'New Complaint Reported', content, '#dc2626', 'Review Complaint', 'https://buildexx.app/admin-dashboard');
    return sendResendEmail(SENDERS.admin, adminEmail, 'New complaint reported – Buildex Admin', html);
}

/**
 * 15. Suspicious Activity Alert
 */
export async function sendSuspiciousActivityEmail(toEmail, userName, activityType, ipAddress) {
    const content = `
        <p>Hello ${userName || 'Admin'},</p>
        <p>We detected suspicious activity on your Buildex account.</p>
        <div class="highlight-box" style="border-left-color: #dc2626; background-color: #fef2f2;">
            <p style="margin:0"><strong>Activity:</strong> ${activityType}</p>
            ${ipAddress ? `<p style="margin:5px 0 0"><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
        </div>
        <p>If this was you, you can safely ignore this email. Otherwise, please secure your account immediately.</p>
    `;

    const html = wrapHtmlContent('Security Alert', '⚠️ Suspicious Activity Detected', content, '#dc2626', 'Secure Account', 'https://buildexx.app/login');
    return sendResendEmail(SENDERS.security, toEmail, '⚠️ Suspicious activity alert – Buildex', html);
}

// ============================================
// RENT & PAYMENT EMAILS
// ============================================

/**
 * 16. Rent Request Email (Builder)
 */
export async function sendRentRequestEmail(toEmail, builderName, customerName, customerEmail, customerPhone, propertyName, moveInDate, message) {
    const content = `
        <p>Dear ${builderName},</p>
        <p>New rental application for <strong>${propertyName}</strong>.</p>
        <table class="data-table">
            <tr><td class="data-cell label-cell">Applicant</td><td class="data-cell value-cell">${customerName}</td></tr>
            <tr><td class="data-cell label-cell">Email</td><td class="data-cell value-cell"><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
            <tr><td class="data-cell label-cell">Phone</td><td class="data-cell value-cell">${customerPhone}</td></tr>
            <tr><td class="data-cell label-cell">Move-in Date</td><td class="data-cell value-cell">${moveInDate}</td></tr>
        </table>
        <div style="background: #fff; padding: 15px; border-left: 4px solid #dd6b20; background-color:#fffaf0; font-style: italic; margin: 20px 0;">
            "${message}"
        </div>
    `;

    const html = wrapHtmlContent('Rent Application', 'New Rental Application', content, '#dd6b20', 'View Dashboard', 'https://buildexx.app/builder-dashboard');
    return sendResendEmail(SENDERS.notifications, toEmail, `Rent application for ${propertyName} – Buildex`, html, customerEmail);
}

/**
 * 17. Payment Success Email (User)
 */
export async function sendPaymentSuccessEmail(toEmail, userName, propertyName, amount, transactionId) {
    const content = `
        <p>Dear ${userName},</p>
        <p>Your payment has been processed successfully.</p>
        <div style="text-align: center; margin: 25px 0;">
            <div style="background-color: #047857; color: white; padding: 15px 40px; border-radius: 50px; display: inline-block; font-weight: bold; box-shadow: 0 4px 6px rgba(4, 120, 87, 0.2);">
                PAID: ₹${Number(amount).toLocaleString('en-IN')}
            </div>
        </div>
        <table class="data-table">
            <tr><td class="data-cell label-cell">Property</td><td class="data-cell value-cell">${propertyName}</td></tr>
            <tr><td class="data-cell label-cell">Transaction ID</td><td class="data-cell value-cell" style="font-family:monospace">${transactionId}</td></tr>
            <tr><td class="data-cell label-cell">Date</td><td class="data-cell value-cell">${new Date().toLocaleDateString('en-IN')}</td></tr>
        </table>
    `;

    const html = wrapHtmlContent('Payment Success', 'Payment Confirmed ✓', content, '#047857', 'View Receipt', 'https://buildexx.app/user-dashboard');
    return sendResendEmail(SENDERS.notifications, toEmail, `Payment receipt for ${propertyName} – Buildex`, html);
}

/**
 * 18. Payment Received Email (Builder)
 */
export async function sendPaymentReceivedEmail(toEmail, builderName, customerName, propertyName, amount) {
    const content = `
        <p>Dear ${builderName},</p>
        <p>You have received a payment for <strong>${propertyName}</strong>.</p>
        <div class="highlight-box" style="border-left-color: #047857;">
            <h2 style="margin:0; color:#047857;">₹${Number(amount).toLocaleString('en-IN')}</h2>
            <p style="margin:5px 0 0; font-size:12px; color:#718096;">CREDITED TO YOUR ACCOUNT</p>
        </div>
        <table class="data-table">
            <tr><td class="data-cell label-cell">From</td><td class="data-cell value-cell">${customerName}</td></tr>
            <tr><td class="data-cell label-cell">Date</td><td class="data-cell value-cell">${new Date().toLocaleDateString('en-IN')}</td></tr>
        </table>
    `;

    const html = wrapHtmlContent('Payment Received', 'Payment Notification', content, '#047857', 'View Dashboard', 'https://buildexx.app/builder-dashboard');
    return sendResendEmail(SENDERS.notifications, toEmail, `Payment received for ${propertyName} – Buildex`, html);
}

/**
 * 19. Test Email
 */
export async function sendTestEmail(toEmail) {
    const content = `
        <p>Hello,</p>
        <p>This is a <strong>test email</strong> to verify that the Buildex email system is working correctly.</p>
        <div class="highlight-box">
            <p style="margin:0"><strong>Status:</strong> <span class="status-badge badge-success">OPERATIONAL</span></p>
        </div>
        <p>If you see this branded template, Resend integration is successful!</p>
    `;

    const html = wrapHtmlContent('System Test', 'Email System Test', content, '#3b82f6', 'Visit Buildex', 'https://buildexx.app');
    return sendResendEmail(SENDERS.notifications, toEmail, 'Buildex Email System Test', html);
}

// ============================================
// LEGACY COMPATIBILITY
// ============================================

/**
 * Generic send email function for backward compatibility
 */
export async function sendEmail(to, templateName, data) {
    console.log(`📧 [EMAIL] Template: ${templateName} to: ${to}`);

    try {
        switch (templateName) {
            case 'paymentConfirmationUser':
                return sendPaymentSuccessEmail(to, data.userName, data.propertyName, data.amount, data.transactionId);
            case 'paymentNotificationBuilder':
                return sendPaymentReceivedEmail(to, data.builderName, data.userName, data.propertyName, data.amount);
            case 'enquiryNotification':
                return sendNewEnquiryEmail(to, data.builderName, data.userName, data.userEmail, data.userPhone, data.propertyName, data.message);
            case 'welcome':
                return sendWelcomeEmail(to, data.userName, data.role || 'user');
            default:
                console.warn(`Unknown email template: ${templateName}`);
                return { success: false, error: `Unknown template: ${templateName}` };
        }
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send payment emails (legacy compatibility)
 */
export async function sendPaymentEmails(paymentData) {
    const { userId, builderId, propertyId, amount, paymentType, transactionId } = paymentData;

    try {
        const [user] = await sql`SELECT * FROM users WHERE id = ${userId}`;
        const [builder] = await sql`SELECT * FROM users WHERE id = ${builderId}`;
        const [property] = await sql`SELECT * FROM properties WHERE id = ${propertyId}`;

        if (!user || !builder || !property) {
            console.error('Missing data for payment emails');
            return;
        }

        // Email to user
        await sendPaymentSuccessEmail(
            user.email,
            user.full_name || user.username,
            property.title || property.name,
            amount,
            transactionId
        );

        // Email to builder
        await sendPaymentReceivedEmail(
            builder.email,
            builder.full_name || builder.username,
            user.full_name || user.username,
            property.title || property.name,
            amount
        );

    } catch (error) {
        console.error('Error sending payment emails:', error);
    }
}

export default {
    // Auth emails
    sendOtpEmail,
    sendEmailVerifiedEmail,
    sendPasswordResetEmail,
    sendPasswordChangedEmail,
    sendWelcomeEmail,

    // Property emails
    sendPropertySubmittedEmail,
    sendPropertyApprovedEmail,
    sendPropertyRejectedEmail,

    // Enquiry/Booking emails
    sendEnquiryConfirmationEmail,
    sendNewEnquiryEmail,
    sendBookingConfirmationEmail,
    sendBookingNotificationEmail,
    sendRentRequestEmail,

    // Payment emails
    sendPaymentSuccessEmail,
    sendPaymentReceivedEmail,

    // Admin emails
    sendAdminPropertyPendingEmail,
    sendAdminLegalDocUploadedEmail,
    sendSuspiciousActivityEmail,

    // Utilities
    sendTestEmail,
    sendEmail,
    sendPaymentEmails
};
