#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
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
    @api.response(200, 'List of places retrieved successfully')
    def get(self):
        """Retrieve a list of all places (public)"""
        places = facade.get_all_places()
        return [
            {
                'id': p.id,
                'title': p.title,
                'price': p.price,
                'latitude': p.latitude,
                'longitude': p.longitude
            }
            for p in places
        ], 200

    @jwt_required()
    @api.expect(place_model)
    @api.response(201, 'Place successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Create a new place (authenticated)"""
        current_user_id = get_jwt_identity()
        data = api.payload
        data['owner_id'] = current_user_id  # Set owner to current user

        try:
            new_place = facade.create_place(data)
            return {
                'id': new_place.id,
                'title': new_place.title,
                'description': new_place.description,
                'price': new_place.price,
                'latitude': new_place.latitude,
                'longitude': new_place.longitude,
                'owner_id': new_place.owner.id
            }, 201
        except ValueError as e:
            return {"error": str(e)}, 400

@api.route('/<place_id>')
class PlaceResource(Resource):
    @api.response(200, 'Place details retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get place details by ID (public)"""
        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404

        return {
            'id': place.id,
            'title': place.title,
            'description': place.description,
            'price': place.price,
            'latitude': place.latitude,
            'longitude': place.longitude,
            'owner_id': place.owner.id,
            'amenities': [a.id for a in place.amenities]
        }, 200

    @jwt_required()
    @api.expect(place_model)
    @api.response(200, 'Place updated successfully')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'Place not found')
    def put(self, place_id):
        """Update place details (authenticated, owner only)"""
        claims = get_jwt()
        is_admin = claims.get('is_admin', False)
        current_user_id = get_jwt_identity()
        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404
        if not is_admin and place.owner.id != current_user_id:
            return {'error': 'Unauthorized action'}, 403

        data = api.payload
        try:
            updated_place = facade.update_place(place_id, data)
            if not updated_place:
                return {'error': 'Place not found'}, 404
            return {
                'id': updated_place.id,
                'title': updated_place.title,
                'description': updated_place.description,
                'price': updated_place.price,
                'latitude': updated_place.latitude,
                'longitude': updated_place.longitude
            }, 200
        except ValueError as e:
            return {"error": str(e)}, 400


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
