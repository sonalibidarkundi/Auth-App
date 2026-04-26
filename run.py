from app import create_app

app = create_app()

if __name__ == '__main__':
    print("Starting Flask Authentication Server...")
    print("API Base URL: http://127.0.0.1:5000")
    print("Health Check: GET http://127.0.0.1:5000/health")
    print("Register: POST http://127.0.0.1:5000/api/auth/register")
    print("Login: POST http://127.0.0.1:5000/api/auth/login")
    print("Profile: GET http://127.0.0.1:5000/api/auth/me")
    app.run(debug=True, host='0.0.0.0', port=5000)

