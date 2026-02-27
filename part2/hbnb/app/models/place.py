#!/usr/bin/python3
from .baseModel import BaseModel


class Place(BaseModel):
    def __init__(self, title="", description="", price=0, latitude=0, longitude=0, owner=None):
        super().__init__()
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner = owner
        self.reviews = []
        self.amenities = []

    @property
    def title(self):
        """Gets the title of the place"""
        return self.__title

    @property
    def description(self):
        """Gets the description of the place"""
        return self.__description
    
    @property
    def price(self):
        """Gets the price of the place"""
        return self.__price

    @property
    def latitude(self):
        """Gets the latitude of the place"""
        return self.__latitude

    @property
    def longitude(self):
        """Gets the longitude of the place"""
        return self.__longitude

    @property
    def owner(self):
        """Gets the owner of the place"""
        return self.__owner

    @title.setter
    def title(self, value):
        if not isinstance(value, str):
            raise TypeError("title must be a string")
        if value == "":
            raise ValueError("The title is mandatory")
        if len(value) > 100:
            raise ValueError("The length of title must be max 100 characters")
        self.__title = value

    @description.setter
    def description(self, value):
        if not isinstance(value, str):
            raise TypeError("description must be a string")
        self.__description = value

    @price.setter
    def price(self, value):
        if not isinstance(value, (int, float)):
            raise TypeError("price must be a number")
        if value <= 0:
            raise ValueError("The price must be positive")
        self.__price = value

    @latitude.setter
    def latitude(self, value):
        if not isinstance(value, (int, float)):
            raise TypeError("latitude must be a number")
        if value < -90.0 or value > 90.0:
            raise ValueError("latitude must be between -90 and 90")
        self.__latitude = value

    @longitude.setter
    def longitude(self, value):
        if not isinstance(value, (int, float)):
            raise TypeError("longitude must be a number")
        if value < -180.0 or value > 180.0:
            raise ValueError("longitude must be between -180 and 180")
        self.__longitude = value

    @owner.setter
    def owner(self, value):
        from .user import User
        if value is not None and not isinstance(value, User):
            raise TypeError("owner must be an instance of User")
        self.__owner = value
        if value:
            value.add_place(self)

    def add_review(self, review):
        from .review import Review
        if not isinstance(review, Review):
            raise TypeError("review must be an instance of Review")
        self.reviews.append(review)

    def remove_review(self, review):
        from .review import Review
        if not isinstance(review, Review):
            raise TypeError("review must be an instance of Review")
        if review in self.reviews:
            self.reviews.remove(review)

    def add_amenity(self, amenity):
        from .amenity import Amenity
        if not isinstance(amenity, Amenity):
            raise TypeError("amenity must be an instance of Amenity")
        self.amenities.append(amenity)

    def to_dict(self):
        """Convert the place to a dictionary for JSON serialization"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "owner_id": self.owner.id if self.owner else None,
            "amenities": [
                {
                    "id": a.id,
                    "name": a.name
                }
                for a in self.amenities
            ],
            "reviews": [
                {
                    "id": r.id,
                    "text": r.text,
                    "rating": r.rating,
                    "user_id": r.user.id if r.user else None
                }
                for r in self.reviews
            ]
        }