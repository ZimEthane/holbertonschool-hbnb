-- ============================================================================
-- HBNB Database - INSERT INITIAL DATA SCRIPT
-- ============================================================================
-- This script inserts initial data into the HBNB database
-- Make sure to run the create_tables.sql script first
-- ============================================================================

-- ============================================================================
-- 1. INSERT ADMIN USER
-- ============================================================================
-- Admin account for system administration
-- Password: admin1234 (hashed with bcrypt)
-- Email: admin@hbnb.io
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
-- 2. INSERT INITIAL AMENITIES
-- ============================================================================
-- These are the basic amenities that can be assigned to places
-- ============================================================================
INSERT INTO amenities (id, name, created_at, updated_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'WiFi', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Piscine', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Climatisation', NOW(), NOW());

-- ============================================================================
-- Initial Data Insertion Complete
-- ============================================================================
-- 1 admin user has been created with the following credentials:
--    - Email: admin@hbnb.io
--    - Password: admin1234
--    - ID: 36c9050e-ddd3-4c3b-9731-9f487208bbc1
--
-- 3 amenities have been created:
--    - WiFi
--    - Piscine (Swimming Pool)
--    - Climatisation (Air Conditioning)
-- ============================================================================
