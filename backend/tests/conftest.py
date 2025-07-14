import pytest
from app import create_app
from app.extensions import db
from app.config import TestingConfig

@pytest.fixture
def app():
    """Create application for testing"""
    app = create_app(TestingConfig)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    """Create authentication headers for testing"""
    # Create test user and get token
    response = client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'testpassword123',
        'name': 'Test User'
    })
    
    login_response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'testpassword123'
    })
    
    token = login_response.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}
