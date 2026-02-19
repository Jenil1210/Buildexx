/**
 * Overpass API Service
 * Fetches nearby amenities using OpenStreetMap's Overpass API
 */

// Category definitions with Overpass query tags
const CATEGORIES = {
    cinema: {
        label: 'Movie Theatre',
        icon: 'bi-film',
        color: '#E91E63',
        tags: ['amenity=cinema']
    },
    hospital: {
        label: 'Hospital',
        icon: 'bi-hospital',
        color: '#F44336',
        tags: ['amenity=hospital', 'amenity=clinic']
    },
    school: {
        label: 'School',
        icon: 'bi-book',
        color: '#2196F3',
        tags: ['amenity=school']
    },
    college: {
        label: 'College',
        icon: 'bi-mortarboard',
        color: '#9C27B0',
        tags: ['amenity=college', 'amenity=university']
    },
    restaurant: {
        label: 'Restaurant',
        icon: 'bi-shop',
        color: '#FF9800',
        tags: ['amenity=restaurant']
    },
    cafe: {
        label: 'Cafe',
        icon: 'bi-cup-hot',
        color: '#795548',
        tags: ['amenity=cafe']
    },
    mall: {
        label: 'Mall',
        icon: 'bi-bag',
        color: '#4CAF50',
        tags: ['shop=mall', 'shop=supermarket']
    },
    bus_stop: {
        label: 'Bus Stop',
        icon: 'bi-bus-front',
        color: '#3F51B5',
        tags: ['highway=bus_stop', 'amenity=bus_station']
    },
    metro: {
        label: 'Metro/Railway',
        icon: 'bi-train-front',
        color: '#673AB7',
        tags: ['railway=station', 'station=subway']
    },
    park: {
        label: 'Park',
        icon: 'bi-tree',
        color: '#8BC34A',
        tags: ['leisure=park', 'leisure=garden']
    },
    gym: {
        label: 'Gym',
        icon: 'bi-bicycle',
        color: '#FF5722',
        tags: ['leisure=fitness_centre', 'amenity=gym']
    }
};

// Cache for Overpass API responses
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Build Overpass QL query for a category
 */
const buildQuery = (category, lat, lng, radius = 3000) => {
    const categoryInfo = CATEGORIES[category];
    if (!categoryInfo) return null;

    const tagQueries = categoryInfo.tags.map(tag => {
        const [key, value] = tag.split('=');
        return `node["${key}"="${value}"](around:${radius},${lat},${lng});
way["${key}"="${value}"](around:${radius},${lat},${lng});`;
    }).join('\n');

    return `
[out:json][timeout:25];
(
${tagQueries}
);
out center tags;
`;
};

// Alternative Overpass API endpoints for failover
const OVERPASS_ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

/**
 * Fetch nearby places for a given category
 * @param {string} category - Category key from CATEGORIES
 * @param {number} lat - Latitude of the property
 * @param {number} lng - Longitude of the property
 * @param {number} radius - Search radius in meters (default: 3000m = 3km)
 * @returns {Promise<{success: boolean, data: Array, error?: string}>}
 */
export const fetchNearbyPlaces = async (category, lat, lng, radius = 3000) => {
    // Check cache first
    const cacheKey = `${category}-${lat.toFixed(4)}-${lng.toFixed(4)}-${radius}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
        return { success: true, data: cachedResult.data, fromCache: true };
    }

    const query = buildQuery(category, lat, lng, radius);
    if (!query) {
        return { success: false, error: 'Invalid category', data: [] };
    }

    // Try each endpoint until one succeeds
    for (let i = 0; i < OVERPASS_ENDPOINTS.length; i++) {
        const endpoint = OVERPASS_ENDPOINTS[i];

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'data=' + encodeURIComponent(query),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // If we get a 504, 502, 503, or 429, try the next endpoint
            if ([502, 503, 504, 429].includes(response.status)) {
                console.warn(`Overpass endpoint ${endpoint} returned ${response.status}, trying next...`);
                continue;
            }

            if (!response.ok) {
                throw new Error(`Overpass API error: ${response.status}`);
            }

            const data = await response.json();

            // Process results
            const places = data.elements
                .filter(el => el.tags && el.tags.name)
                .map(el => {
                    // Get coordinates (node has lat/lon directly, way has center)
                    const placeLat = el.lat || el.center?.lat;
                    const placeLng = el.lon || el.center?.lon;

                    if (!placeLat || !placeLng) return null;

                    return {
                        id: el.id,
                        name: el.tags.name,
                        latitude: placeLat,
                        longitude: placeLng,
                        category: category,
                        categoryInfo: CATEGORIES[category],
                        distance: calculateDistance(lat, lng, placeLat, placeLng),
                        address: el.tags['addr:street']
                            ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}, ${el.tags['addr:city'] || ''}`
                            : null,
                        phone: el.tags.phone || el.tags['contact:phone'],
                        website: el.tags.website || el.tags['contact:website'],
                        openingHours: el.tags.opening_hours
                    };
                })
                .filter(place => place !== null)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 20); // Limit to 20 results

            // Cache the result
            cache.set(cacheKey, { data: places, timestamp: Date.now() });

            return { success: true, data: places, fromCache: false };

        } catch (error) {
            // If it's the last endpoint, throw the error
            if (i === OVERPASS_ENDPOINTS.length - 1) {
                console.error('All Overpass endpoints failed:', error);

                if (error.name === 'AbortError') {
                    return {
                        success: false,
                        error: 'Request timed out. Please try again later.',
                        data: []
                    };
                }

                return {
                    success: false,
                    error: 'Nearby places service is currently unavailable. Please try again later.',
                    data: []
                };
            }

            console.warn(`Overpass endpoint ${endpoint} failed, trying next...`, error.message);
        }
    }

    return {
        success: false,
        error: 'All nearby places services are unavailable. Please try again later.',
        data: []
    };
};

/**
 * Get all available categories
 */
export const getCategories = () => CATEGORIES;

/**
 * Clear the cache
 */
export const clearCache = () => {
    cache.clear();
};

export default {
    fetchNearbyPlaces,
    getCategories,
    clearCache
};
