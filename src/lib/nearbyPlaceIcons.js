import L from 'leaflet';

/**
 * Custom Leaflet icons for nearby places categories
 * Each icon uses a colored SVG marker with a category-specific symbol
 */

const createCategoryIcon = (color, iconClass) => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
            <path fill="${color}" stroke="#FFFFFF" stroke-width="2" d="M18 0C8.1 0 0 8.1 0 18c0 10.8 18 30 18 30s18-19.2 18-30C36 8.1 27.9 0 18 0z"/>
            <circle fill="white" cx="18" cy="18" r="10"/>
        </svg>
    `;

    return L.divIcon({
        html: `
            <div style="position: relative; width: 36px; height: 48px;">
                <div style="position: absolute; top: 0; left: 0;">
                    ${svg}
                </div>
                <div style="
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    color: ${color};
                ">
                    <i class="bi ${iconClass}"></i>
                </div>
            </div>
        `,
        className: 'nearby-place-marker',
        iconSize: [36, 48],
        iconAnchor: [18, 48],
        popupAnchor: [0, -48]
    });
};

// Pre-defined icons for each category
const nearbyPlaceIcons = {
    cinema: createCategoryIcon('#E91E63', 'bi-film'),
    hospital: createCategoryIcon('#F44336', 'bi-hospital'),
    school: createCategoryIcon('#2196F3', 'bi-book'),
    college: createCategoryIcon('#9C27B0', 'bi-mortarboard'),
    restaurant: createCategoryIcon('#FF9800', 'bi-shop'),
    cafe: createCategoryIcon('#795548', 'bi-cup-hot'),
    mall: createCategoryIcon('#4CAF50', 'bi-bag'),
    bus_stop: createCategoryIcon('#3F51B5', 'bi-bus-front'),
    metro: createCategoryIcon('#673AB7', 'bi-train-front'),
    park: createCategoryIcon('#8BC34A', 'bi-tree'),
    gym: createCategoryIcon('#FF5722', 'bi-bicycle')
};

// Property marker icon (gold)
const propertyIcon = L.divIcon({
    html: `
        <div style="position: relative; width: 40px; height: 52px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" width="40" height="52">
                <path fill="#C8A24A" stroke="#9E7C2F" stroke-width="2" d="M20 0C9 0 0 9 0 20c0 12 20 32 20 32s20-20 20-32C40 9 31 0 20 0z"/>
                <circle fill="white" cx="20" cy="20" r="8"/>
                <path fill="#C8A24A" d="M20 14l-6 5v7h4v-4h4v4h4v-7z"/>
            </svg>
        </div>
    `,
    className: 'property-marker',
    iconSize: [40, 52],
    iconAnchor: [20, 52],
    popupAnchor: [0, -52]
});

export const getIcon = (category) => nearbyPlaceIcons[category] || nearbyPlaceIcons.restaurant;
export const getPropertyIcon = () => propertyIcon;

export default nearbyPlaceIcons;
