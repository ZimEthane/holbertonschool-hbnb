
#!/usr/bin/python3
"""Unit tests for /api/v1/amenities endpoints."""

import unittest

from app import create_app
from tests.utils import reset_facade_state, login, create_user_direct


class TestAmenityEndpoints(unittest.TestCase):
    def setUp(self):
        reset_facade_state()
        self.app = create_app()
        self.client = self.app.test_client()

        admin = create_user_direct({
            "first_name": "Admin",
            "last_name": "User",
            "email": "admin@example.com",
            "password": "adminpass",
            "is_admin": True
        })
        token = login(self.client, "admin@example.com", "adminpass")
        self.admin_headers = {'Authorization': f'Bearer {token}'}

        # regular user for unauthorized checks
        regular = create_user_direct({
            "first_name": "Joe",
            "last_name": "User",
            "email": "joe.user@example.com",
            "password": "joepass"
        })
        rt = login(self.client, "joe.user@example.com", "joepass")
        self.user_headers = {'Authorization': f'Bearer {rt}'}

    def test_create_amenity_success(self):
        response = self.client.post('/api/v1/amenities/', json={"name": "WiFi"}, headers=self.admin_headers)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], "WiFi")

    def test_create_amenity_invalid_data(self):
        response = self.client.post('/api/v1/amenities/', json={}, headers=self.admin_headers)
        self.assertEqual(response.status_code, 400)

    def test_create_amenity_unauthorized(self):
        r1 = self.client.post('/api/v1/amenities/', json={"name": "Gym"})
        self.assertEqual(r1.status_code, 401)
        r2 = self.client.post('/api/v1/amenities/', json={"name": "Gym"}, headers=self.user_headers)
        self.assertEqual(r2.status_code, 403)

    def test_get_amenities_list(self):
        self.client.post('/api/v1/amenities/', json={"name": "WiFi"}, headers=self.admin_headers)
        self.client.post('/api/v1/amenities/', json={"name": "Pool"}, headers=self.admin_headers)
        response = self.client.get('/api/v1/amenities/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.get_json()), 2)

    def test_get_amenity_not_found(self):
        response = self.client.get('/api/v1/amenities/does-not-exist')
        self.assertEqual(response.status_code, 404)

    def test_update_amenity_success(self):
        r = self.client.post('/api/v1/amenities/', json={"name": "WiFi"}, headers=self.admin_headers)
        amenity_id = r.get_json()["id"]
        response = self.client.put(f'/api/v1/amenities/{amenity_id}', json={"name": "Fast WiFi"}, headers=self.admin_headers)
        self.assertEqual(response.status_code, 200)

        # verify updated
        get_r = self.client.get(f'/api/v1/amenities/{amenity_id}')
        self.assertEqual(get_r.status_code, 200)
        self.assertEqual(get_r.get_json()["name"], "Fast WiFi")

    def test_update_amenity_unauthorized(self):
        r = self.client.post('/api/v1/amenities/', json={"name": "WiFi"}, headers=self.admin_headers)
        amenity_id = r.get_json()["id"]
        r2 = self.client.put(f'/api/v1/amenities/{amenity_id}', json={"name": "Nope"}, headers=self.user_headers)
        self.assertEqual(r2.status_code, 403)

    def test_update_amenity_invalid_data(self):
        r = self.client.post('/api/v1/amenities/', json={"name": "WiFi"}, headers=self.admin_headers)
        amenity_id = r.get_json()["id"]
        response = self.client.put(f'/api/v1/amenities/{amenity_id}', json={"name": ""}, headers=self.admin_headers)
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
