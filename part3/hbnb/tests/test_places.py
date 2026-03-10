#!/usr/bin/python3
"""Unit tests for /api/v1/places endpoints."""

import unittest

from app import create_app
from tests.utils import reset_facade_state


class TestPlaceEndpoints(unittest.TestCase):
    def setUp(self):
        reset_facade_state()
        self.app = create_app()
        self.client = self.app.test_client()

        # Create a user that can own places
        r_user = self.client.post('/api/v1/users/', json={
            "first_name": "Owner",
            "last_name": "One",
            "email": "owner.one@example.com"
        })
        self.owner_id = r_user.get_json()["id"]

        # Create an amenity
        r_am = self.client.post('/api/v1/amenities/', json={"name": "WiFi"})
        self.amenity_id = r_am.get_json()["id"]

    def test_create_place_success(self):
        response = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "description": "Center",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44,
            "owner_id": self.owner_id,
            "amenities": [self.amenity_id]
        })
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("id", data)
        self.assertEqual(data["owner_id"], self.owner_id)
        self.assertEqual(len(data["amenities"]), 1)

    def test_create_place_missing_owner_id(self):
        response = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44
        })
        self.assertEqual(response.status_code, 400)

    def test_create_place_invalid_amenity(self):
        response = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44,
            "owner_id": self.owner_id,
            "amenities": ["bad-amenity-id"]
        })
        self.assertEqual(response.status_code, 400)

    def test_get_place_success(self):
        r = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "description": "Center",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44,
            "owner_id": self.owner_id,
            "amenities": [self.amenity_id]
        })
        place_id = r.get_json()["id"]

        response = self.client.get(f'/api/v1/places/{place_id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["id"], place_id)
        self.assertIn("owner", data)
        self.assertEqual(data["owner"]["id"], self.owner_id)

    def test_get_place_not_found(self):
        response = self.client.get('/api/v1/places/does-not-exist')
        self.assertEqual(response.status_code, 404)

    def test_update_place_success(self):
        r = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "description": "Center",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44,
            "owner_id": self.owner_id
        })
        place_id = r.get_json()["id"]

        response = self.client.put(f'/api/v1/places/{place_id}', json={
            "description": "Updated"
        })
        self.assertEqual(response.status_code, 200)

    def test_get_place_reviews_list(self):
        # create place + review
        r_place = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "description": "Center",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44,
            "owner_id": self.owner_id
        })
        place_id = r_place.get_json()["id"]

        r_review = self.client.post('/api/v1/reviews/', json={
            "text": "Great!",
            "rating": 5,
            "user_id": self.owner_id,
            "place_id": place_id
        })
        self.assertEqual(r_review.status_code, 201)

        response = self.client.get(f'/api/v1/places/{place_id}/reviews')
        self.assertEqual(response.status_code, 200)
        reviews = response.get_json()
        self.assertEqual(len(reviews), 1)
        self.assertEqual(reviews[0]["text"], "Great!")

    def test_get_place_reviews_place_not_found(self):
        response = self.client.get('/api/v1/places/does-not-exist/reviews')
        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
