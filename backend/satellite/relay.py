"""
Satellite Relay Module
Handles satellite relay logic for ORBITNET-MESH
"""

import time
from typing import Dict, Optional, List
from dataclasses import dataclass

try:
    from config import settings
except ImportError:
    from ..config import settings


@dataclass
class RelayDecision:
    """Decision made by satellite relay"""
    action: str  # 'forward_to_ground', 'buffer', 'reject'
    reason: str
    relay_satellite: Optional[str] = None
    estimated_delay: float = 0
    
    def to_dict(self) -> Dict:
        return {
            'action': self.action,
            'reason': self.reason,
            'relaySatellite': self.relay_satellite,
            'estimatedDelay': self.estimated_delay
        }


class SatelliteRelay:
    """
    Satellite Relay Logic
    
    Receives data from spacecraft and decides whether to:
    1. Forward immediately to ground (if ground station visible)
    2. Buffer data (if no ground visibility)
    3. Use inter-satellite links
    """
    
    def __init__(self):
        self.relay_satellites = settings.RELAY_SATELLITES
        self.buffered_packets: List[Dict] = []
        self.relay_stats = {
            'total_received': 0,
            'forwarded_to_ground': 0,
            'buffered': 0,
            'inter_satellite_links': 0
        }
        
    async def receive_from_spacecraft(
        self, 
        packet: Dict,
        link_status: Dict
    ) -> RelayDecision:
        """
        Receive a packet from spacecraft via satellite link
        
        Args:
            packet: Data packet from spacecraft
            link_status: Current link status
            
        Returns:
            RelayDecision object
        """
        self.relay_stats['total_received'] += 1
        
        # If satellite relay is active
        if link_status['type'] == 'satellite':
            satellite_name = link_status['name']
            
            # Check ground station visibility from this satellite
            ground_visible = self._check_ground_visibility(satellite_name)
            
            if ground_visible:
                # Forward to ground immediately
                self.relay_stats['forwarded_to_ground'] += 1
                return RelayDecision(
                    action='forward_to_ground',
                    reason='Ground station visible from relay satellite',
                    relay_satellite=satellite_name,
                    estimated_delay=link_status['latency']
                )
            else:
                # Buffer for later forwarding
                self.buffered_packets.append(packet)
                self.relay_stats['buffered'] += 1
                return RelayDecision(
                    action='buffer',
                    reason='No ground visibility, buffering for next pass',
                    relay_satellite=satellite_name,
                    estimated_delay=self._estimate_next_ground_pass()
                )
        
        # Direct ground link - no relay needed
        return RelayDecision(
            action='forward_to_ground',
            reason='Direct ground link',
            relay_satellite=None,
            estimated_delay=link_status['latency']
        )
    
    def _check_ground_visibility(self, satellite_name: str) -> bool:
        """
        Check if satellite has ground station visibility
        
        For simulation: GEO satellites have periodic ground visibility
        """
        import random
        
        # Simulate ground visibility windows
        # In reality, this would check actual satellite-ground geometry
        current_time = time.time()
        phase = (current_time % 600) / 600  # 10-minute cycles
        
        # 70% of time GEO satellites have ground visibility
        return phase < 0.7 or random.random() < 0.7
    
    def _estimate_next_ground_pass(self) -> float:
        """Estimate time until next ground station pass"""
        import random
        # For GEO satellites, typically minutes
        return random.uniform(60, 300)  # 1-5 minutes
    
    async def flush_buffer_to_ground(self) -> List[Dict]:
        """
        Flush buffered packets when ground becomes visible
        
        Returns:
            List of forwarded packets
        """
        if not self.buffered_packets:
            return []
        
        forwarded = self.buffered_packets.copy()
        self.buffered_packets.clear()
        self.relay_stats['forwarded_to_ground'] += len(forwarded)
        
        return forwarded
    
    def get_stats(self) -> Dict:
        """Get relay statistics"""
        return {
            **self.relay_stats,
            'currently_buffered': len(self.buffered_packets)
        }
