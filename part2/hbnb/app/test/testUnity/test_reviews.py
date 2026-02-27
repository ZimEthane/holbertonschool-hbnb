import unittest
from part2.hbnb.app import create_app


class TestReviewEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

        # Création d'un user
        user_response = self.client.post("/api/v1/users/", json={
            "first_name": "Test",
            "last_name": "User",
            "email": "testuser@example.com"
        })
        self.user_id = user_response.get_json()["id"]

        # Création d'un place
        place_response = self.client.post("/api/v1/places/", json={
            "title": "Test Place",
            "price": 100,
            "latitude": 40,
            "longitude": 20
        })
        self.place_id = place_response.get_json()["id"]

    def test_create_review_valid(self):
        response = self.client.post("/api/v1/reviews/", json={
            "text": "Excellent endroit",
            "user_id": self.user_id,
            "place_id": self.place_id
        })
        self.assertEqual(response.status_code, 201)

    def test_create_review_empty_text(self):
        response = self.client.post("/api/v1/reviews/", json={
            "text": "",
            "user_id": self.user_id,
            "place_id": self.place_id
        })
        self.assertEqual(response.status_code, 400)

    def test_create_review_invalid_user(self):
        response = self.client.post("/api/v1/reviews/", json={
            "text": "Test",
            "user_id": "fake-id",
            "place_id": self.place_id
        })
        self.assertEqual(response.status_code, 400)

    def test_create_review_invalid_place(self):
        response = self.client.post("/api/v1/reviews/", json={
            "text": "Test",
            "user_id": self.user_id,
            "place_id": "fake-id"
        })
        self.assertEqual(response.status_code, 400)

    def test_get_nonexistent_review(self):
        response = self.client.get("/api/v1/reviews/fake-id")
        self.assertEqual(response.status_code, 404)
