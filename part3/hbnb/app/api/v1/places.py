#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from app.services import facade

api = Namespace('places', description='Place operations')

# 1) Define review_model FIRST
review_model = api.model('PlaceReview', {
    'id': fields.String(description='Review ID'),
    'text': fields.String(description='Text of the review'),
    'rating': fields.Integer(description='Rating of the place (1-5)'),
    'user_id': fields.String(description='ID of the user')
})

# 2) Then place_model
place_model = api.model('Place', {
    'id': fields.String,
    'title': fields.String(required=True),
    'description': fields.String(description='Description of the place'),
    'price': fields.Float(required=True),
    'latitude': fields.Float(required=True),
    'longitude': fields.Float(required=True),
    'owner_id': fields.String(required=False),
    'amenities': fields.List(fields.String),
    'reviews': fields.List(fields.Nested(review_model))
})


@api.route('/')
class PlaceList(Resource):

    @api.expect(place_model)
    def post(self):
        data = api.payload
        try:
            place = facade.create_place(data)
        except Exception as e:
            return {"message": str(e)}, 400

        return place.to_dict(), 201

    def get(self):
        places = facade.get_all_places()
        return [
            {
                "id": p.id,
                "title": p.title,
                "latitude": p.latitude,
                "longitude": p.longitude
            }
            for p in places
        ], 200


@api.route('/<place_id>')
class PlaceResource(Resource):

    def get(self, place_id):
        place = facade.get_place(place_id)
        if not place:
            return {"message": "Place not found"}, 404

        owner = place.owner

        if not owner:
            return {"message": "Owner not found"}, 404

        return {
            "id": place.id,
            "title": place.title,
            "description": place.description,
            "price": place.price,
            "latitude": place.latitude,
            "longitude": place.longitude,
            "owner": {
                "id": owner.id,
                "first_name": owner.first_name,
                "last_name": owner.last_name,
                "email": owner.email
            },
            "amenities": [
                {
                    "id": a.id,
                    "name": a.name
                }
                for a in place.amenities
            ],
            "reviews": [
                {
                    "id": r.id,
                    "text": r.text,
                    "rating": r.rating,
                    "user_id": r.user.id
                }
                for r in place.reviews
            ]
        }, 200

    @api.expect(place_model)
    def put(self, place_id):
        data = api.payload
        try:
            place = facade.update_place(place_id, data)
            if not place:
                return {"message": "Place not found"}, 404
        except Exception as e:
            return {"message": str(e)}, 400

        return {"message": "Place updated successfully"}, 200


@api.route('/<place_id>/reviews')
class PlaceReviewList(Resource):
    @api.response(200, 'List of reviews for the place retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get all reviews for a specific place"""
        try:
            reviews = facade.get_reviews_by_place(place_id)
            # safe serialization (évite to_dict si pas sûr)
            return [
                {
                    "id": r.id,
                    "text": r.text,
                    "rating": r.rating,
                    "user_id": r.user.id
                }
                for r in reviews
            ], 200
        except ValueError:
            return {"error": "Place not found"}, 404
