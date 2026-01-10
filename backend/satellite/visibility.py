"""
Satellite Visibility Calculator
Determines when satellites have line-of-sight to ground stations
"""

import math
import time
from typing import Dict, List, Tuple

try:
    from config import settings
except ImportError:
    from ..config import settings


class VisibilityCalculator:
    """
    Calculate satellite-to-ground visibility windows
    
    Simplified model for demonstration purposes.
    Real implementation would use orbital propagators (SGP4/SDP4).
    """
    
    def __init__(self):
        self.ground_stations = settings.GROUND_STATIONS
        self.satellites = settings.RELAY_SATELLITES
        
    def calculate_visibility_window(
        self, 
        satellite_id: str,
        ground_station_id: str,
        current_time: float
    ) -> Dict:
        """
        Calculate visibility window for satellite-ground pair
        
        Returns:
            Dict with 'visible', 'elevation', 'azimuth', 'next_pass'
        """
        # Find satellite and ground station
        satellite = next((s for s in self.satellites if s['id'] == satellite_id), None)
        ground = next((g for g in self.ground_stations if g['id'] == ground_station_id), None)
        
        if not satellite or not ground:
            return {
                'visible': False,
                'elevation': 0,
                'azimuth': 0,
                'next_pass': None
            }
        
        # For GEO satellites, visibility is relatively constant based on latitude
        # Simplified: GEO satellites at 0° latitude have visibility to stations within coverage
        if satellite['orbitType'] == 'GEO':
            # Check if ground station is within satellite's latitude coverage
            in_coverage = (
                satellite['minLat'] <= ground['lat'] <= satellite['maxLat']
            )
            
            if in_coverage:
                # Calculate simplified elevation angle
                lat_diff = abs(ground['lat'] - 0)  # Assume GEO at equator
                elevation = max(5, 90 - lat_diff)  # Simplified
                
                # Visibility windows for GEO: periodic based on longitude
                phase = (current_time % 1000) / 1000
                visible = phase < 0.8  # 80% visibility
                
                return {
                    'visible': visible,
                    'elevation': elevation if visible else 0,
                    'azimuth': 180,  # Simplified
                    'next_pass': current_time + (1000 * (1 - phase)) if not visible else None
                }
        
        # LEO/MEO satellites have periodic passes
        return self._calculate_leo_visibility(satellite, ground, current_time)
    
    def _calculate_leo_visibility(
        self,
        satellite: Dict,
        ground: Dict,
        current_time: float
    ) -> Dict:
        """Calculate LEO satellite visibility (simplified)"""
        # LEO satellites have ~10 minute passes every ~90 minutes
        orbital_period = 90 * 60  # 90 minutes for LEO
        pass_duration = 10 * 60   # 10 minute passes
        
        time_in_orbit = current_time % orbital_period
        
        # Check if satellite is over ground station
        # This is heavily simplified
        visible = time_in_orbit < pass_duration
        
        if visible:
            # Calculate elevation (0-90 degrees)
            pass_progress = time_in_orbit / pass_duration
            elevation = math.sin(pass_progress * math.pi) * 90
            
            return {
                'visible': True,
                'elevation': elevation,
                'azimuth': 180,
                'next_pass': None
            }
        else:
            # Calculate next pass time
            next_pass = current_time + (orbital_period - time_in_orbit)
            
            return {
                'visible': False,
                'elevation': 0,
                'azimuth': 0,
                'next_pass': next_pass
            }
    
    def get_all_visible_satellites(
        self,
        ground_station_id: str,
        current_time: float
    ) -> List[Dict]:
        """Get all satellites currently visible from a ground station"""
        visible = []
        
        for satellite in self.satellites:
            visibility = self.calculate_visibility_window(
                satellite['id'],
                ground_station_id,
                current_time
            )
            
            if visibility['visible']:
                visible.append({
                    'satellite': satellite,
                    'visibility': visibility
                })
        
        return visible
