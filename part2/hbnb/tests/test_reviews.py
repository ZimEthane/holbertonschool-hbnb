#!/usr/bin/python3
"""Unit tests for /api/v1/reviews endpoints."""

import unittest

from app import create_app
from tests.utils import reset_facade_state


class TestReviewEndpoints(unittest.TestCase):
    def setUp(self):
        reset_facade_state()
        self.app = create_app()
        self.client = self.app.test_client()

        # user + place prerequisites
        r_user = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com"
        })
        self.user_id = r_user.get_json()["id"]

        r_place = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "description": "Center",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44,
            "owner_id": self.user_id
        })
        self.place_id = r_place.get_json()["id"]

    def test_create_review_success(self):
        response = self.client.post('/api/v1/reviews/', json={
            "text": "Great!",
            "rating": 5,
            "user_id": self.user_id,
            "place_id": self.place_id
        })
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("id", data)
        self.assertEqual(data["text"], "Great!")

    def test_create_review_invalid_data(self):
        response = self.client.post('/api/v1/reviews/', json={
            "text": "Missing ids"
        })
        self.assertEqual(response.status_code, 400)

    def test_get_reviews_list(self):
        self.client.post('/api/v1/reviews/', json={
            "text": "Great!",
            "rating": 5,
            "user_id": self.user_id,
            "place_id": self.place_id
        })
        response = self.client.get('/api/v1/reviews/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.get_json()), 1)

    def test_get_review_not_found(self):
        response = self.client.get('/api/v1/reviews/does-not-exist')
        self.assertEqual(response.status_code, 404)

    def test_update_review_success(self):
        r = self.client.post('/api/v1/reviews/', json={
            "text": "Great!",
            "rating": 5,
            "user_id": self.user_id,
            "place_id": self.place_id
        })
        review_id = r.get_json()["id"]

        response = self.client.put(f'/api/v1/reviews/{review_id}', json={
            "text": "Updated",
            "rating": 4,
            "user_id": self.user_id,
            "place_id": self.place_id
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["text"], "Updated")

    def test_delete_review_success(self):
        r = self.client.post('/api/v1/reviews/', json={
            "text": "Great!",
            "rating": 5,
            "user_id": self.user_id,
            "place_id": self.place_id
        })
        review_id = r.get_json()["id"]

        response = self.client.delete(f'/api/v1/reviews/{review_id}')
        self.assertEqual(response.status_code, 200)

        # verify gone
        get_r = self.client.get(f'/api/v1/reviews/{review_id}')
        self.assertEqual(get_r.status_code, 404)

    def test_delete_review_not_found(self):
        response = self.client.delete('/api/v1/reviews/does-not-exist')
        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
