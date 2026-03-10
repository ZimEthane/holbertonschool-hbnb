from .baseModel import BaseModel


class Review(BaseModel):
    def __init__(self, text="", rating=0, place=None, user=None):
        super().__init__()
        self.text = text
        self.rating = rating

        if place is not None:
            self.place = place

        if user is not None:
            self.user = user

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
        if value is None:
            raise TypeError("place must be a valid Place")
        self.__place = value

    @user.setter
    def user(self, value):
        """information must be checked"""
        if value is None:
            raise TypeError("user must be a valid User")
        self.__user = value

    def to_dict(self):
        """Convert the review to a dictionary for JSON serialization"""
        return {
            "id": self.id,
            "text": self.text,
            "rating": self.rating,
            "user_id": self.user.id if self.user else None,
            "place_id": self.place.id if self.place else None
        }
