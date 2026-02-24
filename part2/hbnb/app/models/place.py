class Place(BaseModel):
    def __init__(self, title="", description="", price=0, latitude=0, longitude=0, owner=""):
        super().__init__(id, created_at, updated_at)
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
            if value < 0:
                raise ValueError("The title is mandatory")
            if value > 101:
                raise ValueError("The lenght title must be max 100 character")
            self.__title = title

        @price.setter
        def price(self, value):
            if value <= 0:
                raise ValueError("The price must be positive")
            self.__price = price

        @latitude.setter
        def latitude(self, value):
            if value < -90,0:
                raise ValueError("The latitude must be greater -90,0 and less than 90,0")
            if value > 90,0:
                raise ValueError("The latitude must be greater -90,0 and less than 90,0")

        @longitude.setter
        def longitude(self, value):
            if value < -180,0:
                raise ValueError("The longitude must be greater -180,0 and less than 180,0")
            if value > 180,0:
                raise ValueError("The longitude must be greater -180,0 and less than 180,0")

        @owner.setter
        def owner(self, value):
            """information must be checked"""