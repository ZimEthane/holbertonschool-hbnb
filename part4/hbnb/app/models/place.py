#!/usr/bin/python3
from app.extensions import db
from sqlalchemy.orm import validates
from .baseModel import BaseModel

# Table d'association Many-to-Many Place <-> Amenity
place_amenity = db.Table('place_amenity',
    db.Column('place_id', db.String(36), db.ForeignKey('places.id'), primary_key=True),
    db.Column('amenity_id', db.String(36), db.ForeignKey('amenities.id'), primary_key=True)
)

class Place(BaseModel):
    __tablename__ = 'places'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(1024), nullable=True)
    price = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    # FK vers User
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)

    # Relations
    reviews = db.relationship('Review', backref='place', lazy=True, cascade='all, delete-orphan')
    amenities = db.relationship('Amenity', secondary=place_amenity, lazy='subquery',
                                backref=db.backref('places', lazy=True))

    @validates('title')
    def validate_title(self, key, value):
        if not isinstance(value, str):
            raise TypeError("title must be a string")
        if not value.strip():
            raise ValueError("title must not be empty")
        if len(value) > 100:
            raise ValueError("title must not exceed 100 characters")
        return value

    @validates('description')
    def validate_description(self, key, value):
        if value is not None and not isinstance(value, str):
            raise TypeError("description must be a string")
        return value

    @validates('price')
    def validate_price(self, key, value):
        if not isinstance(value, (int, float)):
            raise TypeError("price must be a number")
        if value <= 0:
            raise ValueError("price must be positive")
        return float(value)

    @validates('latitude')
    def validate_latitude(self, key, value):
        if not isinstance(value, (int, float)):
            raise TypeError("latitude must be a number")
        if value < -90.0 or value > 90.0:
            raise ValueError("latitude must be between -90 and 90")
        return float(value)

    @validates('longitude')
    def validate_longitude(self, key, value):
        if not isinstance(value, (int, float)):
            raise TypeError("longitude must be a number")
        if value < -180.0 or value > 180.0:
            raise ValueError("longitude must be between -180 and 180")
        return float(value)

    def to_dict(self):
        base = super().to_dict()
        base.update({
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "owner_id": self.owner_id,
        })
        return base