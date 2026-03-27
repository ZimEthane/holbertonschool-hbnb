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

-- 3. Insert Sample Places With Images
INSERT OR IGNORE INTO place (id, title, description, price, latitude, longitude, image_urls, owner_id)
VALUES
    (
        'b8c59d5f-d09b-4c23-9e6c-1bc8683f7e11',
        'Cosy Studio au Centre-Ville',
        'Un studio moderne et confortable au coeur de la ville.',
        75.00,
        48.8566,
        2.3522,
        '["https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"]',
        '36c9050e-ddd3-4c3b-9731-9f487208bbc1'
    ),
    (
        '9f7a2af8-e6ba-4742-9230-5b8d2bbf03ff',
        'Loft Industrial Chic',
        'Loft tendance avec style industrial et beaux volumes.',
        95.00,
        48.8357,
        2.3577,
        '["https://images.unsplash.com/photo-1486304873000-235643847519?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80"]',
        '36c9050e-ddd3-4c3b-9731-9f487208bbc1'
    ),
    (
        'b4f91f5f-6f64-4ccb-aad7-f0dbfd2e4428',
        'Villa avec Piscine Privee',
        'Villa spacieuse avec piscine privee et terrasse ensoleillee.',
        200.00,
        48.7045,
        2.2230,
        '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80"]',
        '36c9050e-ddd3-4c3b-9731-9f487208bbc1'
    );

-- ==============================================================
-- VERIFY INSERTIONS
-- ==============================================================
-- Uncomment to verify data after running the script:
-- SELECT * FROM user;
-- SELECT * FROM amenity;
-- SELECT COUNT(*) as user_count FROM user;
-- SELECT COUNT(*) as amenity_count FROM amenity;
