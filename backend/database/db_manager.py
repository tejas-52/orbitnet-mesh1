"""
ORBITNET-MESH Database Manager
Handles all database operations for testing data storage and analytics
"""

import sqlite3
import json
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path
import logging
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

@dataclass
class TestSession:
    session_id: str
    test_name: str
    test_type: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    orbitnet_enabled: bool = True
    test_description: Optional[str] = None
    test_parameters: Optional[Dict] = None
    status: str = 'running'

@dataclass
class TransmissionMetric:
    session_id: str
    timestamp: datetime
    mission_time: float
    packets_generated: int = 0
    packets_transmitted: int = 0
    packets_stored: int = 0
    packets_forwarded: int = 0
    packets_lost: int = 0
    data_loss_percentage: float = 0.0
    transmission_rate_pps: float = 0.0
    buffer_utilization_percent: float = 0.0
    average_latency_ms: float = 0.0
    link_available: bool = False
    link_type: Optional[str] = None
    link_name: Optional[str] = None
    signal_strength: float = 0.0
    link_latency_ms: float = 0.0
    satellite_lat: Optional[float] = None
    satellite_lng: Optional[float] = None
    satellite_altitude: Optional[float] = None
    satellite_velocity: Optional[float] = None

@dataclass
class LinkEvent:
    session_id: str
    timestamp: datetime
    mission_time: float
    event_type: str
    link_type: str
    link_name: str
    signal_strength: Optional[float] = None
    latency_ms: Optional[float] = None
    elevation_angle: Optional[float] = None
    distance_km: Optional[float] = None
    link_margin_db: Optional[float] = None
    frequency_band: Optional[str] = None
    data_rate_mbps: Optional[float] = None
    satellite_lat: Optional[float] = None
    satellite_lng: Optional[float] = None
    satellite_altitude: Optional[float] = None
    weather_quality: Optional[str] = None
    weather_attenuation_db: float = 0.0
    data_source: Optional[str] = None

class DatabaseManager:
    """
    Comprehensive database manager for ORBITNET-MESH testing data
    """
    
    def __init__(self, db_path: str = "testing_data.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize database
        self._init_database()
        
        logger.info(f"Database manager initialized: {self.db_path}")
    
    def _init_database(self):
        """Initialize database with schema"""
        try:
            # Read schema file
            schema_path = Path(__file__).parent / "schema.sql"
            if schema_path.exists():
                with open(schema_path, 'r') as f:
                    schema_sql = f.read()
            else:
                # Fallback minimal schema
                schema_sql = self._get_minimal_schema()
            
            # Execute schema
            with sqlite3.connect(self.db_path) as conn:
                conn.executescript(schema_sql)
                conn.commit()
            
            logger.info("Database schema initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    def _get_minimal_schema(self) -> str:
        """Minimal schema if schema.sql not found"""
        return """
        CREATE TABLE IF NOT EXISTS test_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            test_name TEXT NOT NULL,
            test_type TEXT NOT NULL,
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP,
            duration_seconds INTEGER,
            orbitnet_enabled BOOLEAN NOT NULL DEFAULT TRUE,
            status TEXT DEFAULT 'running',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS transmission_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            timestamp TIMESTAMP NOT NULL,
            mission_time REAL NOT NULL,
            packets_generated INTEGER NOT NULL DEFAULT 0,
            packets_transmitted INTEGER NOT NULL DEFAULT 0,
            packets_stored INTEGER NOT NULL DEFAULT 0,
            data_loss_percentage REAL NOT NULL DEFAULT 0.0,
            link_available BOOLEAN NOT NULL DEFAULT FALSE,
            link_type TEXT,
            signal_strength REAL DEFAULT 0.0,
            satellite_lat REAL,
            satellite_lng REAL,
            FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
        );
        """
    
    def create_test_session(
        self,
        test_name: str,
        test_type: str = 'manual',
        test_description: Optional[str] = None,
        test_parameters: Optional[Dict] = None,
        orbitnet_enabled: bool = True
    ) -> str:
        """
        Create a new test session
        
        Returns:
            session_id: Unique session identifier
        """
        session_id = f"test_{int(time.time())}_{uuid.uuid4().hex[:8]}"
        
        session = TestSession(
            session_id=session_id,
            test_name=test_name,
            test_type=test_type,
            start_time=datetime.now(timezone.utc),
            test_description=test_description,
            test_parameters=test_parameters,
            orbitnet_enabled=orbitnet_enabled
        )
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO test_sessions 
                    (session_id, test_name, test_type, start_time, test_description, 
                     test_parameters, orbitnet_enabled, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    session.session_id,
                    session.test_name,
                    session.test_type,
                    session.start_time.isoformat(),
                    session.test_description,
                    json.dumps(session.test_parameters) if session.test_parameters else None,
                    session.orbitnet_enabled,
                    session.status
                ))
                conn.commit()
            
            logger.info(f"Created test session: {session_id}")
            return session_id
            
        except Exception as e:
            logger.error(f"Failed to create test session: {e}")
            raise
    
    def end_test_session(self, session_id: str, status: str = 'completed'):
        """End a test session and calculate summary metrics"""
        try:
            end_time = datetime.now(timezone.utc)
            
            with sqlite3.connect(self.db_path) as conn:
                # Get session start time
                cursor = conn.execute(
                    "SELECT start_time FROM test_sessions WHERE session_id = ?",
                    (session_id,)
                )
                row = cursor.fetchone()
                if not row:
                    raise ValueError(f"Session not found: {session_id}")
                
                start_time = datetime.fromisoformat(row[0])
                duration_seconds = int((end_time - start_time).total_seconds())
                
                # Update session
                conn.execute("""
                    UPDATE test_sessions 
                    SET end_time = ?, duration_seconds = ?, status = ?
                    WHERE session_id = ?
                """, (end_time.isoformat(), duration_seconds, status, session_id))
                
                # Generate test results summary
                self._generate_test_results(conn, session_id)
                
                conn.commit()
            
            logger.info(f"Ended test session: {session_id} ({duration_seconds}s)")
            
        except Exception as e:
            logger.error(f"Failed to end test session {session_id}: {e}")
            raise
    
    def record_transmission_metric(self, metric: TransmissionMetric):
        """Record a transmission metric data point"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO transmission_metrics 
                    (session_id, timestamp, mission_time, packets_generated, 
                     packets_transmitted, packets_stored, packets_forwarded, 
                     packets_lost, data_loss_percentage, transmission_rate_pps,
                     buffer_utilization_percent, average_latency_ms, link_available,
                     link_type, link_name, signal_strength, link_latency_ms,
                     satellite_lat, satellite_lng, satellite_altitude, satellite_velocity)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    metric.session_id,
                    metric.timestamp.isoformat(),
                    metric.mission_time,
                    metric.packets_generated,
                    metric.packets_transmitted,
                    metric.packets_stored,
                    metric.packets_forwarded,
                    metric.packets_lost,
                    metric.data_loss_percentage,
                    metric.transmission_rate_pps,
                    metric.buffer_utilization_percent,
                    metric.average_latency_ms,
                    metric.link_available,
                    metric.link_type,
                    metric.link_name,
                    metric.signal_strength,
                    metric.link_latency_ms,
                    metric.satellite_lat,
                    metric.satellite_lng,
                    metric.satellite_altitude,
                    metric.satellite_velocity
                ))
                conn.commit()
                
        except Exception as e:
            logger.error(f"Failed to record transmission metric: {e}")
    
    def record_link_event(self, event: LinkEvent):
        """Record a link establishment/loss event"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO link_events 
                    (session_id, timestamp, mission_time, event_type, link_type, 
                     link_name, signal_strength, latency_ms, elevation_angle,
                     distance_km, link_margin_db, frequency_band, data_rate_mbps,
                     satellite_lat, satellite_lng, satellite_altitude,
                     weather_quality, weather_attenuation_db, data_source)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    event.session_id,
                    event.timestamp.isoformat(),
                    event.mission_time,
                    event.event_type,
                    event.link_type,
                    event.link_name,
                    event.signal_strength,
                    event.latency_ms,
                    event.elevation_angle,
                    event.distance_km,
                    event.link_margin_db,
                    event.frequency_band,
                    event.data_rate_mbps,
                    event.satellite_lat,
                    event.satellite_lng,
                    event.satellite_altitude,
                    event.weather_quality,
                    event.weather_attenuation_db,
                    event.data_source
                ))
                conn.commit()
                
        except Exception as e:
            logger.error(f"Failed to record link event: {e}")
    
    def _generate_test_results(self, conn: sqlite3.Connection, session_id: str):
        """Generate comprehensive test results summary"""
        try:
            # Get metrics summary
            cursor = conn.execute("""
                SELECT 
                    COUNT(*) as total_records,
                    MAX(packets_generated) as total_packets_generated,
                    MAX(packets_transmitted) as total_packets_transmitted,
                    MAX(packets_stored) as total_packets_stored,
                    AVG(data_loss_percentage) as avg_data_loss_percentage,
                    AVG(CASE WHEN link_available THEN signal_strength END) as avg_signal_strength,
                    AVG(CASE WHEN link_available THEN link_latency_ms END) as avg_link_latency,
                    SUM(CASE WHEN link_available THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as link_availability_percentage
                FROM transmission_metrics 
                WHERE session_id = ?
            """, (session_id,))
            
            metrics_row = cursor.fetchone()
            
            # Get link events summary
            cursor = conn.execute("""
                SELECT COUNT(*) as total_link_events
                FROM link_events 
                WHERE session_id = ?
            """, (session_id,))
            
            link_events_row = cursor.fetchone()
            
            # Calculate test score (0-100)
            if metrics_row and metrics_row[1]:  # Has data
                data_loss = metrics_row[4] or 0
                link_availability = metrics_row[7] or 0
                
                # Score based on data loss (50%) and link availability (50%)
                test_score = (100 - data_loss) * 0.5 + link_availability * 0.5
                test_passed = data_loss < 1.0  # Pass if less than 1% data loss
            else:
                test_score = 0
                test_passed = False
            
            # Insert test results
            conn.execute("""
                INSERT INTO test_results 
                (session_id, total_packets_generated, total_packets_transmitted,
                 total_packets_stored, overall_data_loss_percentage, 
                 total_link_events, average_signal_strength, average_link_latency_ms,
                 link_availability_percentage, test_passed, test_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                session_id,
                metrics_row[1] if metrics_row else 0,
                metrics_row[2] if metrics_row else 0,
                metrics_row[3] if metrics_row else 0,
                metrics_row[4] if metrics_row else 0,
                link_events_row[0] if link_events_row else 0,
                metrics_row[5] if metrics_row else 0,
                metrics_row[6] if metrics_row else 0,
                metrics_row[7] if metrics_row else 0,
                test_passed,
                test_score
            ))
            
        except Exception as e:
            logger.error(f"Failed to generate test results for {session_id}: {e}")
    
    def get_session_summary(self, session_id: str) -> Optional[Dict]:
        """Get comprehensive session summary"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                cursor = conn.execute("""
                    SELECT * FROM session_summary WHERE session_id = ?
                """, (session_id,))
                
                row = cursor.fetchone()
                return dict(row) if row else None
                
        except Exception as e:
            logger.error(f"Failed to get session summary for {session_id}: {e}")
            return None
    
    def get_all_sessions(self) -> List[Dict]:
        """Get all test sessions"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                cursor = conn.execute("""
                    SELECT * FROM session_summary 
                    ORDER BY start_time DESC
                """)
                
                return [dict(row) for row in cursor.fetchall()]
                
        except Exception as e:
            logger.error(f"Failed to get all sessions: {e}")
            return []
    
    def get_transmission_history(self, session_id: str) -> List[Dict]:
        """Get transmission metrics history for a session"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                cursor = conn.execute("""
                    SELECT * FROM transmission_metrics 
                    WHERE session_id = ?
                    ORDER BY timestamp
                """, (session_id,))
                
                return [dict(row) for row in cursor.fetchall()]
                
        except Exception as e:
            logger.error(f"Failed to get transmission history for {session_id}: {e}")
            return []
    
    def get_link_events(self, session_id: str) -> List[Dict]:
        """Get link events for a session"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                cursor = conn.execute("""
                    SELECT * FROM link_events 
                    WHERE session_id = ?
                    ORDER BY timestamp
                """, (session_id,))
                
                return [dict(row) for row in cursor.fetchall()]
                
        except Exception as e:
            logger.error(f"Failed to get link events for {session_id}: {e}")
            return []
    
    def export_session_data(self, session_id: str, format: str = 'json') -> str:
        """Export complete session data"""
        try:
            data = {
                'session': self.get_session_summary(session_id),
                'transmission_metrics': self.get_transmission_history(session_id),
                'link_events': self.get_link_events(session_id)
            }
            
            if format.lower() == 'json':
                return json.dumps(data, indent=2, default=str)
            else:
                raise ValueError(f"Unsupported format: {format}")
                
        except Exception as e:
            logger.error(f"Failed to export session data for {session_id}: {e}")
            raise

# Global database manager instance
db_manager = DatabaseManager()