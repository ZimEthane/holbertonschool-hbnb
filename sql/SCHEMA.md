-- ============================================================================
-- HBNB DATABASE SCHEMA DIAGRAM
-- ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                          HBNB DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│       USERS              │
├──────────────────────────┤
│ PK  id (UUID)            │
│     first_name           │
│     last_name            │
│     email (UNIQUE)       │
│     password (bcrypt)    │
│     is_admin             │
│     created_at           │
│     updated_at           │
└──────────────────────────┘
         ▲         ▲
         │         │
      1:N         1:N
     (owner)    (reviewer)
         │         │
         ├─────┬───┘
         │     │
┌────────▼──┐  │
│   PLACES  │  │
├───────────┤  │
│ PK id     │  │
│    title  │  │
│    desc   │  │
│    price  │  │
│    lat    │  │
│    long   │  │
│ FK owner_id──┘
│    created_at
│    updated_at
└───────────┬──────────────┐
            │              │
          M:N            1:N
            │              │
            │              │
    ┌───────▼────────┐  ┌──▼──────────────┐
    │ PLACE_AMENITY  │  │    REVIEWS       │
    ├────────────────┤  ├──────────────────┤
    │ PK place_id    │  │ PK  id (UUID)    │
    │    amenity_id  │  │     text         │
    └────────────────┘  │     rating (1-5) │
            ▲            │ FK  user_id      │
            │            │ FK  place_id     │
          M:N            │     created_at   │
            │            │     updated_at   │
            │            │ UK (user_id,     │
            │            │     place_id)    │
    ┌───────▼──────────┐ └──────────────────┘
    │   AMENITIES      │
    ├──────────────────┤
    │ PK  id (UUID)    │
    │     name (UNIQUE)│
    │     created_at   │
    │     updated_at   │
    └──────────────────┘

═════════════════════════════════════════════════════════════════════════════

RELATIONSHIPS:
─────────────

1. USERS → PLACES (1:N)
   - One user can own many places
   - Foreign Key: places.owner_id
   - Cascading Delete: ✓

2. USERS → REVIEWS (1:N)
   - One user can write many reviews
   - Foreign Key: reviews.user_id
   - Cascading Delete: ✓
   - Constraint: One review per user per place

3. PLACES → REVIEWS (1:N)
   - One place can have many reviews
   - Foreign Key: reviews.place_id
   - Cascading Delete: ✓

4. PLACES ↔ AMENITIES (M:N)
   - Many places can have many amenities
   - Junction Table: place_amenity
   - Composite Key: (place_id, amenity_id)

═════════════════════════════════════════════════════════════════════════════

UNIQUE CONSTRAINTS:
──────────────────

1. users.email
   - Ensures no duplicate email addresses

2. amenities.name
   - Ensures no duplicate amenity names

3. reviews (user_id, place_id)
   - Ensures only one review per user per place

═════════════════════════════════════════════════════════════════════════════

INDEXES:
────────

1. places.owner_id
   - Improved performance for queries finding user's places

2. reviews.user_id
   - Improved performance for queries finding user's reviews

3. reviews.place_id
   - Improved performance for queries finding place's reviews

4. place_amenity.amenity_id
   - Improved performance for M:N relationship queries

═════════════════════════════════════════════════════════════════════════════

CASCADING RULES:
────────────────

ON DELETE CASCADE is applied to:
- places.owner_id (User deletion removes their places and related reviews)
- reviews.user_id (User deletion removes their reviews)
- reviews.place_id (Place deletion removes all reviews)
- place_amenity.place_id (Place deletion removes associations)
- place_amenity.amenity_id (Amenity deletion removes associations)

═════════════════════════════════════════════════════════════════════════════

DATA TYPES:
───────────

IDs:             CHAR(36)        - UUID format
Strings:         VARCHAR(255)    - Most text fields
Large Text:      TEXT            - Reviews, descriptions
Numbers:         DECIMAL(10,2)   - Prices
Coordinates:     FLOAT           - Latitude, Longitude
Ratings:         INT             - 1-5 scale
Flags:           BOOLEAN         - Admin status
Dates:           DATETIME        - With timestamps

═════════════════════════════════════════════════════════════════════════════

SAMPLE QUERIES:
───────────────

-- Find all places owned by a user
SELECT * FROM places WHERE owner_id = 'user-uuid';

-- Get reviews for a specific place
SELECT r.*, u.first_name, u.last_name
FROM reviews r
JOIN users u ON r.user_id = u.id
WHERE r.place_id = 'place-uuid'
ORDER BY r.created_at DESC;

-- Get amenities for a place
SELECT a.* FROM amenities a
JOIN place_amenity pa ON a.id = pa.amenity_id
WHERE pa.place_id = 'place-uuid';

-- Get places with WiFi amenity
SELECT DISTINCT p.* FROM places p
JOIN place_amenity pa ON p.id = pa.place_id
JOIN amenities a ON pa.amenity_id = a.id
WHERE a.name = 'WiFi';

-- Verify no duplicate reviews per user per place
SELECT user_id, place_id, COUNT(*) as count
FROM reviews
GROUP BY user_id, place_id
HAVING count > 1;

═════════════════════════════════════════════════════════════════════════════
*/
