import unittest
from part2.hbnb.app import create_app


class TestUserEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_create_user_valid(self):
        response = self.client.post("/api/v1/users/", json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@example.com"
        })
        self.assertEqual(response.status_code, 201)

    def test_create_user_invalid(self):
        response = self.client.post("/api/v1/users/", json={
            "first_name": "",
            "last_name": "",
            "email": "bad"
        })
        self.assertEqual(response.status_code, 400)

    def test_get_user_not_found(self):
        response = self.client.get("/api/v1/users/fake-id")
        self.assertEqual(response.status_code, 404)
