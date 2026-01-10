"""
Ground Receiver Module
Receives telemetry from satellites and direct ground links
"""

import time
from typing import Dict, List
from dataclasses import dataclass


@dataclass
class ReceivedPacket:
    """Packet received by ground station"""
    packet_id: str
    received_at: float
    source: str  # 'direct' or 'satellite_relay'
    relay_satellite: str = None
    telemetry: Dict = None
    
    def to_dict(self) -> Dict:
        return {
            'packetId': self.packet_id,
            'receivedAt': self.received_at,
            'source': self.source,
            'relaySatellite': self.relay_satellite,
            'telemetry': self.telemetry
        }


class GroundReceiver:
    """
    Ground Station Receiver
    
    Receives telemetry data from:
    1. Direct spacecraft links
    2. Satellite relay systems
    """
    
    def __init__(self):
        self.received_packets: List[ReceivedPacket] = []
        self.stats = {
            'total_received': 0,
            'direct_links': 0,
            'satellite_relay': 0,
            'last_reception': None
        }
        
    async def receive_packet(
        self,
        packet: Dict,
        source: str,
        relay_satellite: str = None
    ) -> ReceivedPacket:
        """
        Receive a telemetry packet
        
        Args:
            packet: Telemetry packet
            source: 'direct' or 'satellite_relay'
            relay_satellite: Satellite ID if relayed
            
        Returns:
            ReceivedPacket object
        """
        packet_id = packet.get('id', 'unknown')
        print(f"[GROUND] RECEIVED packet {packet_id} at {time.time()} from {source}")
        
        received = ReceivedPacket(
            packet_id=packet_id,
            received_at=time.time(),
            source=source,
            relay_satellite=relay_satellite,
            telemetry=packet
        )
        
        self.received_packets.append(received)
        self.stats['total_received'] += 1
        self.stats['last_reception'] = received.received_at
        
        if source == 'direct':
            self.stats['direct_links'] += 1
        else:
            self.stats['satellite_relay'] += 1
        
        return received
    
    def get_received_packets(self, limit: int = 100) -> List[ReceivedPacket]:
        """Get recently received packets"""
        return self.received_packets[-limit:]
    
    def get_stats(self) -> Dict:
        """Get receiver statistics"""
        return {
            **self.stats,
            'total_packets': len(self.received_packets)
        }
    
    def clear(self):
        """Clear all received packets"""
        self.received_packets.clear()
        self.stats = {
            'total_received': 0,
            'direct_links': 0,
            'satellite_relay': 0,
            'last_reception': None
        }
