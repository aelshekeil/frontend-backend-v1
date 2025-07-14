# Tarim Tours Backend - Improved API System

A comprehensive Flask-based backend API system for Tarim Tours, designed to handle client management, content publishing, product management, and multi-admin functionality.

## 🚀 Features

### Core Functionality
- **Multi-Admin Authentication**: Role-based access control with JWT tokens
- **Client Management**: Complete client lifecycle management with application tracking
- **Content Management**: Posts, travel packages, and destination management
- **Product Management**: eSIM products, services, and order processing
- **Application Processing**: Visa, driving license, and business incorporation applications
- **Audit Logging**: Complete activity tracking for compliance and monitoring

### Security Features
- JWT-based authentication with refresh tokens
- Role-based permissions system (Super Admin, Admin, Editor, Viewer)
- Password hashing with bcrypt
- CORS support for frontend integration
- Input validation and sanitization
- Audit logging for all admin actions

### API Features
- RESTful API design
- Comprehensive error handling
- Pagination support
- Search and filtering capabilities
- File upload support
- Health check endpoints

## 📋 Requirements

- Python 3.11+
- Flask 3.1+
- SQLAlchemy (SQLite for development, PostgreSQL recommended for production)
- JWT Extended for authentication
- CORS support for frontend integration

## 🛠 Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd tarim-backend-improved
```

### 2. Set Up Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=sqlite:///app.db
FLASK_ENV=development
```

### 5. Initialize Database
```bash
python src/main.py
```
The application will automatically create the database and initialize default roles and admin user.

## 🏃‍♂️ Running the Application

### Development Mode
```bash
source venv/bin/activate
python src/main.py
```

### Using Flask CLI
```bash
export FLASK_APP=src/main.py
export FLASK_ENV=development
flask run --host=0.0.0.0 --port=5000
```

The API will be available at `http://localhost:5000`

## 🔐 Default Admin Credentials

**Email**: `admin@tarimtours.com`  
**Password**: `admin123`

⚠️ **Important**: Change these credentials immediately in production!

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and blacklist token
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/client/register` - Client registration
- `POST /api/auth/client/login` - Client login

### Client Management Endpoints
- `GET /api/clients` - List all clients (paginated)
- `GET /api/clients/{id}` - Get specific client
- `POST /api/clients` - Create new client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client
- `POST /api/clients/{id}/applications` - Create application for client
- `PUT /api/clients/applications/{id}/status` - Update application status
- `GET /api/clients/applications/track/{tracking_id}` - Track application (public)

### Content Management Endpoints
- `GET /api/content/posts` - List posts
- `GET /api/content/posts/{id}` - Get specific post
- `POST /api/content/posts` - Create new post
- `PUT /api/content/posts/{id}` - Update post
- `DELETE /api/content/posts/{id}` - Delete post
- `GET /api/content/travel-packages` - List travel packages
- `GET /api/content/travel-packages/{id}` - Get specific package
- `POST /api/content/travel-packages` - Create new package
- `PUT /api/content/travel-packages/{id}` - Update package
- `GET /api/content/categories` - List categories
- `POST /api/content/categories` - Create category

### Product Management Endpoints
- `GET /api/products` - List products
- `GET /api/products/{id}` - Get specific product
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/products/categories` - List product categories
- `POST /api/products/categories` - Create product category
- `GET /api/products/orders` - List orders
- `POST /api/products/orders` - Create new order
- `PUT /api/products/orders/{id}/status` - Update order status

### Admin Management Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/roles` - List roles
- `GET /api/admin/permissions` - List permissions
- `GET /api/admin/audit-logs` - List audit logs
- `GET /api/admin/settings` - System settings

### System Endpoints
- `GET /api` - API information
- `GET /api/health` - Health check
- `GET /api/admin/system/health` - Detailed system health

## 🔑 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-access-token>
```

### Example Login Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tarimtours.com",
    "password": "admin123"
  }'
```

## 👥 User Roles and Permissions

### Role Hierarchy
1. **Super Admin**: Full system access including user management
2. **Admin**: Most operations except user management
3. **Editor**: Content and application management
4. **Viewer**: Read-only access

### Permission Modules
- **Users**: User management permissions
- **Clients**: Client management permissions
- **Applications**: Application processing permissions
- **Content**: Content management permissions
- **Products**: Product management permissions
- **System**: System administration permissions

## 🗄 Database Schema

### Core Tables
- `users` - System users with authentication
- `roles` - User roles definition
- `permissions` - Granular permissions
- `clients` - Customer information
- `applications` - All application types
- `posts` - Blog posts and content
- `travel_packages` - Tour packages
- `products` - Product catalog
- `orders` - Order management
- `audit_logs` - Activity tracking

## 🔧 Configuration

### Environment Variables
- `SECRET_KEY` - Flask secret key
- `JWT_SECRET_KEY` - JWT signing key
- `DATABASE_URL` - Database connection string
- `FLASK_ENV` - Environment (development/production)

### Database Configuration
The application uses SQLite for development and can be easily configured for PostgreSQL in production by updating the `DATABASE_URL`.

## 🚀 Deployment

### Production Deployment Steps

1. **Update Environment Variables**
```env
SECRET_KEY=your-production-secret-key
JWT_SECRET_KEY=your-production-jwt-key
DATABASE_URL=postgresql://user:password@host:port/database
FLASK_ENV=production
```

2. **Install Production Dependencies**
```bash
pip install gunicorn psycopg2-binary
```

3. **Update Requirements**
```bash
pip freeze > requirements.txt
```

4. **Run with Gunicorn**
```bash
gunicorn -w 4 -b 0.0.0.0:5000 src.main:app
```

### Docker Deployment
Create a `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "src.main:app"]
```

### Using Manus Deployment Tools
```bash
# Deploy backend using Manus service deployment
# (This will be available once the backend is ready)
```

## 🔍 Testing

### Manual API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@tarimtours.com", "password": "admin123"}'

# Get dashboard (with token)
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/admin/dashboard
```

### Frontend Integration
The backend is designed to work seamlessly with your existing React frontend. Update your frontend's API base URL to point to this backend:

```javascript
// In your frontend API configuration
const API_BASE_URL = 'http://localhost:5000/api';
// or for production
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

## 📊 Monitoring and Logging

### Audit Logging
All admin actions are automatically logged with:
- User ID and action performed
- Resource type and ID affected
- Timestamp and IP address
- User agent information

### Health Monitoring
- `/api/health` - Basic health check
- `/api/admin/system/health` - Detailed system status
- Database connection monitoring
- Application uptime tracking

## 🔒 Security Best Practices

1. **Change Default Credentials**: Update admin password immediately
2. **Use Strong Secrets**: Generate secure SECRET_KEY and JWT_SECRET_KEY
3. **Enable HTTPS**: Use SSL/TLS in production
4. **Database Security**: Use strong database credentials
5. **Regular Updates**: Keep dependencies updated
6. **Backup Strategy**: Implement regular database backups
7. **Rate Limiting**: Consider implementing rate limiting for production

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL configuration
   - Ensure database server is running
   - Verify credentials and permissions

2. **JWT Token Issues**
   - Check JWT_SECRET_KEY configuration
   - Verify token expiration settings
   - Clear browser storage if needed

3. **CORS Issues**
   - Verify CORS configuration in main.py
   - Check frontend origin settings
   - Ensure proper headers are sent

4. **Permission Denied**
   - Check user roles and permissions
   - Verify JWT token is valid
   - Ensure user has required permissions

### Debug Mode
Enable debug mode for development:
```bash
export FLASK_ENV=development
export FLASK_DEBUG=1
```

## 📞 Support

For technical support or questions about this backend implementation, please refer to:
- API documentation at `/api`
- Health check at `/api/health`
- System status at `/api/admin/system/health`

## 🔄 Migration from Strapi

This backend is designed to replace your current Strapi backend while maintaining compatibility with your existing React frontend. The API endpoints are structured to match your frontend's expectations.

### Key Differences from Strapi
- Custom authentication system instead of Strapi's built-in auth
- More flexible role and permission system
- Better performance for your specific use cases
- Easier customization and extension
- Direct control over all functionality

## 📈 Future Enhancements

Potential improvements for future versions:
- Real-time notifications with WebSockets
- Advanced analytics and reporting
- Integration with external payment systems
- Multi-language support
- Advanced file management
- API rate limiting
- Caching layer implementation
- Automated testing suite

---

**Version**: 1.0.0  
**Last Updated**: July 2025  
**Compatibility**: Python 3.11+, Flask 3.1+

