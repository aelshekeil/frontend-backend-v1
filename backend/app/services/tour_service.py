from app.models.tour import Tour
from app.extensions import db
from app.utils.exceptions import ValidationError, NotFoundError

class TourService:
    @staticmethod
    def get_tours(filters=None):
        """Get tours with optional filtering"""
        query = Tour.query
        if filters:
            if filters.get('destination'):
                query = query.filter(Tour.destination.ilike(f"%{filters['destination']}%"))
            if filters.get('price_min'):
                query = query.filter(Tour.price >= filters['price_min'])
            if filters.get('price_max'):
                query = query.filter(Tour.price <= filters['price_max'])
            if filters.get('duration'):
                query = query.filter(Tour.duration == filters['duration'])
        
        tours = query.all()
        return [tour.to_dict() for tour in tours]

    @staticmethod
    def create_tour(data, user_id):
        """Create a new tour"""
        try:
            tour = Tour(
                title=data['title'],
                description=data['description'],
                destination=data['destination'],
                price=data['price'],
                duration=data['duration'],
                max_participants=data['max_participants'],
                created_by=user_id
            )
            db.session.add(tour)
            db.session.commit()
            return tour.to_dict()
        except Exception as e:
            db.session.rollback()
            raise ValidationError(f"Failed to create tour: {str(e)}")

    @staticmethod
    def get_tour_by_id(tour_id):
        """Get a specific tour by ID"""
        tour = Tour.query.get(tour_id)
        if not tour:
            raise NotFoundError("Tour not found")
        return tour.to_dict()
