#!/usr/bin/python3
from app.extensions import db
from sqlalchemy.orm import validates
from .baseModel import BaseModel


class Review(BaseModel):
    __tablename__ = 'reviews'

    text = db.Column(db.String(2048), nullable=False)
    rating = db.Column(db.Integer, nullable=False)

    # ── Validateurs SQLAlchemy ──────────────────────────────────────────────

    @validates('text')
    def validate_text(self, key, value):
        if not isinstance(value, str):
            raise TypeError("text must be a string")
        if not value.strip():
            raise ValueError("text must not be empty")
        return value

    @validates('rating')
    def validate_rating(self, key, value):
        if not isinstance(value, int):
            raise TypeError("rating must be an integer")
        if value < 1 or value > 5:
            raise ValueError("rating must be between 1 and 5")
        return value

    # ── Sérialisation ───────────────────────────────────────────────────────

    def to_dict(self):
        base = super().to_dict()
        base.update({
            "text": self.text,
            "rating": self.rating,
        })
        return base