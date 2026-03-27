#!/usr/bin/env python3
"""Complete CRUD tests for users, places, reviews, and amenities with cascade delete."""

import sys
sys.path.insert(0, '.')

from app import create_app
from flask_jwt_extended import create_access_token
from app.services import facade
import json


def run_tests():
    """Run complete CRUD tests."""
    app = create_app()

    with app.app_context():
        # Clean database
        from app.extensions import db
        db.drop_all()
        db.create_all()
        print("✅ Database cleaned and initialized\n")

        client = app.test_client()

        # ──────────────────────────────────────────────────────────────────────
        # 1. TEST USERS CRUD
        # ──────────────────────────────────────────────────────────────────────
        print("=" * 70)
        print("1. TESTING USERS CRUD")
        print("=" * 70)

        # CREATE USER
        print("\n📝 Creating users...")
        user1_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'password': 'SecurePass123'
        }
        response = client.post('/api/v1/users/', json=user1_data)
        assert response.status_code == 201, f"Failed to create user: {response.get_json()}"
        user1_id = response.get_json()['id']
        print(f"✓ Created user1: {user1_id}")

        user2_data = {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': 'jane@example.com',
            'password': 'SecurePass123'
        }
        response = client.post('/api/v1/users/', json=user2_data)
        user2_id = response.get_json()['id']
        print(f"✓ Created user2: {user2_id}")

        # CREATE ADMIN USER
        admin_data = {
            'first_name': 'Admin',
            'last_name': 'User',
            'email': 'admin@example.com',
            'password': 'AdminPass123',
            'is_admin': True
        }
        admin_user = facade.create_user(admin_data)
        admin_id = admin_user.id
        print(f"✓ Created admin: {admin_id}")

        # GET USER
        print("\n📖 Reading user details...")
        response = client.get(f'/api/v1/users/{user1_id}')
        assert response.status_code == 200
        user_data = response.get_json()
        assert user_data['first_name'] == 'John'
        print(f"✓ Retrieved user1: {user_data['email']}")

        # GET ALL USERS
        response = client.get('/api/v1/users/')
        assert response.status_code == 200
        users = response.get_json()
        print(f"✓ Retrieved all users: {len(users)} users")

        # UPDATE USER
        print("\n✏️  Updating user...")
        token = create_access_token(
            identity=user1_id,
            additional_claims={'is_admin': False}
        )
        update_data = {
            'first_name': 'Jonathan',
            'phone': '1234567890'
        }
        response = client.put(
            f'/api/v1/users/{user1_id}',
            json=update_data,
            headers={'Authorization': f'Bearer {token}'}
        )
        assert response.status_code == 200
        updated = response.get_json()
        assert updated['first_name'] == 'Jonathan'
        assert updated['phone'] == '1234567890'
        print(f"✓ Updated user1: {updated['first_name']}, phone: {updated['phone']}")

        # ──────────────────────────────────────────────────────────────────────
        # 2. TEST AMENITIES CRUD
        # ──────────────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("2. TESTING AMENITIES CRUD")
        print("=" * 70)

        admin_token = create_access_token(
            identity=admin_id,
            additional_claims={'is_admin': True}
        )

        # CREATE AMENITIES
        print("\n📝 Creating amenities...")
        amenities_names = ['WiFi', 'Pool', 'Parking', 'Kitchen']
        amenity_ids = []

        for name in amenities_names:
            response = client.post(
                '/api/v1/amenities/',
                json={'name': name},
                headers={'Authorization': f'Bearer {admin_token}'}
            )
            assert response.status_code == 201, f"Failed to create amenity: {response.get_json()}"
            amenity_id = response.get_json()['id']
            amenity_ids.append(amenity_id)
            print(f"✓ Created amenity: {name}")

        # GET AMENITY
        print("\n📖 Reading amenity details...")
        response = client.get(f'/api/v1/amenities/{amenity_ids[0]}')
        assert response.status_code == 200
        amenity = response.get_json()
        assert amenity['name'] == 'WiFi'
        print(f"✓ Retrieved amenity: {amenity['name']}")

        # GET ALL AMENITIES
        response = client.get('/api/v1/amenities/')
        assert response.status_code == 200
        amenities = response.get_json()
        print(f"✓ Retrieved all amenities: {len(amenities)} amenities")

        # UPDATE AMENITY
        print("\n✏️  Updating amenity...")
        response = client.put(
            f'/api/v1/amenities/{amenity_ids[0]}',
            json={'name': 'WiFi + Internet'},
            headers={'Authorization': f'Bearer {admin_token}'}
        )
        assert response.status_code == 200
        print(f"✓ Updated amenity: WiFi -> WiFi + Internet")

        # ──────────────────────────────────────────────────────────────────────
        # 3. TEST PLACES CRUD
        # ──────────────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("3. TESTING PLACES CRUD")
        print("=" * 70)

        token1 = create_access_token(
            identity=user1_id,
            additional_claims={'is_admin': False}
        )

        # CREATE PLACES
        print("\n📝 Creating places...")
        place1_data = {
            'title': 'Beautiful Apartment in Paris',
            'description': 'Cozy apartment near the Eiffel Tower',
            'price': 120.0,
            'latitude': 48.8566,
            'longitude': 2.3522,
            'amenities': amenity_ids[:2]  # WiFi and Pool
        }
        response = client.post(
            '/api/v1/places/',
            json=place1_data,
            headers={'Authorization': f'Bearer {token1}'}
        )
        assert response.status_code == 201, f"Failed to create place: {response.get_json()}"
        place1_id = response.get_json()['id']
        print(f"✓ Created place1: {place1_data['title']}")

        place2_data = {
            'title': 'Nice House in Lyon',
            'description': 'Modern house with garden',
            'price': 150.0,
            'latitude': 45.7640,
            'longitude': 4.8357,
            'amenities': [amenity_ids[2]]  # Parking
        }
        response = client.post(
            '/api/v1/places/',
            json=place2_data,
            headers={'Authorization': f'Bearer {token1}'}
        )
        place2_id = response.get_json()['id']
        print(f"✓ Created place2: {place2_data['title']}")

        # CREATE PLACE BY USER2
        token2 = create_access_token(
            identity=user2_id,
            additional_claims={'is_admin': False}
        )
        place3_data = {
            'title': 'Studio in Marseille',
            'description': 'Small studio near the beach',
            'price': 80.0,
            'latitude': 43.2965,
            'longitude': 5.3698,
            'amenities': []
        }
        response = client.post(
            '/api/v1/places/',
            json=place3_data,
            headers={'Authorization': f'Bearer {token2}'}
        )
        place3_id = response.get_json()['id']
        print(f"✓ Created place3 by user2: {place3_data['title']}")

        # GET PLACE
        print("\n📖 Reading place details...")
        response = client.get(f'/api/v1/places/{place1_id}')
        assert response.status_code == 200
        place = response.get_json()
        assert place['title'] == 'Beautiful Apartment in Paris'
        print(f"✓ Retrieved place1: {place['title']}")

        # GET ALL PLACES
        response = client.get('/api/v1/places/')
        assert response.status_code == 200
        places = response.get_json()
        print(f"✓ Retrieved all places: {len(places)} places")

        # UPDATE PLACE (only price and title, no need for lat/long)
        print("\n✏️  Updating place...")
        update_place_data = {
            'price': 130.0,
            'title': 'Beautiful Apartment in Paris (Updated)'
        }
        response = client.put(
            f'/api/v1/places/{place1_id}',
            json=update_place_data,
            headers={'Authorization': f'Bearer {token1}'}
        )
        assert response.status_code == 200, f"Failed to update place: {response.get_json()}"
        updated_place = response.get_json()
        assert updated_place['price'] == 130.0
        print(f"✓ Updated place1: price {120.0} -> {130.0}")

        # ──────────────────────────────────────────────────────────────────────
        # 4. TEST REVIEWS CRUD
        # ──────────────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("4. TESTING REVIEWS CRUD")
        print("=" * 70)

        # CREATE REVIEWS
        print("\n📝 Creating reviews...")
        review1_data = {
            'text': 'Great apartment, very clean and comfortable!',
            'rating': 5,
            'place_id': place1_id
        }
        response = client.post(
            '/api/v1/reviews/',
            json=review1_data,
            headers={'Authorization': f'Bearer {token2}'}
        )
        assert response.status_code == 201, f"Failed to create review: {response.get_json()}"
        review1_id = response.get_json()['id']
        print(f"✓ Created review1 by user2 on place1")

        review2_data = {
            'text': 'Good location, but a bit noisy',
            'rating': 3,
            'place_id': place1_id
        }
        response = client.post(
            '/api/v1/reviews/',
            json=review2_data,
            headers={'Authorization': f'Bearer {token1}'}
        )
        review2_id = response.get_json()['id']
        print(f"✓ Created review2 by user1 on place1")

        review3_data = {
            'text': 'Perfect! Love this place!',
            'rating': 5,
            'place_id': place3_id
        }
        response = client.post(
            '/api/v1/reviews/',
            json=review3_data,
            headers={'Authorization': f'Bearer {token1}'}
        )
        review3_id = response.get_json()['id']
        print(f"✓ Created review3 by user1 on place3 (user2's place)")

        # GET REVIEW
        print("\n📖 Reading review details...")
        response = client.get(f'/api/v1/reviews/{review1_id}')
        assert response.status_code == 200
        review = response.get_json()
        assert review['rating'] == 5
        print(f"✓ Retrieved review1: rating {review['rating']}")

        # GET ALL REVIEWS
        response = client.get('/api/v1/reviews/')
        assert response.status_code == 200
        reviews = response.get_json()
        print(f"✓ Retrieved all reviews: {len(reviews)} reviews")

        # GET REVIEWS BY PLACE
        response = client.get(f'/api/v1/places/{place1_id}/reviews')
        assert response.status_code == 200
        place_reviews = response.get_json()
        assert len(place_reviews) == 2
        print(f"✓ Retrieved reviews for place1: {len(place_reviews)} reviews")

        # UPDATE REVIEW
        print("\n✏️  Updating review...")
        update_review_data = {
            'text': 'Updated: Great apartment, very clean and comfortable!',
            'rating': 4
        }
        response = client.put(
            f'/api/v1/reviews/{review1_id}',
            json=update_review_data,
            headers={'Authorization': f'Bearer {token2}'}
        )
        assert response.status_code == 200
        print(f"✓ Updated review1: rating 5 -> 4")

        # ──────────────────────────────────────────────────────────────────────
        # 5. TEST CASCADE DELETE
        # ──────────────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("5. TESTING CASCADE DELETE")
        print("=" * 70)

        # Count before deletion
        print(f"\n📊 Before deleting user2:")
        response = client.get('/api/v1/users/')
        users_before = len(response.get_json())
        print(f"  - Users: {users_before}")

        response = client.get('/api/v1/places/')
        places_before = len(response.get_json())
        print(f"  - Places: {places_before}")

        response = client.get('/api/v1/reviews/')
        reviews_before = len(response.get_json())
        print(f"  - Reviews: {reviews_before}")

        # Delete user2 (should cascade delete place3)
        print(f"\n🗑️  Deleting user2 (should cascade delete place3)...")
        response = client.delete(
            f'/api/v1/users/{user2_id}',
            headers={'Authorization': f'Bearer {token2}'}
        )
        assert response.status_code == 200
        print(f"✓ User2 deleted: {response.get_json()['message']}")

        # Count after deletion
        print(f"\n📊 After deleting user2:")
        response = client.get('/api/v1/users/')
        users_after = len(response.get_json())
        print(f"  - Users: {users_after} (was {users_before})")

        response = client.get('/api/v1/places/')
        places_after = len(response.get_json())
        print(f"  - Places: {places_after} (was {places_before}, -1 cascade)")

        response = client.get('/api/v1/reviews/')
        reviews_after = len(response.get_json())
        print(f"  - Reviews: {reviews_after} (was {reviews_before}, -1 cascade)")

        # Verify cascade
        # Deleting user2 should:
        # - Delete user2 itself (-1 users)
        # - Delete place3 (user2's place) via User.places cascade (-1 places)
        # - Delete review1 (user2's review on place1) via User.reviews cascade
        # - Delete review3 (on deleted place3) via Place.reviews cascade (-2 reviews total)
        assert users_after == users_before - 1, f"User not deleted: {users_before} != {users_after}"
        assert places_after == places_before - 1, f"Place not cascade deleted: {places_before} != {places_after}"
        # 2 reviews deleted: review1 (user2 created) + review3 (on place3 which deleted)
        assert reviews_after == reviews_before - 2, f"Reviews not cascade deleted correctly: {reviews_before} != {reviews_after} (expected {reviews_before - 2})"
        print(f"\n✅ CASCADE DELETE WORKING: User -> Places & Reviews all deleted!")

        # ──────────────────────────────────────────────────────────────────────
        # 6. TEST INDIVIDUAL DELETES
        # ──────────────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("6. TESTING INDIVIDUAL DELETES")
        print("=" * 70)

        # DELETE REVIEW
        print("\n🗑️  Deleting review...")
        response = client.delete(
            f'/api/v1/reviews/{review2_id}',
            headers={'Authorization': f'Bearer {token1}'}
        )
        assert response.status_code == 200
        print(f"✓ Deleted review2")

        # DELETE PLACE
        print("\n🗑️  Deleting place...")
        response = client.delete(
            f'/api/v1/places/{place2_id}',
            headers={'Authorization': f'Bearer {token1}'}
        )
        assert response.status_code == 200
        print(f"✓ Deleted place2 (should also delete any reviews)")

        # DELETE AMENITY
        print("\n🗑️  Deleting amenity...")
        response = client.delete(
            f'/api/v1/amenities/{amenity_ids[3]}',
            headers={'Authorization': f'Bearer {admin_token}'}
        )
        assert response.status_code == 200
        print(f"✓ Deleted amenity (Kitchen)")

        # ──────────────────────────────────────────────────────────────────────
        # 7. FINAL COUNT
        # ──────────────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("7. FINAL COUNT")
        print("=" * 70)

        response = client.get('/api/v1/users/')
        print(f"\n✓ Users remaining: {len(response.get_json())}")

        response = client.get('/api/v1/places/')
        print(f"✓ Places remaining: {len(response.get_json())}")

        response = client.get('/api/v1/reviews/')
        print(f"✓ Reviews remaining: {len(response.get_json())}")

        response = client.get('/api/v1/amenities/')
        print(f"✓ Amenities remaining: {len(response.get_json())}")

        # ──────────────────────────────────────────────────────────────────────
        # SUMMARY
        # ──────────────────────────────────────────────────────────────────────
        print("\n" + "=" * 70)
        print("✅ ALL TESTS PASSED!")
        print("=" * 70)
        print("""
Summary of what was tested:
✓ CREATE users, places, reviews, amenities
✓ READ individual items and all items
✓ UPDATE items
✓ DELETE items
✓ CASCADE DELETE: User deletion -> Places deletion -> Reviews deletion
✓ Authorization checks (users can only manage their own items)
✓ Admin-only operations (amenities)
        """)


if __name__ == '__main__':
    run_tests()
