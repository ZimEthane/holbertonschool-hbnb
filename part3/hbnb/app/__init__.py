from flask import Flask
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy
from app.extensions import bcrypt
from app.extensions import jwt
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.places import api as places_ns
from app.api.v1.auth import api as auth_ns

db = SQLAlchemy()

def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(__name__)

    app.config.from_object(config_class)
    
    app.config['JWT_SECRET_KEY'] = 'your-secret-key'

    bcrypt.init_app(app)
    jwt.init_app(app)
    db.init_app(app)

    api = Api(app, version='1.0', title='HBnB API', description='HBnB Application API', doc='/')

    # Register namespaces
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(auth_ns, path='/api/v1/auth')

    return app
