import React, { createContext, useContext, useState, useEffect } from 'react';
// DB import removed - using API exclusively for Auth
// import sql from '../../api/db.js'; 
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // Track initial auth check
  const [pendingRegistration, setPendingRegistration] = useState(null);

  // Initialize database removed from here - usage should be in main app or specific feature contexts if needed
  // implementation detail: api/db.js might still be used by other components, but Auth should be API-first.

  // implementation detail: api/db.js might still be used by other components, but Auth should be API-first.
  // Using API_BASE_URL which auto-switches between localhost and VITE_BACKEND_URL
  const BACKEND_URL = `${API_BASE_URL}/api`;

  const login = async (email, password) => {
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        return { success: false, message: data.message || "Invalid email or password" };
      }

      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('buildex_user', JSON.stringify(data.user));
        setLoading(false);
        return { success: true, user: data.user };
      } else {
        setLoading(false);
        return { success: false, message: data.message || "Login failed" };
      }

    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      return { success: false, message: "Server unreachable. Please try again." };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('buildex_user');
  };

  const verifyOtp = async (email, otp) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Backend verification successful. 
        const newUser = data.user;
        setCurrentUser(newUser);
        localStorage.setItem('buildex_user', JSON.stringify(newUser));
        setPendingRegistration(null);
        setLoading(false);
        return { success: true, user: newUser };

      } else {
        setLoading(false);
        return { success: false, message: data.message || "Invalid OTP" };
      }
    } catch (error) {
      setLoading(false);
      console.error('OTP Verification Error:', error);
      return { success: false, message: "Failed to verify OTP. Service unavailable." };
    }
  };

  const register = async (username, email, password, fullName, phone, role = "user") => {
    setLoading(true);

    // Direct DB check removed - Backend handles duplicates
    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, full_name: fullName, phone, role })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store pending data for UI state if needed, though backend handles the flow
        setPendingRegistration({ username, email, password, full_name: fullName, phone, role });
        setLoading(false);
        return { success: true, requiresOtp: true, message: "OTP sent to email" };
      } else {
        setLoading(false);
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (backendError) {
      console.error("Backend registration failed", backendError);
      setLoading(false);
      return { success: false, message: "Registration service unavailable. Please check your connection." };
    }
  };



  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('buildex_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('buildex_user');
      }
    }
    setIsInitializing(false); // Auth check complete
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    register,
    verifyOtp,
    loading,
    isInitializing
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};