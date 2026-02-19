import { useState, useEffect } from 'react';

/**
 * Custom hook for browser geolocation
 * Returns user's current location with loading and error states
 */
export function useGeolocation() {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [permissionDenied, setPermissionDenied] = useState(false);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        setError(null);
        setPermissionDenied(false);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setLoading(false);
            },
            (err) => {
                setLoading(false);
                if (err.code === err.PERMISSION_DENIED) {
                    setPermissionDenied(true);
                    setError('Location access was denied. Please enable location permissions or search manually.');
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    setError('Location information is unavailable.');
                } else if (err.code === err.TIMEOUT) {
                    setError('The request to get location timed out.');
                } else {
                    setError('An unknown error occurred while getting location.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // Cache for 5 minutes
            }
        );
    };

    return {
        location,
        loading,
        error,
        permissionDenied,
        requestLocation
    };
}

export default useGeolocation;
