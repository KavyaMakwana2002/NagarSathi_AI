from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from database import init_db
from routes.complaints import complaints_bp
from routes.admin import admin_bp
from routes.analytics import analytics_bp
from routes.citizen import citizen_bp
from routes.whatsapp import whatsapp_bp

class ApiPrefixMiddleware:
    """WSGI middleware ensuring requests to /citizen/*, /admin/*, /complaints/*, etc.
    automatically route to /api/* even if the client omitted /api in the base URL."""
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get("PATH_INFO", "")
        if not path.startswith("/api") and path not in ["/", "/health"]:
            environ["PATH_INFO"] = f"/api{path}"
        return self.wsgi_app(environ, start_response)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Attach prefix middleware for seamless frontend routing
    app.wsgi_app = ApiPrefixMiddleware(app.wsgi_app)

    # Initialize database tables & seed initial accounts on launch
    init_db()

    # Enable CORS for Next.js frontend (Vercel, localhost, and all origins)
    CORS(app, resources={
        r"/*": {
            "origins": "*",
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

    @app.route("/api/uploads/<path:filename>")
    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

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
