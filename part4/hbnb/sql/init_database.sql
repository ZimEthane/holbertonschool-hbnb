-- ==============================================================
-- HBNB Database Initialization Script (Part 3)
-- ==============================================================
-- This script creates all necessary tables and initializes
-- the database with admin user and default amenities

-- ==============================================================
-- DROP EXISTING TABLES (if they exist)
-- ==============================================================
DROP TABLE IF EXISTS place_amenity;
DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS place;
DROP TABLE IF EXISTS amenity;
DROP TABLE IF EXISTS user;

-- ==============================================================
-- CREATE TABLES
-- ==============================================================

-- 1. Table des utilisateurs (User)
CREATE TABLE user (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID format',
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table de placement (Place)
CREATE TABLE place (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID format',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    image_urls TEXT,
    owner_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_place_owner FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table d'évaluation (Review)
CREATE TABLE review (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID format',
    text TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    user_id CHAR(36) NOT NULL,
    place_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_place FOREIGN KEY (place_id) REFERENCES place(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_place_review UNIQUE (user_id, place_id) COMMENT 'Un utilisateur ne peut laisser qu''un seul avis par place'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table d'agrément (Amenity)
CREATE TABLE amenity (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID format',
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table Place_Amenity (Relation plusieurs à plusieurs)
CREATE TABLE place_amenity (
    place_id CHAR(36) NOT NULL,
    amenity_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (place_id, amenity_id) COMMENT 'Clé primaire composite',
    CONSTRAINT fk_place_amenity_place FOREIGN KEY (place_id) REFERENCES place(id) ON DELETE CASCADE,
    CONSTRAINT fk_place_amenity_amenity FOREIGN KEY (amenity_id) REFERENCES amenity(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- Tables created successfully!
-- Run insert_data.sql to initialize with admin user and amenities
-- ==============================================================
