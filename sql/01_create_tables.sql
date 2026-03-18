-- ============================================================================
-- HBNB Database - CREATE TABLES SCRIPT
-- ============================================================================
-- This script creates all necessary tables for the HBNB application
-- ============================================================================

-- ============================================================================
-- 1. CREATE USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID format',
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. CREATE PLACES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS places (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID format',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL COMMENT 'Price per night',
    latitude FLOAT NOT NULL COMMENT 'Geographic latitude (-90 to 90)',
    longitude FLOAT NOT NULL COMMENT 'Geographic longitude (-180 to 180)',
    owner_id CHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_owner_id (owner_id),
    CONSTRAINT fk_places_owner FOREIGN KEY (owner_id)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. CREATE REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID format',
    text TEXT NOT NULL COMMENT 'Review text content',
    rating INT NOT NULL COMMENT 'Rating from 1 to 5',
    user_id CHAR(36) NOT NULL,
    place_id CHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_place_id (place_id),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_place FOREIGN KEY (place_id)
        REFERENCES places(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_place_review UNIQUE (user_id, place_id)
        COMMENT 'One review per user per place',
    CONSTRAINT check_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. CREATE AMENITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS amenities (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID format',
    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Amenity name',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. CREATE PLACE_AMENITY TABLE (Many-to-Many Relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS place_amenity (
    place_id CHAR(36) NOT NULL,
    amenity_id CHAR(36) NOT NULL,
    PRIMARY KEY (place_id, amenity_id),
    INDEX idx_amenity_id (amenity_id),
    CONSTRAINT fk_place_amenity_place FOREIGN KEY (place_id)
        REFERENCES places(id) ON DELETE CASCADE,
    CONSTRAINT fk_place_amenity_amenity FOREIGN KEY (amenity_id)
        REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Schema creation complete
-- ============================================================================
