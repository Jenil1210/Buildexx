import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});

  const handleLoginSuccess = (user) => {
    if (location.state?.returnUrl) {
      navigate(location.state.returnUrl);
      return;
    }
    if (user.role === 'admin') navigate('/admin-dashboard');
    else if (user.role === 'builder') navigate('/builder-dashboard');
    else navigate('/user-dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        handleLoginSuccess(result.user);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '16px',
    color: '#FFF',
    fontSize: '1rem',
    width: '100%',
    transition: 'all 0.3s ease'
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your details to sign in."
      quote={{
        text: "Design is not just what it looks like and feels like. Design is how it works.",
        author: "Steve Jobs"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#FCA5A5',
            borderRadius: '10px'
          }}>
            <i className="bi bi-exclamation-circle me-2"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email Address"
              className="form-control hover-effect"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              style={{
                ...inputStyle,
                borderColor: errors.email ? '#EF4444' : 'rgba(255,255,255,0.1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#C8A24A';
                e.target.style.background = 'rgba(255,255,255,0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }}
            />
            {errors.email && <div className="text-danger mt-1 small">{errors.email}</div>}
          </div>

          <div className="mb-4 position-relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="form-control hover-effect"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              style={{
                ...inputStyle,
                borderColor: errors.password ? '#EF4444' : 'rgba(255,255,255,0.1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#C8A24A';
                e.target.style.background = 'rgba(255,255,255,0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer'
              }}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
            {errors.password && <div className="text-danger mt-1 small">{errors.password}</div>}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-5">
            <div className="form-check">
              {/* Remember me could go here */}
            </div>
            <Link to="/forgot-password" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn w-100 mb-4"
            style={{
              background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              color: '#1E293B',
              fontWeight: '700',
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(200, 162, 74, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Sign In
          </button>

          <div className="text-center">
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: '#C8A24A', textDecoration: 'none', fontWeight: '600' }}>Sign up for free</Link>
          </div>
        </form>
      </motion.div>
    </AuthLayout>
  );
};
export default Login;