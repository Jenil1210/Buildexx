import { API_BASE_URL } from '../config';

const handleResponse = async (response) => {
    const text = await response.text();
    if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        if (text) {
            try {
                const errorJson = JSON.parse(text);
                errorMessage = errorJson.message || errorJson.error || (Array.isArray(errorJson) ? errorJson[0] : text);
                if (typeof errorMessage !== 'string') errorMessage = JSON.stringify(errorMessage);
            } catch (e) {
                errorMessage = text;
            }
        }
        throw new Error(errorMessage);
    }

    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch (e) {
        return text;
    }
};

// Normalize backend property data to frontend field names
export const normalizeProperty = (p) => {
    if (!p) return p;
    const isNumeric = (val) => !isNaN(parseFloat(val)) && isFinite(val);

    // Smart Locality Extraction: Ignore numeric values (often area sqft)
    // Some fields might already be normalized if this is called twice. Handle that.
    let rawLocality = p.locality || p.area || (p.address && p.address.area);
    if (isNumeric(rawLocality)) {
        // If 'area' is a number, it's likely sqft, not location name. Try finding another field or default to empty.
        rawLocality = (p.locality && !isNumeric(p.locality)) ? p.locality : '';
    }

    // Builder Extraction
    const builderName = p.builderName || p.builder_name ||
        (p.builder && (p.builder.companyName || p.builder.name || p.builder.username)) || '';

    return {
        ...p,
        // Map backend camelCase and new Cloudinary names to frontend expected names
        name: p.title || p.name,
        title: p.title || p.name,
        locality: (rawLocality && !isNumeric(rawLocality)) ? rawLocality : '',
        imageUrl: p.imageUrl || p.image_url,
        images: p.galleryImages || p.imageUrls || p.images || (p.thumbnail ? [p.thumbnail] : []),
        galleryImages: p.galleryImages || p.imageUrls || p.images || [],
        imageUrls: p.galleryImages || p.imageUrls || p.images || (p.thumbnail ? [p.thumbnail] : []),
        thumbnail: p.imageUrl || p.image_url || p.thumbnail || (p.galleryImages && p.galleryImages[0]) || (p.imageUrls && p.imageUrls[0]) || (p.images && p.images[0]) || '',
        builder_name: builderName,
        builder_id: p.builderId || (p.builder && p.builder.id) || p.builder_id,
        type: p.propertyType || p.type,
        propertyType: p.propertyType || p.type,
        availability_status: p.availabilityStatus || p.availability_status || p.availability,
        availability: p.availabilityStatus || p.availability_status || p.availability,
        construction_status: p.constructionStatus || p.construction_status,
        possession: p.possessionStatus || p.possession || p.possessionYear,
        rent_amount: p.rentAmount || p.rent_amount || p.rent,
        rent: p.rentAmount || p.rent_amount || p.rent,
        area_sqft: p.areaSqft || p.area_sqft,
        areaSqft: p.areaSqft || p.area_sqft,
        brochure_url: p.brochureUrl || p.brochure_url,
        google_map_link: p.googleMapLink || p.google_map_link,
        legal_document_url: p.legalDocumentUrl || p.legal_document_url || p.legalDocumentPath || p.legal_document_path,
        legal_document_path: p.legalDocumentUrl || p.legal_document_url || p.legalDocumentPath || p.legal_document_path,
        panorama_image_url: p.panorama_image_url || p.panoramaImageUrl || p.panorama_image_path || p.panoramaImagePath || p.virtual_tour_link || p.virtualTourLink,
        panorama_image_path: p.panorama_image_url || p.panoramaImageUrl || p.panorama_image_path || p.panoramaImagePath || p.virtual_tour_link || p.virtualTourLink,
        panoramaImages: (p.panorama_images && p.panorama_images.length > 0) ? p.panorama_images : ((p.panoramaImages && p.panoramaImages.length > 0) ? p.panoramaImages : (p.virtualTours || [])),
        is_verified: p.isVerified ?? p.is_verified,
        isVerified: p.isVerified ?? p.is_verified,
        created_at: p.createdAt || p.created_at,
        deposit_amount: p.depositAmount || p.deposit_amount,
        virtual_tour_link: p.virtualTourLink || p.virtual_tour_link,
    };
};

export const searchProperties = async (filters = {}, page = 0, size = 10) => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });
        queryParams.append('page', page);
        queryParams.append('size', size);

        const response = await fetch(`${API_BASE_URL}/api/properties/search?${queryParams}`);
        const data = await handleResponse(response);

        let properties = [];
        let totalPages = 0;
        let totalElements = 0;

        if (data && data.content) {
            properties = data.content;
            totalPages = data.totalPages;
            totalElements = data.totalElements;
        } else if (Array.isArray(data)) {
            properties = data;
        }

        return {
            success: true,
            data: properties.map(normalizeProperty),
            totalPages,
            totalElements,
            currentPage: page
        };
    } catch (error) {
        console.error("Error searching properties:", error);
        return { success: false, error: error.message };
    }
};

// --- Property APIs ---

export const getProperties = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/properties`);
        const data = await handleResponse(response);
        let properties = [];
        if (Array.isArray(data)) {
            properties = data;
        } else if (data && data.content) {
            properties = data.content;
        } else if (data && data.data) {
            properties = data.data;
        }
        return { success: true, data: properties.map(normalizeProperty) };
    } catch (error) {
        console.error("Error fetching properties:", error);
        return { success: false, error: error.message };
    }
};

export const getNearbyProperties = async () => {
    return getProperties(); // Fallback
};

export const getCities = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/properties/cities`);
        return await handleResponse(response);
    } catch (error) {
        console.error("Error fetching cities:", error);
        return [];
    }
};

export const getPropertyById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/properties/${id}`);
        const data = await handleResponse(response);
        return { success: true, data: normalizeProperty(data) };
    } catch (error) {
        console.error(`Error fetching property ${id}:`, error);
        return { success: false, error: error.message };
    }
};

export const createProperty = async (data) => {
    try {
        console.log('[apiService] Creating property with payload:', JSON.stringify(data, null, 2));
        const response = await fetch(`${API_BASE_URL}/api/properties/builder/${data.builderId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await handleResponse(response);
        return { success: true, data: result };
    } catch (error) {
        console.error('[apiService] Error creating property:', error);
        return { success: false, error: error.message };
    }
};

export const updateProperty = async (id, data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await handleResponse(response);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteProperty = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            return { success: true };
        } else {
            const error = await handleResponse(response);
            return { success: false, error: error.message || 'Failed to delete' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteComplaint = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/complaints/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, error: 'Failed to delete complaint' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteEnquiry = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/enquiries/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, error: 'Failed to delete enquiry' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteRentRequest = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/rent-requests/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, error: 'Failed to delete rent request' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updatePropertyAvailability = async (id, status) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/properties/${id}/availability?status=${status}`, {
            method: 'PATCH'
        });
        const result = await handleResponse(response);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const uploadPropertyImages = async (files) => {
    try {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        const response = await fetch(`${API_BASE_URL}/api/properties/upload-images`, {
            method: 'POST',
            body: formData
        });

        const result = await handleResponse(response);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error uploading images:', error);
        return { success: false, error: error.message };
    }
};

export const uploadLegalDocument = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/api/properties/upload-legal-doc`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const fileName = await response.text();
            return { success: true, data: fileName };
        } else {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${errorText}`);
        }
    } catch (error) {
        console.error('Error uploading document:', error);
        return { success: false, error: error.message };
    }
};

export const uploadBrochure = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/api/properties/upload-brochure`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const url = await response.text();
            return { success: true, data: url };
        } else {
            throw new Error('Brochure upload failed');
        }
    } catch (error) {
        console.error('Error uploading brochure:', error);
        return { success: false, error: error.message };
    }
};

export const uploadPanoramaImages = async (files) => {
    try {
        const formData = new FormData();
        const fileArray = Array.isArray(files) ? files : Array.from(files);
        fileArray.forEach(file => {
            formData.append('files', file);
        });

        const response = await fetch(`${API_BASE_URL}/api/properties/upload-panorama`, {
            method: 'POST',
            body: formData
        });

        const result = await handleResponse(response);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error uploading panorama images:', error);
        return { success: false, error: error.message };
    }
};

// --- User/Builder/Admin Specific ---

export const scheduleVisit = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/enquiries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, enquiryType: 'VISIT' })
        });
        const result = await handleResponse(response);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getUserWishlist = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/wishlist`);
        const data = await handleResponse(response);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const removeFromWishlist = async (userId, propertyId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/wishlist/${propertyId}`, {
            method: 'DELETE'
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getUserEnquiries = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/enquiries/user/${userId}`);
        const data = await handleResponse(response);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getUserRentHistory = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/rent-requests/user/${userId}`);
        const data = await handleResponse(response);

        let requests = [];
        if (Array.isArray(data)) {
            requests = data;
        } else if (data && data.content) {
            requests = data.content;
        } else if (data && data.data) {
            requests = data.data;
        }

        const normalized = requests.map(req => ({
            ...req,
            property: req.property ? normalizeProperty(req.property) : null
        }));

        return { success: true, data: normalized };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getUserPayments = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/user/${userId}`);
        const data = await handleResponse(response);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const fetchUserRentSubscriptions = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/rent-subscriptions/user/${userId}`);
        const data = await handleResponse(response);

        // Normalize property data inside subscriptions
        const normalized = (data || []).map(sub => ({
            ...sub,
            property: sub.property ? normalizeProperty(sub.property) : null,
            // Map backend fields to frontend expectation if needed (e.g. snack_case to camelCase)
            rent_amount: sub.monthlyRent,
            next_payment_due: sub.nextPaymentDue,
            city: sub.property?.city,
            area: sub.property?.locality,
            property_name: sub.property?.title || sub.property?.name
        }));

        return { success: true, data: normalized };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const payRent = async (subscriptionId, amount) => {
    // Determine target URL - leveraging existing payment flow or specific rent payment
    // For now, we can reuse the create-order flow if we have propertyId, or implement specific logic
    // But since the UI calls this, let's just use a placeholder success for now as the main payment flow is via PaymentButton
    return { success: true };
};

// Builder APIs

export const getPropertiesByBuilder = async (builderId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/properties/builder/${builderId}`);
        const data = await handleResponse(response);
        const properties = Array.isArray(data) ? data : (data.data || data.content || []);
        return { success: true, data: properties.map(normalizeProperty) };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getBuilderEnquiries = async (builderId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/enquiries/builder/${builderId}`);
        const data = await handleResponse(response);
        const enquiries = Array.isArray(data) ? data : (data.data || data.content || []);
        return { success: true, data: enquiries };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateEnquiryStatus = async (id, status) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/enquiries/${id}/status?status=${status}`, {
            method: 'PATCH'
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getRentRequestsByBuilder = async (builderId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/rent-requests/builder/${builderId}`);
        const data = await handleResponse(response);
        const requests = Array.isArray(data) ? data : (data.data || data.content || []);
        return { success: true, data: requests };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateRentRequestStatus = async (id, status) => {
    try {
        const endpoint = status.toLowerCase() === 'approved'
            ? `${API_BASE_URL}/api/rent-requests/${id}/approve`
            : `${API_BASE_URL}/api/rent-requests/${id}/reject`;

        const response = await fetch(endpoint, {
            method: 'PATCH'
        });

        if (!response.ok) {
            throw new Error(`Failed to ${status} request`);
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getBuilderPayments = async (builderId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/builder/${builderId}`);
        const data = await handleResponse(response);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const createWithdrawalRequest = async (builderId, amount) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/withdrawals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ builderId, amount })
        });
        const data = await handleResponse(response);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getBuilderWithdrawals = async (builderId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/withdrawals/builder/${builderId}`);
        const data = await handleResponse(response);
        // Calculate balance from data if needed, or assume backend does it (Controller returns List<Withdrawal>)
        // BuilderDashboard expects success, data, plus totalEarned/balance
        const totalEarned = data.filter(w => w.status === 'approved').reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
        const payout = data.filter(w => w.status === 'approved').reduce((sum, w) => sum + (parseFloat(w.payoutAmount) || 0), 0);

        return {
            success: true,
            data,
            totalEarned,
            balance: totalEarned // This is a simplification, ideally backend tracks this
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Admin APIs

export const getAllBuilders = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/builders`);
        const data = await handleResponse(response);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateBuilderStatus = async (id, status) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}/status?status=${status}`, {
            method: 'PATCH'
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllProperties = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/properties/all`);
        const data = await handleResponse(response);
        let properties = [];
        if (Array.isArray(data)) {
            properties = data;
        } else if (data && data.content) {
            properties = data.content;
        }
        return { success: true, data: properties.map(normalizeProperty) };
    } catch (error) {
        console.error("Error fetching all properties (admin):", error);
        return { success: false, error: error.message };
    }
};

export const updatePropertyStatus = async (id, status) => {
    // Mock or implement actual endpoint
    return updatePropertyAvailability(id, status);
};

export const getAllComplaints = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/complaints`);
        const data = await handleResponse(response);
        // Complaints contain property objects which should be normalized
        const normalized = (data || []).map(c => ({
            ...c,
            property: c.property ? normalizeProperty(c.property) : null
        }));
        return { success: true, data: normalized };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateComplaintStatus = async (id, status) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/complaints/${id}/status?status=${status}`, {
            method: 'PATCH'
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const verifyProperty = async (id, isVerified, userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/properties/${id}/verify?isVerified=${isVerified}&userId=${userId || 1}`, {
            method: 'PATCH'
        });
        const result = await handleResponse(response);
        return { success: true, data: normalizeProperty(result) };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAdminEnquiries = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/enquiries/all`);
        const data = await handleResponse(response);
        // Enquiries contain property objects which should be normalized
        const normalized = (data || []).map(e => ({
            ...e,
            property: e.property ? normalizeProperty(e.property) : null
        }));
        return { success: true, data: normalized };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAdminPayments = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/all`);
        const data = await handleResponse(response);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAdminWithdrawals = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/withdrawals/all`);
        const data = await handleResponse(response);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateWithdrawalStatus = async (id, status, commission, payout) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/withdrawals/${id}/status?status=${status}&commission=${commission || 0}&payout=${payout || 0}`, {
            method: 'PATCH'
        });
        const data = await handleResponse(response);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Forms
export const createEnquiry = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/enquiries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await handleResponse(response);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const createRentRequest = async (data) => {
    try {
        // Fix for backend expecting nested property object
        const payload = { ...data };
        if (payload.propertyId && !payload.property) {
            payload.property = { id: payload.propertyId };
        }

        const response = await fetch(`${API_BASE_URL}/api/rent-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await handleResponse(response);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const createComplaint = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/complaints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await handleResponse(response);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const reportProperty = async (data) => {
    return createComplaint(data);
};

// Payment & Booking APIs
export const createPaymentOrder = async (userId, propertyId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, propertyId })
        });
        const data = await handleResponse(response);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const verifyPayment = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await handleResponse(response);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const checkBookingStatus = async (userId, propertyId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/check-booking?userId=${userId}&propertyId=${propertyId}`);
        const result = await handleResponse(response);
        return { success: true, ...result }; // Backend returns { isBooked: boolean }
    } catch (error) {
        console.error("Error checking booking status:", error);
        return { success: false, isBooked: false, error: error.message };
    }
};

export const getPaymentById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/${id}`);
        // Backend returns the Payment object directly
        const data = await handleResponse(response);
        return { success: true, data };
    } catch (error) {
        console.error(`Error fetching payment ${id}:`, error);
        return { success: false, error: error.message };
    }
};

export const deletePayment = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            return { success: true };
        } else {
            const error = await handleResponse(response);
            return { success: false, error: error.message || 'Failed to delete payment' };
        }
    } catch (error) {
        console.error(`Error deleting payment ${id}:`, error);
        return { success: false, error: error.message };
    }
};
