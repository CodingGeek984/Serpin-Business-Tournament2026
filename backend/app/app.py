from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.exceptions import HTTPException

from config import Config
from routes import register_routes


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    jwt = JWTManager(app)
    app.config["JWT_BLOCKLIST"] = set()

    @jwt.token_in_blocklist_loader
    def is_revoked(_jwt_header, jwt_payload):
        return jwt_payload["jti"] in app.config["JWT_BLOCKLIST"]

    @jwt.revoked_token_loader
    def revoked_token(_jwt_header, _jwt_payload):
        return jsonify({"success": False, "message": "Token has been revoked"}), 401

    @jwt.unauthorized_loader
    def missing_token(message):
        return jsonify({"success": False, "message": message}), 401

    @jwt.invalid_token_loader
    def invalid_token(message):
        return jsonify({"success": False, "message": message}), 401

    @jwt.expired_token_loader
    def expired_token(_jwt_header, _jwt_payload):
        return jsonify({"success": False, "message": "Token has expired"}), 401

    register_routes(app)

    @app.get("/api/health")
    def health():
        return jsonify({"success": True, "status": "ok"})

    @app.errorhandler(HTTPException)
    def http_error(exc):
        return jsonify({"success": False, "message": exc.description}), exc.code

    @app.errorhandler(Exception)
    def unexpected_error(exc):
        app.logger.exception("Unhandled API error")
        return jsonify({"success": False, "message": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
