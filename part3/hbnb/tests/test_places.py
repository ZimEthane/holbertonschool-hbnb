#!/usr/bin/python3
"""Unit tests for /api/v1/places endpoints."""

import unittest

from app import create_app
from tests.utils import reset_facade_state, login, create_user_direct


class TestPlaceEndpoints(unittest.TestCase):
    def setUp(self):
        reset_facade_state()
        self.app = create_app()
        self.client = self.app.test_client()

        # create admin and regular user
        admin = create_user_direct({
            "first_name": "Admin",
            "last_name": "User",
            "email": "admin@example.com",
            "password": "adminpass",
            "is_admin": True
        })
        token_admin = login(self.client, "admin@example.com", "adminpass")
        self.admin_headers = {'Authorization': f'Bearer {token_admin}'}

        regular = create_user_direct({
            "first_name": "Owner",
            "last_name": "One",
            "email": "owner.one@example.com",
            "password": "ownerpass"
        })
        self.owner_id = regular.id
        token_owner = login(self.client, "owner.one@example.com", "ownerpass")
        self.owner_headers = {'Authorization': f'Bearer {token_owner}'}

        # Create an amenity as admin
        r_am = self.client.post('/api/v1/amenities/', json={"name": "WiFi"}, headers=self.admin_headers)
        self.amenity_id = r_am.get_json()["id"]

    def test_create_place_success(self):
        response = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "description": "Center",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44,
            "amenities": [self.amenity_id]
        }, headers=self.owner_headers)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("id", data)
        self.assertEqual(data["owner_id"], self.owner_id)
        self.assertEqual(len(data["amenities"]), 1)

    def test_create_place_missing_owner_id(self):
        # but owner id is automatically set to token owner; removing required fields to simulate invalid
        response = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44
        }, headers=self.owner_headers)
        self.assertEqual(response.status_code, 400)

    def test_create_place_invalid_amenity(self):
        response = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44,
            "amenities": ["bad-amenity-id"]
        }, headers=self.owner_headers)
        self.assertEqual(response.status_code, 400)

    def test_get_place_success(self):
        r = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "description": "Center",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44,
            "amenities": [self.amenity_id]
        }, headers=self.owner_headers)
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
            "longitude": 1.44
        }, headers=self.owner_headers)
        place_id = r.get_json()["id"]

        response = self.client.put(f'/api/v1/places/{place_id}', json={
            "description": "Updated"
        }, headers=self.owner_headers)
        self.assertEqual(response.status_code, 200)

    def test_non_owner_cannot_update(self):
        # create another user
        other = create_user_direct({
            "first_name": "Other",
            "last_name": "User",
            "email": "other@example.com",
            "password": "pass"
        })
        token_other = login(self.client, "other@example.com", "pass")
        other_headers = {'Authorization': f'Bearer {token_other}'}

        r = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "description": "Center",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44
        }, headers=self.owner_headers)
        place_id = r.get_json()["id"]

        resp = self.client.put(f'/api/v1/places/{place_id}', json={"description": "Bad"}, headers=other_headers)
        self.assertEqual(resp.status_code, 403)

    def test_admin_can_update_any_place(self):
        r = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "description": "Center",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44
        }, headers=self.owner_headers)
        place_id = r.get_json()["id"]

        resp = self.client.put(f'/api/v1/places/{place_id}', json={"description": "Admin changed"}, headers=self.admin_headers)
        self.assertEqual(resp.status_code, 200)

    def test_get_place_reviews_list(self):
        # create place + review
        r_place = self.client.post('/api/v1/places/', json={
            "title": "Nice flat",
            "description": "Center",
            "price": 55.5,
            "latitude": 43.6,
            "longitude": 1.44
        }, headers=self.owner_headers)
        place_id = r_place.get_json()["id"]

        r_review = self.client.post('/api/v1/reviews/', json={
            "text": "Great!",
            "rating": 5,
            "place_id": place_id
        }, headers=self.owner_headers)
        self.assertEqual(r_review.status_code, 400)  # owner cannot review own place

        # to test positive flow create different user
        other = create_user_direct({
            "first_name": "Guest",
            "last_name": "Two",
            "email": "guest.two@example.com",
            "password": "guestpass"
        })
        token_guest = login(self.client, "guest.two@example.com", "guestpass")
        guest_headers = {'Authorization': f'Bearer {token_guest}'}
        r_review2 = self.client.post('/api/v1/reviews/', json={
            "text": "Great!",
            "rating": 5,
            "place_id": place_id
        }, headers=guest_headers)
        self.assertEqual(r_review2.status_code, 201)

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
