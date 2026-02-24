#!/usr/bin/python3
from BaseModel import BaseModel
from Place import Place


class User(BaseModel):
    def __init__(self, first_name="", last_name="", email="", is_admin=False):
        super().__init__()

        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin
        self.places = []

    @property
    def first_name(self):
        return self.__first_name

    @property
    def last_name(self):
        return self.__last_name

    @property
    def email(self):
        return self.__email

    @property
    def is_admin(self):
        return self.__is_admin

    @first_name.setter
    def first_name(self, value):
        if not isinstance(value, str):
            raise TypeError("first_name must be a string")
        if value == "":
            raise ValueError("first_name must not be empty")
        if len(value) > 50:
            raise ValueError("first_name must not exceed 50 characters")
        self.__first_name = value

    @last_name.setter
    def last_name(self, value):
        if not isinstance(value, str):
            raise TypeError("last_name must be a string")
        if value == "":
            raise ValueError("last_name must not be empty")
        if len(value) > 50:
            raise ValueError("last_name must not exceed 50 characters")
        self.__last_name = value

    @email.setter
    def email(self, value):
        if not isinstance(value, str):
            raise TypeError("email must be a string")
        if value == "":
            raise ValueError("email must not be empty")
        if "@" not in value or "." not in value:
            raise ValueError("email must be a valid email address")
        self.__email = value

    @is_admin.setter
    def is_admin(self, value):
        if not isinstance(value, bool):
            raise TypeError("is_admin must be a boolean")
        self.__is_admin = value

    def add_place(self, place):
        if not isinstance(place, Place):
            raise TypeError("place must be an instance of Place")
        self.places.append(place)
