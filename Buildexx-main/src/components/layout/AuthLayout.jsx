import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, quote }) => {
    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100%',
            background: 'var(--charcoal-slate)',
            color: '#FFFFFF',
            overflow: 'hidden'
        }}>
            {/* Left Side - Image/Branding (Hidden on mobile) */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="d-none d-lg-flex"
                style={{
                    width: '50%',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
                }}
            >
                {/* Background Image with Overlay */}
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.4,
                        mixBlendMode: 'overlay'
                    }}
                />

                {/* Floating Orbs for Premium Feel */}
                <motion.div
                    animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: 'absolute',
                        top: '20%',
                        left: '20%',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(200,162,74,0.2) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(40px)'
                    }}
                />

                {/* Content Overlay */}
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '60px',
                    height: '100%'
                }}>
                    {/* Logo Area */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className="bi bi-building" style={{ color: '#1E293B', fontSize: '1.2rem' }}></i>
                            </div>
                            <span style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px', color: '#FFF' }}>Buildex</span>
                        </Link>
                    </motion.div>

                    {/* Quote Area */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            padding: '30px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '20px', fontStyle: 'italic' }}>
                                "{quote?.text || "The best investment on Earth is earth."}"
                            </p>
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ width: '40px', height: '2px', background: '#C8A24A' }}></div>
                                <span style={{ fontSize: '0.9rem', color: '#C8A24A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {quote?.author || "Louis Glickman"}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side - Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                background: '#0F172A',
                overflowY: 'auto'
            }}>
                {/* Back Link (Mobile only or Top Right) */}
                <div style={{ position: 'absolute', top: '30px', right: '30px', zIndex: 10 }}>
                    <Link to="/" style={{
                        color: 'rgba(255,255,255,0.6)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        background: 'rgba(255,255,255,0.05)',
                        transition: 'all 0.3s'
                    }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.1)';
                            e.target.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.05)';
                            e.target.style.color = 'rgba(255,255,255,0.6)';
                        }}
                    >
                        Back to website <i className="bi bi-arrow-right"></i>
                    </Link>
                </div>

                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '40px 20px', // Reduced side padding for mobile default
                    maxWidth: '600px',
                    width: '100%',
                    margin: '0 auto',
                    marginTop: '40px' // Check if this helps on mobile
                }}
                    className="auth-form-container"
                >
                    <style>{`
                        @media (min-width: 768px) {
                            .auth-form-container {
                                padding: 40px 60px !important;
                            }
                        }
                    `}</style>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        {/* Mobile Branding */}
                        <div className="d-lg-none text-center mb-5">
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
                                borderRadius: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 15px',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                            }}>
                                <i className="bi bi-building fs-2" style={{ color: 'var(--charcoal-slate)' }}></i>
                            </div>
                            <h3 className="fw-bold text-white">BUILDEX</h3>
                        </div>

                        <div className="mb-5">
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '10px', background: 'linear-gradient(90deg, #FFFFFF, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {title}
                            </h1>
                            <p style={{ color: '#94A3B8', fontSize: '1.1rem' }}>{subtitle}</p>
                        </div>

                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
