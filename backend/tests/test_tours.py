import pytest
from app.models.tour import Tour

def test_get_tours(client):
    """Test getting all tours"""
    response = client.get('/api/tours/')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'data' in data

def test_create_tour(client, auth_headers):
    """Test creating a new tour"""
    tour_data = {
        'title': 'Test Tour',
        'description': 'A test tour description',
        'destination': 'Test Destination',
        'price': 299.99,
        'duration': 7,
        'max_participants': 20
    }
    
    response = client.post('/api/tours/', 
                          json=tour_data, 
                          headers=auth_headers)
    
    assert response.status_code == 201
    data = response.get_json()
    assert data['success'] is True
    assert data['data']['title'] == tour_data['title']

def test_create_tour_validation_error(client, auth_headers):
    """Test tour creation with invalid data"""
    invalid_data = {
        'title': '',  # Invalid: empty title
        'price': -100  # Invalid: negative price
    }
    
    response = client.post('/api/tours/', 
                          json=invalid_data, 
                          headers=auth_headers)
    
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert 'errors' in data
