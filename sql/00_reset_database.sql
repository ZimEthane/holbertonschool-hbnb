-- ============================================================================
-- HBNB DATABASE - RESET SCRIPT
-- ============================================================================
-- THIS SCRIPT WILL DELETE ALL DATA AND TABLES
-- USE WITH CAUTION - THIS OPERATION CANNOT BE UNDONE
-- ============================================================================

-- ============================================================================
-- WARNING: ALL DATA WILL BE LOST
-- ============================================================================
/*
BEFORE RUNNING:
1. Ensure you have a backup of your database
2. Make sure you're connected to the correct database
3. This will remove ALL tables and data permanently

CONFIRMATION:
If you want to proceed, uncomment the DROP statements below.
*/

-- ============================================================================
-- DROP ALL TABLES (IN CORRECT ORDER TO HANDLE FOREIGN KEYS)
-- ============================================================================

-- STEP 1: Drop junction table first (many-to-many relationship)
DROP TABLE IF EXISTS place_amenity;

-- STEP 2: Drop tables with foreign keys
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS places;

-- STEP 3: Drop base tables
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT 'Database reset complete. All tables have been dropped.' as Status;

-- List remaining tables (should be empty)
SELECT 'Remaining tables:' as '';
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE();

-- ============================================================================
-- NEXT STEPS
-- ============================================================================
/*
To reinitialize the database with fresh data:

1. Execute: 01_create_tables.sql
2. Execute: 02_insert_initial_data.sql
3. Verify:  03_verify_database.sql

Or simply execute: init_tables.sql for complete initialization
*/
