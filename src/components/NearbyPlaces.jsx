import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchNearbyPlaces, getCategories } from '../lib/overpassService';
import { getIcon, getPropertyIcon } from '../lib/nearbyPlaceIcons';

/**
 * NearbyPlaces - Displays nearby amenities on a map with category filters
 * Uses OpenStreetMap tiles and Overpass API for data
 */
const NearbyPlaces = ({ property, height = '400px' }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fromCache, setFromCache] = useState(false);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const propertyMarkerRef = useRef(null);

    const categories = getCategories();
    const categoryEntries = Object.entries(categories);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || !property?.latitude || !property?.longitude) return;

        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView(
                [property.latitude, property.longitude],
                14
            );

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstanceRef.current);

            // Add property marker
            propertyMarkerRef.current = L.marker(
                [property.latitude, property.longitude],
                { icon: getPropertyIcon() }
            ).addTo(mapInstanceRef.current);

            propertyMarkerRef.current.bindPopup(`
                <div style="min-width: 150px; font-family: system-ui, sans-serif;">
                    <strong style="color: #C8A24A;">${property.name || 'This Property'}</strong>
                    <br>
                    <small style="color: #64748B;">${property.locality || ''}, ${property.city || ''}</small>
                </div>
            `);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [property?.latitude, property?.longitude]);

    // Fetch places when category changes
    useEffect(() => {
        if (!selectedCategory || !property?.latitude || !property?.longitude) {
            setPlaces([]);
            return;
        }

        const fetchPlaces = async () => {
            setLoading(true);
            setError(null);

            const result = await fetchNearbyPlaces(
                selectedCategory,
                property.latitude,
                property.longitude,
                3000 // 3km radius
            );

            if (result.success) {
                setPlaces(result.data);
                setFromCache(result.fromCache || false);
                setError(null);
            } else {
                setPlaces([]);
                setError(result.error);
            }

            setLoading(false);
        };

        fetchPlaces();
    }, [selectedCategory, property?.latitude, property?.longitude]);

    // Update markers when places change
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers (except property marker)
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        places.forEach(place => {
            const marker = L.marker(
                [place.latitude, place.longitude],
                { icon: getIcon(place.category) }
            ).addTo(mapInstanceRef.current);

            const popupContent = `
                <div style="min-width: 180px; font-family: system-ui, sans-serif; padding: 4px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <i class="bi ${place.categoryInfo.icon}" style="color: ${place.categoryInfo.color}; font-size: 1.1rem;"></i>
                        <strong style="color: #1E293B; font-size: 13px;">${place.name}</strong>
                    </div>
                    <div style="font-size: 12px; color: #10B981; font-weight: 600; margin-bottom: 4px;">
                        📍 ${place.distance.toFixed(2)} km away
                    </div>
                    ${place.address ? `<div style="font-size: 11px; color: #64748B;">${place.address}</div>` : ''}
                    ${place.phone ? `<div style="font-size: 11px; color: #3B82F6; margin-top: 4px;">📞 ${place.phone}</div>` : ''}
                </div>
            `;

            marker.bindPopup(popupContent);
            markersRef.current.push(marker);
        });

        // Fit bounds if we have places
        if (places.length > 0 && propertyMarkerRef.current) {
            const allPoints = [
                [property.latitude, property.longitude],
                ...places.map(p => [p.latitude, p.longitude])
            ];
            const bounds = L.latLngBounds(allPoints);
            mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [places, property?.latitude, property?.longitude]);

    if (!property?.latitude || !property?.longitude) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(226,232,240,0.1)'
            }}>
                <i className="bi bi-geo-alt" style={{ fontSize: '2.5rem', color: '#64748B' }}></i>
                <p style={{ color: '#94A3B8', marginTop: '12px' }}>
                    Location coordinates not available for this property
                </p>
            </div>
        );
    }

    return (
        <div className="nearby-places-container">
            {/* Section Header */}
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-pin-map-fill" style={{ color: '#C8A24A' }}></i>
                Nearby Places
            </h3>

            {/* Category Filters */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px'
            }}>
                {categoryEntries.map(([key, category]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                        style={{
                            padding: '8px 14px',
                            borderRadius: '20px',
                            border: selectedCategory === key ? 'none' : '1px solid rgba(226,232,240,0.15)',
                            background: selectedCategory === key
                                ? category.color
                                : 'rgba(17, 42, 70, 0.8)',
                            color: selectedCategory === key ? '#FFFFFF' : '#94A3B8',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <i className={`bi ${category.icon}`}></i>
                        <span className="d-none d-sm-inline">{category.label}</span>
                    </button>
                ))}
            </div>

            {/* Map Container */}
            <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                border: '2px solid rgba(200,162,74,0.3)',
                position: 'relative'
            }}>
                <div ref={mapRef} style={{ height, width: '100%' }} />

                {/* Loading Overlay */}
                {loading && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(15,23,42,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: '4px solid rgba(200,162,74,0.2)',
                                borderTopColor: '#C8A24A',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 12px'
                            }}></div>
                            <p style={{ color: '#F8FAFC', margin: 0 }}>
                                Searching nearby {categories[selectedCategory]?.label}...
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && !loading && (
                    <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '16px',
                        right: '16px',
                        background: 'rgba(239,68,68,0.9)',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        zIndex: 1000,
                        fontSize: '0.9rem'
                    }}>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                )}

                {/* Results Summary */}
                {selectedCategory && !loading && !error && (
                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        background: 'rgba(15,30,51,0.95)',
                        color: 'white',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        zIndex: 1000,
                        fontSize: '0.85rem',
                        border: '1px solid rgba(200,162,74,0.3)'
                    }}>
                        <strong style={{ color: categories[selectedCategory]?.color }}>
                            {places.length}
                        </strong>
                        {' '}
                        {categories[selectedCategory]?.label}
                        {places.length !== 1 ? 's' : ''} found
                        {fromCache && (
                            <span style={{
                                marginLeft: '8px',
                                color: '#10B981',
                                fontSize: '0.75rem'
                            }}>
                                (cached)
                            </span>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {selectedCategory && !loading && !error && places.length === 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(15,30,51,0.95)',
                        color: 'white',
                        padding: '24px 32px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        zIndex: 1000,
                        border: '1px solid rgba(200,162,74,0.3)'
                    }}>
                        <i className="bi bi-search fs-2 d-block mb-2" style={{ color: '#C8A24A' }}></i>
                        <p style={{ margin: 0, color: '#F8FAFC' }}>
                            No {categories[selectedCategory]?.label} found within 3km
                        </p>
                        <small style={{ color: '#64748B' }}>
                            Try a different category
                        </small>
                    </div>
                )}
            </div>

            {/* Results List */}
            {places.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                    <h6 style={{ color: '#94A3B8', marginBottom: '12px' }}>
                        Nearby {categories[selectedCategory]?.label} ({places.length})
                    </h6>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '12px'
                    }}>
                        {places.slice(0, 6).map(place => (
                            <div
                                key={place.id}
                                style={{
                                    background: 'rgba(17, 42, 70, 0.8)',
                                    borderRadius: '12px',
                                    padding: '14px',
                                    border: '1px solid rgba(226,232,240,0.08)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px'
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: `${place.categoryInfo.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <i className={`bi ${place.categoryInfo.icon}`}
                                        style={{ color: place.categoryInfo.color, fontSize: '1.1rem' }}></i>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h6 style={{
                                        margin: '0 0 4px 0',
                                        color: '#F8FAFC',
                                        fontSize: '0.9rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {place.name}
                                    </h6>
                                    <span style={{
                                        color: '#10B981',
                                        fontSize: '0.8rem',
                                        fontWeight: '600'
                                    }}>
                                        📍 {place.distance.toFixed(2)} km
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {places.length > 6 && (
                        <p style={{
                            color: '#64748B',
                            fontSize: '0.85rem',
                            marginTop: '12px',
                            textAlign: 'center'
                        }}>
                            + {places.length - 6} more on map
                        </p>
                    )}
                </div>
            )}

            {/* Spin Animation */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .nearby-place-marker {
                    background: transparent !important;
                    border: none !important;
                }
            `}</style>
        </div>
    );
};

export default NearbyPlaces;
