import React, { useState, useEffect, useRef } from 'react';
import 'pannellum';
import 'pannellum/build/pannellum.css';

import { getApiUrl } from '../config';

/**
 * PanoramaViewer component for 360° property views
 * Uses Pannellum library for panoramic image display
 * Automatically proxies external images via backend to avoid CORS issues
 */
const PanoramaViewer = ({
    imageUrl, // Single image (fallback)
    imageUrls = [], // Array of images (preferred)
    title = "360° Property View",
    height = '400px'
}) => {
    const [loading, setLoading] = useState(true);
    const [processedUrl, setProcessedUrl] = useState(null);
    const [error, setError] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const containerId = useRef(`panorama-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    // Determine the current image to show
    const getCurrentImage = () => {
        console.log('[PanoramaViewer] Checking props:', { imageUrl, imageUrls });
        if (imageUrls && imageUrls.length > 0) {
            return imageUrls[currentIndex];
        }
        return imageUrl;
    };

    const currentImage = getCurrentImage();
    const hasMultipleImages = imageUrls && imageUrls.length > 1;

    // Process Image URL (Proxy if needed)
    useEffect(() => {
        if (!currentImage) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(false);

        const processImage = async () => {
            // If local or data URL, use directly
            if (currentImage.startsWith('data:') || currentImage.startsWith('/') || currentImage.includes('localhost')) {
                setProcessedUrl(currentImage.startsWith('/') ? getApiUrl(currentImage) : currentImage);
                return;
            }

            // External URL - Proxy it
            try {
                const response = await fetch(getApiUrl('/api/images/proxy-360'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: currentImage })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.localUrl) {
                        // Crucial: Prepend API URL if it's a relative path from the backend
                        setProcessedUrl(data.localUrl.startsWith('/') ? getApiUrl(data.localUrl) : data.localUrl);
                    } else {
                        setProcessedUrl(currentImage);
                    }
                } else {
                    setProcessedUrl(currentImage);
                }
            } catch (err) {
                console.error("Proxy error:", err);
                setProcessedUrl(currentImage);
            }
        };

        processImage();
    }, [currentImage]);


    // Initialize viewer when url is ready
    useEffect(() => {
        if (!processedUrl) {
            return;
        }

        // Cleanup previous viewer safely
        const cleanupViewer = () => {
            if (viewerRef.current) {
                try {
                    viewerRef.current.destroy();
                } catch (e) {
                    // Ignore errors during cleanup
                }
                viewerRef.current = null;
            }
        };

        // Skip if already initialized with same URL (prevents duplicate init)
        if (viewerRef.current && viewerRef.current._panoramaUrl === processedUrl) {
            console.log('[PanoramaViewer] Already initialized with this URL, skipping');
            return;
        }

        cleanupViewer();

        // Initialize after a short delay to ensure DOM is ready
        const initTimer = setTimeout(() => {
            const container = document.getElementById(containerId.current);
            if (!container) {
                return;
            }

            // Clear container manually before reinitializing
            while (container.firstChild) {
                try {
                    container.removeChild(container.firstChild);
                } catch (e) {
                    break;
                }
            }

            try {
                // Access pannellum from window object
                if (window.pannellum) {
                    viewerRef.current = window.pannellum.viewer(containerId.current, {
                        type: 'equirectangular',
                        panorama: processedUrl,
                        autoLoad: true,
                        autoRotate: -2,
                        compass: true,
                        showControls: true,
                        showFullscreenCtrl: true,
                        showZoomCtrl: true,
                        hfov: 110,
                        pitch: 0,
                        yaw: 0,
                        title: hasMultipleImages ? `${title} (${currentIndex + 1}/${imageUrls.length})` : title,
                        author: 'BuildEx',
                        hotSpotDebug: false
                    });

                    // Store URL reference to prevent duplicate initialization
                    viewerRef.current._panoramaUrl = processedUrl;

                    // Force check loading state
                    setTimeout(() => setLoading(false), 1000);

                    viewerRef.current.on('load', () => {
                        setLoading(false);
                    });

                    viewerRef.current.on('error', (err) => {
                        console.error("Pannellum error:", err);
                        setError(true);
                        setLoading(false);
                    });
                }
            } catch (e) {
                console.error('Pannellum init error:', e);
                setError(true);
                setLoading(false);
            }
        }, 150);

        return () => {
            clearTimeout(initTimer);
            cleanupViewer();
        };
    }, [processedUrl, title, currentIndex, hasMultipleImages, imageUrls.length]);

    const handleNext = () => {
        if (currentIndex < imageUrls.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    if (!currentImage) {
        return (
            <div style={{
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                borderRadius: '16px',
                border: '2px solid rgba(200,162,74,0.3)'
            }}>
                <div className="text-center p-4">
                    <i className="bi bi-camera-video-off" style={{
                        fontSize: '3rem',
                        color: '#64748B',
                        marginBottom: '16px',
                        display: 'block'
                    }}></i>
                    <p style={{ color: '#64748B', margin: 0 }}>
                        No 360° view available for this property
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="panorama-viewer-wrapper" style={{ position: 'relative' }}>
            <style>{`
                .panorama-viewer-wrapper .nav-arrow {
                    opacity: 0.8;
                    transition: all 0.3s ease;
                }
                .panorama-viewer-wrapper .nav-arrow:hover {
                    opacity: 1;
                    transform: translateY(-50%) scale(1.1);
                    background: rgba(200,162,74,0.8) !important;
                }
                .panorama-viewer-wrapper .nav-arrow:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
            `}</style>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'linear-gradient(90deg, rgba(200,162,74,0.1), rgba(200,162,74,0.05))',
                borderRadius: '16px 16px 0 0',
                border: '2px solid rgba(200,162,74,0.3)',
                borderBottom: 'none'
            }}>
                <div className="d-flex align-items-center">
                    <i className="bi bi-badge-vr me-2" style={{ color: '#C8A24A', fontSize: '1.5rem' }}></i>
                    <span style={{ color: '#F8FAFC', fontWeight: '600' }}>
                        {title} {hasMultipleImages && <span className="ms-2" style={{ fontSize: '0.9em' }}>({currentIndex + 1}/{imageUrls.length})</span>}
                    </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    <i className="bi bi-mouse me-1"></i>
                    Drag to look around
                </div>
            </div>

            {/* Panorama Container with Navigation */}
            <div style={{ position: 'relative' }}>
                <div
                    id={containerId.current}
                    ref={containerRef}
                    style={{
                        height,
                        width: '100%',
                        borderRadius: '0 0 16px 16px',
                        overflow: 'hidden',
                        border: '2px solid rgba(200,162,74,0.3)',
                        borderTop: 'none',
                        background: '#0F172A'
                    }}
                >
                </div>

                {/* Navigation Controls - Outside pannellum container */}
                {hasMultipleImages && (
                    <>
                        <button
                            className="nav-arrow"
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            style={{
                                position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                                zIndex: 100, background: 'rgba(0,0,0,0.7)', color: 'white', border: '2px solid rgba(200,162,74,0.5)',
                                borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: currentIndex === 0 ? 'default' : 'pointer', fontSize: '1.2rem'
                            }}>
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        <button
                            className="nav-arrow"
                            onClick={handleNext}
                            disabled={currentIndex === imageUrls.length - 1}
                            style={{
                                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                zIndex: 100, background: 'rgba(0,0,0,0.7)', color: 'white', border: '2px solid rgba(200,162,74,0.5)',
                                borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: currentIndex === imageUrls.length - 1 ? 'default' : 'pointer', fontSize: '1.2rem'
                            }}>
                            <i className="bi bi-chevron-right"></i>
                        </button>

                        {/* Footer Indicator */}
                        <div style={{
                            position: 'absolute', bottom: '10px', left: '0', right: '0',
                            textAlign: 'center', zIndex: 100, pointerEvents: 'none'
                        }}>
                            <span style={{
                                background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem'
                            }}>
                                View {currentIndex + 1} of {imageUrls.length}
                            </span>
                        </div>
                    </>
                )}

                {/* Loading overlay */}
                {loading && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                        background: 'rgba(15,23,42,0.9)', zIndex: 100
                    }}>
                        <div style={{
                            width: '50px', height: '50px',
                            border: '3px solid rgba(200,162,74,0.3)',
                            borderTop: '3px solid #C8A24A',
                            borderRadius: '50%',
                            animation: 'panSpin 1s linear infinite'
                        }}></div>
                        <p style={{ color: '#64748B', marginTop: '16px', fontSize: '0.9rem' }}>Loading 360° view...</p>
                        <style>{`@keyframes panSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                )}
                {/* Error state */}
                {error && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                        padding: '24px', background: '#0F172A', zIndex: 100
                    }}>
                        <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: '#F59E0B', marginBottom: '16px' }}></i>
                        <p style={{ color: '#64748B', textAlign: 'center', margin: 0 }}>
                            Unable to load 360° view.<br />
                            Please check if the image is valid.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PanoramaViewer;
