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
