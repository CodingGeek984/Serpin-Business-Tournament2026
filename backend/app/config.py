import os
from datetime import timedelta


class Config:
    FLASK_ENV = os.environ.get("FLASK_ENV", "development")
    _default_secret = "local-development-secret-key-change-before-production"
    SECRET_KEY = os.environ.get("SECRET_KEY", _default_secret)
    
    if FLASK_ENV == "production" and SECRET_KEY == _default_secret:
        raise ValueError("SECRET_KEY environment variable is missing for production!")

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get("JWT_ACCESS_TOKEN_HOURS", "8")))
    JSON_AS_ASCII = False
    
    # CORS Origins (e.g., 'http://localhost:5173,https://my-prod-domain.com')
    # Defaulting to common local dev ports for React/Vite if not provided
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
