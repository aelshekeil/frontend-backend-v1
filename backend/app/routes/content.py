from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from src.models.user import db, User
from src.models.content import Post, PostCategory, TravelPackage, Destination
from src.routes.auth import log_user_activity
import json
import re

content_bp = Blueprint('content', __name__)

def require_permission(permission_name):
    """Decorator to check user permissions"""
    def decorator(f):
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            if current_user_id.startswith('client_'):
                return jsonify({'error': 'Access denied'}), 403
            
            user = User.query.get(current_user_id)
            if not user or not user.has_permission(permission_name):
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator

def generate_slug(title):
    """Generate URL-friendly slug from title"""
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

# Post management routes
@content_bp.route('/api/posts', methods=['GET'])
def get_posts():
    """Get all posts with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        status = request.args.get('status', '')
        category_id = request.args.get('category_id', '')
        featured = request.args.get('featured', '')
        
        query = Post.query
        
        # Apply filters
        if status:
            query = query.filter(Post.status == status)
        else:
            # Default to published posts for public access
            query = query.filter(Post.status == 'published')
        
        if category_id:
            query = query.filter(Post.category_id == category_id)
        
        if featured:
            query = query.filter(Post.is_featured == (featured.lower() == 'true'))
        
        # Order by publication date (newest first)
        query = query.order_by(Post.published_at.desc().nullslast(), Post.created_at.desc())
        
        # Paginate
        posts = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'posts': [post.to_dict() for post in posts.items],
            'pagination': {
                'page': page,
                'pages': posts.pages,
                'per_page': per_page,
                'total': posts.total,
                'has_next': posts.has_next,
                'has_prev': posts.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get posts error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@content_bp.route('/api/posts/<post_id>', methods=['GET'])
def get_post(post_id):
    """Get a specific post by ID or slug"""
    try:
        # Try to find by ID first, then by slug
        post = Post.query.get(post_id)
        if not post:
            post = Post.query.filter_by(slug=post_id).first()
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        # Check if post is published (unless user is authenticated admin)
        auth_header = request.headers.get('Authorization')
        if not auth_header and post.status != 'published':
            return jsonify({'error': 'Post not found'}), 404
        
        return jsonify({'post': post.to_dict()}), 200
        
    except Exception as e:
        current_app.logger.error(f"Get post error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@content_bp.route('/api/posts', methods=['POST'])
@jwt_required()
@require_permission('content.create')
def create_post():
    """Create a new post"""
    try:
        data = request.get_json()
        
        required_fields = ['title', 'content']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Generate slug
        slug = data.get('slug') or generate_slug(data['title'])
        
        # Check if slug already exists
        existing_post = Post.query.filter_by(slug=slug).first()
        if existing_post:
            # Append timestamp to make it unique
            slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
        
        post = Post(
            title=data['title'],
            slug=slug,
            content=data['content'],
            excerpt=data.get('excerpt'),
            featured_image=data.get('featured_image'),
            meta_title=data.get('meta_title'),
            meta_description=data.get('meta_description'),
            status=data.get('status', 'draft'),
            is_featured=data.get('is_featured', False),
            author_id=get_jwt_identity(),
            category_id=data.get('category_id')
        )
        
        # Set published date if status is published
        if post.status == 'published':
            post.published_at = datetime.utcnow()
        
        db.session.add(post)
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'create_post', 'post', post.id)
        
        return jsonify({
            'message': 'Post created successfully',
            'post': post.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create post error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@content_bp.route('/api/posts/<post_id>', methods=['PUT'])
@jwt_required()
@require_permission('content.edit')
def update_post(post_id):
    """Update a post"""
    try:
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'title' in data:
            post.title = data['title']
            # Update slug if title changed
            if 'slug' not in data:
                new_slug = generate_slug(data['title'])
                existing_post = Post.query.filter_by(slug=new_slug).filter(Post.id != post.id).first()
                if not existing_post:
                    post.slug = new_slug
        
        if 'slug' in data:
            # Check if slug already exists
            existing_post = Post.query.filter_by(slug=data['slug']).filter(Post.id != post.id).first()
            if existing_post:
                return jsonify({'error': 'Slug already exists'}), 400
            post.slug = data['slug']
        
        if 'content' in data:
            post.content = data['content']
        if 'excerpt' in data:
            post.excerpt = data['excerpt']
        if 'featured_image' in data:
            post.featured_image = data['featured_image']
        if 'meta_title' in data:
            post.meta_title = data['meta_title']
        if 'meta_description' in data:
            post.meta_description = data['meta_description']
        if 'is_featured' in data:
            post.is_featured = data['is_featured']
        if 'category_id' in data:
            post.category_id = data['category_id']
        
        # Handle status change
        if 'status' in data:
            old_status = post.status
            post.status = data['status']
            
            # Set published date when publishing
            if post.status == 'published' and old_status != 'published':
                post.published_at = datetime.utcnow()
            elif post.status != 'published':
                post.published_at = None
        
        post.updated_at = datetime.utcnow()
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'update_post', 'post', post.id)
        
        return jsonify({
            'message': 'Post updated successfully',
            'post': post.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update post error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@content_bp.route('/api/posts/<post_id>', methods=['DELETE'])
@jwt_required()
@require_permission('content.delete')
def delete_post(post_id):
    """Delete a post"""
    try:
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        db.session.delete(post)
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'delete_post', 'post', post_id)
        
        return jsonify({'message': 'Post deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Delete post error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Travel Package management routes
@content_bp.route('/api/travel-packages', methods=['GET'])
def get_travel_packages():
    """Get all travel packages with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        destination = request.args.get('destination', '')
        featured = request.args.get('featured', '')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        
        query = TravelPackage.query.filter(TravelPackage.is_active == True)
        
        # Apply filters
        if destination:
            query = query.filter(TravelPackage.destination.ilike(f'%{destination}%'))
        
        if featured:
            query = query.filter(TravelPackage.is_featured == (featured.lower() == 'true'))
        
        if min_price is not None:
            query = query.filter(TravelPackage.price >= min_price)
        
        if max_price is not None:
            query = query.filter(TravelPackage.price <= max_price)
        
        # Order by featured first, then by creation date
        query = query.order_by(TravelPackage.is_featured.desc(), TravelPackage.created_at.desc())
        
        # Paginate
        packages = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Format data in Strapi-like structure
        packages_data = []
        for package in packages.items:
            packages_data.append({
                "id": package.id,
                "attributes": package.to_dict()
            })

        response_data = {
            "data": packages_data,
            "meta": {
                "pagination": {
                    "page": page,
                    "pageSize": per_page,
                    "pageCount": packages.pages,
                    "total": packages.total
                }
            }
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        current_app.logger.error(f"Get travel packages error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@content_bp.route('/api/travel-packages/<package_id>', methods=['GET'])
def get_travel_package(package_id):
    """Get a specific travel package by ID or slug"""
    try:
        # Try to find by ID first, then by slug
        package = TravelPackage.query.get(package_id)
        if not package:
            package = TravelPackage.query.filter_by(slug=package_id).first()
        
        if not package or not package.is_active:
            return jsonify({'error': 'Travel package not found'}), 404
        
        return jsonify({'package': package.to_dict()}), 200
        
    except Exception as e:
        current_app.logger.error(f"Get travel package error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@content_bp.route('/api/travel-packages', methods=['POST'])
@jwt_required()
@require_permission('content.create')
def create_travel_package():
    """Create a new travel package"""
    try:
        data = request.get_json()
        
        required_fields = ['title', 'description', 'destination', 'duration_days', 'duration_nights', 'price']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Generate slug
        slug = data.get('slug') or generate_slug(data['title'])
        
        # Check if slug already exists
        existing_package = TravelPackage.query.filter_by(slug=slug).first()
        if existing_package:
            slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
        
        # Parse dates if provided
        available_from = None
        available_to = None
        if data.get('available_from'):
            available_from = datetime.strptime(data['available_from'], '%Y-%m-%d').date()
        if data.get('available_to'):
            available_to = datetime.strptime(data['available_to'], '%Y-%m-%d').date()
        
        package = TravelPackage(
            title=data['title'],
            slug=slug,
            description=data['description'],
            short_description=data.get('short_description'),
            destination=data['destination'],
            duration_days=data['duration_days'],
            duration_nights=data['duration_nights'],
            price=data['price'],
            original_price=data.get('original_price'),
            currency=data.get('currency', 'USD'),
            max_participants=data.get('max_participants'),
            min_participants=data.get('min_participants'),
            difficulty_level=data.get('difficulty_level'),
            featured_image=data.get('featured_image'),
            gallery_images=json.dumps(data.get('gallery_images', [])),
            inclusions=json.dumps(data.get('inclusions', [])),
            exclusions=json.dumps(data.get('exclusions', [])),
            itinerary=json.dumps(data.get('itinerary', [])),
            is_featured=data.get('is_featured', False),
            available_from=available_from,
            available_to=available_to
        )
        
        db.session.add(package)
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'create_travel_package', 'travel_package', package.id)
        
        return jsonify({
            'message': 'Travel package created successfully',
            'package': package.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create travel package error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@content_bp.route('/api/travel-packages/<package_id>', methods=['PUT'])
@jwt_required()
@require_permission('content.edit')
def update_travel_package(package_id):
    """Update a travel package"""
    try:
        package = TravelPackage.query.get(package_id)
        if not package:
            return jsonify({'error': 'Travel package not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'title' in data:
            package.title = data['title']
        if 'slug' in data:
            existing_package = TravelPackage.query.filter_by(slug=data['slug']).filter(TravelPackage.id != package.id).first()
            if existing_package:
                return jsonify({'error': 'Slug already exists'}), 400
            package.slug = data['slug']
        if 'description' in data:
            package.description = data['description']
        if 'short_description' in data:
            package.short_description = data['short_description']
        if 'destination' in data:
            package.destination = data['destination']
        if 'duration_days' in data:
            package.duration_days = data['duration_days']
        if 'duration_nights' in data:
            package.duration_nights = data['duration_nights']
        if 'price' in data:
            package.price = data['price']
        if 'original_price' in data:
            package.original_price = data['original_price']
        if 'currency' in data:
            package.currency = data['currency']
        if 'max_participants' in data:
            package.max_participants = data['max_participants']
        if 'min_participants' in data:
            package.min_participants = data['min_participants']
        if 'difficulty_level' in data:
            package.difficulty_level = data['difficulty_level']
        if 'featured_image' in data:
            package.featured_image = data['featured_image']
        if 'gallery_images' in data:
            package.gallery_images = json.dumps(data['gallery_images'])
        if 'inclusions' in data:
            package.inclusions = json.dumps(data['inclusions'])
        if 'exclusions' in data:
            package.exclusions = json.dumps(data['exclusions'])
        if 'itinerary' in data:
            package.itinerary = json.dumps(data['itinerary'])
        if 'is_featured' in data:
            package.is_featured = data['is_featured']
        if 'is_active' in data:
            package.is_active = data['is_active']
        
        # Handle date fields
        if 'available_from' in data:
            if data['available_from']:
                package.available_from = datetime.strptime(data['available_from'], '%Y-%m-%d').date()
            else:
                package.available_from = None
        
        if 'available_to' in data:
            if data['available_to']:
                package.available_to = datetime.strptime(data['available_to'], '%Y-%m-%d').date()
            else:
                package.available_to = None
        
        package.updated_at = datetime.utcnow()
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'update_travel_package', 'travel_package', package.id)
        
        return jsonify({
            'message': 'Travel package updated successfully',
            'package': package.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update travel package error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Category management routes
@content_bp.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all post categories"""
    try:
        categories = PostCategory.query.order_by(PostCategory.name).all()
        return jsonify({
            'categories': [category.to_dict() for category in categories]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get categories error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@content_bp.route('/api/categories', methods=['POST'])
@jwt_required()
@require_permission('content.create')
def create_category():
    """Create a new post category"""
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'name is required'}), 400
        
        slug = data.get('slug') or generate_slug(data['name'])
        
        # Check if name or slug already exists
        existing_category = PostCategory.query.filter(
            db.or_(PostCategory.name == data['name'], PostCategory.slug == slug)
        ).first()
        if existing_category:
            return jsonify({'error': 'Category name or slug already exists'}), 400
        
        category = PostCategory(
            name=data['name'],
            slug=slug,
            description=data.get('description')
        )
        
        db.session.add(category)
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_user_activity(current_user_id, 'create_category', 'category', category.id)
        
        return jsonify({
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create category error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@content_bp.route('/api/countries', methods=['GET'])
def get_countries():
    """Get a list of mock countries for the frontend"""
    try:
        # This is mock data to satisfy the frontend's Strapi API expectation
        # In a real application, you would fetch this from a database or external API
        countries_data = [
            {
                "id": 1,
                "attributes": {
                    "name": "United States",
                    "code": "US",
                    "createdAt": "2025-01-01T00:00:00.000Z",
                    "updatedAt": "2025-01-01T00:00:00.000Z",
                    "publishedAt": "2025-01-01T00:00:00.000Z",
                    "flag_icon": {
                        "data": {
                            "id": 101,
                            "attributes": {
                                "name": "united-states.png",
                                "url": "/static/flags/united-states.png"
                            }
                        }
                    }
                }
            },
            {
                "id": 2,
                "attributes": {
                    "name": "Canada",
                    "code": "CA",
                    "createdAt": "2025-01-01T00:00:00.000Z",
                    "updatedAt": "2025-01-01T00:00:00.000Z",
                    "publishedAt": "2025-01-01T00:00:00.000Z",
                    "flag_icon": {
                        "data": {
                            "id": 102,
                            "attributes": {
                                "name": "canada.png",
                                "url": "/static/flags/canada.png"
                            }
                        }
                    }
                }
            },
            {
                "id": 3,
                "attributes": {
                    "name": "United Kingdom",
                    "code": "GB",
                    "createdAt": "2025-01-01T00:00:00.000Z",
                    "updatedAt": "2025-01-01T00:00:00.000Z",
                    "publishedAt": "2025-01-01T00:00:00.000Z",
                    "flag_icon": {
                        "data": {
                            "id": 103,
                            "attributes": {
                                "name": "default.svg",
                                "url": "/static/flags/default.svg"
                            }
                        }
                    }
                }
            }
        ]

        # Mimic Strapi's response structure for collections
        response_data = {
            "data": countries_data,
            "meta": {
                "pagination": {
                    "page": 1,
                    "pageSize": 100,
                    "pageCount": 1,
                    "total": len(countries_data)
                }
            }
        }
        
        response = jsonify(response_data)
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response, 200
        
    except Exception as e:
        current_app.logger.error(f"Get countries error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
