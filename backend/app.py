from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import init_db
from routes.complaints import complaints_bp
from routes.admin import admin_bp
from routes.analytics import analytics_bp
from routes.citizen import citizen_bp
from routes.whatsapp import whatsapp_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize database tables & seed initial accounts on launch
    init_db()

    # Enable CORS for Next.js frontend (Vercel and localhost)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "*.vercel.app", "*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Register Blueprints
    app.register_blueprint(complaints_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(citizen_bp)
    app.register_blueprint(whatsapp_bp)

    @app.route("/")
    def index():
        return jsonify({
            "service": "NagarSathi AI Municipal Problem Solver Backend",
            "version": "2.0.0",
            "status": "online",
            "tagline": "Your Voice, A Smarter City.",
            "endpoints": [
                "/api/complaints",
                "/api/track/<query>",
                "/api/admin/login",
                "/api/admin/stats"
            ]
        })

    @app.route("/health")
    def health_check():
        return jsonify({"status": "healthy", "database": "connected"}), 200

    return app

# Application entry point
app = create_app()

if __name__ == "__main__":
    init_db()
    print(f"🚀 NagarSathi AI Backend running on port {Config.PORT}")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
