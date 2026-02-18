import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from '../api/db.js';
import { sendOtpEmail, sendNewEnquiryEmail } from '../api/emailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Initialize DB
initializeDatabase().catch(err => console.error('DB Init Error:', err));

// In-memory store for OTPs (for demonstration/MVP)
const otpStore = new Map();

// Helper to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// --- Routes ---

// Register / Send OTP
app.post('/api/auth/register', async (req, res) => {
  const { email, username } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const otp = generateOTP();
  otpStore.set(email, { otp, timestamp: Date.now(), userData: req.body });

  try {
    const result = await sendOtpEmail(email, otp, username || 'User');

    if (result.success) {
      console.log(`✅ OTP sent to ${email}`);
      res.json({ success: true, message: 'OTP sent successfully' });
    } else {
      console.error('❌ Failed to send OTP:', result.error);
      res.status(500).json({ success: false, message: 'Failed to send OTP email', error: result.error });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP email', error: error.message });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  const storedData = otpStore.get(email);

  if (!storedData) {
    return res.status(400).json({ success: false, message: 'OTP expired or not found' });
  }

  if (storedData.otp === otp) {
    // OTP matches
    otpStore.delete(email); // clear OTP

    // Here we would normally insert into the real DB
    // For now, we return the user data to the frontend to "login"
    // In a real app, 'verify-otp' would create the user in the DB

    const user = {
      ...storedData.userData,
      id: Date.now(), // Mock ID
      created_at: new Date().toISOString()
    };

    // Remove password from response
    delete user.password;

    res.json({ success: true, message: 'User verified successfully', user });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

// Send Inquiry Email
app.post('/api/contact/send', async (req, res) => {
  const { to, subject, message, customerDetails } = req.body;
  // to: builder email, customerDetails: { name, email, phone }

  try {
    // Determine recipient - default to generic notification email or specific builder
    const recipient = to || 'notifications@buildexx.app';
    const builderName = 'Builder'; // Generic name if not provided

    // We map the structure to match sendNewEnquiryEmail signature
    // sendNewEnquiryEmail(toEmail, builderName, userName, userEmail, userPhone, propertyName, message)

    const result = await sendNewEnquiryEmail(
      recipient,
      builderName,
      customerDetails.name,
      customerDetails.email,
      customerDetails.phone,
      subject || 'General Inquiry', // Using subject as property name fallback
      message
    );

    if (result.success) {
      res.json({ success: true, message: 'Inquiry sent' });
    } else {
      console.error('Failed to send inquiry:', result.error);
      res.status(500).json({ success: false, message: 'Failed to send inquiry' });
    }
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send inquiry' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Email Service: Resend API Integration Active`);
});
