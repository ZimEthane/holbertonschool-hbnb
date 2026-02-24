#!/usr/bin/python3
from .baseModel import BaseModel


class Amenity(BaseModel):
    def __init__(self, name=""):
        super().__init__()
        self.name = name

    @property
    def name(self):
        """Gets the name"""
        return self.__name

    @name.setter
    def name(self, value):
        if not isinstance(value, str):
            raise TypeError("Value must be a string")
        if value == "":
            raise ValueError("Value must not be empty")
        if len(value) > 50:
            raise ValueError("Value must not exceed 50 characters")
        self.__name = value
