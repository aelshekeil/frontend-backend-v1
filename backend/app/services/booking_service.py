from app.models.booking import Booking
from app.models.tour import Tour
from app.extensions import db
from app.utils.exceptions import ValidationError, NotFoundError

class BookingService:
    @staticmethod
    def create_booking(data, user_id):
        tour = Tour.query.get(data['tour_id'])
        if not tour:
            raise NotFoundError("Tour not found")
            
        if tour.available_slots < data['participants']:
            raise ValidationError("Not enough available slots")
            
        try:
            booking = Booking(
                user_id=user_id,
                tour_id=data['tour_id'],
                participants=data['participants'],
                total_price=tour.price * data['participants']
            )
            
            tour.available_slots -= data['participants']
            
            db.session.add(booking)
            db.session.commit()
            
            return {'message': 'Booking created successfully', 'booking': booking.to_dict()}, 201
        except Exception as e:
            db.session.rollback()
            raise ValidationError(f"Failed to create booking: {str(e)}")

    @staticmethod
    def get_user_bookings(user_id):
        bookings = Booking.query.filter_by(user_id=user_id).all()
        return {'bookings': [booking.to_dict() for booking in bookings]}, 200
