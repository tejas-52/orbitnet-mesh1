"""
ORBITNET-MESH Data Collector
Automatically collects and stores testing data from the running system
"""

import asyncio
import time
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import requests
from .db_manager import DatabaseManager, TransmissionMetric, LinkEvent

logger = logging.getLogger(__name__)

class DataCollector:
    """
    Automated data collection service for ORBITNET-MESH testing
    """
    
    def __init__(self, api_base_url: str = "http://localhost:8000/api"):
        self.api_base_url = api_base_url
        self.db_manager = DatabaseManager()
        self.current_session_id: Optional[str] = None
        self.collection_task: Optional[asyncio.Task] = None
        self.collection_interval = 1.0  # seconds
        self.last_link_status = None
        self.last_transmitted_count = 0
        
    async def start_collection(
        self,
        test_name: str,
        test_type: str = 'automated',
        test_description: Optional[str] = None,
        collection_interval: float = 1.0
    ) -> str:
        """
        Start automated data collection
        
        Returns:
            session_id: Unique session identifier
        """
        # Stop any existing collection
        await self.stop_collection()
        
        # Create new test session
        self.current_session_id = self.db_manager.create_test_session(
            test_name=test_name,
            test_type=test_type,
            test_description=test_description,
            test_parameters={
                'collection_interval': collection_interval,
                'api_base_url': self.api_base_url
            }
        )
        
        self.collection_interval = collection_interval
        self.last_link_status = None
        self.last_transmitted_count = 0
        
        # Start collection task
        self.collection_task = asyncio.create_task(self._collection_loop())
        
        logger.info(f"Started data collection: {self.current_session_id}")
        return self.current_session_id
    
    async def stop_collection(self, status: str = 'completed'):
        """Stop data collection and finalize session"""
        if self.collection_task and not self.collection_task.done():
            self.collection_task.cancel()
            try:
                await self.collection_task
            except asyncio.CancelledError:
                pass
        
        if self.current_session_id:
            self.db_manager.end_test_session(self.current_session_id, status)
            logger.info(f"Stopped data collection: {self.current_session_id}")
            self.current_session_id = None
    
    async def _collection_loop(self):
        """Main data collection loop"""
        try:
            while True:
                await self._collect_data_point()
                await asyncio.sleep(self.collection_interval)
                
        except asyncio.CancelledError:
            logger.info("Data collection loop cancelled")
        except Exception as e:
            logger.error(f"Data collection loop error: {e}")
    
    async def _collect_data_point(self):
        """Collect a single data point from the system"""
        if not self.current_session_id:
            return
        
        try:
            # Get current system status
            status_data = await self._get_api_data('/status')
            telemetry_data = await self._get_api_data('/telemetry/latest')
            link_data = await self._get_api_data('/link/status')
            
            if not all([status_data, telemetry_data, link_data]):
                return
            
            current_time = datetime.now(timezone.utc)
            mission_time = status_data.get('missionTime', 0)
            
            # Record transmission metrics
            await self._record_transmission_metrics(
                current_time, mission_time, status_data, telemetry_data, link_data
            )
            
            # Check for link events
            await self._check_link_events(
                current_time, mission_time, link_data, telemetry_data
            )
            
        except Exception as e:
            logger.error(f"Failed to collect data point: {e}")
    
    async def _get_api_data(self, endpoint: str) -> Optional[Dict]:
        """Get data from API endpoint"""
        try:
            # Use requests in a thread to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: requests.get(f"{self.api_base_url}{endpoint}", timeout=5)
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"API endpoint {endpoint} returned {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Failed to get API data from {endpoint}: {e}")
            return None
    
    async def _record_transmission_metrics(
        self,
        timestamp: datetime,
        mission_time: float,
        status_data: Dict,
        telemetry_data: Dict,
        link_data: Dict
    ):
        """Record transmission metrics"""
        try:
            stats = status_data.get('stats', {})
            queue_stats = status_data.get('queueStats', {})
            position = telemetry_data.get('position', {})
            
            # Calculate transmission rate
            current_transmitted = stats.get('totalTransmitted', 0)
            transmission_rate = max(0, current_transmitted - self.last_transmitted_count) / self.collection_interval
            self.last_transmitted_count = current_transmitted
            
            # Calculate buffer utilization (assuming max buffer size of 1000)
            max_buffer_size = 1000
            current_stored = stats.get('totalStored', 0)
            buffer_utilization = (current_stored / max_buffer_size) * 100 if max_buffer_size > 0 else 0
            
            metric = TransmissionMetric(
                session_id=self.current_session_id,
                timestamp=timestamp,
                mission_time=mission_time,
                packets_generated=stats.get('totalGenerated', 0),
                packets_transmitted=stats.get('totalTransmitted', 0),
                packets_stored=stats.get('totalStored', 0),
                packets_forwarded=queue_stats.get('forwarded_packets', 0),
                packets_lost=stats.get('dataLost', 0),
                data_loss_percentage=stats.get('dataLossPercentage', 0.0),
                transmission_rate_pps=transmission_rate,
                buffer_utilization_percent=buffer_utilization,
                average_latency_ms=link_data.get('latency', 0.0),
                link_available=link_data.get('available', False),
                link_type=link_data.get('type'),
                link_name=link_data.get('name'),
                signal_strength=link_data.get('signalStrength', 0.0),
                link_latency_ms=link_data.get('latency', 0.0),
                satellite_lat=position.get('lat'),
                satellite_lng=position.get('lng'),
                satellite_altitude=position.get('altitude'),
                satellite_velocity=telemetry_data.get('velocity')
            )
            
            self.db_manager.record_transmission_metric(metric)
            
        except Exception as e:
            logger.error(f"Failed to record transmission metrics: {e}")
    
    async def _check_link_events(
        self,
        timestamp: datetime,
        mission_time: float,
        link_data: Dict,
        telemetry_data: Dict
    ):
        """Check for and record link events"""
        try:
            current_link_available = link_data.get('available', False)
            current_link_type = link_data.get('type', 'none')
            current_link_name = link_data.get('name', 'Unknown')
            
            # Check if link status changed
            if self.last_link_status is None:
                # First data point
                if current_link_available:
                    event_type = 'link_established'
                else:
                    # Don't record initial "no link" as an event
                    self.last_link_status = {
                        'available': current_link_available,
                        'type': current_link_type,
                        'name': current_link_name
                    }
                    return
            else:
                # Check for changes
                last_available = self.last_link_status.get('available', False)
                last_type = self.last_link_status.get('type', 'none')
                
                if current_link_available and not last_available:
                    event_type = 'link_established'
                elif not current_link_available and last_available:
                    event_type = 'link_lost'
                elif current_link_available and last_available and current_link_type != last_type:
                    event_type = 'link_changed'
                else:
                    # No significant change
                    self.last_link_status = {
                        'available': current_link_available,
                        'type': current_link_type,
                        'name': current_link_name
                    }
                    return
            
            # Record the link event
            position = telemetry_data.get('position', {})
            
            event = LinkEvent(
                session_id=self.current_session_id,
                timestamp=timestamp,
                mission_time=mission_time,
                event_type=event_type,
                link_type=current_link_type,
                link_name=current_link_name,
                signal_strength=link_data.get('signalStrength'),
                latency_ms=link_data.get('latency'),
                elevation_angle=link_data.get('elevationAngle'),
                distance_km=link_data.get('distanceKm'),
                link_margin_db=link_data.get('linkMarginDb'),
                frequency_band=link_data.get('frequencyBand'),
                data_rate_mbps=link_data.get('dataRateMbps'),
                satellite_lat=position.get('lat'),
                satellite_lng=position.get('lng'),
                satellite_altitude=position.get('altitude'),
                weather_quality=link_data.get('weatherQuality'),
                weather_attenuation_db=link_data.get('weatherAttenuationDb', 0.0),
                data_source=link_data.get('dataSource')
            )
            
            self.db_manager.record_link_event(event)
            
            logger.info(f"Link event: {event_type} - {current_link_type} ({current_link_name})")
            
            # Update last status
            self.last_link_status = {
                'available': current_link_available,
                'type': current_link_type,
                'name': current_link_name
            }
            
        except Exception as e:
            logger.error(f"Failed to check link events: {e}")
    
    def get_current_session_id(self) -> Optional[str]:
        """Get current session ID"""
        return self.current_session_id
    
    def is_collecting(self) -> bool:
        """Check if data collection is active"""
        return (self.collection_task is not None and 
                not self.collection_task.done() and 
                self.current_session_id is not None)

# Global data collector instance
data_collector = DataCollector()