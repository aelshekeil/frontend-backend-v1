from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from app.config import Config
from app.extensions import db, migrate, jwt, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.tours import tours_bp
    from app.api.bookings import bookings_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tours_bp, url_prefix='/api/tours')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')

    return app
