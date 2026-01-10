"""
Historical Telemetry Replay Service
Enables replay of historical satellite telemetry for demos and testing

Time Complexity: O(n) where n = number of telemetry points
Space Complexity: O(m) where m = size of loaded dataset
"""

import json
import time
import asyncio
import logging
import math
import random
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
from enum import Enum

logger = logging.getLogger(__name__)


class ReplayMode(Enum):
    """Replay operation modes"""
    LIVE = "LIVE"        # Real-time simulation
    REPLAY = "REPLAY"    # Historical data replay
    PAUSED = "PAUSED"    # Replay paused


@dataclass
class HistoricalTelemetry:
    """Historical telemetry data point"""
    timestamp: float
    mission_time: float
    packet_id: str
    altitude: float
    velocity: float
    temperature: float
    fuel_level: float
    battery_level: float
    latitude: float
    longitude: float
    signal_strength: float
    orientation: Dict[str, float]  # pitch, yaw, roll
    link_status: Optional[Dict] = None
    source: str = "historical"
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for API responses"""
        return asdict(self)


@dataclass
class ReplaySession:
    """Replay session configuration"""
    session_id: str
    dataset_name: str
    start_time: float
    end_time: float
    current_time: float
    speed_multiplier: float  # 1.0 = real-time, 2.0 = 2x speed
    mode: ReplayMode
    loop_enabled: bool
    total_points: int
    current_index: int


class ReplayService:
    """
    Historical telemetry replay service
    
    Loads historical satellite data and replays it as a time-based stream
    Supports variable speed playback and looping for demonstrations
    """
    
    def __init__(self, data_directory: str = "./replay_data"):
        self.data_directory = Path(data_directory)
        self.data_directory.mkdir(exist_ok=True)
        
        self.datasets: Dict[str, List[HistoricalTelemetry]] = {}
        self.current_session: Optional[ReplaySession] = None
        self.replay_task: Optional[asyncio.Task] = None
        
        # Create sample datasets if none exist
        self._ensure_sample_datasets()
    
    def _ensure_sample_datasets(self):
        """Create sample historical datasets for demo purposes"""
        sample_files = [
            "iss_pass_2024_01_15.json",
            "sentinel_1a_orbit_2024_01_20.json",
            "galileo_constellation_2024_01_25.json"
        ]
        
        for filename in sample_files:
            filepath = self.data_directory / filename
            if not filepath.exists():
                self._generate_sample_dataset(filepath)
    
    def _generate_sample_dataset(self, filepath: Path):
        """Generate a sample historical dataset"""
        dataset_name = filepath.stem
        
        # Generate 2 hours of telemetry data (7200 seconds)
        duration = 7200  # 2 hours
        interval = 5     # 5 second intervals
        points = []
        
        start_timestamp = time.time() - 86400  # 24 hours ago
        
        for i in range(0, duration, interval):
            mission_time = i
            timestamp = start_timestamp + i
            
            # Generate realistic orbital data based on dataset type
            if "iss" in dataset_name.lower():
                # ISS-like Low Earth Orbit
                orbital_period = 90 * 60  # 90 minutes
                angle = (mission_time / orbital_period) * 2 * 3.14159
                
                altitude = 408 + 15 * math.sin(angle * 3)
                velocity = 7.66 + 0.1 * math.cos(angle * 2)
                latitude = 51.6 * math.sin(angle)
                longitude = ((mission_time / orbital_period) * 360 - 180) % 360
                if longitude > 180:
                    longitude -= 360
                
                temperature = -20 + 40 * (math.sin(angle) + 1) / 2
                fuel_level = 95 - (mission_time / duration) * 10
                battery_level = 85 + 10 * math.sin(angle * 8)
                
            elif "sentinel" in dataset_name.lower():
                # Sentinel-1 Sun-synchronous orbit
                orbital_period = 98.6 * 60  # 98.6 minutes
                angle = (mission_time / orbital_period) * 2 * 3.14159
                
                altitude = 693 + 5 * math.sin(angle * 2)
                velocity = 7.45 + 0.05 * math.cos(angle)
                latitude = 98.2 * math.sin(angle) / 2  # Sun-synchronous inclination
                longitude = ((mission_time / orbital_period) * 360 - 180) % 360
                if longitude > 180:
                    longitude -= 360
                
                temperature = -30 + 20 * (math.sin(angle) + 1) / 2
                fuel_level = 88 - (mission_time / duration) * 5
                battery_level = 90 + 8 * math.sin(angle * 12)
                
            else:  # Galileo constellation
                # Medium Earth Orbit
                orbital_period = 14 * 3600  # 14 hours
                angle = (mission_time / orbital_period) * 2 * 3.14159
                
                altitude = 23222 + 100 * math.sin(angle)
                velocity = 3.87 + 0.02 * math.cos(angle)
                latitude = 56 * math.sin(angle)  # Galileo inclination
                longitude = ((mission_time / orbital_period) * 360 - 180) % 360
                if longitude > 180:
                    longitude -= 360
                
                temperature = -40 + 30 * (math.sin(angle) + 1) / 2
                fuel_level = 92 - (mission_time / duration) * 3
                battery_level = 95 + 5 * math.sin(angle * 6)
            
            # Common parameters
            signal_strength = 75 + 20 * math.sin(angle * 4) + 5 * (random.random() - 0.5)
            
            point = HistoricalTelemetry(
                timestamp=timestamp,
                mission_time=mission_time,
                packet_id=f"{dataset_name}_{i//interval:04d}",
                altitude=altitude,
                velocity=velocity,
                temperature=temperature,
                fuel_level=max(0, fuel_level),
                battery_level=max(0, min(100, battery_level)),
                latitude=latitude,
                longitude=longitude,
                signal_strength=max(0, min(100, signal_strength)),
                orientation={
                    "pitch": 10 * math.sin(angle * 2),
                    "yaw": 5 * math.cos(angle * 3),
                    "roll": 2 * math.sin(angle * 5)
                },
                source="historical"
            )
            
            points.append(point.to_dict())
        
        # Save to file
        with open(filepath, 'w') as f:
            json.dump({
                "dataset_name": dataset_name,
                "description": f"Historical telemetry for {dataset_name}",
                "start_time": start_timestamp,
                "end_time": start_timestamp + duration,
                "total_points": len(points),
                "interval_seconds": interval,
                "telemetry": points
            }, f, indent=2)
        
        logger.info(f"Generated sample dataset: {filepath} ({len(points)} points)")
    
    async def load_dataset(self, dataset_name: str) -> bool:
        """
        Load historical dataset from file
        
        Args:
            dataset_name: Name of dataset to load
            
        Returns:
            True if loaded successfully
        """
        try:
            # Look for dataset file
            possible_files = [
                self.data_directory / f"{dataset_name}.json",
                self.data_directory / f"{dataset_name}_telemetry.json",
            ]
            
            dataset_file = None
            for filepath in possible_files:
                if filepath.exists():
                    dataset_file = filepath
                    break
            
            if not dataset_file:
                logger.error(f"Dataset not found: {dataset_name}")
                return False
            
            # Load and parse dataset
            with open(dataset_file, 'r') as f:
                data = json.load(f)
            
            # Convert to HistoricalTelemetry objects
            telemetry_points = []
            for point_data in data.get("telemetry", []):
                point = HistoricalTelemetry(**point_data)
                telemetry_points.append(point)
            
            # Sort by timestamp
            telemetry_points.sort(key=lambda x: x.timestamp)
            
            self.datasets[dataset_name] = telemetry_points
            logger.info(f"Loaded dataset '{dataset_name}': {len(telemetry_points)} points")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to load dataset '{dataset_name}': {e}")
            return False
    
    def list_available_datasets(self) -> List[Dict[str, Any]]:
        """
        List all available datasets
        
        Returns:
            List of dataset information
        """
        datasets = []
        
        # Scan data directory
        for filepath in self.data_directory.glob("*.json"):
            try:
                with open(filepath, 'r') as f:
                    data = json.load(f)
                
                dataset_info = {
                    "name": filepath.stem,
                    "description": data.get("description", "Historical telemetry dataset"),
                    "start_time": data.get("start_time", 0),
                    "end_time": data.get("end_time", 0),
                    "total_points": data.get("total_points", 0),
                    "interval_seconds": data.get("interval_seconds", 5),
                    "loaded": filepath.stem in self.datasets
                }
                
                datasets.append(dataset_info)
                
            except Exception as e:
                logger.warning(f"Failed to read dataset info from {filepath}: {e}")
        
        return sorted(datasets, key=lambda x: x["name"])
    
    async def start_replay(
        self,
        dataset_name: str,
        speed_multiplier: float = 1.0,
        loop_enabled: bool = False,
        start_offset: float = 0.0
    ) -> bool:
        """
        Start replaying historical dataset
        
        Args:
            dataset_name: Dataset to replay
            speed_multiplier: Playback speed (1.0 = real-time)
            loop_enabled: Whether to loop when reaching end
            start_offset: Start offset in seconds
            
        Returns:
            True if replay started successfully
        """
        # Load dataset if not already loaded
        if dataset_name not in self.datasets:
            if not await self.load_dataset(dataset_name):
                return False
        
        dataset = self.datasets[dataset_name]
        if not dataset:
            logger.error(f"Empty dataset: {dataset_name}")
            return False
        
        # Stop any existing replay
        await self.stop_replay()
        
        # Create replay session
        start_time = dataset[0].timestamp + start_offset
        end_time = dataset[-1].timestamp
        
        self.current_session = ReplaySession(
            session_id=f"replay_{int(time.time())}",
            dataset_name=dataset_name,
            start_time=start_time,
            end_time=end_time,
            current_time=start_time,
            speed_multiplier=speed_multiplier,
            mode=ReplayMode.REPLAY,
            loop_enabled=loop_enabled,
            total_points=len(dataset),
            current_index=0
        )
        
        # Start replay task
        self.replay_task = asyncio.create_task(self._replay_loop())
        
        logger.info(f"Started replay: {dataset_name} at {speed_multiplier}x speed")
        return True
    
    async def _replay_loop(self):
        """Internal replay loop"""
        if not self.current_session:
            return
        
        session = self.current_session
        dataset = self.datasets[session.dataset_name]
        
        try:
            while session.mode == ReplayMode.REPLAY:
                # Find current telemetry point
                current_point = None
                
                for i in range(session.current_index, len(dataset)):
                    point = dataset[i]
                    if point.timestamp <= session.current_time:
                        current_point = point
                        session.current_index = i
                    else:
                        break
                
                # Check if we've reached the end
                if session.current_time >= session.end_time:
                    if session.loop_enabled:
                        # Loop back to start
                        session.current_time = session.start_time
                        session.current_index = 0
                        logger.info(f"Replay loop: restarting {session.dataset_name}")
                    else:
                        # End replay
                        session.mode = ReplayMode.PAUSED
                        logger.info(f"Replay completed: {session.dataset_name}")
                        break
                
                # Advance time
                time_step = 1.0 / session.speed_multiplier  # Real seconds per simulation second
                session.current_time += 1.0  # Advance by 1 simulation second
                
                # Sleep for appropriate real time
                await asyncio.sleep(time_step)
                
        except asyncio.CancelledError:
            logger.info("Replay loop cancelled")
        except Exception as e:
            logger.error(f"Replay loop error: {e}")
            if self.current_session:
                self.current_session.mode = ReplayMode.PAUSED
    
    async def stop_replay(self):
        """Stop current replay session"""
        if self.replay_task and not self.replay_task.done():
            self.replay_task.cancel()
            try:
                await self.replay_task
            except asyncio.CancelledError:
                pass
        
        if self.current_session:
            self.current_session.mode = ReplayMode.PAUSED
            logger.info(f"Stopped replay: {self.current_session.dataset_name}")
    
    async def pause_replay(self):
        """Pause current replay"""
        if self.current_session and self.current_session.mode == ReplayMode.REPLAY:
            self.current_session.mode = ReplayMode.PAUSED
            logger.info("Replay paused")
    
    async def resume_replay(self):
        """Resume paused replay"""
        if self.current_session and self.current_session.mode == ReplayMode.PAUSED:
            self.current_session.mode = ReplayMode.REPLAY
            if not self.replay_task or self.replay_task.done():
                self.replay_task = asyncio.create_task(self._replay_loop())
            logger.info("Replay resumed")
    
    def get_current_telemetry(self) -> Optional[Dict]:
        """
        Get current telemetry point from replay
        
        Returns:
            Current telemetry dict or None
        """
        if not self.current_session or self.current_session.mode == ReplayMode.LIVE:
            return None
        
        session = self.current_session
        dataset = self.datasets.get(session.dataset_name, [])
        
        if not dataset or session.current_index >= len(dataset):
            return None
        
        # Find the telemetry point closest to current time
        best_point = None
        min_time_diff = float('inf')
        
        for i in range(max(0, session.current_index - 10), 
                      min(len(dataset), session.current_index + 10)):
            point = dataset[i]
            time_diff = abs(point.timestamp - session.current_time)
            if time_diff < min_time_diff:
                min_time_diff = time_diff
                best_point = point
        
        return best_point.to_dict() if best_point else None
    
    def get_replay_status(self) -> Dict:
        """Get current replay session status"""
        if not self.current_session:
            return {
                "mode": ReplayMode.LIVE.value,
                "active": False
            }
        
        session = self.current_session
        progress = 0.0
        
        if session.end_time > session.start_time:
            progress = (session.current_time - session.start_time) / (session.end_time - session.start_time)
            progress = max(0.0, min(1.0, progress))
        
        return {
            "mode": session.mode.value,
            "active": session.mode == ReplayMode.REPLAY,
            "dataset_name": session.dataset_name,
            "current_time": session.current_time,
            "start_time": session.start_time,
            "end_time": session.end_time,
            "progress": progress,
            "speed_multiplier": session.speed_multiplier,
            "loop_enabled": session.loop_enabled,
            "current_index": session.current_index,
            "total_points": session.total_points
        }
    
    async def set_replay_speed(self, speed_multiplier: float):
        """Change replay speed"""
        if self.current_session:
            self.current_session.speed_multiplier = max(0.1, min(10.0, speed_multiplier))
            logger.info(f"Replay speed changed to {self.current_session.speed_multiplier}x")
    
    async def seek_to_time(self, target_time: float):
        """Seek to specific time in replay"""
        if not self.current_session:
            return
        
        session = self.current_session
        dataset = self.datasets.get(session.dataset_name, [])
        
        # Clamp to valid range
        target_time = max(session.start_time, min(session.end_time, target_time))
        session.current_time = target_time
        
        # Find corresponding index
        for i, point in enumerate(dataset):
            if point.timestamp >= target_time:
                session.current_index = max(0, i - 1)
                break
        
        logger.info(f"Seeked to time {target_time} (index {session.current_index})")


# Global service instance
replay_service = ReplayService()