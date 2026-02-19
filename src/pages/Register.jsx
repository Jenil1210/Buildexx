import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  // Slide Animation Variants
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const [direction, setDirection] = useState(0);

  const nextStep = () => {
    if (validateStep(step)) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      else if (formData.username.length < 3) newErrors.username = 'Min 3 chars';

      if (!formData.email) newErrors.email = 'Email required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';

      if (!formData.password) newErrors.password = 'Required';
      else if (formData.password.length < 6) newErrors.password = 'Min 6 chars';

      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Match password';
    } else if (currentStep === 2) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Name required';
      if (formData.phone && !/^\d{10}$/.test(formData.phone)) newErrors.phone = '10 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleRegisterSuccess = (user) => {
    if (user.role === 'admin') navigate('/admin-dashboard');
    else if (user.role === 'builder') navigate('/builder-dashboard');
    else navigate('/user-dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setLoading(true);
    setErrors({});
    setError('');

    try {
      if (!showOtp) {
        // Step 1 & 2 done: Register (Initiate)
        const result = await register(
          formData.username,
          formData.email,
          formData.password,
          formData.fullName,
          formData.phone,
          formData.role
        );

        if (result.success) {
          if (result.requiresOtp) {
            setShowOtp(true);
            setLoading(false);
          } else {
            handleRegisterSuccess(result.user);
          }
        } else {
          setError(result.message);
          setLoading(false);
        }
      } else {
        // Verify OTP
        const result = await verifyOtp(formData.email, otp);
        if (result.success) {
          handleRegisterSuccess(result.user);
        } else {
          setError(result.message || 'Invalid OTP');
          setLoading(false);
        }
      }
    } catch (err) {
      setError('Failed to register. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#FFF',
    fontSize: '0.95rem',
    width: '100%',
    transition: 'all 0.3s ease'
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#C8A24A';
    e.target.style.background = 'rgba(255,255,255,0.08)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
    e.target.style.background = 'rgba(255,255,255,0.05)';
  };

  return (
    <AuthLayout
      title={showOtp ? "Verify Email" : step === 1 ? "Create Account" : "Profile Details"}
      subtitle={showOtp ? "Enter the OTP sent to your email." : step === 1 ? "Start your journey with us." : "Tell us a bit more about you."}
      quote={{
        text: "Real estate cannot be lost or stolen, nor can it be carried away.",
        author: "Franklin D. Roosevelt"
      }}
    >
      <div style={{ position: 'relative', minHeight: '400px' }}>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-danger d-flex align-items-center" role="alert" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#FCA5A5',
              borderRadius: '10px'
            }}>
            <i className="bi bi-exclamation-circle me-2"></i>
            <div>{error}</div>
          </motion.div>
        )}

        {/* Progress Indicators */}
        {!showOtp && (
          <div className="d-flex justify-content-center mb-4 gap-2">
            <motion.div
              animate={{ width: step === 1 ? 24 : 8, backgroundColor: step >= 1 ? '#C8A24A' : 'rgba(255,255,255,0.2)' }}
              style={{ height: '8px', borderRadius: '4px' }}
            />
            <motion.div
              animate={{ width: step === 2 ? 24 : 8, backgroundColor: step >= 2 ? '#C8A24A' : 'rgba(255,255,255,0.2)' }}
              style={{ height: '8px', borderRadius: '4px' }}
            />
          </div>
        )}

        <AnimatePresence initial={false} custom={direction} mode='wait'>
          {showOtp ? (
            <motion.div
              key="otp"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label text-white-50 small">One Time Password (OTP)</label>
                  <input
                    type="text"
                    className="form-control hover-effect"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    style={{ ...inputStyle, textAlign: 'center', letterSpacing: '5px', fontSize: '1.5rem' }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-100"
                  style={{
                    background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
                    border: 'none',
                    padding: '16px',
                    borderRadius: '12px',
                    color: '#1E293B',
                    fontWeight: '700',
                    fontSize: '1rem',
                    boxShadow: '0 4px 15px rgba(200, 162, 74, 0.3)',
                  }}
                >
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Verify & Register
                </button>
              </form>
            </motion.div>
          ) : step === 1 ? (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              style={{ position: 'absolute', width: '100%' }}
            >
              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label text-white-50 small">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    value={formData.username}
                    onChange={handleChange}
                    style={{ ...inputStyle, borderColor: errors.username ? '#EF4444' : 'rgba(255,255,255,0.1)' }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.username && <div className="text-danger mt-1 small">{errors.username}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-white-50 small">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ ...inputStyle, borderColor: errors.email ? '#EF4444' : 'rgba(255,255,255,0.1)' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                {errors.email && <div className="text-danger mt-1 small">{errors.email}</div>}
              </div>

              <div className="row">
                <div className="col-6 mb-3 position-relative">
                  <label className="form-label text-white-50 small">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ ...inputStyle, paddingRight: '35px', borderColor: errors.password ? '#EF4444' : 'rgba(255,255,255,0.1)' }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '20px', top: '38px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)' }}>
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                  {errors.password && <div className="text-danger mt-1 small">{errors.password}</div>}
                </div>
                <div className="col-6 mb-3 position-relative">
                  <label className="form-label text-white-50 small">Confirm</label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="form-control"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{ ...inputStyle, paddingRight: '35px', borderColor: errors.confirmPassword ? '#EF4444' : 'rgba(255,255,255,0.1)' }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  {errors.confirmPassword && <div className="text-danger mt-1 small" style={{ fontSize: '0.7rem' }}>Mismatch</div>}
                </div>
              </div>

              <button className="btn w-100 mt-2" onClick={nextStep}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#FFF',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}
              >
                Next Step <i className="bi bi-arrow-right ms-2"></i>
              </button>

              <div className="text-center mt-3">
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Already have an account? </span>
                <Link to="/login" style={{ color: '#C8A24A', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              style={{ position: 'absolute', width: '100%' }}
            >
              <div className="mb-3">
                <label className="form-label text-white-50 small">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{ ...inputStyle, borderColor: errors.fullName ? '#EF4444' : 'rgba(255,255,255,0.1)' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                {errors.fullName && <div className="text-danger mt-1 small">{errors.fullName}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label text-white-50 small">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({ ...prev, phone: val }));
                  }}
                  style={{ ...inputStyle, borderColor: errors.phone ? '#EF4444' : 'rgba(255,255,255,0.1)' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                {errors.phone && <div className="text-danger mt-1 small">{errors.phone}</div>}
              </div>

              <div className="mb-4">
                <label className="form-label text-white-50 small">I want to...</label>
                <div className="d-flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
                    className="flex-fill"
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: formData.role === 'user' ? '2px solid #C8A24A' : '1px solid rgba(255,255,255,0.1)',
                      background: formData.role === 'user' ? 'rgba(200,162,74,0.1)' : 'rgba(255,255,255,0.03)',
                      color: formData.role === 'user' ? '#C8A24A' : 'rgba(255,255,255,0.7)',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Buy/Rent
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'builder' }))}
                    className="flex-fill"
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: formData.role === 'builder' ? '2px solid #C8A24A' : '1px solid rgba(255,255,255,0.1)',
                      background: formData.role === 'builder' ? 'rgba(200,162,74,0.1)' : 'rgba(255,255,255,0.03)',
                      color: formData.role === 'builder' ? '#C8A24A' : 'rgba(255,255,255,0.7)',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    List Property
                  </button>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button className="btn flex-fill" onClick={prevStep}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFF',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}
                >
                  Back
                </button>
                <button className="btn flex-fill" onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    color: '#1E293B',
                    fontWeight: '700',
                    boxShadow: '0 4px 15px rgba(200, 162, 74, 0.3)',
                  }}
                >
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Create Account
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
};

export default Register;