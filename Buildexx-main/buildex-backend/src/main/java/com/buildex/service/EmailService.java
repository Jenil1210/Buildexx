package com.buildex.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

/**
 * Email Service using Resend API
 * 
 * Sender Emails:
 * - security@buildexx.app - OTP, Password Reset
 * - onboarding@buildexx.app - Welcome, Verification Success
 * - notifications@buildexx.app - Enquiries, Bookings, Property Updates
 * - admin@buildexx.app - Admin Notifications
 */
@Service
@RequiredArgsConstructor
public class EmailService {

        @Value("${resend.api.url}")
        private String RESEND_API_URL;

        @Value("${resend.api.key}")
        private String RESEND_API_KEY;

        // Sender addresses
        private static final String SENDER_SECURITY = "Buildex Security <security@buildexx.app>";
        private static final String SENDER_ONBOARDING = "Buildex <onboarding@buildexx.app>";
        private static final String SENDER_NOTIFICATIONS = "Buildex Notifications <notifications@buildexx.app>";
        private static final String SENDER_ADMIN = "Buildex Admin <admin@buildexx.app>";

        private final RestTemplate restTemplate = new RestTemplate();
        private final JavaMailSender javaMailSender;

        // Premium Template Wrapper with Theme Support
        private String wrapHtmlContent(String heading, String content, String themeColor, String ctaText,
                        String ctaUrl) {
                if (themeColor == null)
                        themeColor = "#D4AF37";

                String ctaButton = (ctaText != null && ctaUrl != null)
                                ? "<div style=\"text-align: center;\"><a href=\"" + ctaUrl
                                                + "\" style=\"display: inline-block; background-color: " + themeColor
                                                + "; color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 25px;\">"
                                                + ctaText + "</a></div>"
                                : "";

                return "<!DOCTYPE html>" +
                                "<html>" +
                                "<head>" +
                                "<meta charset=\"UTF-8\">" +
                                "<style>" +
                                "  body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; }"
                                +
                                "  .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }"
                                +
                                "  .header { background: linear-gradient(135deg, #0B1C30 0%, #1a365d 100%); padding: 40px 0; text-align: center; position: relative; }"
                                +
                                "  .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, "
                                + themeColor + ", #ffffff); }" +
                                "  .brand { color: #D4AF37; font-size: 28px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0; }"
                                +
                                "  .tagline { color: #a0aec0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }"
                                +
                                "  .content { padding: 40px; }" +
                                "  .heading { color: #1a202c; font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #edf2f7; padding-bottom: 15px; }"
                                +
                                "  .text { color: #4a5568; line-height: 1.7; font-size: 16px; }" +
                                "  .footer { background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #edf2f7; }"
                                +
                                "  .footer-text { color: #718096; font-size: 13px; margin: 5px 0; }" +
                                "  .highlight-box { background-color: #f8fafc; border-left: 4px solid " + themeColor
                                + "; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }" +
                                "  .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }" +
                                "  .data-cell { padding: 12px 0; border-bottom: 1px solid #edf2f7; color: #4a5568; }" +
                                "  .label-cell { width: 35%; color: #718096; font-weight: 500; }" +
                                "  .value-cell { font-weight: 600; color: #2d3748; }" +
                                "  .otp-box { text-align: center; margin: 30px 0; }" +
                                "  .otp-code { font-size: 36px; font-weight: 800; color: #2d3748; letter-spacing: 12px; background: #EDF2F7; padding: 20px 40px; border-radius: 12px; display: inline-block; border-bottom: 4px solid "
                                + themeColor + "; }" +
                                "</style>" +
                                "</head>" +
                                "<body>" +
                                "  <div class=\"container\">" +
                                "    <div class=\"header\">" +
                                "      <h1 class=\"brand\">BUILDEX</h1>" +
                                "      <div class=\"tagline\">Premium Real Estate Marketplace</div>" +
                                "    </div>" +
                                "    <div class=\"content\">" +
                                "      <h2 class=\"heading\">" + heading + "</h2>" +
                                "      <div class=\"text\">" + content + "</div>" +
                                ctaButton +
                                "    </div>" +
                                "    <div class=\"footer\">" +
                                "      <p class=\"footer-text\">&copy; 2026 Buildex Real Estate. All rights reserved.</p>"
                                +
                                "      <p class=\"footer-text\">support@buildexx.app</p>" +
                                "    </div>" +
                                "  </div>" +
                                "</body>" +
                                "</html>";
        }

        /**
         * Send email via Resend API
         */
        private boolean sendResendEmail(String from, String to, String subject, String html) {
                try {
                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);
                        headers.set("Authorization", "Bearer " + RESEND_API_KEY);

                        Map<String, Object> body = new HashMap<>();
                        body.put("from", from);
                        body.put("to", List.of(to));
                        body.put("subject", subject);
                        body.put("html", html);

                        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
                        ResponseEntity<String> response = restTemplate.postForEntity(RESEND_API_URL, request,
                                        String.class);

                        if (response.getStatusCode().is2xxSuccessful()) {
                                System.out.println("✅ Email sent via Resend: " + subject + " to " + to);
                                return true;
                        } else {
                                System.err.println("❌ Resend API error: " + response.getBody());
                                return false;
                        }
                } catch (Exception e) {
                        System.err.println("❌ Failed to send email via Resend: " + e.getMessage());
                        e.printStackTrace();
                        return false;
                }
        }

        /**
         * Legacy method for backward compatibility
         */
        @Async
        public void sendHtmlEmail(String toEmail, String subject, String content) {
                sendResendEmail(SENDER_NOTIFICATIONS, toEmail, subject, content);
        }

        /**
         * Test Email
         */
        public void sendTestEmail(String toEmail) {
                String content = "<p>Hello,</p>" +
                                "<p>This is a <strong>Test Email</strong> to verify that the Buildex email system is working correctly.</p>"
                                +
                                "<div class=\"highlight-box\">" +
                                "  <p style=\"margin:0\"><strong>Status:</strong> <span style=\"background:#d1fae5; color:#047857; padding:4px 12px; border-radius:20px; font-size:12px;\">OPERATIONAL</span></p>"
                                +
                                "</div>" +
                                "<p>If you see this branded template, Resend integration is successful!</p>";

                String html = wrapHtmlContent("Email System Test", content, "#3182ce", "Visit Buildex",
                                "https://buildexx.app");
                sendResendEmail(SENDER_NOTIFICATIONS, toEmail, "Buildex System Test", html);
        }

        /**
         * 1. OTP Email
         */
        public void sendOtpEmail(String toEmail, String otp) {
                String content = "<p>Hello,</p>" +
                                "<p>Thank you for registering with Buildex. Please use the code below to verify your email address:</p>"
                                +
                                "<div class=\"otp-box\">" +
                                "  <div class=\"otp-code\">" + otp + "</div>" +
                                "</div>" +
                                "<p>This code will expire in <strong>10 minutes</strong>.</p>" +
                                "<p>If you didn't request this verification, please ignore this email.</p>";

                String html = wrapHtmlContent("Verify Your Email Address", content, "#D4AF37", null, null);
                sendResendEmail(SENDER_SECURITY, toEmail, "Verify your email – Buildex", html);
        }

        /**
         * 2. Welcome Email
         */
        public void sendWelcomeEmail(String toEmail, String name, String role) {
                String roleMessage = role.equalsIgnoreCase("builder")
                                ? "<p>As a builder, you can list properties, manage enquiries, and connect with buyers.</p>"
                                : "<p>Explore premium properties, save favorites, and connect with trusted builders.</p>";

                String content = "<p>Dear <strong>" + name + "</strong>,</p>" +
                                "<p>Welcome to the <strong>Buildex</strong> family! Your account has been successfully verified.</p>"
                                +
                                "<div class=\"highlight-box\">" +
                                "  <p style=\"margin:0\">Account Type: <strong style=\"text-transform:uppercase;\">"
                                + role + "</strong></p>" +
                                "</div>" +
                                roleMessage +
                                "<p>Start your premium real estate journey today!</p>";

                String html = wrapHtmlContent("Welcome to Buildex! 🏠", content, "#1a365d", "Explore Dashboard",
                                "https://buildexx.app");
                sendResendEmail(SENDER_ONBOARDING, toEmail, "Welcome to Buildex 🏡", html);
        }

        /**
         * 3. Enquiry Received (To Builder)
         */
        @Async
        public void sendEnquiryReceivedEmail(String builderEmail, String builderName, String customerName,
                        String customerEmail, String customerPhone, String propertyName, String message) {
                String content = "<p>Dear " + builderName + ",</p>" +
                                "<p>You have a new enquiry for <strong>" + propertyName + "</strong>.</p>" +
                                "<table class=\"data-table\">" +
                                "  <tr><td class=\"data-cell label-cell\">Name</td><td class=\"data-cell value-cell\">"
                                + customerName + "</td></tr>" +
                                "  <tr><td class=\"data-cell label-cell\">Email</td><td class=\"data-cell value-cell\"><a href=\"mailto:"
                                + customerEmail + "\">" + customerEmail + "</a></td></tr>" +
                                "  <tr><td class=\"data-cell label-cell\">Phone</td><td class=\"data-cell value-cell\">"
                                + customerPhone + "</td></tr>" +
                                "</table>" +
                                "<div style=\"background: #fff; padding: 15px; border-left: 4px solid #805ad5; font-style: italic; background-color:#faf5ff; margin: 20px 0;\">"
                                +
                                "  \"" + message + "\"" +
                                "</div>" +
                                "<p>Respond promptly to convert this lead!</p>";

                String html = wrapHtmlContent("New Lead Received! 📬", content, "#805ad5", "View Dashboard",
                                "https://buildexx.app/builder-dashboard");
                sendResendEmail(SENDER_NOTIFICATIONS, builderEmail, "New enquiry for " + propertyName + " – Buildex",
                                html);
        }

        /**
         * 4. Payment Success Receipt (To User)
         */
        @Async
        public void sendPaymentSuccessEmail(String userEmail, String userName, String propertyName, String amount,
                        String transactionId) {
                String content = "<p>Dear " + userName + ",</p>" +
                                "<p>Your payment has been processed successfully.</p>" +
                                "<div style=\"text-align: center; margin: 25px 0;\">" +
                                "  <div style=\"background-color: #047857; color: white; padding: 15px 40px; border-radius: 50px; display: inline-block; font-weight: bold;\">"
                                +
                                "    PAID: ₹" + amount +
                                "  </div>" +
                                "</div>" +
                                "<table class=\"data-table\">" +
                                "  <tr><td class=\"data-cell label-cell\">Property</td><td class=\"data-cell value-cell\">"
                                + propertyName + "</td></tr>" +
                                "  <tr><td class=\"data-cell label-cell\">Transaction ID</td><td class=\"data-cell value-cell\" style=\"font-family:monospace\">"
                                + transactionId + "</td></tr>" +
                                "  <tr><td class=\"data-cell label-cell\">Date</td><td class=\"data-cell value-cell\">"
                                + java.time.LocalDate.now() + "</td></tr>" +
                                "</table>";

                String html = wrapHtmlContent("Payment Confirmed ✓", content, "#047857", "View Receipt",
                                "https://buildexx.app/user-dashboard");
                sendResendEmail(SENDER_NOTIFICATIONS, userEmail, "Payment receipt for " + propertyName + " – Buildex",
                                html);
        }

        /**
         * 5. Payment Received (To Builder)
         */
        @Async
        public void sendPaymentReceivedEmail(String builderEmail, String builderName, String propertyName,
                        String amount, String customerName) {
                String content = "<p>Dear " + builderName + ",</p>" +
                                "<p>You have received a payment for <strong>" + propertyName + "</strong>.</p>" +
                                "<div class=\"highlight-box\" style=\"border-left-color: #047857;\">" +
                                "  <h2 style=\"margin:0; color:#047857;\">₹" + amount + "</h2>" +
                                "  <p style=\"margin:5px 0 0; font-size:12px; color:#718096;\">CREDITED TO YOUR ACCOUNT</p>"
                                +
                                "</div>" +
                                "<table class=\"data-table\">" +
                                "  <tr><td class=\"data-cell label-cell\">From</td><td class=\"data-cell value-cell\">"
                                + customerName + "</td></tr>" +
                                "  <tr><td class=\"data-cell label-cell\">Date</td><td class=\"data-cell value-cell\">"
                                + java.time.LocalDate.now() + "</td></tr>" +
                                "</table>";

                String html = wrapHtmlContent("Payment Notification", content, "#047857", "View Dashboard",
                                "https://buildexx.app/builder-dashboard");
                sendResendEmail(SENDER_NOTIFICATIONS, builderEmail,
                                "Payment received for " + propertyName + " – Buildex", html);
        }

        /**
         * 6. Rent Request (To Builder)
         */
        @Async
        public void sendRentRequestEmail(String builderEmail, String builderName, String customerName,
                        String email, String phone, String propertyName, String moveInDate, String message) {
                String content = "<p>Dear " + builderName + ",</p>" +
                                "<p>New rental application for <strong>" + propertyName + "</strong>.</p>" +
                                "<table class=\"data-table\">" +
                                "  <tr><td class=\"data-cell label-cell\">Applicant</td><td class=\"data-cell value-cell\">"
                                + customerName + "</td></tr>" +
                                "  <tr><td class=\"data-cell label-cell\">Email</td><td class=\"data-cell value-cell\"><a href=\"mailto:"
                                + email + "\">" + email + "</a></td></tr>" +
                                "  <tr><td class=\"data-cell label-cell\">Phone</td><td class=\"data-cell value-cell\">"
                                + phone + "</td></tr>" +
                                "  <tr><td class=\"data-cell label-cell\">Move-in Date</td><td class=\"data-cell value-cell\">"
                                + moveInDate + "</td></tr>" +
                                "</table>" +
                                "<div style=\"background: #fff; padding: 15px; border-left: 4px solid #dd6b20; background-color:#fffaf0; font-style: italic; margin: 20px 0;\">"
                                +
                                "  \"" + message + "\"" +
                                "</div>";

                String html = wrapHtmlContent("New Rental Application", content, "#dd6b20", "View Dashboard",
                                "https://buildexx.app/builder-dashboard");
                sendResendEmail(SENDER_NOTIFICATIONS, builderEmail,
                                "Rent application for " + propertyName + " – Buildex", html);
        }

        /**
         * 7. Password Reset Email
         */
        public void sendPasswordResetEmail(String toEmail, String resetLink, String userName) {
                String content = "<p>Hello " + (userName != null ? userName : "") + ",</p>" +
                                "<p>We received a request to reset your password. Click the button below to create a new password:</p>"
                                +
                                "<div style=\"text-align: center; margin: 30px 0;\">" +
                                "  <a href=\"" + resetLink
                                + "\" style=\"display: inline-block; background-color: #e53e3e; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;\">Reset Password</a>"
                                +
                                "</div>" +
                                "<p>This link will expire in <strong>15 minutes</strong>.</p>" +
                                "<p>If you didn't request a password reset, you can safely ignore this email.</p>";

                String html = wrapHtmlContent("Reset Your Password", content, "#e53e3e", null, null);
                sendResendEmail(SENDER_SECURITY, toEmail, "Reset your password – Buildex", html);
        }

        /**
         * 8. Password Changed Email
         */
        public void sendPasswordChangedEmail(String toEmail, String userName) {
                String content = "<p>Hello " + (userName != null ? userName : "") + ",</p>" +
                                "<p>Your password has been successfully changed.</p>" +
                                "<div class=\"highlight-box\" style=\"border-left-color: #047857;\">" +
                                "  <p style=\"margin:0\"><strong>Security Notice:</strong> If you did not make this change, please contact us immediately.</p>"
                                +
                                "</div>" +
                                "<p>You can now login with your new password.</p>";

                String html = wrapHtmlContent("Password Changed Successfully", content, "#047857", "Login Now",
                                "https://buildexx.app/login");
                sendResendEmail(SENDER_SECURITY, toEmail, "Your password was changed – Buildex", html);
        }

        /**
         * 9. Enquiry Confirmation (To User)
         */
        @Async
        public void sendEnquiryConfirmationEmail(String userEmail, String userName, String propertyName) {
                String content = "<p>Dear <strong>" + userName + "</strong>,</p>" +
                                "<p>We've received your enquiry for <strong>" + propertyName + "</strong>.</p>" +
                                "<p>The builder has been notified and will get in touch with you shortly via your provided contact details.</p>"
                                +
                                "<div class=\"highlight-box\">" +
                                "  <p style=\"margin:0\">Thank you for choosing Buildex for your property search.</p>" +
                                "</div>";

                String html = wrapHtmlContent("Enquiry Received", content, "#3182ce", "Browse More Properties",
                                "https://buildexx.app/properties");
                sendResendEmail(SENDER_NOTIFICATIONS, userEmail, "Confirmation: Enquiry for " + propertyName, html);
        }

    /**
     * 10. Visit Scheduled (To Builder)
     */
    @Async
        public void sendVisitScheduledEmail(String builderEmail, String builderName, String customerName,
                        String customerEmail, String customerPhone, String propertyName, String visitDate, String message) {
                String content = "<p>Dear " + builderName + ",</p>" +
                                "<p>A site visit has been scheduled for <strong>" + propertyName + "</strong>.</p>" +
                                "<table class=\"data-table\">" +
                                "  <tr><td class=\"data-cell label-cell\">Visitor</td><td class=\"data-cell value-cell\">"
                                + customerName + "</td></tr>" +
                                "  <tr><td class=\"data-cell label-cell\">Visit Date</td><td class=\"data-cell value-cell\"><strong>"
                                + visitDate + "</strong></td></tr>" +
                                "  <tr><td class=\"data-cell label-cell\">Contact</td><td class=\"data-cell value-cell\">"
                                + customerPhone + "</td></tr>" +
                                "</table>" +
                                "<div style=\"background: #fff; padding: 15px; border-left: 4px solid #3182ce; background-color:#ebf8ff; font-style: italic; margin: 20px 0;\">"
                                +
                                "  \"" + message + "\"" +
                                "</div>" +
                                "<p>Please ensure someone is available at the site to assist the visitor.</p>";

                String html = wrapHtmlContent("Site Visit Scheduled! 🗓️", content, "#3182ce", "View Details",
                                "https://buildexx.app/builder-dashboard");
                sendResendEmail(SENDER_NOTIFICATIONS, builderEmail, "Site Visit for " + propertyName + " – Buildex", html);
        }

        /**
         * 11. Visit Confirmation (To User)
         */
        @Async
        public void sendVisitConfirmationEmail(String userEmail, String userName, String propertyName, String visitDate) {
                String content = "<p>Dear <strong>" + userName + "</strong>,</p>" +
                                "<p>Your site visit for <strong>" + propertyName + "</strong> is scheduled for <strong>" + visitDate
                                + "</strong>.</p>" +
                                "<p>The builder has been notified. If there are any changes, they will contact you directly.</p>" +
                                "<div class=\"highlight-box\">" +
                                "  <p style=\"margin:0\">Location details and builder contact info are available in your dashboard.</p>"
                                +
                                "</div>";

                String html = wrapHtmlContent("Site Visit Confirmed", content, "#3182ce", "My Appointments",
                                "https://buildexx.app/user-dashboard");
                sendResendEmail(SENDER_NOTIFICATIONS, userEmail, "Confirmed: Site Visit for " + propertyName, html);
        }

    /**
     * 12. Complaint/Report Notification (To Admin/Builder)
     */
    public void sendComplaintNotificationEmail(String recipientEmail, String recipientName, String propertyName,
                        String issueType, String description) {
                String content = "<p>Dear " + recipientName + ",</p>" +
                                "<p>A new report/complaint has been filed for <strong>" + propertyName + "</strong>.</p>" +
                                "<div class=\"highlight-box\" style=\"border-left-color: #e53e3e;\">" +
                                "  <p style=\"margin:0\"><strong>Issue:</strong> " + issueType + "</p>" +
                                "</div>" +
                                "<p><strong>Description:</strong></p>" +
                                "<div style=\"background: #fff5f5; padding: 15px; border-radius:8px; border:1px solid #feb2b2; margin-top:10px;\">"
                                +
                                description +
                                "</div>";

                String html = wrapHtmlContent("Property Report Filed", content, "#e53e3e", "Review Report",
                                "https://buildexx.app/admin/complaints");
                sendResendEmail(SENDER_ADMIN, recipientEmail, "Report for " + propertyName + " – Buildex", html);
        }

    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String attachmentName) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(SENDER_NOTIFICATIONS);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            if (attachment != null && attachmentName != null) {
                helper.addAttachment(attachmentName, new ByteArrayResource(attachment));
            }

            javaMailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send email via SMTP: " + e.getMessage());
            // Fallback to Resend API without attachment? Or just log.
            // For now, just log and continue.
        }
    }
}
