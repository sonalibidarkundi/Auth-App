from flask import Flask
from flask_cors import CORS
from config import Config
from models import db, bcrypt

def create_app():
    app = Flask(__name__, static_folder='frontend', static_url_path='')
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    CORS(app)
    
    # Import and register blueprints
    from auth_routes import auth_bp, init_jwt
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    init_jwt(app)
    
    # Serve frontend at root
    @app.route('/')
    def index():
        return app.send_static_file('index.html')
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'success': True, 'message': 'Server is running'}
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app

