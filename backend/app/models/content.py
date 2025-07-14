from src.models.user import db
from datetime import datetime
import uuid

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(250), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text)
    featured_image = db.Column(db.String(500))
    meta_title = db.Column(db.String(200))
    meta_description = db.Column(db.Text)
    status = db.Column(db.String(20), default='draft')  # draft, published, archived
    is_featured = db.Column(db.Boolean, default=False)
    author_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.String(36), db.ForeignKey('post_categories.id'))
    published_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = db.relationship('User', backref='posts')
    category = db.relationship('PostCategory', backref='posts')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'content': self.content,
            'excerpt': self.excerpt,
            'featured_image': self.featured_image,
            'meta_title': self.meta_title,
            'meta_description': self.meta_description,
            'status': self.status,
            'is_featured': self.is_featured,
            'author_id': self.author_id,
            'category_id': self.category_id,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class PostCategory(db.Model):
    __tablename__ = 'post_categories'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }

class TravelPackage(db.Model):
    __tablename__ = 'travel_packages'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(250), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    short_description = db.Column(db.Text)
    destination = db.Column(db.String(100), nullable=False)
    duration_days = db.Column(db.Integer, nullable=False)
    duration_nights = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    original_price = db.Column(db.Numeric(10, 2))  # For showing discounts
    currency = db.Column(db.String(3), default='USD')
    max_participants = db.Column(db.Integer)
    min_participants = db.Column(db.Integer)
    difficulty_level = db.Column(db.String(20))  # easy, moderate, challenging
    rating = db.Column(db.Numeric(3, 2), default=0.0)
    review_count = db.Column(db.Integer, default=0)
    featured_image = db.Column(db.String(500))
    gallery_images = db.Column(db.Text)  # JSON array of image URLs
    inclusions = db.Column(db.Text)  # JSON array
    exclusions = db.Column(db.Text)  # JSON array
    itinerary = db.Column(db.Text)  # JSON array of daily activities
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    available_from = db.Column(db.Date)
    available_to = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'description': self.description,
            'short_description': self.short_description,
            'destination': self.destination,
            'duration_days': self.duration_days,
            'duration_nights': self.duration_nights,
            'price': float(self.price) if self.price else None,
            'original_price': float(self.original_price) if self.original_price else None,
            'currency': self.currency,
            'max_participants': self.max_participants,
            'min_participants': self.min_participants,
            'difficulty_level': self.difficulty_level,
            'rating': float(self.rating) if self.rating else 0.0,
            'review_count': self.review_count,
            'featured_image': self.featured_image,
            'gallery_images': self.gallery_images,
            'inclusions': self.inclusions,
            'exclusions': self.exclusions,
            'itinerary': self.itinerary,
            'is_featured': self.is_featured,
            'is_active': self.is_active,
            'available_from': self.available_from.isoformat() if self.available_from else None,
            'available_to': self.available_to.isoformat() if self.available_to else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Destination(db.Model):
    __tablename__ = 'destinations'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(120), unique=True, nullable=False)
    country = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    featured_image = db.Column(db.String(500))
    latitude = db.Column(db.Numeric(10, 8))
    longitude = db.Column(db.Numeric(11, 8))
    best_time_to_visit = db.Column(db.String(200))
    average_temperature = db.Column(db.String(50))
    currency = db.Column(db.String(3))
    language = db.Column(db.String(100))
    timezone = db.Column(db.String(50))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'country': self.country,
            'description': self.description,
            'featured_image': self.featured_image,
            'latitude': float(self.latitude) if self.latitude else None,
            'longitude': float(self.longitude) if self.longitude else None,
            'best_time_to_visit': self.best_time_to_visit,
            'average_temperature': self.average_temperature,
            'currency': self.currency,
            'language': self.language,
            'timezone': self.timezone,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

