import React, { useState, useEffect, useRef } from 'react';

/**
 * LocationSearch component with Nominatim API autocomplete
 * @param {Function} onLocationSelect - Callback when a location is selected
 * @param {string} placeholder - Input placeholder text
 * @param {string} className - Additional CSS classes
 */
const LocationSearch = ({ onLocationSelect, placeholder = "Search location...", className = "" }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [hasSelected, setHasSelected] = useState(false);
    const containerRef = useRef(null);

    // Debounced search - only search if user is typing (not after selection)
    useEffect(() => {
        if (hasSelected) return;

        const timer = setTimeout(() => {
            if (query.length >= 3) {
                searchLocations(query);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, hasSelected]);

    const searchLocations = async (searchQuery) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=6&countrycodes=in`,
                {
                    headers: {
                        'Accept-Language': 'en'
                    }
                }
            );
            const data = await response.json();

            const formattedSuggestions = data.map(item => ({
                displayName: item.display_name,
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                city: item.address?.city || item.address?.town || item.address?.village || item.address?.suburb || '',
                area: item.address?.suburb || item.address?.neighbourhood || item.address?.locality || '',
                state: item.address?.state || ''
            }));

            setSuggestions(formattedSuggestions);
            if (formattedSuggestions.length > 0) {
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (suggestion) => {
        const displayText = suggestion.city || suggestion.area || suggestion.displayName.split(',')[0];
        setQuery(displayText);
        setShowSuggestions(false);
        setSuggestions([]);
        setHasSelected(true);
        if (onLocationSelect) {
            onLocationSelect(suggestion);
        }
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        setHasSelected(false);
        if (onLocationSelect) {
            onLocationSelect(null);
        }
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        setHasSelected(false); // User is typing again, allow search
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`location-search-container ${className}`} style={{ position: 'relative' }}>
            <div className="input-group">
                <span className="input-group-text" style={{
                    background: '#1E293B',
                    border: '2px solid #C8A24A',
                    borderRight: 'none',
                    borderRadius: '10px 0 0 10px'
                }}>
                    <i className="bi bi-geo-alt" style={{ color: '#C8A24A' }}></i>
                </span>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="form-control"
                    style={{
                        background: '#1E293B',
                        border: '2px solid #C8A24A',
                        borderLeft: 'none',
                        borderRadius: '0 10px 10px 0',
                        color: '#F8FAFC',
                        padding: '12px 40px 12px 16px',
                        fontSize: '0.95rem',
                        height: '48px'
                    }}
                />
                {query && (
                    <button
                        type="button"
                        className="btn"
                        onClick={handleClear}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: '#94A3B8',
                            zIndex: 10,
                            padding: '4px 8px'
                        }}
                    >
                        <i className="bi bi-x-circle"></i>
                    </button>
                )}
            </div>

            {loading && (
                <div className="position-absolute" style={{ right: '45px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                    <div className="spinner-border spinner-border-sm" role="status" style={{ color: '#C8A24A' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <ul
                    className="list-group position-absolute w-100"
                    style={{
                        top: '100%',
                        zIndex: 1050,
                        maxHeight: '320px',
                        overflowY: 'auto',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                        borderRadius: '12px',
                        marginTop: '6px',
                        border: '2px solid #C8A24A'
                    }}
                >
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className="list-group-item"
                            onClick={() => handleSelect(suggestion)}
                            style={{
                                cursor: 'pointer',
                                background: '#1E293B',
                                border: 'none',
                                borderBottom: index === suggestions.length - 1 ? 'none' : '1px solid rgba(200,162,74,0.2)',
                                padding: '14px 16px',
                                borderRadius: index === 0 ? '10px 10px 0 0' : index === suggestions.length - 1 ? '0 0 10px 10px' : '0',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#2D3A4F';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#1E293B';
                            }}
                        >
                            <div className="d-flex align-items-center">
                                <i className="bi bi-geo-alt-fill me-3" style={{ color: '#C8A24A', fontSize: '1.1rem' }}></i>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ color: '#F8FAFC', fontWeight: '500', fontSize: '0.95rem' }}>
                                        {suggestion.city || suggestion.area || suggestion.displayName.split(',')[0]}
                                    </div>
                                    <small style={{ color: '#94A3B8', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {suggestion.displayName.length > 55
                                            ? suggestion.displayName.substring(0, 55) + '...'
                                            : suggestion.displayName}
                                    </small>
                                </div>
                                <i className="bi bi-arrow-right-circle ms-2" style={{ color: '#64748B' }}></i>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Branding for Nominatim (required by usage policy) */}
            <small className="d-block mt-1" style={{ fontSize: '10px', color: '#64748B' }}>
                Powered by OpenStreetMap
            </small>
        </div>
    );
};

export default LocationSearch;
