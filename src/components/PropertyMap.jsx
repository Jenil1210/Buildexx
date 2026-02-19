import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom gold marker for properties
const createGoldMarkerIcon = () => new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
            <path fill="#C8A24A" stroke="#9E7C2F" stroke-width="1" d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z"/>
            <circle fill="white" cx="12" cy="12" r="5"/>
        </svg>
    `),
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
    tooltipAnchor: [0, -30]
});

/**
 * PropertyMap component for displaying properties on an OpenStreetMap
 * Uses vanilla Leaflet for better React 18 compatibility
 */
const PropertyMap = ({
    properties = [],
    center = { lat: 19.0760, lng: 72.8777 },
    zoom = 12,
    height = '400px',
    showSingleProperty = false,
    onMarkerClick = null
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    // Filter properties with valid coordinates
    const validProperties = properties.filter(p =>
        (p.latitude !== null && p.latitude !== undefined && !isNaN(p.latitude)) &&
        (p.longitude !== null && p.longitude !== undefined && !isNaN(p.longitude))
    );

    console.log('[PropertyMap] Total props:', properties.length, 'Valid for map:', validProperties.length);
    if (properties.length > 0 && validProperties.length === 0) {
        console.warn('[PropertyMap] Properties present but none have valid coordinates:',
            properties.map(p => ({ id: p.id, lat: p.latitude, lng: p.longitude })));
    }

    // Calculate center
    const isDefaultCenter = center.lat === 19.0760 && center.lng === 72.8777;
    const mapCenter = !isDefaultCenter && center.lat && center.lng
        ? [center.lat, center.lng]
        : validProperties.length > 0
            ? [validProperties[0].latitude, validProperties[0].longitude]
            : [19.0760, 72.8777];

    // Initialize map
    useEffect(() => {
        if (!mapRef.current) return;

        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView(mapCenter, zoom);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstanceRef.current);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update center and zoom
    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(mapCenter, zoom);
        }
    }, [mapCenter[0], mapCenter[1], zoom]);

    // Update markers
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        const goldIcon = createGoldMarkerIcon();

        // Add new markers
        validProperties.forEach((property) => {
            const marker = L.marker([property.latitude, property.longitude], { icon: goldIcon })
                .addTo(mapInstanceRef.current);

            // Create tooltip content (shows on hover)
            const tooltipContent = `
                <div style="min-width: 180px; font-family: system-ui, sans-serif; padding: 4px;">
                    <div style="font-weight: 600; color: #1E293B; font-size: 13px; margin-bottom: 4px;">
                        ${property.name || property.title || 'Property'}
                    </div>
                    <div style="font-size: 11px; color: #64748B; margin-bottom: 4px;">
                        📍 ${property.city || ''}${property.locality ? `, ${property.locality}` : ''}
                    </div>
                    <div style="font-weight: 600; color: #C8A24A; font-size: 12px;">
                        ${property.price ? `₹${property.price.toLocaleString()}` : (property.rent ? `₹${property.rent.toLocaleString()}/mo` : '')}
                    </div>
                    ${property.distance ? `
                        <div style="font-size: 11px; color: #10B981; margin-top: 4px;">
                            📌 ${property.distance.toFixed(1)} km away
                        </div>
                    ` : ''}
                </div>
            `;

            // Bind tooltip (shows on hover)
            marker.bindTooltip(tooltipContent, {
                permanent: false,
                direction: 'top',
                offset: [0, -30],
                opacity: 1,
                className: 'property-tooltip'
            });

            // Click to navigate to property detail
            marker.on('click', () => {
                if (onMarkerClick) {
                    onMarkerClick(property);
                } else {
                    window.location.href = `/property/${property.id}`;
                }
            });

            markersRef.current.push(marker);
        });

        // Fit bounds to show markers
        if (validProperties.length > 1) {
            const bounds = L.latLngBounds(validProperties.map(p => [p.latitude, p.longitude]));
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } else if (validProperties.length === 1 && isDefaultCenter) {
            // If only one property and we are on default center, pan to it
            mapInstanceRef.current.setView([validProperties[0].latitude, validProperties[0].longitude], 14);
        }
    }, [validProperties, showSingleProperty, onMarkerClick, isDefaultCenter]);

    return (
        <>
            {/* Custom tooltip styles */}
            <style>{`
                .property-tooltip {
                    background: white !important;
                    border: 2px solid #C8A24A !important;
                    border-radius: 10px !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
                    padding: 8px 12px !important;
                }
                .property-tooltip::before {
                    border-top-color: #C8A24A !important;
                }
                .leaflet-tooltip-top:before {
                    border-top-color: #C8A24A !important;
                }
            `}</style>

            <div className="property-map-container" style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '2px solid rgba(200,162,74,0.3)',
                position: 'relative'
            }}>
                <div
                    ref={mapRef}
                    style={{ height, width: '100%' }}
                />

                {validProperties.length === 0 && !showSingleProperty && (
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
                        <i className="bi bi-geo-alt fs-2 d-block mb-2" style={{ color: '#C8A24A' }}></i>
                        <p style={{ margin: 0, fontSize: '14px', color: '#F8FAFC' }}>
                            No properties with location data in this area
                        </p>
                        <small style={{ color: '#64748B' }}>
                            Properties need coordinates to show on map
                        </small>
                    </div>
                )}
            </div>
        </>
    );
};

export default PropertyMap;
