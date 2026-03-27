from flask import Flask, request, send_from_directory
from flask_restx import Api
from app.extensions import bcrypt, jwt, db, cors
from sqlalchemy import inspect, text
import os


def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(__name__, static_folder='../frontend', static_url_path='')

    app.config.from_object(config_class)
    app.config['JWT_SECRET_KEY'] = 'your-secret-key'

    # Initialize extensions
    bcrypt.init_app(app)
    jwt.init_app(app)
    db.init_app(app)

    # Configure CORS
    cors.init_app(app, resources={r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": False,
        "max_age": 3600
    }})

    # Add middleware to ensure CORS headers are always present
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = app.make_default_options_response()
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Max-Age'] = '3600'
            return response, 200

    @app.after_request
    def after_request(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Max-Age'] = '3600'
        return response

    # Serve frontend files
    @app.route('/')
    def index():
        return send_from_directory('../frontend', 'index.html')

    @app.route('/<path:path>')
    def serve_static(path):
        # Try static folder first
        full_path = os.path.join('../frontend', path)
        if os.path.exists(full_path):
            if os.path.isdir(full_path):
                return send_from_directory(full_path, 'index.html')
            else:
                return send_from_directory('../frontend', path)
        return {'error': 'Not found'}, 404

    # Import models
    with app.app_context():
        from app.models import user      # noqa: F401
        from app.models import place     # noqa: F401
        from app.models import review    # noqa: F401
        from app.models import amenity   # noqa: F401
        db.create_all()

        # Lightweight migration for existing databases
        inspector = inspect(db.engine)
        columns = {column['name'] for column in inspector.get_columns('places')}
        if 'image_urls' not in columns:
            db.session.execute(text("ALTER TABLE places ADD COLUMN image_urls TEXT DEFAULT '[]'"))
            db.session.commit()

    from app.api.v1.users import api as users_ns
    from app.api.v1.amenities import api as amenities_ns
    from app.api.v1.reviews import api as reviews_ns
    from app.api.v1.places import api as places_ns
    from app.api.v1.auth import api as auth_ns

    api = Api(app, version='1.0', title='HBnB API', description='HBnB Application API', doc='/')

    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(auth_ns, path='/api/v1/auth')

    return app