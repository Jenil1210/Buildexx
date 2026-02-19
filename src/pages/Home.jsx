import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  // Animated counter hook
  const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, [end, duration]);
    return count;
  };

  // Statistics
  const totalProperties = useCounter(500);
  const happyCustomers = useCounter(2500);
  const citiesCovered = useCounter(15);
  const verifiedBuilders = useCounter(120);

  // Testimonials data
  const testimonials = [
    { name: "Rahul Sharma", role: "Home Buyer", text: "Buildex made my dream of owning a home come true! The verification process gave me confidence.", rating: 5, image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Priya Patel", role: "Investor", text: "Excellent platform for property investment. The comparison feature helped me make smart decisions.", rating: 5, image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Amit Kumar", role: "Builder Partner", text: "As a builder, Buildex has helped us reach genuine buyers. Great partnership!", rating: 5, image: "https://randomuser.me/api/portraits/men/67.jpg" }
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      {/* Hero Section with Video Background */}
      <section className="hero-section" style={{
        position: 'relative',
        height: '90vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover',
            zIndex: 0
          }}
        >
          <source src="https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay for Text Readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(11, 28, 48, 0.7), rgba(11, 28, 48, 0.9))',
          zIndex: 1
        }}></div>

        {/* Hero Content */}
        <div className="container text-center" style={{ position: 'relative', zIndex: 2, maxWidth: '900px' }}>
          {/* Main Headline */}
          <h1 className="display-2 fw-bold mb-4 animate-fade-in-up" style={{
            color: '#FFFFFF',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            textShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            Find Your <span className="text-gradient-gold">Perfect Property</span>.
          </h1>

          {/* Search Label */}
          <p className="mb-5 animate-fade-in-up" style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.25rem',
            letterSpacing: '0.5px',
            animationDelay: '0.2s'
          }}>
            Discover verified homes, connect with top builders, and make your dream a reality with Buildex.
          </p>

          {/* Explore Properties Button */}
          <button
            onClick={() => navigate('/property-list')}
            className="btn-glow hover-lift animate-fade-in-up"
            style={{
              background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
              border: 'none',
              borderRadius: '50px',
              padding: '18px 56px',
              color: '#0F172A',
              fontWeight: '700',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 40px rgba(200, 162, 74, 0.4)',
              animationDelay: '0.4s'
            }}
          >
            <i className="bi bi-building me-2"></i>
            Explore Properties
          </button>
        </div>
      </section>

      {/* Company Tagline Section */}
      <section style={{
        background: 'var(--charcoal-slate)',
        padding: '60px 0',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div className="container">
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.25rem',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.6,
            fontWeight: '400'
          }}>
            Buildex is a leader in verified real estate in India. Our platform prides itself on transparency, trust, and true market wisdom.
          </p>
        </div>
      </section>


      {/* Statistics Counter Section */}
      <section className="stats-section py-5" style={{
        background: 'linear-gradient(135deg, var(--charcoal-slate) 0%, #1E293B 100%)',
        position: 'relative'
      }}>
        <div className="container-fluid">
          <div className="row g-4 text-center">
            <div className="col-md-3 col-6">
              <div className="stat-card p-4" style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(200,162,74,0.2)'
              }}>
                <div className="d-flex justify-content-center mb-3">
                  <div style={{
                    background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-building fs-4" style={{ color: '#0F172A' }}></i>
                  </div>
                </div>
                <h2 className="fw-bold mb-1" style={{ color: '#C8A24A', fontSize: '2.5rem' }}>{totalProperties}+</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>Properties Listed</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-card p-4" style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(200,162,74,0.2)'
              }}>
                <div className="d-flex justify-content-center mb-3">
                  <div style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-people-fill fs-4 text-white"></i>
                  </div>
                </div>
                <h2 className="fw-bold mb-1" style={{ color: '#10B981', fontSize: '2.5rem' }}>{happyCustomers}+</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>Happy Customers</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-card p-4" style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(200,162,74,0.2)'
              }}>
                <div className="d-flex justify-content-center mb-3">
                  <div style={{
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-geo-alt-fill fs-4 text-white"></i>
                  </div>
                </div>
                <h2 className="fw-bold mb-1" style={{ color: '#3B82F6', fontSize: '2.5rem' }}>{citiesCovered}+</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>Cities Covered</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-card p-4" style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(200,162,74,0.2)'
              }}>
                <div className="d-flex justify-content-center mb-3">
                  <div style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-shield-check fs-4 text-white"></i>
                  </div>
                </div>
                <h2 className="fw-bold mb-1" style={{ color: '#8B5CF6', fontSize: '2.5rem' }}>{verifiedBuilders}+</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>Verified Builders</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="features-section py-5 animate__animated animate__fadeIn" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="container-fluid">
          <div className="text-center mb-5">
            <span style={{ color: '#C8A24A', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Why Choose Us
            </span>
            <h2 className="fw-bold mt-2" style={{ color: 'var(--primary-text)' }}>Why Choose Buildex?</h2>
          </div>
          <div className="row g-4">
            {[
              { icon: 'bi-shield-check', title: 'Verified Builders', desc: 'All our builders are verified for authenticity and reliability.', color: '#10B981' },
              { icon: 'bi-house-door', title: 'New Schemes Only', desc: 'Access to latest property schemes and upcoming projects.', color: '#3B82F6' },
              { icon: 'bi-camera-video', title: '360° Virtual Tour', desc: 'Experience properties virtually with our immersive technology.', color: '#8B5CF6' },
              { icon: 'bi-graph-up-arrow', title: 'Smart Rent Management', desc: 'Efficiently manage your rental properties with our tools.', color: '#F59E0B' }
            ].map((feature, index) => (
              <div className="col-lg-3 col-md-6" key={index}>
                <div className="feature-card text-center p-4 rounded h-100 hover-lift animate-fade-in-up" style={{
                  backgroundColor: 'var(--card-bg)',
                  boxShadow: 'var(--card-shadow)',
                  border: 'none',
                  borderRadius: '16px',
                  animationDelay: `${index * 0.15}s`
                }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <i className={`bi ${feature.icon} fs-3`} style={{ color: feature.color }}></i>
                  </div>
                  <h5 className="fw-bold" style={{ color: 'var(--primary-text)' }}>{feature.title}</h5>
                  <p style={{ color: 'var(--secondary-text)', margin: 0 }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works py-5" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="container-fluid">
          <div className="text-center mb-5">
            <span style={{ color: '#C8A24A', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Simple Process
            </span>
            <h2 className="fw-bold mt-2" style={{ color: 'var(--primary-text)' }}>How Buildex Works</h2>
          </div>
          <div className="row g-4">
            {[
              { step: 1, icon: 'bi-search', title: 'Browse Properties', desc: 'Explore our curated collection of verified properties for sale or rent.' },
              { step: 2, icon: 'bi-chat-dots', title: 'Connect with Builders', desc: 'Direct communication with verified builders and property managers.' },
              { step: 3, icon: 'bi-check-circle', title: 'Close the Deal', desc: 'Complete your transaction with our secure and transparent process.' }
            ].map((item, index) => (
              <div className="col-md-4" key={index}>
                <div className="step-card p-4 rounded text-center h-100 hover-lift animate-fade-in-up" style={{
                  backgroundColor: 'var(--card-bg)',
                  boxShadow: 'var(--card-shadow)',
                  border: 'none',
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  animationDelay: `${0.5 + (index * 0.2)}s`
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    fontSize: '6rem',
                    fontWeight: '800',
                    color: 'rgba(200,162,74,0.08)'
                  }}>{item.step}</div>

                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <i className={`bi ${item.icon} fs-4`} style={{ color: '#0F172A' }}></i>
                  </div>
                  <h5 className="fw-bold" style={{ color: 'var(--primary-text)' }}>{item.title}</h5>
                  <p style={{ color: 'var(--secondary-text)', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
};

export default Home;
