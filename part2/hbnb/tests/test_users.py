#!/usr/bin/python3
"""Unit tests for /api/v1/users endpoints."""

import unittest

from app import create_app
from tests.utils import reset_facade_state


class TestUserEndpoints(unittest.TestCase):
    def setUp(self):
        reset_facade_state()
        self.app = create_app()
        self.client = self.app.test_client()

    def test_create_user_success(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com"
        })
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("id", data)
        self.assertEqual(data["email"], "jane.doe@example.com")

    def test_create_user_duplicate_email(self):
        payload = {
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com"
        }
        r1 = self.client.post('/api/v1/users/', json=payload)
        self.assertEqual(r1.status_code, 201)

        r2 = self.client.post('/api/v1/users/', json=payload)
        self.assertEqual(r2.status_code, 400)
        self.assertIn("error", r2.get_json())

    def test_create_user_invalid_data(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "",
            "last_name": "",
            "email": "invalid-email"
        })
        self.assertEqual(response.status_code, 400)

    def test_get_users_list(self):
        self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com"
        })
        self.client.post('/api/v1/users/', json={
            "first_name": "John",
            "last_name": "Smith",
            "email": "john.smith@example.com"
        })

        response = self.client.get('/api/v1/users/')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 2)

    def test_get_user_not_found(self):
        response = self.client.get('/api/v1/users/does-not-exist')
        self.assertEqual(response.status_code, 404)

    def test_get_user_success(self):
        r = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com"
        })
        user_id = r.get_json()["id"]

        response = self.client.get(f'/api/v1/users/{user_id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["id"], user_id)
        self.assertEqual(data["email"], "jane.doe@example.com")


if __name__ == "__main__":
    unittest.main()
