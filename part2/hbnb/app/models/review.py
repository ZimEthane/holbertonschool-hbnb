from .baseModel import BaseModel
from .user import User
from .place import Place


class Review(BaseModel):
    def __init__(self, text="", rating=0, place=None, user=None):
        super().__init__()
        self.__text = text
        self.__rating = rating
        self.__place = place
		self.__user = user

    @property
    def text(self):
        """Gets the text of the review"""
        return self.__text

    @property
    def rating(self):
        """Gets the rating of the review"""
        return self.__rating
    
    @property
    def place(self):
        """Gets the place of the review"""
        return self.__place
    
    @property
    def user(self):
        """Gets the user of the review"""
        return self.__user

    @text.setter
    def text(self, value):
        """information must be checked"""
        if not isinstance(value, str):
            raise TypeError("The text must be a string")
        if value == "":
            raise ValueError("The text must not be empty")
        self.__text = value

    @rating.setter
    def rating(self, value):
        """information must be checked"""
        if not isinstance(value, int):
            raise TypeError("The rating must be an integer")
        if value < 0 or value > 5:
			raise ValueError("The rating must be between 0 and 5")
        self.__rating = value

    @place.setter
    def place(self, value):
        """information must be checked"""
		if not isinstance(value, Place):
			raise TypeError("place must be an instance of Place")
        self.__place = value
		value.add_review(self)

    @user.setter
    def user(self, value):
        """information must be checked"""
		if not isinstance(value, User):
			raise TypeError("user must be an instance of User")
        self.__user = value
		value.add_review(self)
