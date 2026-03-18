-- ============================================================================
-- HBNB Database Initialization Script
-- ============================================================================
-- This script creates all necessary tables and inserts initial data
-- ============================================================================

-- ============================================================================
-- 1. CREATE USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. CREATE PLACES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS places (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    owner_id CHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_places_user FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. CREATE REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id CHAR(36) PRIMARY KEY,
    text TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    user_id CHAR(36) NOT NULL,
    place_id CHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_place_review UNIQUE (user_id, place_id)
);

-- ============================================================================
-- 4. CREATE AMENITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS amenities (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. CREATE PLACE_AMENITY TABLE (Many-to-Many Relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS place_amenity (
    place_id CHAR(36) NOT NULL,
    amenity_id CHAR(36) NOT NULL,
    PRIMARY KEY (place_id, amenity_id),
    CONSTRAINT fk_place_amenity_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    CONSTRAINT fk_place_amenity_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- ============================================================================
-- 6. INSERT INITIAL DATA
-- ============================================================================

-- ============================================================================
-- 6.1 INSERT ADMIN USER
-- ============================================================================
INSERT INTO users (id, first_name, last_name, email, password, is_admin, created_at, updated_at)
VALUES (
    '36c9050e-ddd3-4c3b-9731-9f487208bbc1',
    'Admin',
    'HBnB',
    'admin@hbnb.io',
    '$2b$12$RJk3aShbZhUWO5bw7uW80.fV74R.amtr3dFpTU9GQr7U/QiwPDDyO',
    TRUE,
    NOW(),
    NOW()
);

-- ============================================================================
-- 6.2 INSERT INITIAL AMENITIES
-- ============================================================================
INSERT INTO amenities (id, name, created_at, updated_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'WiFi', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Piscine', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Climatisation', NOW(), NOW());

-- ============================================================================
-- Initialization Complete
-- ============================================================================
-- All tables have been created with the initial data
-- Admin user can now be used for authentication
-- Initial amenities are available for place management
-- ============================================================================
