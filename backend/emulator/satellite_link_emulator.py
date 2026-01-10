"""
Satellite Link Emulator
Software-only emulation of satellite communication behavior for hackathon demonstration

This emulator simulates real satellite link characteristics:
- Communication latency (300ms typical)
- Bandwidth limitations (512 Kbps)
- Optional packet loss (5% realistic)
- Transmission delays and buffering

IMPORTANT: This is SOFTWARE-ONLY emulation for demonstration purposes.
No real satellite communication or RF/SDR hardware is involved.
"""

import asyncio
import time
import random
from typing import Dict, List, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class EmulatorConfig:
    """Configuration for satellite link emulator"""
    enabled: bool = True
    latency_ms: int = 300          # Satellite round-trip latency
    packet_loss_rate: float = 0.05  # 5% packet loss
    bandwidth_kbps: int = 512      # Throughput limit
    jitter_ms: int = 50           # Latency variation
    
    def to_dict(self) -> Dict:
        return {
            'enabled': self.enabled,
            'latency_ms': self.latency_ms,
            'packet_loss_rate': self.packet_loss_rate,
            'bandwidth_kbps': self.bandwidth_kbps,
            'jitter_ms': self.jitter_ms
        }


@dataclass
class TransmissionResult:
    """Result of packet transmission through emulator"""
    packet_id: str
    success: bool
    latency_ms: float
    dropped: bool
    timestamp: float
    error_reason: Optional[str] = None
    
    def to_dict(self) -> Dict:
        return {
            'packet_id': self.packet_id,
            'success': self.success,
            'latency_ms': self.latency_ms,
            'dropped': self.dropped,
            'timestamp': self.timestamp,
            'error_reason': self.error_reason
        }


class SatelliteLinkEmulator:
    """
    Software-only satellite communication emulator
    
    Simulates realistic satellite link behavior for demonstration:
    - Adds communication latency
    - Applies bandwidth limitations
    - Introduces optional packet loss
    - Provides transmission analytics
    """
    
    def __init__(self, config: Optional[EmulatorConfig] = None):
        self.config = config or EmulatorConfig()
        self.transmission_history: List[TransmissionResult] = []
        self.total_packets_sent = 0
        self.total_packets_dropped = 0
        self.total_latency_ms = 0.0
        self.bandwidth_queue = asyncio.Queue()
        self.is_transmitting = False
        self._bandwidth_task: Optional[asyncio.Task] = None
        
        # Don't start bandwidth limiter during init - start it lazily
    
    async def transmit_packet(self, packet: Dict) -> TransmissionResult:
        """
        Transmit a packet through the satellite link emulator
        
        Args:
            packet: Data packet to transmit
            
        Returns:
            TransmissionResult with transmission details
        """
        # Start bandwidth limiter if not already running
        await self._ensure_bandwidth_limiter()
        
        packet_id = packet.get('id', f"pkt_{int(time.time() * 1000)}")
        print(f"[EMULATOR] START transmit packet {packet_id} at {time.time()}")
        
        if not self.config.enabled:
            # Emulator disabled - pass through immediately
            print(f"[EMULATOR] DISABLED - immediate passthrough for packet {packet_id}")
            return TransmissionResult(
                packet_id=packet_id,
                success=True,
                latency_ms=0.0,
                dropped=False,
                timestamp=time.time()
            )
        
        packet_id = packet.get('id', f"pkt_{int(time.time() * 1000)}")
        start_time = time.time()
        
        try:
            # 1. SIMULATE PACKET LOSS
            if random.random() < self.config.packet_loss_rate:
                result = TransmissionResult(
                    packet_id=packet_id,
                    success=False,
                    latency_ms=0.0,
                    dropped=True,
                    timestamp=time.time(),
                    error_reason="Packet lost during transmission"
                )
                
                self.total_packets_dropped += 1
                self._record_transmission(result)
                logger.warning(f"📡❌ Packet {packet_id} dropped by satellite link")
                return result
            
            # 2. SIMULATE SATELLITE LATENCY + JITTER
            base_latency = self.config.latency_ms / 1000.0  # Convert to seconds
            jitter = random.uniform(-self.config.jitter_ms, self.config.jitter_ms) / 1000.0
            total_latency = max(0.1, base_latency + jitter)  # Minimum 100ms
            
            logger.info(f"📡⏳ Transmitting packet {packet_id} via satellite (latency: {total_latency*1000:.1f}ms)")
            
            # 3. APPLY TRANSMISSION DELAY
            print(f"[EMULATOR] APPLYING {total_latency*1000:.1f}ms delay for packet {packet_id}")
            await asyncio.sleep(total_latency)
            print(f"[EMULATOR] END transmit packet {packet_id} at {time.time()}")
            
            # 4. BANDWIDTH LIMITING (queue packet for transmission)
            await self.bandwidth_queue.put({
                'packet': packet,
                'packet_id': packet_id,
                'start_time': start_time,
                'latency_applied': total_latency
            })
            
            # 5. SUCCESSFUL TRANSMISSION
            actual_latency_ms = (time.time() - start_time) * 1000
            result = TransmissionResult(
                packet_id=packet_id,
                success=True,
                latency_ms=actual_latency_ms,
                dropped=False,
                timestamp=time.time()
            )
            
            self.total_packets_sent += 1
            self.total_latency_ms += actual_latency_ms
            self._record_transmission(result)
            
            logger.info(f"📡✅ Packet {packet_id} successfully transmitted (total latency: {actual_latency_ms:.1f}ms)")
            return result
            
        except Exception as e:
            # Handle transmission errors
            result = TransmissionResult(
                packet_id=packet_id,
                success=False,
                latency_ms=(time.time() - start_time) * 1000,
                dropped=True,
                timestamp=time.time(),
                error_reason=f"Transmission error: {str(e)}"
            )
            
            self.total_packets_dropped += 1
            self._record_transmission(result)
            logger.error(f"📡❌ Packet {packet_id} transmission failed: {e}")
            return result
    
    async def transmit_batch(self, packets: List[Dict]) -> List[TransmissionResult]:
        """
        Transmit multiple packets through the satellite link
        
        Args:
            packets: List of data packets to transmit
            
        Returns:
            List of TransmissionResults
        """
        if not packets:
            return []
        
        logger.info(f"📡📦 Starting batch transmission of {len(packets)} packets via satellite")
        
        # Transmit all packets concurrently (satellite can handle multiple streams)
        tasks = [self.transmit_packet(packet) for packet in packets]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle any exceptions
        final_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                final_results.append(TransmissionResult(
                    packet_id=packets[i].get('id', f'pkt_{i}'),
                    success=False,
                    latency_ms=0.0,
                    dropped=True,
                    timestamp=time.time(),
                    error_reason=f"Batch transmission error: {str(result)}"
                ))
            else:
                final_results.append(result)
        
        successful = len([r for r in final_results if r.success])
        logger.info(f"📡📊 Batch transmission complete: {successful}/{len(packets)} packets successful")
        
        return final_results
    
    async def _ensure_bandwidth_limiter(self):
        """Ensure bandwidth limiter task is running"""
        if self.config.enabled and (self._bandwidth_task is None or self._bandwidth_task.done()):
            try:
                self._bandwidth_task = asyncio.create_task(self._bandwidth_limiter())
            except RuntimeError:
                # No event loop running, will start later
                pass
    
    async def _bandwidth_limiter(self):
        """
        Background task to enforce bandwidth limitations
        Processes queued packets at the configured rate
        """
        if not self.config.enabled:
            return
        
        # Calculate delay between packets based on bandwidth
        # Assuming average packet size of 1KB
        packet_size_kb = 1.0
        delay_between_packets = packet_size_kb / self.config.bandwidth_kbps
        
        logger.info(f"📡🚦 Bandwidth limiter started: {self.config.bandwidth_kbps} Kbps (delay: {delay_between_packets:.3f}s/packet)")
        
        while True:
            try:
                # Wait for next packet in bandwidth queue
                queued_item = await self.bandwidth_queue.get()
                
                # Apply bandwidth delay
                if delay_between_packets > 0:
                    await asyncio.sleep(delay_between_packets)
                
                # Mark packet as processed
                self.bandwidth_queue.task_done()
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"📡❌ Bandwidth limiter error: {e}")
                await asyncio.sleep(1)
    
    def _record_transmission(self, result: TransmissionResult):
        """Record transmission result for analytics"""
        self.transmission_history.append(result)
        
        # Keep only last 1000 transmissions for memory management
        if len(self.transmission_history) > 1000:
            self.transmission_history = self.transmission_history[-1000:]
    
    def get_statistics(self) -> Dict:
        """Get emulator transmission statistics"""
        total_packets = self.total_packets_sent + self.total_packets_dropped
        success_rate = (self.total_packets_sent / max(1, total_packets)) * 100
        avg_latency = self.total_latency_ms / max(1, self.total_packets_sent)
        
        return {
            'emulator_enabled': self.config.enabled,
            'total_packets_processed': total_packets,
            'packets_transmitted': self.total_packets_sent,
            'packets_dropped': self.total_packets_dropped,
            'success_rate_percent': round(success_rate, 2),
            'average_latency_ms': round(avg_latency, 2),
            'configured_latency_ms': self.config.latency_ms,
            'configured_loss_rate': self.config.packet_loss_rate,
            'bandwidth_kbps': self.config.bandwidth_kbps,
            'recent_transmissions': len(self.transmission_history)
        }
    
    def get_recent_transmissions(self, limit: int = 50) -> List[Dict]:
        """Get recent transmission results"""
        recent = self.transmission_history[-limit:] if self.transmission_history else []
        return [t.to_dict() for t in recent]
    
    def update_config(self, new_config: EmulatorConfig):
        """Update emulator configuration"""
        old_enabled = self.config.enabled
        self.config = new_config
        
        logger.info(f"📡⚙️ Emulator configuration updated: {new_config.to_dict()}")
        
        # Restart bandwidth limiter if enabled state changed
        if old_enabled != new_config.enabled and new_config.enabled:
            try:
                if self._bandwidth_task:
                    self._bandwidth_task.cancel()
                self._bandwidth_task = asyncio.create_task(self._bandwidth_limiter())
            except RuntimeError:
                # No event loop running, will start later
                pass
    
    def reset_statistics(self):
        """Reset all transmission statistics"""
        self.transmission_history.clear()
        self.total_packets_sent = 0
        self.total_packets_dropped = 0
        self.total_latency_ms = 0.0
        logger.info("📡🔄 Emulator statistics reset")
    
    def get_status(self) -> Dict:
        """Get current emulator status"""
        return {
            'enabled': self.config.enabled,
            'configuration': self.config.to_dict(),
            'statistics': self.get_statistics(),
            'queue_size': self.bandwidth_queue.qsize() if hasattr(self.bandwidth_queue, 'qsize') else 0,
            'is_transmitting': self.is_transmitting
        }


# Global emulator instance with hackathon-friendly defaults
satellite_emulator = SatelliteLinkEmulator(EmulatorConfig(
    enabled=True,           # Enable by default for demo
    latency_ms=300,         # Realistic satellite latency
    packet_loss_rate=0.05,  # 5% loss rate
    bandwidth_kbps=512,     # Moderate bandwidth
    jitter_ms=50           # Some latency variation
))


def get_emulator() -> SatelliteLinkEmulator:
    """Get the global satellite emulator instance"""
    return satellite_emulator


def configure_emulator(
    enabled: bool = True,
    latency_ms: int = 300,
    packet_loss_rate: float = 0.05,
    bandwidth_kbps: int = 512,
    jitter_ms: int = 50
) -> Dict:
    """
    Configure the satellite link emulator
    
    Args:
        enabled: Enable/disable emulator
        latency_ms: Satellite communication latency
        packet_loss_rate: Probability of packet loss (0.0-1.0)
        bandwidth_kbps: Bandwidth limitation in Kbps
        jitter_ms: Latency variation in milliseconds
        
    Returns:
        Configuration status
    """
    config = EmulatorConfig(
        enabled=enabled,
        latency_ms=latency_ms,
        packet_loss_rate=packet_loss_rate,
        bandwidth_kbps=bandwidth_kbps,
        jitter_ms=jitter_ms
    )
    
    satellite_emulator.update_config(config)
    
    return {
        'success': True,
        'message': f"Satellite emulator {'enabled' if enabled else 'disabled'}",
        'configuration': config.to_dict()
    }