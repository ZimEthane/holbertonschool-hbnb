#!/usr/bin/python3
from BaseModel import BaseModel
from User import User


class Place(BaseModel):
    def __init__(self, title="", description="", price=0, latitude=0, longitude=0, owner=None):
        super().__init__()
        self.__title = title
        self.__description = description
        self.__price = price
        self.__latitude = latitude
        self.__longitude = longitude
        self.__owner = owner

    @property
    def title(self):
        """Gets the title of the place"""
        return self.__title

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
        if not isinstance(value, User):
            raise TypeError("owner must be an instance of User")
        self.__owner = value
        value.add_place(self)
