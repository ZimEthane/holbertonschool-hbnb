-- ============================================================================
-- HBNB DATABASE - VERIFICATION SCRIPT
-- ============================================================================
-- This script verifies that the database is properly initialized
-- Run this after executing init_tables.sql or the individual scripts
-- ============================================================================

-- ============================================================================
-- 1. VERIFY TABLE EXISTENCE
-- ============================================================================
SELECT 'TABLE VERIFICATION' as 'Check Type';
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

-- ============================================================================
-- 2. VERIFY ADMIN USER
-- ============================================================================
SELECT '--- ADMIN USER ---' as '';
SELECT
    id,
    CONCAT(first_name, ' ', last_name) as fullname,
    email,
    is_admin,
    created_at
FROM users
WHERE is_admin = 1;

-- ============================================================================
-- 3. VERIFY AMENITIES
-- ============================================================================
SELECT '--- INITIAL AMENITIES ---' as '';
SELECT
    id,
    name,
    created_at
FROM amenities
ORDER BY name;

-- ============================================================================
-- 4. VERIFY FOREIGN KEY CONSTRAINTS
-- ============================================================================
SELECT '--- FOREIGN KEY CONSTRAINTS ---' as '';
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- ============================================================================
-- 5. VERIFY UNIQUE CONSTRAINTS
-- ============================================================================
SELECT '--- UNIQUE CONSTRAINTS ---' as '';
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
AND CONSTRAINT_NAME != 'PRIMARY'
AND CONSTRAINT_NAME LIKE '%_UNIQUE%'
OR (TABLE_NAME = 'users' AND COLUMN_NAME = 'email')
OR (TABLE_NAME = 'amenities' AND COLUMN_NAME = 'name')
ORDER BY TABLE_NAME;

-- ============================================================================
-- 6. TABLE STRUCTURE VERIFICATION
-- ============================================================================

SELECT '--- USERS TABLE ---' as '';
DESC users;

SELECT '--- PLACES TABLE ---' as '';
DESC places;

SELECT '--- REVIEWS TABLE ---' as '';
DESC reviews;

SELECT '--- AMENITIES TABLE ---' as '';
DESC amenities;

SELECT '--- PLACE_AMENITY TABLE ---' as '';
DESC place_amenity;

-- ============================================================================
-- 7. CHECK CONSTRAINTS
-- ============================================================================
SELECT '--- CHECK CONSTRAINTS ---' as '';
SELECT
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE();

-- ============================================================================
-- 8. VERIFY INDEXES
-- ============================================================================
SELECT '--- INDEXES ---' as '';
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ============================================================================
-- 9. VERIFY ROW COUNTS
-- ============================================================================
SELECT '--- TABLE ROW COUNTS ---' as '';
SELECT
    'users' as Table_Name,
    COUNT(*) as Row_Count
FROM users
UNION ALL
SELECT 'places', COUNT(*) FROM places
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'amenities', COUNT(*) FROM amenities
UNION ALL
SELECT 'place_amenity', COUNT(*) FROM place_amenity;

-- ============================================================================
-- 10. VERIFICATION COMPLETE
-- ============================================================================
SELECT '✓ Database verification complete!' as Status;
