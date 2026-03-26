#!/usr/bin/python3
"""Unit tests for /api/v1/reviews endpoints."""

import unittest

from app import create_app
from tests.utils import reset_facade_state, login, create_user_direct


class TestReviewEndpoints(unittest.TestCase):
    def setUp(self):
        reset_facade_state()
        self.app = create_app()
        self.client = self.app.test_client()

        # user + place prerequisites
        # create admin and two users
        admin = create_user_direct({
            "first_name": "Admin",
            "last_name": "User",
            "email": "admin@example.com",
            "password": "adminpass",
            "is_admin": True
        })
        admin_token = login(self.client, "admin@example.com", "adminpass")
        self.admin_headers = {'Authorization': f'Bearer {admin_token}'}

        user = create_user_direct({
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com",
            "password": "janepass"
        })
        self.user_id = user.id
        user_token = login(self.client, "jane.doe@example.com", "janepass")
        self.user_headers = {'Authorization': f'Bearer {user_token}'}

        # create place by user
        r_place = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "description": "Center",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44
        }, headers=self.user_headers)
        self.place_id = r_place.get_json()["id"]

    def test_create_review_success(self):
        response = self.client.post('/api/v1/reviews/', json={
            "text": "Great!",
            "rating": 5,
            "place_id": self.place_id
        }, headers=self.user_headers)
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
            "place_id": self.place_id
        }, headers=self.user_headers)
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
            "place_id": self.place_id
        }, headers=self.user_headers)
        review_id = r.get_json()["id"]

        response = self.client.put(f'/api/v1/reviews/{review_id}', json={
            "text": "Updated",
            "rating": 4
        }, headers=self.user_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["text"], "Updated")

    def test_delete_review_success(self):
        r = self.client.post('/api/v1/reviews/', json={
            "text": "Great!",
            "rating": 5,
            "place_id": self.place_id
        }, headers=self.user_headers)
        review_id = r.get_json()["id"]

        response = self.client.delete(f'/api/v1/reviews/{review_id}', headers=self.user_headers)
        self.assertEqual(response.status_code, 200)

        # verify gone
        get_r = self.client.get(f'/api/v1/reviews/{review_id}')
        self.assertEqual(get_r.status_code, 404)

    def test_non_creator_cannot_modify(self):
        # create review as user
        r = self.client.post('/api/v1/reviews/', json={
            "text": "Great!",
            "rating": 5,
            "place_id": self.place_id
        }, headers=self.user_headers)
        review_id = r.get_json()["id"]
        # another regular user
        other = create_user_direct({
            "first_name": "Other",
            "last_name": "User",
            "email": "other@example.com",
            "password": "pass"
        })
        token_other = login(self.client, "other@example.com", "pass")
        other_headers = {'Authorization': f'Bearer {token_other}'}
        r_put = self.client.put(f'/api/v1/reviews/{review_id}', json={"text": "Bad"}, headers=other_headers)
        self.assertEqual(r_put.status_code, 403)
        r_del = self.client.delete(f'/api/v1/reviews/{review_id}', headers=other_headers)
        self.assertEqual(r_del.status_code, 403)

    def test_admin_can_modify_any_review(self):
        r = self.client.post('/api/v1/reviews/', json={
            "text": "Great!",
            "rating": 5,
            "place_id": self.place_id
        }, headers=self.user_headers)
        review_id = r.get_json()["id"]
        r_put = self.client.put(f'/api/v1/reviews/{review_id}', json={"text": "Admin edit"}, headers=self.admin_headers)
        self.assertEqual(r_put.status_code, 200)
        r_del = self.client.delete(f'/api/v1/reviews/{review_id}', headers=self.admin_headers)
        self.assertEqual(r_del.status_code, 200)

    def test_delete_review_not_found(self):
        response = self.client.delete('/api/v1/reviews/does-not-exist')
        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
