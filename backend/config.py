import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env file if present (for local development)
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'change-me-in-production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'change-jwt-secret-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

    # MongoDB Configuration
    MONGO_URI = os.environ.get('MONGO_URI', '')
    MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'skill2career')

    # Data paths
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = BASE_DIR
