from app.services.repositories.user_repository import UserRepository
from app.services.repositories.place_repository import PlaceRepository
from app.services.repositories.review_repository import ReviewRepository
from app.services.repositories.amenity_repository import AmenityRepository
from app.models.user import User
from app.models.amenity import Amenity
from app.models.place import Place
from app.models.review import Review


class HBnBFacade:
    def __init__(self):
        self.user_repo = UserRepository()
        self.amenities_repo = AmenityRepository()
        self.places_repo = PlaceRepository()
        self.reviews_repo = ReviewRepository()

    # ── User ──────────────────────────────────────────────────────────────

    def create_user(self, user_data):
        user = User(
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            email=user_data["email"],
            is_admin=user_data.get("is_admin", False)
        )
        user.hash_password(user_data["password"])
        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        return self.user_repo.get_user_by_email(email)

    def get_all_users(self):
        return self.user_repo.get_all()

    def update_user(self, user_id, data):
        self.user_repo.update(user_id, data)
        return self.user_repo.get(user_id)

    # ── Amenity ───────────────────────────────────────────────────────────

    def create_amenity(self, amenity_data):
        amenity = Amenity(name=amenity_data['name'])
        self.amenities_repo.add(amenity)
        return amenity

    def get_amenity(self, amenity_id):
        return self.amenities_repo.get(amenity_id)

    def get_all_amenities(self):
        return self.amenities_repo.get_all()

    def update_amenity(self, amenity_id, amenity_data):
        amenity = self.get_amenity(amenity_id)
        if not amenity:
            return None
        self.amenities_repo.update(amenity_id, amenity_data)
        return self.amenities_repo.get(amenity_id)

    # ── Place ─────────────────────────────────────────────────────────────

    def create_place(self, place_data):
        owner_id = place_data.get('owner_id')
        if not owner_id:
            raise ValueError("owner_id is required")
        owner = self.get_user(owner_id)
        if not owner:
            raise ValueError("Owner not found")

        place = Place(
            title=place_data.get('title', ''),
            description=place_data.get('description', ''),
            price=place_data.get('price', 0),
            latitude=place_data.get('latitude', 0),
            longitude=place_data.get('longitude', 0),
            owner_id=owner_id
        )
        self.places_repo.add(place)
        return place

    def get_place(self, place_id):
        return self.places_repo.get(place_id)

    def get_all_places(self):
        return self.places_repo.get_all()

    def update_place(self, place_id, place_data):
        from app.extensions import db
        place = self.get_place(place_id)
        if not place:
            return None

        # Gérer les amenities séparément
        amenity_ids = place_data.pop('amenities', None)
        if amenity_ids is not None:
            amenities = []
            for amenity_id in amenity_ids:
                amenity = self.get_amenity(amenity_id)
                if amenity:
                    amenities.append(amenity)
            place.amenities = amenities

        # Mettre à jour les autres champs
        allowed = ['title', 'description', 'price', 'latitude', 'longitude']
        for key, value in place_data.items():
            if key in allowed:
                setattr(place, key, value)

        db.session.commit()
        return place

    def delete_place(self, place_id):
        place = self.get_place(place_id)
        if not place:
            return False
        self.places_repo.delete(place_id)
        return True

    # ── Review ────────────────────────────────────────────────────────────

    def create_review(self, review_data):
        user_id = review_data.get('user_id')
        place_id = review_data.get('place_id')

        if not user_id or not place_id:
            raise ValueError("user_id and place_id are required")
        if not self.get_user(user_id):
            raise ValueError("User not found")
        if not self.get_place(place_id):
            raise ValueError("Place not found")

        review = Review(
            text=review_data.get('text'),
            rating=review_data.get('rating'),
            user_id=user_id,
            place_id=place_id
        )
        self.reviews_repo.add(review)
        return review

    def get_review(self, review_id):
        return self.reviews_repo.get(review_id)

    def get_all_reviews(self):
        return self.reviews_repo.get_all()

    def get_reviews_by_place(self, place_id):
        place = self.get_place(place_id)
        if not place:
            raise ValueError("Place not found")
        return place.reviews

    def update_review(self, review_id, review_data):
        review = self.get_review(review_id)
        if not review:
            return None
        self.reviews_repo.update(review_id, review_data)
        return self.reviews_repo.get(review_id)

    def delete_review(self, review_id):
        review = self.get_review(review_id)
        if not review:
            return False
        self.reviews_repo.delete(review_id)
        return True