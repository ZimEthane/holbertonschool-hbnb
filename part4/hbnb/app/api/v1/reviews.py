#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services import facade

api = Namespace('reviews', description='Review operations')

review_model = api.model('Review', {
    'text': fields.String(required=True),
    'rating': fields.Integer(required=True),
    'place_id': fields.String(required=True),
})


@api.route('/')
class ReviewList(Resource):
    def get(self):
        reviews = facade.get_all_reviews()
        return [
            {
                'id': r.id,
                'text': r.text,
                'rating': r.rating,
                'user_id': r.user_id,
                'user_name': f"{r.user.first_name} {r.user.last_name}" if r.user else 'Unknown',
                'place_id': r.place_id
            }
            for r in reviews
        ], 200

    @jwt_required()
    @api.expect(review_model)
    def post(self):
        current_user_id = get_jwt_identity()
        data = api.payload

        # Verify place exists and user is not the owner
        place_id = data.get('place_id')
        place = facade.get_place(place_id)
        if not place:
            return {'error': 'Place not found'}, 404

        # Prevent place owner from reviewing their own place
        if place.owner_id == current_user_id:
            return {'error': 'You cannot review your own place'}, 403

        data['user_id'] = current_user_id
        try:
            new_review = facade.create_review(data)
            return {
                'id': new_review.id,
                'text': new_review.text,
                'rating': new_review.rating,
                'user_id': new_review.user_id,
                'place_id': new_review.place_id
            }, 201
        except (ValueError, TypeError) as e:
            return {"error": str(e)}, 400


@api.route('/<review_id>')
class ReviewResource(Resource):
    def get(self, review_id):
        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        return {
            'id': review.id,
            'text': review.text,
            'rating': review.rating,
            'user_id': review.user_id,
            'user_name': f"{review.user.first_name} {review.user.last_name}" if review.user else 'Unknown',
            'place_id': review.place_id,
            'place_title': review.place.title if review.place else 'Unknown'
        }, 200

    @jwt_required()
    @api.expect(review_model)
    def put(self, review_id):
        claims = get_jwt()
        is_admin = claims.get('is_admin', False)
        current_user_id = get_jwt_identity()
        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        if not is_admin and review.user_id != current_user_id:
            return {'error': 'Unauthorized action'}, 403
        data = api.payload
        try:
            updated = facade.update_review(review_id, data)
            return {
                'id': updated.id,
                'text': updated.text,
                'rating': updated.rating,
                'user_id': updated.user_id,
                'user_name': f"{updated.user.first_name} {updated.user.last_name}" if updated.user else 'Unknown',
                'place_id': updated.place_id
            }, 200
        except (ValueError, TypeError) as e:
            return {"error": str(e)}, 400

    @jwt_required()
    def delete(self, review_id):
        claims = get_jwt()
        is_admin = claims.get('is_admin', False)
        current_user_id = get_jwt_identity()
        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404
        if not is_admin and review.user_id != current_user_id:
            return {'error': 'Unauthorized action'}, 403
        facade.delete_review(review_id)
        return {'message': 'Review deleted successfully'}, 200


@api.route('/user/my-reviews')
class MyReviewsList(Resource):
    @jwt_required()
    def get(self):
        """Get all reviews by current user"""
        current_user_id = get_jwt_identity()
        user = facade.get_user(current_user_id)
        if not user:
            return {'error': 'User not found'}, 404

        reviews = [
            {
                'id': r.id,
                'text': r.text,
                'rating': r.rating,
                'user_id': r.user_id,
                'user_name': f"{r.user.first_name} {r.user.last_name}" if r.user else 'Unknown',
                'place_id': r.place_id,
                'place_title': r.place.title if r.place else 'Unknown'
            }
            for r in user.reviews
        ]
        return reviews, 200