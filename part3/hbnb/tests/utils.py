#!/usr/bin/python3
"""Common helpers for API unit tests."""

from app.services import facade
from app.persistence.repository import InMemoryRepository


def reset_facade_state():
    """Reset in-memory stores so tests are isolated."""
    facade.user_repo = InMemoryRepository()
    facade.amenities.clear()
    facade.places.clear()
    facade.reviews.clear()


def login(client, email, password):
    """Return access token for given credentials or None."""
    r = client.post('/api/v1/auth/login', json={'email': email, 'password': password})
    if r.status_code == 200:
        return r.get_json().get('access_token')
    return None


def create_user_direct(user_data):
    """Bypass API and create a user directly via facade (useful for setup)."""
    return facade.create_user(user_data)
