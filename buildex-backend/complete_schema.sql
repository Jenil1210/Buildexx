-- Full Database Schema for Buildex (NeonDB / PostgreSQL)
-- This file synchronizes the database with the current Java Entity models.

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
    image_url TEXT,
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

