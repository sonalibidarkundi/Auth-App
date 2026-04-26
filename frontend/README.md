# Frontend - Auth App

This is the HTML/CSS/JavaScript frontend for the Flask Authentication Backend.

## Pages

- **Login** (`/`) - User login form
- **Register** (`/register.html`) - User registration form
- **Dashboard** (`/dashboard.html`) - User profile, update profile, change password

## How to Use

### Option 1: Via Flask Server (Recommended)
The Flask backend is configured to serve these static files automatically.

1. Start the Flask server:
```powershell
python run.py
```

2. Open your browser and go to:
```
http://127.0.0.1:5000
```

This will show the login page. All frontend assets (CSS, JS) are served by Flask.

### Option 2: Direct File Access (Requires CORS)
You can also open the HTML files directly in a browser since the backend has CORS enabled.

1. Start the Flask server first
2. Open `frontend/index.html` directly in your browser

## Features

- **Responsive Design** - Works on desktop and mobile
- **Modern UI** - Clean card-based design with gradients
- **Form Validation** - Client-side validation before API calls
- **JWT Token Storage** - Tokens stored in localStorage
- **Auto-Redirect** - Authenticated users are redirected to dashboard
- **Protected Routes** - Unauthenticated users are redirected to login
- **Toast Messages** - Success/error notifications

## File Structure

```
frontend/
├── index.html       # Login page
├── register.html    # Registration page
├── dashboard.html   # User dashboard
├── css/
│   └── style.css    # Stylesheet
└── js/
    ├── api.js       # API client
    └── auth.js      # Authentication logic
```

