"""
Telemetry Generation Module
Generates realistic telemetry data from the spacecraft

UPDATED: Now integrates real-world data sources:
- Real orbital positions from TLE data
- Physics-based calculations
- Historical telemetry replay capability
"""

import time
import math
import random
import logging
from dataclasses import dataclass, asdict
from typing import Dict, Optional

# Import new services
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from services.orbit_service import orbit_service
    from services.replay_service import replay_service, ReplayMode
    from services.payload_service import payload_service
except ImportError:
    # Fallback if services not available
    orbit_service = None
    replay_service = None
    ReplayMode = None
    payload_service = None

logger = logging.getLogger(__name__)


@dataclass
class Orientation:
    """Spacecraft orientation"""
    pitch: float
    yaw: float
    roll: float


@dataclass
class Position:
    """Orbital position"""
    lat: float
    lng: float
    altitude: float


@dataclass
class TelemetryData:
    """Complete telemetry packet"""
    timestamp: float
    packet_id: str
    altitude: float
    velocity: float
    temperature: float
    fuel_level: float
    battery_level: float
    orientation: Orientation
    position: Position
    signal_strength: float
    data_source: str  # 'simulation', 'tle', 'replay'
    mission_payload: str = "Idle"
    actual_payload: Optional[Dict] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        data = asdict(self)
        data['orientation'] = asdict(self.orientation)
        data['position'] = asdict(self.position)
        return data


class TelemetryGenerator:
    """
    Enhanced telemetry generator with real-world data integration
    
    Features:
    1. Real orbital positions from TLE data
    2. Historical telemetry replay
    3. Fallback to simulation mode
    """
    
    def __init__(self):
        self.start_time = time.time()
        self.packet_count = 0
        self.use_real_orbits = True
        self.satellite_id = "ISS"  # Default to ISS
        
    async def generate(self, mission_time: float) -> TelemetryData:
        """
        Generate telemetry packet with real-world data integration
        
        Priority order:
        1. Historical replay data (if active)
        2. Real orbital data from TLE
        3. Fallback simulation
        
        Args:
            mission_time: Mission elapsed time in seconds
            
        Returns:
            TelemetryData object with real or simulated data
        """
        self.packet_count += 1
        current_timestamp = time.time()
        
        # Check for replay mode first
        if replay_service and replay_service.current_session:
            replay_status = replay_service.get_replay_status()
            if replay_status["active"]:
                replay_data = replay_service.get_current_telemetry()
                if replay_data:
                    return self._create_telemetry_from_replay(replay_data, mission_time)
        
        # Try real orbital data
        if self.use_real_orbits and orbit_service:
            try:
                orbital_pos = await orbit_service.get_orbital_position(
                    self.satellite_id, 
                    current_timestamp
                )
                
                return self._create_telemetry_from_orbit(orbital_pos, mission_time)
                
            except Exception as e:
                logger.warning(f"Real orbit data failed, using simulation: {e}")
        
        # Fallback to simulation
        return self._generate_simulated_telemetry(mission_time)
    
    def _create_telemetry_from_replay(self, replay_data: Dict, mission_time: float) -> TelemetryData:
        """Create telemetry from historical replay data"""
        
        orientation = Orientation(
            pitch=replay_data.get("orientation", {}).get("pitch", 0.0),
            yaw=replay_data.get("orientation", {}).get("yaw", 0.0),
            roll=replay_data.get("orientation", {}).get("roll", 0.0)
        )
        
        position = Position(
            lat=replay_data.get("latitude", 0.0),
            lng=replay_data.get("longitude", 0.0),
            altitude=replay_data.get("altitude", 400.0)
        )
        
        return TelemetryData(
            timestamp=time.time(),
            packet_id=f"replay_{self.packet_count:06d}",
            altitude=replay_data.get("altitude", 400.0),
            velocity=replay_data.get("velocity", 7.66),
            temperature=replay_data.get("temperature", -20.0),
            # Use stable values from replay with minimal noise
            fuel_level=max(0, replay_data.get("fuel_level", 85.0) + random.uniform(-0.1, 0.1)),
            battery_level=max(70, min(98, replay_data.get("battery_level", 90.0) + random.uniform(-0.2, 0.2))),
            orientation=orientation,
            position=position,
            signal_strength=replay_data.get("signal_strength", 75.0),
            data_source="replay",
            mission_payload=self._get_random_payload(mission_time),
            actual_payload=payload_service.get_random_payload() if payload_service else None
        )
    
    def _create_telemetry_from_orbit(self, orbital_pos, mission_time: float) -> TelemetryData:
        """Create telemetry from real orbital position data"""
        
        # Real position from TLE
        position = Position(
            lat=orbital_pos.latitude,
            lng=orbital_pos.longitude,
            altitude=orbital_pos.altitude
        )
        
        # Simulate other parameters based on real position
        # Temperature varies with orbital position (sun/shadow)
        sun_angle = math.sin(mission_time * 0.01) * math.cos(math.radians(orbital_pos.latitude))
        temperature = -40 + 60 * max(0, sun_angle)  # -40°C to +20°C
        
        # Battery level varies with solar panel exposure (more realistic)
        # Base level depends on solar exposure, with gradual changes
        solar_charging = max(0, sun_angle) * 0.3  # Even slower charging rate
        battery_base = 78 + solar_charging * 12  # 78-90% range
        # Add minimal measurement noise only
        battery_level = battery_base + random.uniform(-0.1, 0.1)
        battery_level = max(70, min(95, battery_level))  # Realistic bounds
        
        # Fuel decreases monotonically over time (no random increases)
        # Consumption rate: ~0.1% per day with small measurement variations
        fuel_consumed = (mission_time / 86400) * 0.1
        fuel_level = max(0, 95 - fuel_consumed + random.uniform(-0.1, 0.1))
        fuel_level = max(0, min(100, fuel_level))
        
        # Orientation based on orbital mechanics
        orbital_rate = 2 * math.pi / (90 * 60)  # ISS orbital period
        orientation = Orientation(
            pitch=10 * math.sin(orbital_rate * mission_time),
            yaw=5 * math.cos(orbital_rate * mission_time * 1.1),
            roll=2 * math.sin(orbital_rate * mission_time * 0.9)
        )
        
        # Signal strength based on altitude and position
        base_signal = 80 - (orbital_pos.altitude - 400) * 0.1  # Decrease with altitude
        signal_strength = base_signal + random.uniform(-10, 10)
        signal_strength = max(0, min(100, signal_strength))
        
        return TelemetryData(
            timestamp=orbital_pos.timestamp,
            packet_id=f"tle_{self.packet_count:06d}",
            altitude=orbital_pos.altitude,
            velocity=orbital_pos.velocity,
            temperature=temperature,
            fuel_level=fuel_level,
            battery_level=battery_level,
            orientation=orientation,
            position=position,
            signal_strength=signal_strength,
            data_source="tle",
            mission_payload=self._get_random_payload(mission_time),
            actual_payload=payload_service.get_random_payload() if payload_service else None
        )
    
    def _generate_simulated_telemetry(self, mission_time: float) -> TelemetryData:
        """Generate simulated telemetry (original logic)"""
        
        # Simulate orbital mechanics
        altitude = 400 + math.sin(mission_time * 0.01) * 50 + random.uniform(0, 5)
        velocity = 7.66 + math.sin(mission_time * 0.02) * 0.1 + random.uniform(0, 0.05)
        
        # Orbital position (simplified circular orbit with ISS-like inclination)
        orbital_period = 90 * 60  # 90 minutes in seconds
        angle = (mission_time / orbital_period) * 2 * math.pi
        lat = math.sin(angle) * 51.6  # ISS inclination
        lng = ((mission_time / orbital_period) * 360 - 180) % 360
        if lng > 180:
            lng -= 360

        position = Position(lat=lat, lng=lng, altitude=altitude)
        
        # Environmental conditions
        temperature = -20 + math.sin(mission_time * 0.005) * 30 + random.uniform(-5, 5)
        
        # System status - more realistic and stable
        # Fuel decreases monotonically (no random increases)
        fuel_consumed = (mission_time / 86400) * 0.05  # 0.05% per day
        fuel_level = max(0, 95 - fuel_consumed + random.uniform(-0.05, 0.05))
        
        # Battery level with realistic solar charging cycles
        # Orbital period affects charging (in sunlight vs shadow)
        orbital_angle = (mission_time / orbital_period) * 2 * math.pi
        solar_exposure = max(0, math.sin(orbital_angle))  # 0 in shadow, 1 in full sun
        
        # Battery management system maintains stable levels with slow changes
        battery_base = 82 + solar_exposure * 8  # 82-90% range (more conservative)
        battery_level = battery_base + random.uniform(-0.1, 0.1)  # Minimal measurement noise
        battery_level = max(75, min(95, battery_level))
        
        # Spacecraft orientation
        orientation = Orientation(
            pitch=math.sin(mission_time * 0.02) * 15 + random.uniform(-2, 2),
            yaw=math.cos(mission_time * 0.015) * 10 + random.uniform(-1.5, 1.5),
            roll=math.sin(mission_time * 0.025) * 5 + random.uniform(-1, 1)
        )
        
        # Signal strength varies with position and atmospheric conditions
        signal_strength = 75 + math.sin(angle * 2) * 15 + random.uniform(-5, 5)
        signal_strength = max(0, min(100, signal_strength))
        
        return TelemetryData(
            timestamp=time.time(),
            packet_id=f"sim_{self.packet_count:06d}",
            altitude=altitude,
            velocity=velocity,
            temperature=temperature,
            fuel_level=fuel_level,
            battery_level=battery_level,
            orientation=orientation,
            position=position,
            signal_strength=signal_strength,
            data_source="simulation",
            mission_payload=self._get_random_payload(mission_time),
            actual_payload=payload_service.get_random_payload() if payload_service else None
        )
    
    def _get_random_payload(self, mission_time: float) -> str:
        """Generate a realistic mission payload description"""
        payloads = [
            "Scanning Earth surface for thermal anomalies",
            "Analyzing atmospheric CO2 concentration",
            "Capturing high-resolution multispectral imagery",
            "Measuring solar radiation flux",
            "Calibrating onboard star tracker",
            "Synchronizing atomic clock with ground segment",
            "Monitoring structural resonance during orbital correction",
            "Executing autonomous collision avoidance check",
            "Mapping ocean surface topography",
            "Detecting ionospheric disturbances",
            "Transmitting scientific experiment data (Module A-12)",
            "Running diagnostic on propulsion subsystem",
            "Updating onboard orbital ephemeris",
            "Compressing telemetry archive for downlink"
        ]
        # Change payload every 10 seconds
        index = int(mission_time / 10) % len(payloads)
        return payloads[index]
    
    def set_satellite_id(self, satellite_id: str):
        """Set the satellite ID for TLE data lookup"""
        self.satellite_id = satellite_id
        logger.info(f"Telemetry generator set to satellite: {satellite_id}")
    
    def enable_real_orbits(self, enabled: bool):
        """Enable/disable real orbital data"""
        self.use_real_orbits = enabled
        logger.info(f"Real orbital data: {'enabled' if enabled else 'disabled'}")
    
    def get_data_source_status(self) -> Dict:
        """Get status of data sources"""
        return {
            "real_orbits_enabled": self.use_real_orbits,
            "satellite_id": self.satellite_id,
            "orbit_service_available": orbit_service is not None,
            "replay_service_available": replay_service is not None,
            "replay_active": (replay_service.get_replay_status()["active"] 
                            if replay_service else False),
            "packet_count": self.packet_count
        }
    
    def reset(self):
        """Reset the generator"""
        self.start_time = time.time()
        self.packet_count = 0
