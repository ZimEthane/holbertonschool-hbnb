import unittest
from part2.hbnb.app import create_app


class TestPlaceEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_place_valid(self):
        response = self.client.post("/api/v1/places/", json={
            "title": "Test",
            "price": 100,
            "latitude": 45,
            "longitude": 50
        })
        self.assertEqual(response.status_code, 201)

    def test_place_invalid_price(self):
        response = self.client.post("/api/v1/places/", json={
            "title": "Test",
            "price": -1,
            "latitude": 45,
            "longitude": 50
        })
        self.assertEqual(response.status_code, 400)
