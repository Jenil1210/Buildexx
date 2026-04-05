-- Full Database Setup Script for Buildex
-- Combined from complete_schema.sql and row.sql

-- ==========================================
-- 1. Schema Definition (from complete_schema.sql)
-- ==========================================

-- Drop tables if they exist to start fresh (Reverse order of dependencies)
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS rent_requests CASCADE;
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS property_panorama_images CASCADE;
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS property_amenities CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Handles Both Users and Builders)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(255),
    role VARCHAR(50), -- user, builder, admin
    status VARCHAR(50), -- active, pending_verification
    
    -- Builder Specific Fields
    company_name VARCHAR(255),
    gst_number VARCHAR(255),
    address VARCHAR(1000),
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, VERIFIED
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Properties Table
CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    builder_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT, -- Changed to TEXT for simplicity and length
    property_type VARCHAR(50), -- RESIDENTIAL, COMMERCIAL
    purpose VARCHAR(50), -- BUY, RENT
    price DECIMAL(19, 2),
    rent_amount DECIMAL(19, 2),
    deposit_amount DECIMAL(19, 2),
    area_sqft INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    possession_year INTEGER,
    construction_status VARCHAR(50), -- UNDER_CONSTRUCTION, READY
    availability_status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, BOOKED, SOLD, RENTED
    city VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL, -- "locality" in frontend
    google_map_link TEXT,
    brochure_url TEXT,
    virtual_tour_link TEXT,
    legal_document_path TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    panorama_image_path TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Properties (Matching Property.java)
CREATE INDEX idx_property_city ON properties(city);
CREATE INDEX idx_property_purpose ON properties(purpose);
CREATE INDEX idx_property_type ON properties(property_type);
CREATE INDEX idx_property_price ON properties(price);
CREATE INDEX idx_property_rent ON properties(rent_amount);
CREATE INDEX idx_property_status ON properties(availability_status);

-- 3. Property Amenities (Set Collection)
CREATE TABLE property_amenities (
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity VARCHAR(255) NOT NULL,
    PRIMARY KEY (property_id, amenity)
);

-- 4. Property Images (List Collection with Order)
CREATE TABLE property_images (
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_order INTEGER NOT NULL,
    PRIMARY KEY (property_id, image_order)
);

-- 5. Property Panorama Images (List Collection with Order)
CREATE TABLE property_panorama_images (
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    panorama_image_url TEXT NOT NULL,
    image_order INTEGER NOT NULL,
    PRIMARY KEY (property_id, image_order)
);

-- 6. Enquiries Table
CREATE TABLE enquiries (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message VARCHAR(1000),
    enquiry_type VARCHAR(50), -- BUY, RENT, VISIT
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Rent Requests Table
CREATE TABLE rent_requests (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    monthly_rent DECIMAL(19, 2),
    deposit DECIMAL(19, 2),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Payments Table (Razorpay Integrated)
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    builder_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50), -- PENDING, SUCCESS, FAILED, REFUNDED
    amount DECIMAL(19, 2), -- Transaction amount
    total_amount DECIMAL(19, 2), -- Full property/rent price
    remaining_amount DECIMAL(19, 2), -- Calculated balance
    payment_type VARCHAR(50), -- BUY, RENT
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Withdrawals Table (For Builders)
CREATE TABLE withdrawals (
    id BIGSERIAL PRIMARY KEY,
    builder_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(19, 2) NOT NULL,
    commission_amount DECIMAL(19, 2),
    payout_amount DECIMAL(19, 2),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Complaints Table
CREATE TABLE complaints (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, RESOLVED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. Initial Data Seeding
-- ==========================================

-- Seed a default Builder account (Required for Properties)
-- Password is 'password' (bcrypt hash placeholder, update using correct encoder if needed)
INSERT INTO users (username, email, password, full_name, role, status, company_name, verification_status)
VALUES (
    'demo_builder', 
    'builder@buildex.com', 
    '$2a$10$X7.1.i.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', -- Placeholder hash
    'Demo Builder', 
    'BUILDER', 
    'active', 
    'Buildex Constructions', 
    'VERIFIED'
) ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- 3. Property Data (from row.sql)
-- ==========================================

INSERT INTO properties (
    id, title, description, property_type, purpose, 
    price, rent_amount, deposit_amount, 
    area_sqft, bedrooms, bathrooms, possession_year, 
    construction_status, availability_status, city, area, 
    google_map_link, brochure_url, virtual_tour_link, 
    legal_document_path, panorama_image_path, is_verified, 
    latitude, longitude, builder_id, created_at
) VALUES 
-- 1. Green Valley Apartments (BUY)
(
    1, 
    'Green Valley Apartments', 
    'Spacious 3BHK apartment with modern amenities and lush green surroundings.', 
    'APARTMENT', 
    'BUY', 
    5500000, NULL, NULL, -- Price, Rent, Deposit
    1450, 3, 3, 2024, -- Area, Beds, Baths, Possession
    'READY', 'AVAILABLE', 'Ahmedabad', 'Satellite', 
    NULL, NULL, NULL, NULL, NULL, -- URLs
    true, 23.0338, 72.5850, -- Verified, Lat, Lon
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 2. Blue Ridge Villa (RENT)
(
    2, 
    'Blue Ridge Villa', 
    'Luxury 4BHK villa with private garden and pool access.', 
    'VILLA', 
    'RENT', 
    NULL, 45000, 200000, -- Price, Rent (Est), Deposit (Est)
    3200, 4, 4, 2023, 
    'READY', 'AVAILABLE', 'Pune', 'Kalyani Nagar', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 18.5482, 73.9030, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 3. Skyline Towers (BUY)
(
    3, 
    'Skyline Towers', 
    'Premium high-rise apartment with panoramic city views.', 
    'APARTMENT', 
    'BUY', 
    8500000, NULL, NULL, 
    1800, 3, 3, 2025, 
    'UNDER_CONSTRUCTION', 'AVAILABLE', 'Delhi', 'Dwarka', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 28.5823, 77.0500, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 4. Ocean Breeze (RENT)
(
    4, 
    'Ocean Breeze', 
    'Sea-facing 2BHK apartment in a prime location.', 
    'APARTMENT', 
    'RENT', 
    NULL, 60000, 300000, 
    1100, 2, 2, 2022, 
    'READY', 'AVAILABLE', 'Mumbai', 'Worli', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 19.0167, 72.8167, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 5. Lakeview Apartments (BUY)
(
    5, 
    'Lakeview Apartments', 
    'Affordable 2BHK apartment with scenic lake views and peaceful surroundings.', 
    'APARTMENT', 
    'BUY', 
    4800000, NULL, NULL, -- Price, Rent, Deposit
    1300, 2, 2, 2024, -- Area, Beds, Baths, Possession
    'READY', 'AVAILABLE', 'Rajkot', 'Kalawad Road', 
    NULL, NULL, NULL, NULL, NULL, -- URLs
    true, 22.3039, 70.8022, -- Verified, Lat, Lon
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 6. Urban Nest Residency (RENT)
(
    6, 
    'Urban Nest Residency', 
    'Modern high-rise apartment close to metro station and commercial offices.', 
    'APARTMENT', 
    'RENT', 
    NULL, 35000, 150000, -- Price, Rent (Est), Deposit (Est)
    2000, 3, 3, 2024, 
    'READY', 'AVAILABLE', 'Mumbai', 'Andheri East', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 19.1136, 72.8697, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 7. Palm Grove Homes (BUY)
(
    7, 
    'Palm Grove Homes', 
    'Ideal IT professionals’ housing near major tech parks and highways.', 
    'APARTMENT', 
    'BUY', 
    7200000, NULL, NULL, 
    1750, 3, 2, 2024, 
    'READY', 'AVAILABLE', 'Pune', 'Hinjewadi', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 18.5913, 73.7389, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 8. Silver Oak Residency (RENT)
(
    8, 
    'Silver Oak Residency', 
    'Comfortable family apartment with spacious rooms and modern fittings.', 
    'APARTMENT', 
    'RENT', 
    NULL, 18000, 60000, 
    1500, 3, 2, 2023, 
    'READY', 'AVAILABLE', 'Indore', 'Vijay Nagar', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 22.7196, 75.8577, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 9. Orchid Elite Towers (BUY)
(
    9, 
    'Orchid Elite Towers', 
    'Premium 3BHK with smart home features and proximity to IT hubs.', 
    'APARTMENT', 
    'BUY', 
    11000000, NULL, NULL, 
    2400, 3, 3, 2025, 
    'UNDER_CONSTRUCTION', 'AVAILABLE', 'Bengaluru', 'Whitefield', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 12.9716, 77.5946, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 10. Sunrise Residency (RENT)
(
    10, 
    'Sunrise Residency', 
    'Budget-friendly 2BHK in a developing residential neighborhood.', 
    'APARTMENT', 
    'RENT', 
    NULL, 12000, 36000, 
    1200, 2, 2, 2023, 
    'READY', 'AVAILABLE', 'Jaipur', 'Mansarovar', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 26.9124, 75.7873, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 11. Sapphire Enclave (BUY)
(
    11, 
    'Sapphire Enclave', 
    'Elegant apartment located in a well-planned and green environment.', 
    'APARTMENT', 
    'BUY', 
    6800000, NULL, NULL, 
    1700, 3, 2, 2024, 
    'READY', 'AVAILABLE', 'Chandigarh', 'Sector 45', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 30.7333, 76.7794, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 12. Harmony Heights (RENT)
(
    12, 
    'Harmony Heights', 
    'Peaceful residential flat with nearby schools and hospitals.', 
    'APARTMENT', 
    'RENT', 
    NULL, 16000, 50000, 
    1550, 3, 2, 2023, 
    'READY', 'AVAILABLE', 'Bhopal', 'Arera Colony', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 23.2599, 77.4126, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 13. Golden Meadows Villa (BUY)
(
    13, 
    'Golden Meadows Villa', 
    'Luxury villa with spacious interiors and modern architecture.', 
    'VILLA', 
    'BUY', 
    14000000, NULL, NULL, 
    3000, 4, 4, 2025, 
    'READY', 'AVAILABLE', 'Hyderabad', 'Gachibowli', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 17.3850, 78.4867, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 14. City Square Residency (RENT)
(
    14, 
    'City Square Residency', 
    'Well-connected apartment near shopping centers and metro.', 
    'APARTMENT', 
    'RENT', 
    NULL, 14000, 45000, 
    1350, 2, 2, 2024, 
    'READY', 'AVAILABLE', 'Lucknow', 'Gomti Nagar', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 26.8467, 80.9462, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
),
-- 15. Prestige Park View (BUY)
(
    15, 
    'Prestige Park View', 
    'Spacious premium apartment with quick access to IT corridor.', 
    'APARTMENT', 
    'BUY', 
    9500000, NULL, NULL, 
    2100, 3, 3, 2024, 
    'READY', 'AVAILABLE', 'Chennai', 'OMR', 
    NULL, NULL, NULL, NULL, NULL, 
    true, 13.0827, 80.2707, 
    (SELECT id FROM users WHERE role IN ('builder', 'BUILDER') LIMIT 1), 
    CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. Amenities Data (from row.sql)
-- ==========================================
-- Insert Property Amenities
INSERT INTO property_amenities (property_id, amenity) VALUES 
-- 1. Green Valley Apartments
(1, 'Parking'), (1, 'Garden'), (1, 'Security'), (1, 'Clubhouse'), (1, 'Gym'),
-- 2. Blue Ridge Villa
(2, 'Swimming Pool'), (2, 'Private Garden'), (2, 'Parking'), (2, 'Security'), (2, 'Servant Quarter'),
-- 3. Skyline Towers
(3, 'Lift'), (3, 'Gym'), (3, 'Clubhouse'), (3, 'Power Backup'), (3, 'CCTV'),
-- 4. Ocean Breeze
(4, 'Sea View'), (4, 'Lift'), (4, 'Security'), (4, 'Parking'), (4, 'Intercom'),
-- 5. Lakeview Apartments
(5, 'Parking'), (5, 'Security'), (5, 'Garden'), (5, 'CCTV'),
-- 6. Urban Nest Residency
(6, 'Lift'), (6, 'Gym'), (6, 'Security'), (6, 'Swimming Pool'), (6, 'Parking'), (6, 'Power Backup'),
-- 7. Palm Grove Homes
(7, 'Clubhouse'), (7, 'Gym'), (7, 'Security'), (7, 'Parking'), (7, 'Garden Area'),
-- 8. Silver Oak Residency
(8, 'Lift'), (8, 'Security'), (8, 'Parking'), (8, 'CCTV'), (8, 'Power Backup'),
-- 9. Orchid Elite Towers
(9, 'Swimming Pool'), (9, 'Gym'), (9, 'Clubhouse'), (9, 'Parking'), (9, 'Security'),
-- 10. Sunrise Residency
(10, 'Parking'), (10, 'Security'), (10, 'Garden Area'), (10, 'CCTV'),
-- 11. Sapphire Enclave
(11, 'Lift'), (11, 'Security'), (11, 'Parking'), (11, 'Gym'), (11, 'Power Backup'),
-- 12. Harmony Heights
(12, 'Lift'), (12, 'Parking'), (12, 'Security'), (12, 'Garden'),
-- 13. Golden Meadows Villa
(13, 'Private Parking'), (13, 'Garden'), (13, 'CCTV'), (13, 'Security'), (13, 'Clubhouse'),
-- 14. City Square Residency
(14, 'Lift'), (14, 'Parking'), (14, 'Security'), (14, 'Power Backup'),
-- 15. Prestige Park View
(15, 'Swimming Pool'), (15, 'Gym'), (15, 'Clubhouse'), (15, 'Security'), (15, 'Parking'), (15, 'Garden Area');
