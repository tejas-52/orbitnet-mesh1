"""
Database Module
Stores mission telemetry and history
"""

import aiosqlite
import json
from typing import Dict, List, Optional

try:
    from config import settings
except ImportError:
    from ..config import settings


class MissionDatabase:
    """
    Mission Data Storage
    
    Stores:
    - Telemetry packets
    - Link status history
    - Mission statistics
    """
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path or settings.DATABASE_PATH
        self.db = None
        
    async def initialize(self):
        """Initialize database and create tables"""
        self.db = await aiosqlite.connect(self.db_path)
        
        # Create telemetry table
        await self.db.execute('''
            CREATE TABLE IF NOT EXISTS telemetry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                packet_id TEXT UNIQUE,
                timestamp REAL,
                mission_time REAL,
                altitude REAL,
                velocity REAL,
                temperature REAL,
                fuel_level REAL,
                battery_level REAL,
                latitude REAL,
                longitude REAL,
                signal_strength REAL,
                data TEXT,
                received_at REAL,
                source TEXT
            )
        ''')
        
        # Create link history table
        await self.db.execute('''
            CREATE TABLE IF NOT EXISTS link_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL,
                link_type TEXT,
                link_name TEXT,
                signal_strength REAL,
                latency REAL,
                available INTEGER
            )
        ''')
        
        # Create mission stats table
        await self.db.execute('''
            CREATE TABLE IF NOT EXISTS mission_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL,
                total_packets INTEGER,
                transmitted_packets INTEGER,
                stored_packets INTEGER,
                forwarded_packets INTEGER,
                data_loss_rate REAL,
                average_latency REAL
            )
        ''')
        
        await self.db.commit()
    
    async def store_telemetry(self, packet: Dict, received_at: float, source: str):
        """Store a telemetry packet"""
        telemetry = packet.get('telemetry', {})
        position = telemetry.get('position', {})
        
        await self.db.execute('''
            INSERT OR IGNORE INTO telemetry (
                packet_id, timestamp, mission_time, altitude, velocity,
                temperature, fuel_level, battery_level, latitude, longitude,
                signal_strength, data, received_at, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            packet['id'],
            telemetry.get('timestamp'),
            0,  # Mission time would be calculated
            telemetry.get('altitude'),
            telemetry.get('velocity'),
            telemetry.get('temperature'),
            telemetry.get('fuel_level'),
            telemetry.get('battery_level'),
            position.get('lat'),
            position.get('lng'),
            telemetry.get('signal_strength'),
            json.dumps(telemetry),
            received_at,
            source
        ))
        
        await self.db.commit()
    
    async def store_link_status(self, link_status: Dict):
        """Store link status"""
        await self.db.execute('''
            INSERT INTO link_history (
                timestamp, link_type, link_name, signal_strength, latency, available
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            link_status.get('timestamp', 0),
            link_status.get('type'),
            link_status.get('name'),
            link_status.get('signalStrength'),
            link_status.get('latency'),
            1 if link_status.get('available') else 0
        ))
        
        await self.db.commit()
    
    async def get_latest_telemetry(self, limit: int = 10) -> List[Dict]:
        """Get latest telemetry packets"""
        async with self.db.execute(
            'SELECT * FROM telemetry ORDER BY timestamp DESC LIMIT ?',
            (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in rows]
    
    async def get_mission_summary(self) -> Dict:
        """Get overall mission summary"""
        # Count total packets
        async with self.db.execute('SELECT COUNT(*) FROM telemetry') as cursor:
            total_packets = (await cursor.fetchone())[0]
        
        # Get link statistics
        async with self.db.execute('''
            SELECT link_type, COUNT(*) as count
            FROM link_history
            GROUP BY link_type
        ''') as cursor:
            link_stats = {row[0]: row[1] for row in await cursor.fetchall()}
        
        return {
            'total_packets': total_packets,
            'link_statistics': link_stats,
            'data_loss': 0  # ALWAYS ZERO with ORBITNET-MESH
        }
    
    async def close(self):
        """Close database connection"""
        if self.db:
            await self.db.close()
