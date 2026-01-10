"""
Link Selection Module
Selects the best available communication link

UPDATED: Now integrates real-world data:
- Weather impact on link quality
- Physics-based link budget calculations
- Frequency band optimization
"""

import math
import asyncio
import logging
from typing import Optional, Dict, List
from dataclasses import dataclass

try:
    from config import settings
except ImportError:
    from ..config import settings

# Import new services
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from services.weather_service import weather_service, LinkQuality
    from services.link_budget_service import link_budget_service, FrequencyBand
except ImportError:
    # Fallback if services not available
    weather_service = None
    link_budget_service = None
    LinkQuality = None
    FrequencyBand = None

logger = logging.getLogger(__name__)


@dataclass
class LinkStatus:
    """Enhanced communication link status"""
    link_type: str  # 'ground', 'satellite', or 'none'
    name: str
    signal_strength: float
    latency: float
    available: bool
    station_id: Optional[str] = None
    
    # New real-world parameters
    weather_quality: Optional[str] = None  # OPTIMAL/DEGRADED/FAILED
    weather_attenuation_db: float = 0.0
    link_margin_db: float = 0.0
    data_rate_mbps: float = 0.0
    frequency_band: str = "X"
    elevation_angle: float = 0.0
    distance_km: float = 0.0
    data_source: str = "simulation"  # simulation/weather/physics
    
    def to_dict(self) -> Dict:
        return {
            'type': self.link_type,
            'name': self.name,
            'signalStrength': self.signal_strength,
            'latency': self.latency,
            'available': self.available,
            'stationId': self.station_id,
            'weatherQuality': self.weather_quality,
            'weatherAttenuationDb': self.weather_attenuation_db,
            'linkMarginDb': self.link_margin_db,
            'dataRateMbps': self.data_rate_mbps,
            'frequencyBand': self.frequency_band,
            'elevationAngle': self.elevation_angle,
            'distanceKm': self.distance_km,
            'dataSource': self.data_source
        }


class LinkSelector:
    """
    Enhanced link selector with real-world physics and weather integration
    
    Features:
    1. Weather impact assessment
    2. Physics-based link budget calculations
    3. Frequency band optimization
    4. Fallback to simulation mode
    """
    
    def __init__(self):
        self.ground_stations = settings.GROUND_STATIONS
        self.relay_satellites = settings.RELAY_SATELLITES
        self.use_weather_data = True
        self.use_physics_model = True
        
    async def select_link(self, position: Dict, mission_time: float) -> LinkStatus:
        """
        Select the best available link with real-world data integration
        
        Args:
            position: Satellite position dict with lat, lng, altitude
            mission_time: Current mission time in seconds
            
        Returns:
            LinkStatus object with best available link
        """
        lat = position['lat']
        lng = position['lng']
        alt = position.get('altitude', 400)  # Default 400km altitude
        
        # Try enhanced methods first if services are available
        if self.use_weather_data or self.use_physics_model:
            # Check ground stations with weather/physics
            ground_link = await self._check_enhanced_ground_coverage(lat, lng, alt)
            if ground_link:
                return ground_link
            
            # Check satellite relays with physics
            satellite_link = await self._check_enhanced_satellite_coverage(lat, lng, alt)
            if satellite_link:
                return satellite_link
        
        # Fallback to simple coverage checks
        ground_link = self._check_ground_coverage(lat, lng)
        if ground_link:
            return ground_link
        
        satellite_link = self._check_satellite_coverage(lat, lng)
        if satellite_link:
            return satellite_link
        
        # No link available
        return LinkStatus(
            link_type='none',
            name='No Link',
            signal_strength=0.0,
            latency=999.0,
            available=False,
            data_source="simulation"
        )
    
    def _check_ground_coverage(self, lat: float, lng: float) -> Optional[LinkStatus]:
        """Check if any ground station has line of sight"""
        for gs in self.ground_stations:
            distance = self._calculate_distance(
                lat, lng,
                gs['lat'], gs['lng']
            )
            
            # Check if within coverage range
            coverage_km = gs['coverage'] * 111  # Convert degrees to km
            if distance < coverage_km:
                signal_strength = max(50, 100 - distance / 10)
                latency = 20 + (distance / 299792)  # Light speed delay
                
                return LinkStatus(
                    link_type='ground',
                    name=gs['name'],
                    signal_strength=signal_strength,
                    latency=latency,
                    available=True,
                    station_id=gs['id']
                )
        
        return None
    
    def _check_satellite_coverage(self, lat: float, lng: float) -> Optional[LinkStatus]:
        """Check if any relay satellite is available"""
        import random
        
        # FORCE SATELLITE LINK FOR EMULATOR TESTING
        print(f"[DEBUG] Checking satellite coverage for lat={lat}, lng={lng}")
        
        for sat in self.relay_satellites:
            # Check latitude coverage
            if sat['minLat'] <= lat <= sat['maxLat']:
                # GEO satellites have higher latency
                latency = 250 + random.uniform(0, 100)
                signal_strength = 60 + random.uniform(0, 30)
                
                print(f"[DEBUG] SATELLITE LINK FOUND: {sat['name']} (lat range: {sat['minLat']} to {sat['maxLat']})")
                
                return LinkStatus(
                    link_type='satellite',
                    name=sat['name'],
                    signal_strength=signal_strength,
                    latency=latency,
                    available=True,
                    station_id=sat['id']
                )
        
        print(f"[DEBUG] NO SATELLITE COVERAGE for lat={lat}")
        return None
    
    def _calculate_distance(self, lat1: float, lng1: float, 
                           lat2: float, lng2: float) -> float:
        """Calculate great circle distance using Haversine formula"""
        R = 6371  # Earth's radius in km
        
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        
        a = (math.sin(dlat/2) ** 2 + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlng/2) ** 2)
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    async def _check_enhanced_ground_coverage(
        self, 
        sat_lat: float, 
        sat_lng: float, 
        sat_alt: float
    ) -> Optional[LinkStatus]:
        """
        Check ground station coverage with weather and physics integration
        """
        best_link = None
        best_score = -999.0
        
        for station in self.ground_stations:
            try:
                # Calculate geometry and link budget
                if link_budget_service:
                    sat_pos = {"lat": sat_lat, "lng": sat_lng, "altitude": sat_alt}
                    gs_pos = {"lat": station["lat"], "lng": station["lng"], "altitude": 0.0}
                    
                    # Get weather impact
                    weather_attenuation = 0.0
                    weather_quality = "OPTIMAL"
                    
                    if weather_service:
                        try:
                            weather_impact = await weather_service.assess_link_impact(
                                station["id"], station["lat"], station["lng"]
                            )
                            weather_attenuation = weather_impact.attenuation_db
                            weather_quality = weather_impact.link_quality.value
                        except Exception as e:
                            logger.warning(f"Weather assessment failed for {station['id']}: {e}")
                    
                    # Physics-based link analysis
                    link_analysis = link_budget_service.analyze_satellite_link(
                        sat_pos, gs_pos, FrequencyBand.X_BAND, weather_attenuation
                    )
                    
                    if link_analysis.link_available and link_analysis.elevation_angle >= 5.0:
                        # Score based on link margin and elevation
                        score = link_analysis.link_margin_db + link_analysis.elevation_angle * 0.1
                        
                        if score > best_score:
                            best_score = score
                            best_link = LinkStatus(
                                link_type='ground',
                                name=station['name'],
                                signal_strength=min(100, 50 + link_analysis.link_margin_db * 2),
                                latency=link_analysis.total_latency_ms,
                                available=True,
                                station_id=station['id'],
                                weather_quality=weather_quality,
                                weather_attenuation_db=weather_attenuation,
                                link_margin_db=link_analysis.link_margin_db,
                                data_rate_mbps=link_analysis.data_rate_mbps,
                                frequency_band=link_analysis.frequency_band.value,
                                elevation_angle=link_analysis.elevation_angle,
                                distance_km=link_analysis.distance_km,
                                data_source="physics"
                            )
                
            except Exception as e:
                logger.error(f"Enhanced ground coverage check failed for {station['id']}: {e}")
                # Fallback to simple coverage
                simple_link = self._check_simple_ground_station(sat_lat, sat_lng, station)
                if simple_link and (best_link is None or simple_link.signal_strength > best_link.signal_strength):
                    best_link = simple_link
        
        return best_link
    
    async def _check_enhanced_satellite_coverage(
        self, 
        sat_lat: float, 
        sat_lng: float, 
        sat_alt: float
    ) -> Optional[LinkStatus]:
        """
        Check satellite relay coverage with physics modeling
        """
        best_link = None
        best_score = -999.0
        
        for satellite in self.relay_satellites:
            try:
                # GEO satellites at ~35,786 km altitude
                relay_alt = 35786  # km
                
                # Simplified GEO positioning (would use real ephemeris data)
                if satellite["id"] == "sat-1":  # EDRS-A
                    relay_lng = 9.0  # Over Europe
                elif satellite["id"] == "sat-2":  # EDRS-C  
                    relay_lng = 31.0  # Over Africa
                else:
                    relay_lng = 0.0  # Default
                
                relay_lat = 0.0  # GEO is equatorial
                
                if link_budget_service:
                    sat_pos = {"lat": sat_lat, "lng": sat_lng, "altitude": sat_alt}
                    relay_pos = {"lat": relay_lat, "lng": relay_lng, "altitude": relay_alt}
                    
                    # Satellite-to-relay link analysis
                    uplink_analysis = link_budget_service.analyze_satellite_link(
                        sat_pos, relay_pos, FrequencyBand.KA_BAND, 0.0  # No weather in space
                    )
                    
                    # Check if satellite is in coverage area
                    lat_in_range = (satellite["minLat"] <= sat_lat <= satellite["maxLat"])
                    
                    if uplink_analysis.link_available and lat_in_range:
                        # Score based on link quality
                        score = uplink_analysis.link_margin_db
                        
                        if score > best_score:
                            best_score = score
                            
                            # Estimate total latency (up + down + processing)
                            total_latency = uplink_analysis.total_latency_ms * 2 + 50  # Round trip + processing
                            
                            best_link = LinkStatus(
                                link_type='satellite',
                                name=satellite['name'],
                                signal_strength=min(100, 40 + uplink_analysis.link_margin_db * 1.5),
                                latency=total_latency,
                                available=True,
                                station_id=satellite['id'],
                                weather_quality="OPTIMAL",  # No weather in space
                                weather_attenuation_db=0.0,
                                link_margin_db=uplink_analysis.link_margin_db,
                                data_rate_mbps=uplink_analysis.data_rate_mbps * 0.7,  # Reduced for relay
                                frequency_band=uplink_analysis.frequency_band.value,
                                elevation_angle=uplink_analysis.elevation_angle,
                                distance_km=uplink_analysis.distance_km,
                                data_source="physics"
                            )
                
            except Exception as e:
                logger.error(f"Enhanced satellite coverage check failed for {satellite['id']}: {e}")
                # Fallback to simple coverage
                simple_link = self._check_simple_satellite(sat_lat, sat_lng, satellite)
                if simple_link and (best_link is None or simple_link.signal_strength > best_link.signal_strength):
                    best_link = simple_link
        
        return best_link
    
    def _check_simple_ground_station(self, sat_lat: float, sat_lng: float, station: Dict) -> Optional[LinkStatus]:
        """Simple ground station coverage check (fallback)"""
        distance = self._haversine_distance(sat_lat, sat_lng, station["lat"], station["lng"])
        
        if distance <= station["coverage"]:
            # Simple signal strength based on distance
            signal_strength = max(20, 100 - (distance / station["coverage"]) * 60)
            latency = 50 + distance * 0.1  # Simple latency model
            
            return LinkStatus(
                link_type='ground',
                name=station['name'],
                signal_strength=signal_strength,
                latency=latency,
                available=True,
                station_id=station['id'],
                data_source="simulation"
            )
        
        return None
    
    def _check_simple_satellite(self, sat_lat: float, sat_lng: float, satellite: Dict) -> Optional[LinkStatus]:
        """Simple satellite coverage check (fallback)"""
        # Check if satellite is in coverage area
        if satellite["minLat"] <= sat_lat <= satellite["maxLat"]:
            # Simulate varying signal strength
            signal_strength = 60 + (sat_lat % 20) - 10
            latency = 250 + abs(sat_lat) * 2  # Higher latency for GEO
            
            return LinkStatus(
                link_type='satellite',
                name=satellite['name'],
                signal_strength=max(30, signal_strength),
                latency=latency,
                available=True,
                station_id=satellite['id'],
                data_source="simulation"
            )
        
        return None
    
    def _haversine_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate great circle distance using Haversine formula"""
        R = 6371  # Earth's radius in km
        
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        
        a = (math.sin(dlat/2) ** 2 + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlng/2) ** 2)
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    def enable_weather_integration(self, enabled: bool):
        """Enable/disable weather data integration"""
        self.use_weather_data = enabled
        logger.info(f"Weather integration: {'enabled' if enabled else 'disabled'}")
    
    def enable_physics_model(self, enabled: bool):
        """Enable/disable physics-based link calculations"""
        self.use_physics_model = enabled
        logger.info(f"Physics model: {'enabled' if enabled else 'disabled'}")
    
    def get_service_status(self) -> Dict:
        """Get status of integrated services"""
        return {
            "weather_integration": self.use_weather_data,
            "physics_model": self.use_physics_model,
            "weather_service_available": weather_service is not None,
            "link_budget_service_available": link_budget_service is not None,
            "ground_stations": len(self.ground_stations),
            "relay_satellites": len(self.relay_satellites)
        }