from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from app.services import facade
from app.models.user import User

api = Namespace('users', description='User operations')

# Model pour validation et documentation
user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user'),
    'password': fields.String(required=True, description='Password of the user')
})


@api.route('/')
class UserList(Resource):

    @api.expect(user_model)
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def post(self):
        """Create a new user (admin only)"""
        claims = get_jwt()
        if not claims.get('is_admin', False):
            return {'error': 'Admin privileges required'}, 403

        data = api.payload

        try:
            existing_user = facade.get_user_by_email(data['email'])
            if existing_user:
                return {'error': 'Email already registered'}, 400

            new_user = facade.create_user(data)

            return {
                'id': new_user.id,
                'message': 'User successfully registered'
            }, 201

        except (ValueError, TypeError) as e:
            return {"error": str(e)}, 400


    @api.response(200, 'List of users retrieved successfully')
    def get(self):
        """Retrieve a list of all users"""

        users = facade.get_all_users()

        return [
            {
                'id': u.id,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'email': u.email
            }
            for u in users
        ], 200


@api.route('/<user_id>')
class UserResource(Resource):

    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user details by ID"""

        user = facade.get_user(user_id)

        if not user:
            return {'error': 'User not found'}, 404

        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }, 200

    @jwt_required()
    @api.expect(user_model)
    @api.response(200, 'User updated successfully')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Unauthorized action')
    def put(self, user_id):
        """Update user details.

        * Admin: full access, can change email/password (with uniqueness check)
        * Regular: only self; cannot change email/password.
        """
        claims = get_jwt()
        is_admin = claims.get('is_admin', False)
        current_user_id = get_jwt_identity()

        if not is_admin and user_id != current_user_id:
            return {'error': 'Unauthorized action'}, 403

        data = api.payload
        if not is_admin and ('email' in data or 'password' in data):
            return {'error': 'You cannot modify email or password'}, 400

        if is_admin and 'email' in data:
            existing_user = facade.get_user_by_email(data['email'])
            if existing_user and existing_user.id != user_id:
                return {'error': 'Email already in use'}, 400

        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404

        for key, value in data.items():
            if hasattr(user, key):
                setattr(user, key, value)

        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }, 200