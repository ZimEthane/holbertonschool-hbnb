-- ==============================================================
-- HBNB Database - Insert Initial Data - SQLite (Part 3)
-- ==============================================================
-- SQLite version for local testing
-- Prerequisites: Tables must be created first (see init_database_sqlite.sql)

-- ==============================================================
-- ENABLE FOREIGN KEYS (important for SQLite!)
-- ==============================================================
PRAGMA foreign_keys = ON;

-- ==============================================================
-- INSERT INITIAL DATA
-- ==============================================================

-- 1. Insert Admin User
INSERT INTO user (id, first_name, last_name, email, password, is_admin)
VALUES (
    '36c9050e-ddd3-4c3b-9731-9f487208bbc1',
    'Admin',
    'HBnB',
    'admin@hbnb.io',
    '$2b$12$kp5iyQdbKsVinptr2nxVBO72dtN6LOSrhJXqQvatD4ROw/or/.AbG',
    1
);

-- 2. Insert Initial Amenities
INSERT INTO amenity (id, name) VALUES
    ('d912d7a9-c584-47db-a24f-b64a9e742f51', 'WiFi'),
    ('bd408c8f-a6d5-4818-9ba8-788da242a303', 'Piscine'),
    ('4362e7dd-360e-472d-914d-b671b269623d', 'Climatisation');

-- ==============================================================
-- VERIFY INSERTIONS
-- ==============================================================
-- Uncomment to verify data after running the script:
-- SELECT * FROM user;
-- SELECT * FROM amenity;
-- SELECT COUNT(*) as user_count FROM user;
-- SELECT COUNT(*) as amenity_count FROM amenity;
