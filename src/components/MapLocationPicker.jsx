import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker for selected location
const createSelectedMarkerIcon = () => new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
            <path fill="#10B981" stroke="#059669" stroke-width="1.5" d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z"/>
            <circle fill="white" cx="12" cy="12" r="5"/>
        </svg>
    `),
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48]
});

/**
 * MapLocationPicker component for builders to select property location
 * Uses vanilla Leaflet for React 18 compatibility
 */
const MapLocationPicker = ({
    initialPosition = null,
    onLocationChange,
    height = '300px'
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    const [position, setPosition] = useState(initialPosition);
    const [manualLat, setManualLat] = useState(initialPosition?.lat?.toString() || '');
    const [manualLng, setManualLng] = useState(initialPosition?.lng?.toString() || '');
    const [mapLink, setMapLink] = useState('');

    // Initialize map
    useEffect(() => {
        if (!mapRef.current) return;

        const center = position ? [position.lat, position.lng] : [19.0760, 72.8777];

        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView(center, position ? 15 : 11);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(mapInstanceRef.current);

            // Click handler
            mapInstanceRef.current.on('click', (e) => {
                const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
                setPosition(newPos);
                setManualLat(e.latlng.lat.toFixed(6));
                setManualLng(e.latlng.lng.toFixed(6));
            });
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update marker when position changes
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Remove existing marker
        if (markerRef.current) {
            markerRef.current.remove();
        }

        // Add new marker if position exists
        if (position) {
            const icon = createSelectedMarkerIcon();
            markerRef.current = L.marker([position.lat, position.lng], { icon })
                .addTo(mapInstanceRef.current);

            mapInstanceRef.current.setView([position.lat, position.lng], 15);
        }
    }, [position]);

    // Update parent when position changes
    useEffect(() => {
        if (position && onLocationChange) {
            onLocationChange({
                latitude: position.lat,
                longitude: position.lng,
                mapLink: mapLink
            });
        }
    }, [position, mapLink]);

    // Handle manual coordinate input
    const handleManualUpdate = () => {
        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            setPosition({ lat, lng });
        }
    };

    // Extract coordinates from map link
    const handleMapLinkPaste = (link) => {
        setMapLink(link);

        // Try to extract coordinates from various map link formats
        const osmMatch = link.match(/openstreetmap\.org.*?\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/);
        if (osmMatch) {
            const lat = parseFloat(osmMatch[1]);
            const lng = parseFloat(osmMatch[2]);
            if (!isNaN(lat) && !isNaN(lng)) {
                setPosition({ lat, lng });
                setManualLat(lat.toString());
                setManualLng(lng.toString());
                return;
            }
        }

        const coordMatch = link.match(/@?(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lng = parseFloat(coordMatch[2]);
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90) {
                setPosition({ lat, lng });
                setManualLat(lat.toString());
                setManualLng(lng.toString());
            }
        }
    };

    return (
        <div className="map-location-picker">
            {/* Instructions */}
            <div className="alert" style={{
                background: 'rgba(200,162,74,0.1)',
                border: '1px solid rgba(200,162,74,0.3)',
                borderRadius: '12px',
                color: '#F8FAFC',
                marginBottom: '16px',
                padding: '12px 16px'
            }}>
                <i className="bi bi-info-circle me-2" style={{ color: '#C8A24A' }}></i>
                <strong>Pin Your Property Location:</strong> Click on the map to place a pin, or enter coordinates manually.
            </div>

            {/* Map */}
            <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '16px',
                border: '2px solid rgba(200,162,74,0.3)'
            }}>
                <div
                    ref={mapRef}
                    style={{ height, width: '100%' }}
                />
            </div>

            {/* Manual Coordinate Input */}
            <div className="row g-3 mb-3">
                <div className="col-md-5">
                    <label className="form-label" style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                        Latitude
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        onBlur={handleManualUpdate}
                        className="form-control"
                        placeholder="e.g., 19.0760"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#F8FAFC',
                            borderRadius: '10px',
                            padding: '10px 14px'
                        }}
                    />
                </div>
                <div className="col-md-5">
                    <label className="form-label" style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                        Longitude
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        onBlur={handleManualUpdate}
                        className="form-control"
                        placeholder="e.g., 72.8777"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#F8FAFC',
                            borderRadius: '10px',
                            padding: '10px 14px'
                        }}
                    />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                    <button
                        type="button"
                        onClick={handleManualUpdate}
                        className="btn w-100"
                        style={{
                            background: '#C8A24A',
                            color: '#0F172A',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px'
                        }}
                    >
                        <i className="bi bi-check-lg"></i>
                    </button>
                </div>
            </div>

            {/* Map Link Input */}
            <div className="mb-3">
                <label className="form-label" style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                    <i className="bi bi-link-45deg me-1"></i>
                    Or paste a map link (OpenStreetMap)
                </label>
                <input
                    type="url"
                    value={mapLink}
                    onChange={(e) => handleMapLinkPaste(e.target.value)}
                    className="form-control"
                    placeholder="Paste OpenStreetMap or coordinates link..."
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#F8FAFC',
                        borderRadius: '10px',
                        padding: '10px 14px'
                    }}
                />
            </div>

            {/* Selected Location Display */}
            {position && (
                <div className="d-flex align-items-center p-3" style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '10px'
                }}>
                    <i className="bi bi-check-circle-fill me-2" style={{ color: '#10B981', fontSize: '1.2rem' }}></i>
                    <div>
                        <strong style={{ color: '#F8FAFC' }}>Location Selected</strong>
                        <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                            Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapLocationPicker;
