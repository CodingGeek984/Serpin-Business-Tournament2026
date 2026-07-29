import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "local-development-secret-key-change-before-production")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", SECRET_KEY)
    JSON_AS_ASCII = False
