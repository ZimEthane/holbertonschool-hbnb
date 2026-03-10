#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request
from app.services import facade

api = Namespace('reviews', description='Review operations')

# Define the review model for input validation and documentation
review_model = api.model('Review', {
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=False, description='Rating of the place (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})


@api.route('/')
class ReviewList(Resource):
    @jwt_required()
    @api.expect(review_model)
    @api.response(201, 'Review successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Create a new review (authenticated)"""
        current_user_id = get_jwt_identity()
        data = api.payload
        place_id = data['place_id']
        place = facade.get_place(place_id)
        rating = data.get('rating')#ligne rajoutée par ju' 
        
        if not place:
            return {'error': 'Place not found'}, 404
        if place.owner.id == current_user_id:
            return {'error': 'You cannot review your own place'}, 400
        #Ce que je viens de rajouter pour que le code fonctionne
        if rating is None:
            return {'error': 'rating is required'}, 400

        if not isinstance(rating, int):
            return {'error': 'rating must be an integer'}, 400
        #ça s'arrete ici 
        # Check if user already reviewed this place
        existing_reviews = facade.get_reviews_by_place(place_id)
        if any(r.user.id == current_user_id for r in existing_reviews):
            return {'error': 'You have already reviewed this place'}, 400

        data['user_id'] = current_user_id
        try:
            new_review = facade.create_review(data)
            return {
                'id': new_review.id,
                'text': new_review.text,
                'rating': new_review.rating,
                'user_id': new_review.user.id,
                'place_id': new_review.place.id
            }, 201
        except ValueError as e:
            return {"error": str(e)}, 400


@api.route('/<review_id>')
class ReviewResource(Resource):
    @jwt_required()
    @api.expect(review_model)
    @api.response(200, 'Review updated successfully')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'Review not found')
    def put(self, review_id):
        """Update review (authenticated, creator only)"""
        current_user_id = get_jwt_identity()
        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        if review.user.id != current_user_id:
            return {'error': 'Unauthorized action'}, 403

        data = api.payload
        try:
            updated_review = facade.update_review(review_id, data)
            if not updated_review:
                return {'error': 'Review not found'}, 404
            return {
                'id': updated_review.id,
                'text': updated_review.text,
                'rating': updated_review.rating
            }, 200
        except ValueError as e:
            return {"error": str(e)}, 400

    @jwt_required()
    @api.response(200, 'Review deleted successfully')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'Review not found')
    def delete(self, review_id):
        """Delete review (authenticated, creator only)"""
        current_user_id = get_jwt_identity()
        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        if review.user.id != current_user_id:
            return {'error': 'Unauthorized action'}, 403

        success = facade.delete_review(review_id)
        if success:
            return {'message': 'Review deleted successfully'}, 200
        return {'error': 'Review not found'}, 404