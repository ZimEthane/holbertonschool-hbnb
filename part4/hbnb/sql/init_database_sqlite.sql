-- ==============================================================
-- HBNB Database Initialization Script - SQLite (Part 3)
-- ==============================================================
-- SQLite version for local testing
-- Run this script first to create all tables

-- ==============================================================
-- ENABLE FOREIGN KEYS (important for SQLite!)
-- ==============================================================
PRAGMA foreign_keys = ON;

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
    id CHAR(36) PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table de placement (Place)
CREATE TABLE place (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    image_urls TEXT DEFAULT '[]',
    owner_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 3. Table d'évaluation (Review)
CREATE TABLE review (
    id CHAR(36) PRIMARY KEY,
    text TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    user_id CHAR(36) NOT NULL,
    place_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES place(id) ON DELETE CASCADE,
    UNIQUE (user_id, place_id)
);

-- 4. Table d'agrément (Amenity)
CREATE TABLE amenity (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table Place_Amenity (Relation plusieurs à plusieurs)
CREATE TABLE place_amenity (
    place_id CHAR(36) NOT NULL,
    amenity_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (place_id, amenity_id),
    FOREIGN KEY (place_id) REFERENCES place(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenity(id) ON DELETE CASCADE
);

-- ==============================================================
-- Tables created successfully!
-- Run insert_data_sqlite.sql to initialize with admin user and amenities
-- ==============================================================
