import { useState, useEffect, Suspense, lazy } from 'react'
import { getImageUrl } from './utils/imageUtils';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion';
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const PropertyList = lazy(() => import('./pages/PropertyList'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const ComparePropertiesPage = lazy(() => import('./pages/CompareProperties'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const BuilderDashboard = lazy(() => import('./pages/BuilderDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));


// ComparePropertiesModal is a component


// Loading Component
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div className="spinner-border" style={{ color: '#C8A24A' }} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, isInitializing } = useAuth()

  // Wait for auth initialization to complete before making any redirects
  if (isInitializing) {
    return <PageLoader />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on actual role
    if (currentUser.role === 'admin') return <Navigate to="/admin-dashboard" replace />
    if (currentUser.role === 'builder') return <Navigate to="/builder-dashboard" replace />
    return <Navigate to="/user-dashboard" replace />
  }

  return children
}

function AppContent() {
  // Load state from localStorage
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('compareList');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });



  // Persist state changes
  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);
  const location = useLocation()

  // Helper for components that might still try to call navigateTo (backward compat or easy refactor)
  const navigate = useNavigate()

  const addToCompare = (property) => {
    if (compareList.length < 3 && !compareList.find(p => p.id === property.id)) {
      setCompareList([...compareList, property])
    } else if (compareList.length >= 3) {
      // Show a brief notification
      alert('You can compare up to 3 properties at a time')
    }
  }

  const removeFromCompare = (propertyId) => {
    setCompareList(compareList.filter(p => p.id !== propertyId))
  }

  const addToWishlist = (property) => {
    if (!wishlist.find(p => p.id === property.id)) {
      setWishlist([...wishlist, property])
    }
  }

  const removeFromWishlist = (propertyId) => {
    setWishlist(wishlist.filter(p => p.id !== propertyId))
  }

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        currentPage={location.pathname}
        compareCount={compareList.length}
        wishlistCount={wishlist.length}
      />
      <main style={{ flex: '1' }}>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/property-list" element={<PropertyList addToCompare={addToCompare} addToWishlist={addToWishlist} />} />
              <Route path="/properties" element={<PropertyList addToCompare={addToCompare} addToWishlist={addToWishlist} />} />
              <Route path="/property/:id" element={<PropertyDetail addToCompare={addToCompare} addToWishlist={addToWishlist} />} />

              <Route path="/compare" element={<ComparePropertiesPage compareList={compareList} removeFromCompare={removeFromCompare} />} />
              <Route path="/wishlist" element={<Wishlist wishlist={wishlist} removeFromWishlist={removeFromWishlist} />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes */}
              <Route path="/user-dashboard" element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <UserDashboard wishlist={wishlist} />
                </ProtectedRoute>
              } />

              <Route path="/builder-dashboard" element={
                <ProtectedRoute allowedRoles={['builder', 'admin']}>
                  <BuilderDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/payment/success/:paymentId" element={
                <ProtectedRoute allowedRoles={['user', 'builder', 'admin']}>
                  <PaymentSuccess />
                </ProtectedRoute>
              } />



              <Route path="*" element={<Home />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
      <BackToTop />

      {/* Floating Compare Tray */}
      {
        compareList.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #112A46, #0F1E33)',
            borderRadius: '16px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(200, 162, 74, 0.3)',
            zIndex: 1000
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {compareList.map((prop) => (
                <div key={prop.id} style={{ position: 'relative' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '2px solid rgba(200, 162, 74, 0.5)',
                    marginRight: '8px' // Add spacing for the close button
                  }}>
                    {prop.images && prop.images[0] ? (
                      <img src={getImageUrl(prop.images[0])} alt={prop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-building" style={{ color: '#64748B' }}></i>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCompare(prop.id)}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '20px',
                      height: '20px',
                      background: '#EF4444',
                      border: '2px solid #0F1E33',
                      borderRadius: '50%',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              ))}
              {/* Empty slots */}
              {[...Array(3 - compareList.length)].map((_, i) => (
                <div key={`empty-${i}`} style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '10px',
                  border: '2px dashed rgba(100, 116, 139, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-plus" style={{ color: '#64748B' }}></i>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/compare')}
              disabled={compareList.length < 2}
              style={{
                background: compareList.length >= 2 ? 'linear-gradient(135deg, #C8A24A, #9E7C2F)' : '#374151',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                color: compareList.length >= 2 ? '#0F172A' : '#64748B',
                fontWeight: '700',
                cursor: compareList.length >= 2 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="bi bi-layout-split"></i>
              Compare ({compareList.length}/3)
            </button>
          </div>
        )
      }


    </div >
  )
}


function App() {
  useEffect(() => {
    // Database initialization removed as we moved to Java backend
  }, []);

  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#fff',
            border: '1px solid #334155'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App