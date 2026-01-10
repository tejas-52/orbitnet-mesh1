"""
Simple ORBITNET-MESH Backend Server
Standalone version without package imports
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
import asyncio
from typing import Dict, Optional
from dataclasses import dataclass, asdict, field
import math
import random
from collections import deque
import aiosqlite
import json

# Optional Firebase import
try:
    from firebase_manager import firebase_manager
    FIREBASE_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Firebase not available: {e}")
    firebase_manager = None
    FIREBASE_AVAILABLE = False

# Import enhanced LinkSelector
try:
    from onboard.link_selector import LinkSelector
except ImportError:
    # Fallback to simple implementation if import fails
    LinkSelector = None

# Import database endpoints
try:
    from database.api_endpoints import router as db_router
    DATABASE_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Database endpoints not available: {e}")
    db_router = None
    DATABASE_AVAILABLE = False

# ============ CONFIGURATION ============
API_HOST = "0.0.0.0"
API_PORT = 8000
CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"]
DATABASE_PATH = "./mission_data.db"

GROUND_STATIONS = [
    {"id": "gs-1", "name": "ESTRACK Kourou", "lat": 5.2, "lng": -52.8, "coverage": 15},
    {"id": "gs-2", "name": "ESTRACK Kiruna", "lat": 67.9, "lng": 20.9, "coverage": 12},
    {"id": "gs-3", "name": "ESTRACK New Norcia", "lat": -31.0, "lng": 116.2, "coverage": 18},
    {"id": "gs-4", "name": "ESTRACK Cebreros", "lat": 40.5, "lng": -4.4, "coverage": 15},
    {"id": "gs-5", "name": "ESTRACK Malargüe", "lat": -35.8, "lng": -69.4, "coverage": 18},
]

RELAY_SATELLITES = [
    {"id": "sat-1", "name": "EDRS-A", "constellation": "EDRS", "orbitType": "GEO", "minLat": -75, "maxLat": 75},
    {"id": "sat-2", "name": "EDRS-C", "constellation": "EDRS", "orbitType": "GEO", "minLat": -75, "maxLat": 75},
    {"id": "sat-3", "name": "Artemis", "constellation": "ESA", "orbitType": "GEO", "minLat": -70, "maxLat": 70},
    {"id": "sat-4", "name": "TDRS-M", "constellation": "NASA", "orbitType": "GEO", "minLat": -80, "maxLat": 80},
]

# ============ DATA CLASSES ============
@dataclass
class TelemetryData:
    timestamp: float
    packet_id: str
    altitude: float
    velocity: float
    temperature: float
    fuel_level: float
    battery_level: float
    orientation: Dict
    position: Dict
    signal_strength: float

@dataclass
class DataPacket:
    id: str
    timestamp: float
    telemetry: Dict
    status: str
    retries: int = 0
    stored_at: Optional[float] = None
    transmitted_at: Optional[float] = None

# ============ TELEMETRY GENERATOR ============
class TelemetryGenerator:
    def __init__(self):
        self.start_time = time.time()
        self.packet_count = 0
        
    def generate(self, mission_time: float) -> TelemetryData:
        self.packet_count += 1
        altitude = 400 + math.sin(mission_time * 0.01) * 50 + random.uniform(0, 5)
        velocity = 7.66 + math.sin(mission_time * 0.02) * 0.1 + random.uniform(0, 0.05)
        
        orbital_period = 90 * 60
        angle = (mission_time / orbital_period) * 2 * math.pi
        lat = math.sin(angle) * 51.6
        lng = ((mission_time / orbital_period) * 360 - 180) % 360
        if lng > 180:
            lng -= 360
            
        packet_id = f"PKT-{int(time.time() * 1000):X}-{self.packet_count:04d}"
        
        return TelemetryData(
            timestamp=time.time(),
            packet_id=packet_id,
            altitude=altitude,
            velocity=velocity,
            temperature=20 + math.sin(mission_time * 0.005) * 30 + random.uniform(0, 2),
            fuel_level=max(0, 100 - mission_time * 0.001),
            battery_level=85 + math.sin(mission_time * 0.003) * 10,
            orientation={
                'pitch': math.sin(mission_time * 0.01) * 5,
                'yaw': math.cos(mission_time * 0.008) * 3,
                'roll': math.sin(mission_time * 0.012) * 2
            },
            position={'lat': lat, 'lng': lng, 'altitude': altitude},
            signal_strength=70 + random.uniform(0, 25)
        )

# ============ FALLBACK LINK SELECTOR ============
class SimpleLinkSelector:
    """Fallback simple link selector if enhanced version fails to import"""
    def __init__(self):
        pass
        
    async def select_link(self, position: Dict, mission_time: float) -> Dict:
        lat, lng = position['lat'], position['lng']
        
        # Check ground coverage
        for gs in GROUND_STATIONS:
            distance = self._calculate_distance(lat, lng, gs['lat'], gs['lng'])
            if distance < gs['coverage'] * 111:
                return {
                    'type': 'ground',
                    'name': gs['name'],
                    'signalStrength': max(50, 100 - distance / 10),
                    'latency': 20 + (distance / 299792),
                    'available': True
                }
        
        # Check blackout
        if math.sin(mission_time * 0.0003) > 0.7:
            return {'type': 'none', 'name': 'BLACKOUT', 'signalStrength': 0, 'latency': float('inf'), 'available': False}
        
        # Check satellite
        for sat in RELAY_SATELLITES:
            if sat['minLat'] <= lat <= sat['maxLat']:
                return {
                    'type': 'satellite',
                    'name': sat['name'],
                    'signalStrength': 60 + random.uniform(0, 30),
                    'latency': 250 + random.uniform(0, 100),
                    'available': True
                }
        
        return {'type': 'none', 'name': 'NO LINK', 'signalStrength': 0, 'latency': float('inf'), 'available': False}
    
    def _calculate_distance(self, lat1, lng1, lat2, lng2):
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c
    
    def get_service_status(self):
        return {"type": "simple", "enhanced_features": False}

# ============ STORE-AND-FORWARD QUEUE ============
class StoreAndForwardQueue:
    def __init__(self, max_size=1000):
        self.queue = deque(maxlen=max_size)
        self.transmitted = []
        
    async def store(self, telemetry: Dict) -> DataPacket:
        packet = DataPacket(
            id=telemetry['packet_id'],
            timestamp=telemetry['timestamp'],
            telemetry=telemetry,
            status='stored',
            stored_at=time.time()
        )
        self.queue.append(packet)
        return packet
    
    async def forward_stored(self):
        forwarded = []
        for packet in list(self.queue):
            if packet.status == 'stored':
                packet.status = 'forwarded'
                packet.retries += 1
                packet.transmitted_at = time.time()
                forwarded.append(packet)
                self.transmitted.append(packet)
        
        self.queue = deque([p for p in self.queue if p.status == 'stored'], maxlen=1000)
        return forwarded
    
    async def transmit_direct(self, telemetry: Dict) -> DataPacket:
        packet = DataPacket(
            id=telemetry['packet_id'],
            timestamp=telemetry['timestamp'],
            telemetry=telemetry,
            status='transmitted',
            transmitted_at=time.time()
        )
        self.transmitted.append(packet)
        return packet
    
    def get_stored_packets(self):
        return [p for p in self.queue if p.status == 'stored']
    
    def get_stats(self):
        return {
            'total_packets': len(self.queue) + len(self.transmitted),
            'stored_packets': len([p for p in self.queue if p.status == 'stored']),
            'transmitted_packets': len(self.transmitted),
            'forwarded_packets': len([p for p in self.transmitted if p.status == 'forwarded']),
            'data_loss': 0
        }
    
    def clear(self):
        self.queue.clear()
        self.transmitted.clear()

# ============ MISSION STATE ============
class MissionState:
    def __init__(self):
        self.is_running = False
        self.mission_time = 0.0
        self.start_time = 0.0
        self.orbitnet_enabled = True
        self.telemetry_gen = TelemetryGenerator()
        
        # Use enhanced LinkSelector if available, otherwise fallback to simple
        if LinkSelector:
            self.link_selector = LinkSelector()
        else:
            self.link_selector = SimpleLinkSelector()
            
        self.store_forward = StoreAndForwardQueue()
        self.current_telemetry = None
        self.current_link = None
        self.link_history = []
        self.simulation_task = None

mission_state = MissionState()

# ============ SIMULATION LOOP ============
async def simulation_loop():
    while mission_state.is_running:
        try:
            mission_state.mission_time = time.time() - mission_state.start_time
            
            # Generate telemetry
            telemetry = mission_state.telemetry_gen.generate(mission_state.mission_time)
            mission_state.current_telemetry = asdict(telemetry)
            
            # Select link
            if hasattr(mission_state.link_selector.select_link, '__call__'):
                # Check if it's async
                if asyncio.iscoroutinefunction(mission_state.link_selector.select_link):
                    link_status = await mission_state.link_selector.select_link(
                        mission_state.current_telemetry['position'],
                        mission_state.mission_time
                    )
                else:
                    link_status = mission_state.link_selector.select_link(
                        mission_state.current_telemetry['position'],
                        mission_state.mission_time
                    )
            else:
                # Fallback
                link_status = {'type': 'none', 'name': 'NO LINK', 'signalStrength': 0, 'latency': float('inf'), 'available': False}
            
            # Convert LinkStatus object to dict if needed
            if hasattr(link_status, 'to_dict'):
                mission_state.current_link = link_status.to_dict()
            else:
                mission_state.current_link = link_status
            mission_state.current_link['timestamp'] = time.time()
            mission_state.link_history.append(mission_state.current_link)
            
            # Process data
            current_link_dict = mission_state.current_link
            if mission_state.orbitnet_enabled:
                if current_link_dict.get('available', False):
                    await mission_state.store_forward.forward_stored()
                    await mission_state.store_forward.transmit_direct(mission_state.current_telemetry)
                else:
                    await mission_state.store_forward.store(mission_state.current_telemetry)
            else:
                if current_link_dict.get('type') == 'ground':
                    await mission_state.store_forward.transmit_direct(mission_state.current_telemetry)
            
            # Sync to Firebase
            if FIREBASE_AVAILABLE and firebase_manager and firebase_manager.enabled:
                await firebase_manager.push_telemetry(mission_state.current_telemetry)
                await firebase_manager.update_mission_status({
                    "isRunning": mission_state.is_running,
                    "missionTime": mission_state.mission_time,
                    "orbitnetEnabled": mission_state.orbitnet_enabled,
                    "linkStatus": mission_state.current_link,
                    "stats": mission_state.store_forward.get_stats()
                })
            
            await asyncio.sleep(1.0)
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error in simulation: {e}")
            await asyncio.sleep(1)

# ============ FASTAPI APP ============
@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 ORBITNET-MESH Backend running on http://{API_HOST}:{API_PORT}")
    yield
    if mission_state.simulation_task:
        mission_state.simulation_task.cancel()
    print("👋 Backend shutdown")

app = FastAPI(title="ORBITNET-MESH API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include database router if available
if DATABASE_AVAILABLE and db_router:
    app.include_router(db_router)
    print("✅ Database endpoints enabled")
else:
    print("⚠️ Database endpoints not available")

# ============ API ENDPOINTS ============
@app.get("/")
async def root():
    return {"name": "ORBITNET-MESH API", "version": "1.0.0", "status": "operational"}

@app.get("/api/status")
async def get_status():
    queue_stats = mission_state.store_forward.get_stats()
    total_generated = queue_stats['total_packets']
    transmitted = queue_stats['transmitted_packets']
    stored = queue_stats['stored_packets']
    data_lost = 0 if mission_state.orbitnet_enabled else max(0, total_generated - transmitted)
    
    return {
        "isRunning": mission_state.is_running,
        "missionTime": mission_state.mission_time,
        "orbitnetEnabled": mission_state.orbitnet_enabled,
        "stats": {
            "totalGenerated": total_generated,
            "totalTransmitted": transmitted,
            "totalStored": stored,
            "dataLost": data_lost,
            "dataLossPercentage": (data_lost / max(1, total_generated)) * 100
        },
        "queueStats": queue_stats
    }

@app.get("/api/telemetry/latest")
async def get_latest_telemetry():
    return mission_state.current_telemetry or {}

@app.get("/api/link/status")
async def get_link_status():
    return mission_state.current_link or {}

@app.get("/api/packets/stored")
async def get_stored_packets():
    packets = mission_state.store_forward.get_stored_packets()
    return {"count": len(packets), "packets": [asdict(p) for p in packets[:50]]}

@app.get("/api/packets/transmitted")
async def get_transmitted_packets():
    packets = mission_state.store_forward.transmitted[-50:]
    return {"count": len(packets), "packets": [asdict(p) for p in packets]}

@app.post("/api/mission/start")
async def start_mission():
    if mission_state.is_running:
        return {"status": "already_running"}
    mission_state.is_running = True
    mission_state.start_time = time.time()
    mission_state.simulation_task = asyncio.create_task(simulation_loop())
    return {"status": "started"}

@app.post("/api/mission/stop")
async def stop_mission():
    mission_state.is_running = False
    if mission_state.simulation_task:
        mission_state.simulation_task.cancel()
    return {"status": "stopped"}

@app.post("/api/mission/reset")
async def reset_mission():
    mission_state.is_running = False
    if mission_state.simulation_task:
        mission_state.simulation_task.cancel()
    mission_state.mission_time = 0.0
    mission_state.telemetry_gen = TelemetryGenerator()
    mission_state.store_forward.clear()
    mission_state.current_telemetry = None
    mission_state.current_link = None
    mission_state.link_history = []
    return {"status": "reset"}

@app.post("/api/mission/toggle-orbitnet")
async def toggle_orbitnet():
    mission_state.orbitnet_enabled = not mission_state.orbitnet_enabled
    return {"orbitnetEnabled": mission_state.orbitnet_enabled}

@app.get("/api/config")
async def get_config():
    return {
        "groundStations": GROUND_STATIONS,
        "relaySatellites": RELAY_SATELLITES
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host=API_HOST, port=API_PORT, reload=False)
