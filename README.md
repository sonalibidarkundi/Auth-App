# Flask Authentication Backend

A real user authentication system built with Python Flask, SQLAlchemy, and JWT tokens.

## Features

- **User Registration** - Create new accounts with username, email, and password
- **User Login** - Authenticate and receive JWT access tokens
- **Protected Routes** - Access user profile with valid JWT tokens
- **Password Hashing** - Secure bcrypt password storage
- **Input Validation** - Marshmallow schema validation for all inputs
- **Profile Management** - Update profile and change password
- **CORS Enabled** - Ready for frontend integration

## Tech Stack

- **Python 3.x**
- **Flask** - Web framework
- **Flask-SQLAlchemy** - ORM for SQLite database
- **Flask-JWT-Extended** - JWT authentication
- **Flask-Bcrypt** - Password hashing
- **Marshmallow** - Input validation

## Project Structure

```
DekNek/
├── app.py              # Flask app factory & configuration
├── models.py           # User database model
├── auth_routes.py      # Authentication endpoints
├── config.py           # App configuration
├── requirements.txt    # Dependencies
├── run.py              # Entry point
└── README.md           # Documentation
```

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |

## Setup & Installation

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python run.py
```

The server will start at `http://127.0.0.1:5000`

## API Usage Examples

### Register a New User

```bash
curl -X POST http://127.0.0.1:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00",
      "last_login": null
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login

```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Get User Profile

```bash
curl -X GET http://127.0.0.1:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Profile

```bash
curl -X PUT http://127.0.0.1:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "full_name": "John Updated",
    "username": "johndoe2"
  }'
```

### Change Password

```bash
curl -X PUT http://127.0.0.1:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "current_password": "password123",
    "new_password": "newpassword456"
  }'
```

## Environment Variables

Create a `.env` file in the root directory to customize configuration:

```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=sqlite:///auth.db
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with 12 rounds
- **JWT Authentication**: Stateless token-based authentication
- **Input Validation**: All inputs validated using Marshmallow schemas
- **Unique Constraints**: Email and username must be unique
- **Account Status**: Users can be deactivated (is_active flag)
- **Token Expiration**: JWT tokens expire after 24 hours

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {} // Optional validation errors
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials or token)
- `403` - Forbidden (account deactivated)
- `404` - Not Found
- `409` - Conflict (duplicate email/username)
- `500` - Internal Server Error

