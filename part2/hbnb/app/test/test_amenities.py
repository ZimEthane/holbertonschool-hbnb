import unittest
from part2.hbnb.app import create_app


class TestAmenityEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_create_amenity_valid(self):
        response = self.client.post("/api/v1/amenities/", json={
            "name": "WiFi"
        })
        self.assertEqual(response.status_code, 201)

    def test_create_amenity_empty_name(self):
        response = self.client.post("/api/v1/amenities/", json={
            "name": ""
        })
        self.assertEqual(response.status_code, 400)

    def test_get_nonexistent_amenity(self):
        response = self.client.get("/api/v1/amenities/fake-id")
        self.assertEqual(response.status_code, 404)
