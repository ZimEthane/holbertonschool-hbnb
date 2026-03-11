#!/usr/bin/python3
"""Unit tests for /api/v1/users endpoints."""

import unittest

from app import create_app
from tests.utils import reset_facade_state, login, create_user_direct


class TestUserEndpoints(unittest.TestCase):
    def setUp(self):
        reset_facade_state()
        self.app = create_app()
        self.client = self.app.test_client()

        # create admin user directly and login
        admin = create_user_direct({
            "first_name": "Admin",
            "last_name": "User",
            "email": "admin@example.com",
            "password": "adminpass",
            "is_admin": True
        })
        token = login(self.client, "admin@example.com", "adminpass")
        self.admin_headers = {'Authorization': f'Bearer {token}'}

        # also create a regular user for later tests
        regular = create_user_direct({
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com",
            "password": "janepass"
        })
        self.user_id = regular.id
        self.user_token = login(self.client, "jane.doe@example.com", "janepass")
        self.user_headers = {'Authorization': f'Bearer {self.user_token}'}

    def test_create_user_success(self):
        payload = {
            "first_name": "John",
            "last_name": "Smith",
            "email": "john.smith@example.com",
            "password": "pwd123"
        }
        response = self.client.post('/api/v1/users/', json=payload, headers=self.admin_headers)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("id", data)
        self.assertEqual(facade.get_user(data['id']).email, "john.smith@example.com")

    def test_create_user_unauthorized(self):
        payload = {
            "first_name": "Mary",
            "last_name": "Jones",
            "email": "mary.jones@example.com",
            "password": "pwd"
        }
        r = self.client.post('/api/v1/users/', json=payload)
        self.assertEqual(r.status_code, 401)  # no token
        r2 = self.client.post('/api/v1/users/', json=payload, headers=self.user_headers)
        self.assertEqual(r2.status_code, 403)  # regular user cannot

    def test_create_user_duplicate_email(self):
        payload = {
            "first_name": "Another",
            "last_name": "User",
            "email": "duplicate@example.com",
            "password": "pwd"
        }
        r1 = self.client.post('/api/v1/users/', json=payload, headers=self.admin_headers)
        self.assertEqual(r1.status_code, 201)

        r2 = self.client.post('/api/v1/users/', json=payload, headers=self.admin_headers)
        self.assertEqual(r2.status_code, 400)
        self.assertIn("error", r2.get_json())

    def test_create_user_invalid_data(self):
        response = self.client.post('/api/v1/users/', json={
            "first_name": "",
            "last_name": "",
            "email": "invalid-email"
        }, headers=self.admin_headers)
        self.assertEqual(response.status_code, 400)

    def test_get_users_list(self):
        # create two additional users via admin
        self.client.post('/api/v1/users/', json={
            "first_name": "A",
            "last_name": "B",
            "email": "a.b@example.com",
            "password": "pw"
        }, headers=self.admin_headers)
        self.client.post('/api/v1/users/', json={
            "first_name": "C",
            "last_name": "D",
            "email": "c.d@example.com",
            "password": "pw"
        }, headers=self.admin_headers)

        response = self.client.get('/api/v1/users/')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(len(data) >= 3)  # includes admin + others

    def test_get_user_not_found(self):
        response = self.client.get('/api/v1/users/does-not-exist')
        self.assertEqual(response.status_code, 404)

    def test_get_user_success(self):
        # we already have self.user_id from setUp
        user_id = self.user_id
        response = self.client.get(f'/api/v1/users/{user_id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["id"], user_id)
        self.assertEqual(data["email"], "jane.doe@example.com")

    def test_admin_modifies_user(self):
        # change regular user's email
        payload = {"email": "new.email@example.com"}
        r = self.client.put(f'/api/v1/users/{self.user_id}', json=payload, headers=self.admin_headers)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.get_json()["email"], "new.email@example.com")

    def test_regular_cannot_modify_other(self):
        # create second user
        other = create_user_direct({
            "first_name": "Foo",
            "last_name": "Bar",
            "email": "foo.bar@example.com",
            "password": "foobar"
        })
        other_id = other.id
        r = self.client.put(f'/api/v1/users/{other_id}', json={"last_name": "Z"}, headers=self.user_headers)
        self.assertEqual(r.status_code, 403)

    def test_regular_can_modify_self_except_email(self):
        r = self.client.put(f'/api/v1/users/{self.user_id}', json={"first_name": "Janet"}, headers=self.user_headers)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.get_json()["first_name"], "Janet")
        r2 = self.client.put(f'/api/v1/users/{self.user_id}', json={"email": "x@x.com"}, headers=self.user_headers)
        self.assertEqual(r2.status_code, 400)


if __name__ == "__main__":
    unittest.main()
