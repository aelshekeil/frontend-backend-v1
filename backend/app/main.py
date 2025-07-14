import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from src.models.user import db
from src.models.client import Client, Application, ApplicationDocument, ApplicationStatusHistory
from src.models.content import Post, PostCategory, TravelPackage, Destination
from src.models.product import Product, ProductCategory, ProductVariant, ESIMProduct, Order, OrderItem

# Import blueprints
from src.routes.auth import auth_bp
from src.routes.clients import clients_bp
from src.routes.content import content_bp
from src.routes.products import products_bp
from src.routes.admin import admin_bp
from supabase import create_client, Client

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'tarim-tours-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Database configuration
# Hardcoding for local development to bypass environment variable issues
database_url = 'postgresql://postgres:password@localhost:5432/tarim_db'
print(f"--- CONNECTING TO DATABASE: {database_url} ---")
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS configuration - Allow all origins for development
CORS(app, origins="*", supports_credentials=True)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(clients_bp, url_prefix='/api/clients')
app.register_blueprint(content_bp, url_prefix='/api/content')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Create database tables and initialize default data
with app.app_context():
    db.create_all()

# API documentation endpoint
@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        'name': 'Tarim Tours Backend API',
        'version': '1.0.0',
        'description': 'Backend API for Tarim Tours - Travel, Visa, and Business Services',
        'endpoints': {
            'authentication': '/api/auth',
            'clients': '/api/clients',
            'content': '/api/content',
            'products': '/api/products',
            'admin': '/api/admin'
        },
        'features': [
            'Multi-admin authentication with role-based access control',
            'Client management and application tracking',
            'Content management (posts, travel packages)',
            'Product management (eSIMs, services)',
            'Order management and processing',
            'Audit logging and system monitoring'
        ],
        'documentation': '/api/docs'  # Future: Add Swagger documentation
    }), 200

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'version': '1.0.0'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

# Serve frontend static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve static files or index.html for SPA routing"""
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return jsonify({
            'message': 'Tarim Tours Backend API',
            'version': '1.0.0',
            'api_docs': '/api'
        }), 200

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return jsonify({
                'message': 'Tarim Tours Backend API',
                'version': '1.0.0',
                'api_docs': '/api'
            }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized'}), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({'error': 'Forbidden'}), 403

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Authorization token is required'}), 401

if __name__ == '__main__':
    # Run the application
    app.run(host='0.0.0.0', port=5000, debug=True)
