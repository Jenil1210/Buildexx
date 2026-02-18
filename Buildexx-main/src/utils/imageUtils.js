import { getApiUrl } from '../config';

// Cloudinary cloud name (fallback to buildexx which matches backend default)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'buildexx';

/**
 * Ensures an image / file URL is correctly formatted for display.
 * - If it's already a full URL, return it (with Cloudinary optimization applied).
 * - If it's a Cloudinary public id (e.g. properties/brochures/xxx), build the proper Cloudinary URL.
 * - Otherwise, treat as a backend-relative path and prepend API base URL.
 */
export const getImageUrl = (url) => {
    if (!url) return null;

    const targetUrl = Array.isArray(url) ? url[0] : url;
    if (!targetUrl) return null;

    // Full URLs and data URIs
    if (targetUrl.startsWith('http') || targetUrl.startsWith('data:')) {
        if (targetUrl.includes('cloudinary.com') && targetUrl.includes('/upload/')) {
            return targetUrl.replace('/upload/', '/upload/f_auto,q_auto/');
        }
        return targetUrl;
    }

    // If the stored value looks like a Cloudinary public id (contains properties/ or starts with folder),
    // construct a Cloudinary URL. Decide resource type by heuristics (pdf/brochure/legal -> raw)
    const looksLikeCloudinaryId = /properties\/.+/.test(targetUrl);
    if (looksLikeCloudinaryId) {
        const isPdfLikely = /brochur|legal|receipt|pdf|receipts?/i.test(targetUrl);
        if (isPdfLikely) {
            return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/${encodeURIComponent(targetUrl)}`;
        }
        // image path
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${encodeURIComponent(targetUrl)}`;
    }

    // Fallback: prepend backend API base
    const baseUrl = getApiUrl('');
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanUrl = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
    return `${cleanBaseUrl}${cleanUrl}`;
};

export const getImagesUrls = (images) => {
    if (!images || !Array.isArray(images)) return [];
    return images.map(img => getImageUrl(img)).filter(Boolean);
};
