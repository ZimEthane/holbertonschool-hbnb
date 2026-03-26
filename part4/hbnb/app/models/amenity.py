#!/usr/bin/python3
from app.extensions import db
from sqlalchemy.orm import validates
from .baseModel import BaseModel


class Amenity(BaseModel):
    __tablename__ = 'amenities'

    name = db.Column(db.String(50), nullable=False, unique=True)

    # ── Validateurs SQLAlchemy ──────────────────────────────────────────────

    @validates('name')
    def validate_name(self, key, value):
        if not isinstance(value, str):
            raise TypeError("name must be a string")
        if not value.strip():
            raise ValueError("name must not be empty")
        if len(value) > 50:
            raise ValueError("name must not exceed 50 characters")
        return value

    # ── Sérialisation ───────────────────────────────────────────────────────

    def to_dict(self):
        base = super().to_dict()
        base.update({
            "name": self.name,
        })
        return base
