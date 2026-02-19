import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import LocationSearch from '../components/LocationSearch';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton';
import { getProperties, getNearbyProperties, getCities, searchProperties } from '../api/apiService';

import { useGeolocation } from '../lib/useGeolocation';

// Lazy load PropertyMap
const PropertyMap = lazy(() => import('../components/PropertyMap'));

const CACHE_VERSION = '1.0';

const PropertyList = ({ addToCompare, addToWishlist }) => {
  // ... (state definitions remain same up to cities) 
  // We can keep state definitions as is, just updating useEffect

  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState(() => {
    try {
      const cached = sessionStorage.getItem('propertiesCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.version === CACHE_VERSION && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          if (parsed.data && parsed.data.length > 0) {
            const hasCoords = parsed.data.some(p => p.latitude && p.longitude);
            if (hasCoords) return parsed.data;
          } else {
            return [];
          }
        }
      }
    } catch (e) { }
    return [];
  });

  const [filteredProperties, setFilteredProperties] = useState(() => {
    // ... same as before
    try {
      const cached = sessionStorage.getItem('propertiesCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.version === CACHE_VERSION && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          if (parsed.data && parsed.data.length > 0) {
            const hasCoords = parsed.data.some(p => p.latitude && p.longitude);
            if (hasCoords) return parsed.data;
          } else {
            return [];
          }
        }
      }
    } catch (e) { }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    // ... same as before
    try {
      const cached = sessionStorage.getItem('propertiesCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.version === CACHE_VERSION && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          if (parsed.data && parsed.data.length > 0) {
            const hasCoords = parsed.data.some(p => p.latitude && p.longitude);
            if (hasCoords) return false;
          } else if (parsed.data) {
            return false;
          }
        }
      }
    } catch (e) { }
    return true;
  });
  const [isSearching, setIsSearching] = useState(false);
  const [cities, setCities] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const dataLoadedRef = useRef(false);
  const cachedPropertiesRef = useRef([]);

  const [viewMode, setViewMode] = useState('list');
  const [mapCenter, setMapCenter] = useState({ lat: 19.0760, lng: 72.8777 });
  const { location: userLocation, loading: geoLoading, error: geoError, permissionDenied, requestLocation } = useGeolocation();
  const [nearbyMode, setNearbyMode] = useState(false);

  const [filters, setFilters] = useState({
    type: location.state?.type || '',
    purpose: location.state?.purpose
      ? (location.state.purpose.toLowerCase() === 'buy' ? 'Sale' : (location.state.purpose.charAt(0).toUpperCase() + location.state.purpose.slice(1).toLowerCase()))
      : '',
    city: '',
    locality: '',
    search: ''
  });

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9;

  // Fetch properties and cities on mount
  useEffect(() => {
    const loadCities = async () => {
      const citiesData = await getCities();
      if (citiesData && Array.isArray(citiesData)) {
        setCities(citiesData.sort((a, b) => a.localeCompare(b)));
      }
    };
    loadCities();
  }, []);

  const loadProperties = async (pageNum = 0) => {
    setLoading(true);
    try {
      // Map property type values to RESIDENTIAL or COMMERCIAL
      const mapPropertyType = (type) => {
        if (!type) return null;
        const residentialTypes = ['Apartment', 'Villa', 'House', 'Farmhouse', 'Guest House', 'Plot'];
        const commercialTypes = ['Commercial', 'Commercial Space', 'Office', 'Office Space', 'Industrial', 'Warehouse', 'Agricultural Land'];

        if (residentialTypes.includes(type)) return 'RESIDENTIAL';
        if (commercialTypes.includes(type)) return 'COMMERCIAL';
        return null;
      };

      // Map frontend filters to API filters
      const apiFilters = {
        purpose: filters.purpose === 'Sale' ? 'BUY' : (filters.purpose === 'Rent' ? 'RENT' : null),
        propertyType: mapPropertyType(filters.type),
        city: filters.city || null,
        area: filters.locality || null,
        search: filters.search || null
      };

      // Use larger page size for map view to show all properties
      const currentSize = viewMode === 'map' ? 1000 : pageSize;
      const result = await searchProperties(apiFilters, pageNum, currentSize);

      if (result.success) {
        // Map and filter: only show verified properties (include sold properties for portfolio showcasing)
        const properties = result.data.map(p => ({
          ...p,
          // Ensure availability is populated for PropertyCard
          availability: p.availability || p.availabilityStatus || p.availability_status
        })).filter(p => {
          const verified = p.is_verified ?? p.isVerified ?? false;
          return (verified === true || verified === 'true');
        });

        setFilteredProperties(properties);
        // Keep server pagination values but page content is filtered client-side
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
        setPage(pageNum);

        // Update localities if city is selected but localities is empty
        if (filters.city && localities.length === 0 && result.data.length > 0) {
          const cityLocalities = [...new Set(result.data.map(p => p.locality).filter(Boolean))];
          setLocalities(cityLocalities);
        }
      }
    } catch (err) {
      console.error("Failed to load properties", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!nearbyMode) {
      loadProperties(0);
    }
  }, [filters.type, filters.purpose, filters.city, filters.locality, filters.search, nearbyMode, viewMode]);

  // Handle location from search or geolocation
  useEffect(() => {
    if (userLocation && nearbyMode) {
      fetchNearbyProperties(userLocation.latitude, userLocation.longitude);
      setMapCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
    }
  }, [userLocation, nearbyMode]);

  const fetchProperties = async () => {
    setLoading(true);
    setNearbyMode(false);
    try {
      const result = await getProperties();

      if (result.success) {
        // Filter out unverified and sold properties (protect against stale/deleted items)
        const visible = result.data.filter(p => {
          const verified = p.is_verified ?? p.isVerified ?? false;
          const availability = (p.availability_status || p.availability || p.availabilityStatus || '').toString().toLowerCase();
          return (verified === true || verified === 'true') && availability !== 'sold';
        });

        setProperties(visible);
        setFilteredProperties(visible);

        // Cache the data (only visible ones)
        cachedPropertiesRef.current = visible;
        dataLoadedRef.current = true;

        // Cache a trimmed version to save session storage space
        const summaryData = (result.data || []).map(p => ({
          id: p.id,
          name: p.name,
          title: p.title,
          price: p.price,
          rent: p.rent,
          locality: p.locality,
          city: p.city,
          imageUrl: p.imageUrl,
          thumbnail: p.thumbnail,
          latitude: p.latitude,
          longitude: p.longitude,
          type: p.type,
          purpose: p.purpose,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area: p.area,
          availability_status: p.availability_status,
          is_verified: p.is_verified
        }));

        try {
          sessionStorage.setItem('propertiesCache', JSON.stringify({
            data: summaryData,
            timestamp: Date.now(),
            version: CACHE_VERSION
          }));
        } catch (e) {
          if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.warn('[PropertyList] Session storage full, clearing old property detail cache...');
            // Clear detail caches to make room for the main list
            Object.keys(sessionStorage).forEach(key => {
              if (key.startsWith('property_detail_')) sessionStorage.removeItem(key);
            });
            try {
              sessionStorage.setItem('propertiesCache', JSON.stringify({
                data: result.data,
                timestamp: Date.now(),
                version: CACHE_VERSION
              }));
            } catch (retryError) {
              console.warn('[PropertyList] Session storage still full, skipping properties cache');
            }
          } else {
            console.warn('[PropertyList] Skipping properties cache:', e);
          }
        }

        // Fallback: If cities array is empty (API failed), extract from visible properties
        setCities(prev => {
          if (prev.length === 0) {
            return [...new Set(visible.map(p => p.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));
          }
          return prev;
        });

      } else {
        console.error('[PropertyList] Failed to fetch properties:', result.error);
      }
    } catch (error) {
      console.error('[PropertyList] Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchNearbyProperties = async (lat, lng, radius = 10) => {
    setLoading(true);
    setIsSearching(true);
    try {
      const result = await getNearbyProperties(lat, lng, radius);
      if (result.success) {
        // Filter nearby results to verified
        const nearbyVisible = (result.data || []).filter(p => {
          const verified = p.is_verified ?? p.isVerified ?? false;
          return (verified === true || verified === 'true');
        });
        setFilteredProperties(nearbyVisible);
      } else {
        setFilteredProperties([]);
      }
    } catch (error) {
      console.error('Error fetching nearby properties:', error);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle "Near Me" button click
  const handleNearMe = () => {
    setNearbyMode(true);
    requestLocation();
  };

  // Handle location selected from search
  const handleLocationSelect = (location) => {
    if (location) {
      setMapCenter({ lat: location.latitude, lng: location.longitude });

      // First try to filter by city name match
      const cityName = location.city?.toLowerCase();
      const areaName = location.area?.toLowerCase();

      let matchedProperties = properties.filter(p => {
        const propCity = p.city?.toLowerCase() || '';
        const propLocality = p.locality?.toLowerCase() || '';
        return propCity.includes(cityName || '') ||
          propLocality.includes(cityName || '') ||
          propCity.includes(areaName || '') ||
          propLocality.includes(areaName || '');
      });

      // If we have good matches, show those
      if (matchedProperties.length > 0) {
        setFilteredProperties(matchedProperties);
        setNearbyMode(false);
      } else {
        // Otherwise, search by proximity (within 50km radius)
        setNearbyMode(true);
        fetchNearbyProperties(location.latitude, location.longitude, 50);
      }

      // Also update city filter if exact match exists
      if (location.city && cities.includes(location.city)) {
        setFilters(prev => ({ ...prev, city: location.city }));
      }
    } else {
      // Clear was clicked, reset to all properties (force refresh)
      setNearbyMode(false);
      refreshProperties();
    }
  };

  // Filters are now handled server-side in loadProperties

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'city' ? { locality: '' } : {})
    }));
  };

  const clearFilters = () => {
    // Clear UI filters and cached property list, then reload verified properties
    setFilters({
      type: '',
      purpose: '',
      city: '',
      locality: '',
      search: '',
      searchBuffer: ''
    });
    setLocalities([]);
    setNearbyMode(false);
    try { sessionStorage.removeItem('propertiesCache'); } catch (e) { }
    loadProperties(0);
  };

  const refreshProperties = () => {
    // Force refresh from server and clear client cache
    try { sessionStorage.removeItem('propertiesCache'); } catch (e) { }
    loadProperties(0);
  };

  const handleMarkerClick = (property) => {
    navigate(`/property/${property.id}`);
  };

  return (
    <div className="property-list-page animate__animated animate__fadeIn" style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <div className="container-fluid py-4">
        {/* Page Header */}
        <div className="mb-4">
          <div style={{
            background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--charcoal-slate) 100%)',
            borderRadius: '20px',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(200,162,74,0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />

            <h1 className="fw-bold mb-2" style={{ color: 'var(--primary-text)' }}>
              <i className="bi bi-building me-3" style={{ color: 'var(--construction-gold)' }}></i>
              Find Your Perfect Property
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Browse verified properties from trusted builders
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div style={{
          background: 'var(--card-bg)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          <h5 className="fw-bold mb-4" style={{ color: 'var(--primary-text)' }}>
            <i className="bi bi-funnel me-2" style={{ color: 'var(--construction-gold)' }}></i>
            Filter Properties
          </h5>

          {/* Search Bar & Near Me */}
          <div className="row g-3 mb-4 align-items-center">
            <div className="col-md-9 position-relative">
              <div className="input-group input-group-sm"> {/* Added input-group-sm for smaller size */}
                <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search city, area, or property..."
                  value={filters.searchBuffer || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters(prev => ({ ...prev, searchBuffer: val }));

                    // Simple debounce for OSM Autocomplete
                    if (val.length > 2) {
                      const timerId = setTimeout(async () => {
                        try {
                          // Fetch from OpenStreetMap Nominatim
                          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${val}&countrycodes=in&limit=5`, {
                            headers: { 'User-Agent': 'BuildexApp/1.0' }
                          });
                          const data = await response.json();
                          // We use 'display_name' for the list
                          setSuggestions(data);
                        } catch (err) {
                          console.error("OSM Fetch Error", err);
                        }
                      }, 400); // 400ms debounce
                      return () => clearTimeout(timerId); // Cleanup not fully effective in inline, but acceptable for simple case or move to useEffect
                    } else {
                      setSuggestions([]);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setFilters(prev => ({ ...prev, search: prev.searchBuffer }));
                      setSuggestions([]);
                    }
                  }}
                  style={{ height: '38px', boxShadow: 'none', fontSize: '0.9rem' }}
                />

                {/* Search Button */}
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, search: prev.searchBuffer }));
                    setSuggestions([]);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
                    border: 'none',
                    padding: '0 16px',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  Search
                </button>

                <button
                  className="btn ms-2"
                  onClick={handleNearMe}
                  disabled={geoLoading}
                  style={{
                    background: nearbyMode ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    color: 'white',
                    padding: '0 16px',
                    borderRadius: '0 8px 8px 0',
                    fontWeight: '600',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem'
                  }}
                >
                  {geoLoading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <i className="bi bi-crosshair"></i>
                  )}
                  {nearbyMode ? 'Nearby' : 'Near Me'}
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {suggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000, top: '100%', left: 0 }}>
                  {suggestions.map((item, idx) => (
                    <li
                      key={idx}
                      className="list-group-item list-group-item-action cursor-pointer"
                      style={{ fontSize: '0.9rem', cursor: 'pointer' }}
                      onClick={() => {
                        // User selects a location from OSM list
                        const displayName = item.display_name.split(',')[0]; // Simple extraction
                        setFilters(prev => ({
                          ...prev,
                          searchBuffer: displayName,
                          search: displayName // Automatically trigger search
                        }));
                        setSuggestions([]);
                        // Optional: Could also use item.lat/item.lon to set map center or fetchNearby
                        setMapCenter({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
                      }}
                    >
                      <i className="bi bi-geo-alt me-2 text-muted"></i>
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-md-3">
              {/* View Toggle */}
              <div className="btn-group w-100" role="group" style={{ height: '48px' }}>
                <button
                  type="button"
                  className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('list')}
                  style={{
                    background: viewMode === 'list' ? 'var(--construction-gold)' : 'transparent',
                    border: viewMode === 'list' ? 'none' : '1px solid rgba(200,162,74,0.5)',
                    color: viewMode === 'list' ? '#0F172A' : '#F8FAFC',
                    height: '100%'
                  }}
                >
                  <i className="bi bi-list-ul me-1"></i>List
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('map')}
                  style={{
                    background: viewMode === 'map' ? 'var(--construction-gold)' : 'transparent',
                    border: viewMode === 'map' ? 'none' : '1px solid rgba(200,162,74,0.5)',
                    color: viewMode === 'map' ? '#0F172A' : '#F8FAFC',
                    height: '100%'
                  }}
                >
                  <i className="bi bi-map me-1"></i>Map
                </button>
              </div>
            </div>
          </div>

          {/* Permission Denied Message */}
          {permissionDenied && (
            <div className="alert mb-4" style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              color: 'var(--primary-text)'
            }}>
              <i className="bi bi-info-circle me-2" style={{ color: '#F59E0B' }}></i>
              📍 Location access is required to show properties near you. Please enable location permissions or search manually.
            </div>
          )}

          {/* Nearby Mode Indicator */}
          {nearbyMode && userLocation && (
            <div className="alert mb-4" style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              color: 'var(--primary-text)'
            }}>
              <i className="bi bi-geo-alt-fill me-2" style={{ color: '#10B981' }}></i>
              <strong>Showing properties near you</strong> (within 10 km)
              <button
                className="btn btn-sm ms-3"
                onClick={clearFilters}
                style={{ background: 'transparent', color: '#10B981', border: '1px solid #10B981' }}
              >
                Show All Properties
              </button>
            </div>
          )}

          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--primary-text)' }}>Property Type</label>
              <select
                className="form-select custom-dropdown"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                disabled={isSearching || loading}
              >
                <option value="">All Types</option>
                <optgroup label="Residential">
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="House">House</option>
                  <option value="Farmhouse">Farmhouse</option>
                  <option value="Guest House">Guest House</option>
                </optgroup>
                <optgroup label="Commercial">
                  <option value="Commercial">Commercial Space</option>
                  <option value="Office">Office Space</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Warehouse">Warehouse</option>
                </optgroup>
                <optgroup label="Land">
                  <option value="Plot">Plot</option>
                  <option value="Agricultural Land">Agricultural Land</option>
                </optgroup>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--primary-text)' }}>Purpose</label>
              <select
                className="form-select custom-dropdown"
                name="purpose"
                value={filters.purpose}
                onChange={handleFilterChange}
                disabled={isSearching || loading}
              >
                <option value="">Both</option>
                <option value="Sale">Buy</option>
                <option value="Rent">Rent</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--primary-text)' }}>City</label>
              <select
                className="form-select custom-dropdown"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                disabled={isSearching || loading}
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--primary-text)' }}>Locality</label>
              <select
                className="form-select custom-dropdown"
                name="locality"
                value={filters.locality}
                onChange={handleFilterChange}
                disabled={!filters.city || isSearching || loading}
                style={{ opacity: filters.city ? 1 : 0.6 }}
              >
                <option value="">All Localities</option>
                {localities.map(locality => (
                  <option key={locality} value={locality}>{locality}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 d-flex gap-3">
            <button
              className="btn"
              onClick={clearFilters}
              style={{
                background: '#0F1E33',
                color: '#64748B',
                padding: '10px 24px',
                borderRadius: '10px',
                fontWeight: '600',
                border: '1px solid #E2E8F0'
              }}
            >
              <i className="bi bi-x-circle me-2"></i>Clear Filters
            </button>
            <button
              className="btn"
              onClick={refreshProperties}
              style={{
                background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
                color: '#0F172A',
                padding: '10px 24px',
                borderRadius: '10px',
                fontWeight: '600',
                border: 'none'
              }}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>Refresh
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <span style={{
              background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
              color: '#0F172A',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>
              {nearbyMode ? filteredProperties.length : totalElements}
            </span>
            <div className="d-flex flex-column">
              <h5 className="mb-0" style={{ color: '#0F172A' }}>
                {nearbyMode ? 'Properties Near You' : 'Properties Found'}
              </h5>
            </div>
          </div>
        </div>

        {/* Loading State with Skeleton */}
        {loading && (
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div className="col-lg-4 col-md-6" key={n}>
                <PropertyCardSkeleton />
              </div>
            ))}
          </div>
        )}

        {/* Map View */}
        {!loading && viewMode === 'map' && (
          <div className="mb-4">
            {filteredProperties.length > 0 ? (
              <Suspense fallback={
                <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F1E33', borderRadius: '16px' }}>
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading map...</span>
                  </div>
                </div>
              }>
                <PropertyMap
                  properties={filteredProperties}
                  center={mapCenter}
                  zoom={nearbyMode ? 13 : 11}
                  height="500px"
                  onMarkerClick={handleMarkerClick}
                />
              </Suspense>
            ) : (
              <div className="text-center py-5" style={{
                background: '#0F1E33',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                height: '500px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #C8A24A20, #C8A24A10)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <i className="bi bi-geo-alt" style={{ fontSize: '3rem', color: '#C8A24A' }}></i>
                </div>
                <h4 style={{ color: '#F8FAFC' }}>No properties found in this area</h4>
                <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto 20px' }}>
                  Try searching a different location or clearing filters
                </p>
                <button
                  className="btn"
                  onClick={clearFilters}
                  style={{
                    background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
                    color: '#0F172A',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    border: 'none'
                  }}
                >
                  Clear Filters & Show All
                </button>
              </div>
            )
            }
            <p className="text-center mt-2" style={{ color: '#64748B', fontSize: '0.85rem' }}>
              <i className="bi bi-info-circle me-1"></i>
              Click on any property pin to view details
            </p>
          </div>
        )}

        {/* Property Cards with Animation */}
        {!loading && viewMode === 'list' && filteredProperties.length > 0 ? (
          <motion.div className="row g-4" layout>
            <AnimatePresence>
              {filteredProperties.map((property, index) => (
                <motion.div
                  className="col-lg-4 col-md-6"
                  key={property.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PropertyCard
                    property={property}
                    addToCompare={addToCompare}
                    addToWishlist={addToWishlist}
                  />
                  {/* Show distance badge for nearby properties */}
                  {property.distance && (
                    <div className="mt-2 text-center">
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}>
                        <i className="bi bi-pin-map me-1"></i>
                        {property.distance.toFixed(1)} km away
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : !loading && viewMode === 'list' && (
          <div className="text-center py-5" style={{
            background: '#0F1E33',
            borderRadius: '16px',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #C8A24A20, #C8A24A10)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <i className="bi bi-search" style={{ fontSize: '3rem', color: '#C8A24A' }}></i>
            </div>
            <h4 style={{ color: '#F8FAFC' }}>No properties found</h4>
            <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto 20px' }}>
              {nearbyMode
                ? 'No properties found within 10 km of your location. Try searching a different area.'
                : 'Try adjusting your filters or check back later for new listings'
              }
            </p>
            <button
              className="btn"
              onClick={clearFilters}
              style={{
                background: 'linear-gradient(135deg, #C8A24A, #9E7C2F)',
                color: '#0F172A',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '600',
                border: 'none'
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="d-flex justify-content-center mt-5 mb-5">
            <nav>
              <ul className="pagination shadow-sm">
                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => {
                      loadProperties(page - 1);
                      window.scrollTo(0, 0);
                    }}
                    style={{ background: '#0F1E33', color: '#C8A24A', border: '1px solid rgba(200,162,74,0.3)', padding: '10px 20px' }}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => {
                        loadProperties(i);
                        window.scrollTo(0, 0);
                      }}
                      style={{
                        background: page === i ? 'var(--construction-gold)' : '#0F1E33',
                        color: page === i ? '#0F172A' : '#C8A24A',
                        border: '1px solid rgba(200,162,74,0.3)',
                        padding: '10px 20px',
                        fontWeight: page === i ? '700' : '400'
                      }}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => {
                      loadProperties(page + 1);
                      window.scrollTo(0, 0);
                    }}
                    style={{ background: '#0F1E33', color: '#C8A24A', border: '1px solid rgba(200,162,74,0.3)', padding: '10px 20px' }}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyList;
