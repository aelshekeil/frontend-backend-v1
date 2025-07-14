from app.models.user import User
from app.extensions import db
from flask_jwt_extended import create_access_token, create_refresh_token
from app.utils.exceptions import ValidationError

class AuthService:
    @staticmethod
    def register_user(data):
        if User.query.filter_by(email=data['email']).first():
            raise ValidationError("Email already registered")
        
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return {'message': 'User registered successfully'}, 201

    @staticmethod
    def login_user(data):
        user = User.query.filter_by(email=data['email']).first()
        
        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)
            return {
                'access_token': access_token,
                'refresh_token': refresh_token
            }, 200
        
        raise ValidationError("Invalid credentials")
