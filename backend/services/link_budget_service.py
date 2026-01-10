"""
Physics-Based Link Budget & Latency Calculation Service
Computes realistic communication parameters based on orbital mechanics

Time Complexity: O(1) per calculation
Space Complexity: O(1)
"""

import math
import logging
from typing import Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class FrequencyBand(Enum):
    """Satellite communication frequency bands"""
    L_BAND = "L"      # 1-2 GHz, mobile/GPS
    S_BAND = "S"      # 2-4 GHz, weather radar, WiFi
    C_BAND = "C"      # 4-8 GHz, satellite TV
    X_BAND = "X"      # 8-12 GHz, military, radar
    KU_BAND = "Ku"    # 12-18 GHz, satellite TV/internet
    KA_BAND = "Ka"    # 26-40 GHz, high-speed data
    OPTICAL = "Optical"  # Laser communication


@dataclass
class LinkBudgetParams:
    """Link budget calculation parameters"""
    frequency_band: FrequencyBand
    frequency_ghz: float
    tx_power_dbm: float      # Transmitter power
    tx_antenna_gain_dbi: float  # Transmitter antenna gain
    rx_antenna_gain_dbi: float  # Receiver antenna gain
    system_losses_db: float     # Cable, pointing, etc.
    noise_temperature_k: float  # System noise temperature
    required_snr_db: float      # Required signal-to-noise ratio


@dataclass
class LinkAnalysis:
    """Complete link analysis results"""
    distance_km: float
    elevation_angle: float      # degrees
    azimuth_angle: float       # degrees
    
    # Latency
    propagation_delay_ms: float
    total_latency_ms: float
    
    # Link budget
    path_loss_db: float
    received_power_dbm: float
    snr_db: float
    link_margin_db: float
    
    # Quality assessment
    link_available: bool
    quality_score: float       # 0.0 to 1.0
    data_rate_mbps: float
    
    # Metadata
    frequency_band: FrequencyBand
    atmospheric_loss_db: float
    explanation: str


class LinkBudgetService:
    """
    Physics-based link budget and latency calculations
    
    Implements standard satellite communication link analysis
    with realistic propagation models and frequency-dependent effects
    """
    
    def __init__(self):
        # Standard link budget parameters by frequency band
        self.band_params = {
            FrequencyBand.L_BAND: LinkBudgetParams(
                frequency_band=FrequencyBand.L_BAND,
                frequency_ghz=1.5,
                tx_power_dbm=30.0,      # 1W
                tx_antenna_gain_dbi=10.0,
                rx_antenna_gain_dbi=25.0,
                system_losses_db=3.0,
                noise_temperature_k=150.0,
                required_snr_db=10.0
            ),
            FrequencyBand.S_BAND: LinkBudgetParams(
                frequency_band=FrequencyBand.S_BAND,
                frequency_ghz=2.2,
                tx_power_dbm=33.0,      # 2W
                tx_antenna_gain_dbi=12.0,
                rx_antenna_gain_dbi=30.0,
                system_losses_db=2.5,
                noise_temperature_k=120.0,
                required_snr_db=12.0
            ),
            FrequencyBand.X_BAND: LinkBudgetParams(
                frequency_band=FrequencyBand.X_BAND,
                frequency_ghz=8.4,
                tx_power_dbm=40.0,      # 10W
                tx_antenna_gain_dbi=20.0,
                rx_antenna_gain_dbi=45.0,
                system_losses_db=2.0,
                noise_temperature_k=100.0,
                required_snr_db=15.0
            ),
            FrequencyBand.KU_BAND: LinkBudgetParams(
                frequency_band=FrequencyBand.KU_BAND,
                frequency_ghz=14.0,
                tx_power_dbm=43.0,      # 20W
                tx_antenna_gain_dbi=25.0,
                rx_antenna_gain_dbi=50.0,
                system_losses_db=1.5,
                noise_temperature_k=80.0,
                required_snr_db=18.0
            ),
            FrequencyBand.KA_BAND: LinkBudgetParams(
                frequency_band=FrequencyBand.KA_BAND,
                frequency_ghz=32.0,
                tx_power_dbm=45.0,      # 32W
                tx_antenna_gain_dbi=35.0,
                rx_antenna_gain_dbi=55.0,
                system_losses_db=2.5,
                noise_temperature_k=120.0,
                required_snr_db=20.0
            ),
            FrequencyBand.OPTICAL: LinkBudgetParams(
                frequency_band=FrequencyBand.OPTICAL,
                frequency_ghz=300000000.0,  # 300 THz (1 μm)
                tx_power_dbm=20.0,      # 100mW laser
                tx_antenna_gain_dbi=80.0,   # High-gain optical telescope
                rx_antenna_gain_dbi=85.0,
                system_losses_db=5.0,   # Atmospheric turbulence
                noise_temperature_k=300.0,
                required_snr_db=25.0
            )
        }
        
        # Physical constants
        self.SPEED_OF_LIGHT = 299792458  # m/s
        self.EARTH_RADIUS = 6371000      # meters
        
    def calculate_distance_and_angles(
        self, 
        sat_lat: float, 
        sat_lng: float, 
        sat_alt: float,
        gs_lat: float, 
        gs_lng: float, 
        gs_alt: float = 0.0
    ) -> Tuple[float, float, float]:
        """
        Calculate satellite-to-ground distance and look angles
        
        Args:
            sat_lat, sat_lng, sat_alt: Satellite position (degrees, degrees, km)
            gs_lat, gs_lng, gs_alt: Ground station position (degrees, degrees, km)
            
        Returns:
            (distance_km, elevation_angle, azimuth_angle)
        """
        # Convert to radians
        sat_lat_rad = math.radians(sat_lat)
        sat_lng_rad = math.radians(sat_lng)
        gs_lat_rad = math.radians(gs_lat)
        gs_lng_rad = math.radians(gs_lng)
        
        # Convert to Cartesian coordinates (ECEF)
        sat_r = (self.EARTH_RADIUS / 1000) + sat_alt  # km
        gs_r = (self.EARTH_RADIUS / 1000) + gs_alt    # km
        
        # Satellite position
        sat_x = sat_r * math.cos(sat_lat_rad) * math.cos(sat_lng_rad)
        sat_y = sat_r * math.cos(sat_lat_rad) * math.sin(sat_lng_rad)
        sat_z = sat_r * math.sin(sat_lat_rad)
        
        # Ground station position
        gs_x = gs_r * math.cos(gs_lat_rad) * math.cos(gs_lng_rad)
        gs_y = gs_r * math.cos(gs_lat_rad) * math.sin(gs_lng_rad)
        gs_z = gs_r * math.sin(gs_lat_rad)
        
        # Range vector
        dx = sat_x - gs_x
        dy = sat_y - gs_y
        dz = sat_z - gs_z
        
        # Distance
        distance = math.sqrt(dx*dx + dy*dy + dz*dz)
        
        # Local coordinate system at ground station
        # East-North-Up (ENU) coordinates
        sin_lat = math.sin(gs_lat_rad)
        cos_lat = math.cos(gs_lat_rad)
        sin_lng = math.sin(gs_lng_rad)
        cos_lng = math.cos(gs_lng_rad)
        
        # Transform to ENU
        east = -sin_lng * dx + cos_lng * dy
        north = -sin_lat * cos_lng * dx - sin_lat * sin_lng * dy + cos_lat * dz
        up = cos_lat * cos_lng * dx + cos_lat * sin_lng * dy + sin_lat * dz
        
        # Elevation angle
        elevation = math.degrees(math.atan2(up, math.sqrt(east*east + north*north)))
        
        # Azimuth angle (from North, clockwise)
        azimuth = math.degrees(math.atan2(east, north))
        if azimuth < 0:
            azimuth += 360
        
        return distance, elevation, azimuth
    
    def calculate_free_space_path_loss(self, distance_km: float, frequency_ghz: float) -> float:
        """
        Calculate free space path loss using Friis equation
        
        Args:
            distance_km: Distance in kilometers
            frequency_ghz: Frequency in GHz
            
        Returns:
            Path loss in dB
        """
        # Friis free space path loss formula
        # FSPL(dB) = 20*log10(d) + 20*log10(f) + 92.45
        # where d is in km and f is in GHz
        
        if distance_km <= 0 or frequency_ghz <= 0:
            return 999.0  # Invalid parameters
        
        fspl = 20 * math.log10(distance_km) + 20 * math.log10(frequency_ghz) + 92.45
        return fspl
    
    def calculate_atmospheric_loss(
        self, 
        frequency_ghz: float, 
        elevation_angle: float,
        weather_attenuation_db: float = 0.0
    ) -> float:
        """
        Calculate atmospheric attenuation
        
        Args:
            frequency_ghz: Frequency in GHz
            elevation_angle: Elevation angle in degrees
            weather_attenuation_db: Additional weather losses
            
        Returns:
            Atmospheric loss in dB
        """
        # Atmospheric absorption (simplified model)
        # Based on ITU-R P.676 for clear sky conditions
        
        if elevation_angle < 5:
            return 999.0  # Below horizon
        
        # Zenith attenuation (clear sky)
        if frequency_ghz < 10:
            zenith_loss = 0.1  # Low frequencies
        elif frequency_ghz < 20:
            zenith_loss = 0.2 + (frequency_ghz - 10) * 0.05
        elif frequency_ghz < 60:
            zenith_loss = 0.7 + (frequency_ghz - 20) * 0.1
        else:
            zenith_loss = 4.7 + (frequency_ghz - 60) * 0.2
        
        # Path length factor
        elevation_rad = math.radians(max(5, elevation_angle))
        path_factor = 1.0 / math.sin(elevation_rad)
        
        # Total atmospheric loss
        atmospheric_loss = zenith_loss * path_factor + weather_attenuation_db
        
        return min(atmospheric_loss, 50.0)  # Cap at 50 dB
    
    def calculate_link_budget(
        self, 
        distance_km: float,
        elevation_angle: float,
        frequency_band: FrequencyBand,
        weather_attenuation_db: float = 0.0
    ) -> LinkAnalysis:
        """
        Complete link budget analysis
        
        Args:
            distance_km: Satellite distance
            elevation_angle: Elevation angle in degrees
            frequency_band: Communication frequency band
            weather_attenuation_db: Weather-induced losses
            
        Returns:
            Complete LinkAnalysis
        """
        # Get band parameters
        params = self.band_params.get(frequency_band, self.band_params[FrequencyBand.X_BAND])
        
        # Calculate propagation delay
        distance_m = distance_km * 1000
        propagation_delay_ms = (distance_m / self.SPEED_OF_LIGHT) * 1000
        
        # Add processing delays (simplified)
        processing_delay_ms = 5.0  # Modem, encoding, etc.
        total_latency_ms = propagation_delay_ms + processing_delay_ms
        
        # Path loss calculations
        free_space_loss = self.calculate_free_space_path_loss(distance_km, params.frequency_ghz)
        atmospheric_loss = self.calculate_atmospheric_loss(
            params.frequency_ghz, 
            elevation_angle, 
            weather_attenuation_db
        )
        
        total_path_loss = free_space_loss + atmospheric_loss
        
        # Link budget calculation
        # Received Power = Tx Power + Tx Gain + Rx Gain - Path Loss - System Losses
        received_power = (params.tx_power_dbm + 
                         params.tx_antenna_gain_dbi + 
                         params.rx_antenna_gain_dbi - 
                         total_path_loss - 
                         params.system_losses_db)
        
        # Noise power calculation
        # N = k * T * B (in linear units)
        # For digital systems, assume 1 MHz bandwidth
        bandwidth_hz = 1e6  # 1 MHz
        boltzmann_k = 1.38e-23  # J/K
        noise_power_w = boltzmann_k * params.noise_temperature_k * bandwidth_hz
        noise_power_dbm = 10 * math.log10(noise_power_w * 1000)  # Convert to dBm
        
        # Signal-to-Noise Ratio
        snr_db = received_power - noise_power_dbm
        
        # Link margin
        link_margin_db = snr_db - params.required_snr_db
        
        # Link availability assessment
        link_available = (elevation_angle >= 5.0 and 
                         link_margin_db >= 0.0 and 
                         distance_km < 50000)  # Max range check
        
        # Quality score (0.0 to 1.0)
        if not link_available:
            quality_score = 0.0
        else:
            # Based on link margin and elevation
            margin_factor = min(1.0, max(0.0, link_margin_db / 10.0))
            elevation_factor = min(1.0, max(0.0, (elevation_angle - 5) / 85.0))
            quality_score = (margin_factor + elevation_factor) / 2.0
        
        # Estimate data rate based on SNR
        if snr_db < 0:
            data_rate_mbps = 0.0
        elif snr_db < 10:
            data_rate_mbps = 0.1 * (snr_db / 10.0)
        else:
            # Shannon capacity approximation
            data_rate_mbps = bandwidth_hz * math.log2(1 + 10**(snr_db/10)) / 1e6
            data_rate_mbps = min(data_rate_mbps, 100.0)  # Cap at 100 Mbps
        
        # Generate explanation
        if not link_available:
            if elevation_angle < 5:
                explanation = f"Satellite below horizon (elevation: {elevation_angle:.1f}°)"
            elif link_margin_db < 0:
                explanation = f"Insufficient link margin: {link_margin_db:.1f}dB"
            else:
                explanation = "Link unavailable (range/interference)"
        else:
            explanation = f"Link active: {link_margin_db:.1f}dB margin, {data_rate_mbps:.1f}Mbps"
        
        return LinkAnalysis(
            distance_km=distance_km,
            elevation_angle=elevation_angle,
            azimuth_angle=0.0,  # Would be calculated in full implementation
            propagation_delay_ms=propagation_delay_ms,
            total_latency_ms=total_latency_ms,
            path_loss_db=total_path_loss,
            received_power_dbm=received_power,
            snr_db=snr_db,
            link_margin_db=link_margin_db,
            link_available=link_available,
            quality_score=quality_score,
            data_rate_mbps=data_rate_mbps,
            frequency_band=frequency_band,
            atmospheric_loss_db=atmospheric_loss,
            explanation=explanation
        )
    
    def analyze_satellite_link(
        self,
        sat_position: Dict,  # {lat, lng, altitude}
        gs_position: Dict,   # {lat, lng, altitude}
        frequency_band: FrequencyBand = FrequencyBand.X_BAND,
        weather_attenuation_db: float = 0.0
    ) -> LinkAnalysis:
        """
        Analyze satellite-to-ground communication link
        
        Args:
            sat_position: Satellite position dict
            gs_position: Ground station position dict
            frequency_band: Communication frequency band
            weather_attenuation_db: Weather-induced losses
            
        Returns:
            Complete link analysis
        """
        # Calculate geometry
        distance, elevation, azimuth = self.calculate_distance_and_angles(
            sat_position["lat"], sat_position["lng"], sat_position["altitude"],
            gs_position["lat"], gs_position["lng"], gs_position.get("altitude", 0.0)
        )
        
        # Perform link budget analysis
        analysis = self.calculate_link_budget(
            distance, elevation, frequency_band, weather_attenuation_db
        )
        
        # Update azimuth
        analysis.azimuth_angle = azimuth
        
        logger.debug(f"Link analysis: {distance:.1f}km, {elevation:.1f}°, {analysis.link_margin_db:.1f}dB margin")
        
        return analysis
    
    def get_optimal_frequency_band(
        self, 
        distance_km: float, 
        elevation_angle: float,
        weather_attenuation_db: float = 0.0
    ) -> Tuple[FrequencyBand, LinkAnalysis]:
        """
        Find optimal frequency band for given conditions
        
        Args:
            distance_km: Distance to satellite
            elevation_angle: Elevation angle
            weather_attenuation_db: Weather losses
            
        Returns:
            (optimal_band, best_analysis)
        """
        best_band = FrequencyBand.X_BAND
        best_analysis = None
        best_score = -999.0
        
        # Test each frequency band
        for band in [FrequencyBand.L_BAND, FrequencyBand.S_BAND, 
                    FrequencyBand.X_BAND, FrequencyBand.KU_BAND]:
            
            analysis = self.calculate_link_budget(
                distance_km, elevation_angle, band, weather_attenuation_db
            )
            
            # Score based on link margin and data rate
            if analysis.link_available:
                score = analysis.link_margin_db + math.log10(analysis.data_rate_mbps + 0.1)
            else:
                score = -999.0
            
            if score > best_score:
                best_score = score
                best_band = band
                best_analysis = analysis
        
        return best_band, best_analysis or self.calculate_link_budget(
            distance_km, elevation_angle, FrequencyBand.X_BAND, weather_attenuation_db
        )


# Global service instance
link_budget_service = LinkBudgetService()