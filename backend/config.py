"""
Configuration module for ORBITNET-MESH Backend
"""

import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings"""
    
    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8001"))
    API_TITLE: str = os.getenv("API_TITLE", "ORBITNET-MESH API | Beyond Gravity")
    API_VERSION: str = os.getenv("API_VERSION", "1.0.0")
    
    # ============ GLOBAL OPERATION MODE ============
    # SYSTEM_MODE controls the fundamental behavior of ORBITNET-MESH
    # "GROUND_ONLY" - If ground is not visible → telemetry is LOST
    # "ORBITNET"    - If ground is not visible → telemetry is STORED (zero data loss)
    SYSTEM_MODE: str = os.getenv("DEFAULT_SYSTEM_MODE", "ORBITNET")  # or "GROUND_ONLY"
    
    # CORS Settings
    CORS_ORIGINS: list = [
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://localhost:8080", 
        "http://localhost:5174"
    ]
    
    # Database
    DATABASE_PATH: str = os.getenv("DATABASE_URL", "./mission_data.db").replace("sqlite:///", "")
    
    # Simulation Parameters
    TELEMETRY_GENERATION_INTERVAL: float = float(os.getenv("TELEMETRY_GENERATION_INTERVAL", "1.0"))
    PACKET_SIZE_BYTES: int = 1024
    BUFFER_MAX_SIZE: int = 1000
    
    # Real-world data integration flags
    USE_REAL_ORBITS: bool = os.getenv("USE_REAL_ORBITS", "true").lower() == "true"
    USE_WEATHER_DATA: bool = os.getenv("USE_WEATHER_DATA", "true").lower() == "true"
    USE_PHYSICS_MODEL: bool = os.getenv("USE_PHYSICS_MODEL", "true").lower() == "true"
    DEFAULT_SATELLITE_ID: str = os.getenv("DEFAULT_SATELLITE_ID", "ISS")
    
    # API Keys
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    OPENWEATHER_API_KEY: Optional[str] = os.getenv("OPENWEATHER_API_KEY")
    
    # Satellite Link Emulator Configuration
    EMULATOR_ENABLED: bool = os.getenv("EMULATOR_ENABLED", "true").lower() == "true"
    EMULATOR_LATENCY_MS: int = int(os.getenv("EMULATOR_LATENCY_MS", "300"))
    EMULATOR_PACKET_LOSS_RATE: float = float(os.getenv("EMULATOR_PACKET_LOSS_RATE", "0.05"))
    EMULATOR_BANDWIDTH_KBPS: int = int(os.getenv("EMULATOR_BANDWIDTH_KBPS", "512"))
    EMULATOR_JITTER_MS: int = int(os.getenv("EMULATOR_JITTER_MS", "50"))
    
    # Demo Satellite Override (Hackathon-Safe)
    FORCE_SATELLITE_DEMO: bool = os.getenv("FORCE_SATELLITE_DEMO", "true").lower() == "true"
    
    # Ground Stations (ESA Network)
    GROUND_STATIONS: list = [
        {"id": "gs-1", "name": "ESTRACK Kourou", "lat": 5.2, "lng": -52.8, "coverage": 15},
        {"id": "gs-2", "name": "ESTRACK Kiruna", "lat": 67.9, "lng": 20.9, "coverage": 12},
        {"id": "gs-3", "name": "ESTRACK New Norcia", "lat": -31.0, "lng": 116.2, "coverage": 18},
        {"id": "gs-4", "name": "ESTRACK Cebreros", "lat": 40.5, "lng": -4.4, "coverage": 15},
        {"id": "gs-5", "name": "ESTRACK Malargüe", "lat": -35.8, "lng": -69.4, "coverage": 18},
    ]
    
    # Relay Satellites
    RELAY_SATELLITES: list = [
        {"id": "sat-1", "name": "EDRS-A", "constellation": "EDRS", "orbitType": "GEO", "minLat": -75, "maxLat": 75},
        {"id": "sat-2", "name": "EDRS-C", "constellation": "EDRS", "orbitType": "GEO", "minLat": -75, "maxLat": 75},
        {"id": "sat-3", "name": "Artemis", "constellation": "ESA", "orbitType": "GEO", "minLat": -70, "maxLat": 70},
        {"id": "sat-4", "name": "TDRS-M", "constellation": "NASA", "orbitType": "GEO", "minLat": -80, "maxLat": 80},
    ]


settings = Settings()


# ============ GLOBAL MODE MANAGEMENT ============

def set_system_mode(mode: str) -> bool:
    """
    Set the global system mode
    Args:
        mode: "GROUND_ONLY" or "ORBITNET"
    Returns:
        bool: True if mode was set successfully
    """
    if mode not in ["GROUND_ONLY", "ORBITNET"]:
        return False
    
    settings.SYSTEM_MODE = mode
    return True


def get_system_mode() -> str:
    """Get current system mode"""
    return settings.SYSTEM_MODE


def is_orbitnet_mode() -> bool:
    """Check if system is in ORBITNET mode (zero data loss)"""
    return settings.SYSTEM_MODE == "ORBITNET"


def is_ground_only_mode() -> bool:
    """Check if system is in GROUND_ONLY mode (data loss possible)"""
    return settings.SYSTEM_MODE == "GROUND_ONLY"
