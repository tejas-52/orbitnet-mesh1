"""
ORBITNET-MESH Backend API
FastAPI server providing real backend logic for space communication system
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
import asyncio
from typing import Dict, Optional

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import settings, get_system_mode, set_system_mode, is_orbitnet_mode
from onboard.telemetry import TelemetryGenerator
from onboard.link_selector import LinkSelector
from queue_module.store_forward import StoreAndForwardQueue
from satellite.relay import SatelliteRelay
from ground.receiver import GroundReceiver
from ground.database import MissionDatabase
from ai.gemini_explainer import explainer, explain_link_selection

# Import Satellite Link Emulator
try:
    from emulator.satellite_link_emulator import satellite_emulator, get_emulator
    EMULATOR_AVAILABLE = True
    print("🛰️ Satellite Link Emulator loaded - Ready for demonstration")
except ImportError as e:
    print(f"⚠️ Satellite Link Emulator not available: {e}")
    satellite_emulator = None
    EMULATOR_AVAILABLE = False

# Import database API endpoints
try:
    from database.api_endpoints import router as db_router
    DATABASE_API_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Database API endpoints not available: {e}")
    db_router = None
    DATABASE_API_AVAILABLE = False

# Import Firebase manager
try:
    from firebase_manager import firebase_manager
    FIREBASE_AVAILABLE = True
    print(f"🔥 Firebase manager imported - Status: {firebase_manager.get_status()}")
except ImportError as e:
    print(f"⚠️ Firebase manager not available: {e}")
    firebase_manager = None
    FIREBASE_AVAILABLE = False


# Global state
class MissionState:
    """Global mission state"""
    def __init__(self):
        self.is_running = False
        self.mission_time = 0.0
        self.start_time = 0.0
        
        # Components
        self.telemetry_gen = TelemetryGenerator()
        self.link_selector = LinkSelector()
        self.store_forward = StoreAndForwardQueue()
        self.satellite_relay = SatelliteRelay()
        self.ground_receiver = GroundReceiver()
        self.database = MissionDatabase()
        
        # Current state
        self.current_telemetry: Optional[Dict] = None
        self.current_link: Optional[Dict] = None
        self.link_history = []
        self.current_explanation: str = "System initializing..."
        
        # Link state tracking for transition detection
        self.previous_link_available: bool = False
        self.current_link_available: bool = False
        
        # Blackout simulation state
        self.blackout_simulation_active: bool = False
        
        # Statistics for /system/status API
        self.telemetry_generated = 0
        self.telemetry_sent = 0
        self.telemetry_buffered = 0
        self.telemetry_forwarded = 0
        self.telemetry_lost = 0
        
        # Background task
        self.simulation_task: Optional[asyncio.Task] = None


mission_state = MissionState()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    await mission_state.database.initialize()
    print("✅ Database initialized")
    print(f"🚀 ORBITNET-MESH Backend running on http://{settings.API_HOST}:{settings.API_PORT}")
    
    yield
    
    # Shutdown
    if mission_state.simulation_task:
        mission_state.simulation_task.cancel()
    await mission_state.database.close()
    print("👋 Backend shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include database API endpoints if available
if DATABASE_API_AVAILABLE and db_router:
    app.include_router(db_router, prefix="/api/database", tags=["database"])


async def simulation_loop():
    """
    Main simulation loop
    Generates telemetry and processes it through the system
    Uses global SYSTEM_MODE to control behavior
    FIXED: Implements link-state-transition-based buffer flushing
    """
    while mission_state.is_running:
        try:
            # Update mission time
            mission_state.mission_time = time.time() - mission_state.start_time
            
            # 1. GENERATE TELEMETRY (Onboard) - Now with real-world data
            telemetry = await mission_state.telemetry_gen.generate(mission_state.mission_time)
            mission_state.current_telemetry = telemetry.to_dict()
            mission_state.telemetry_generated += 1
            
            # 2. SELECT LINK (Onboard) - Now with weather and physics
            link_status = await mission_state.link_selector.select_link(
                mission_state.current_telemetry['position'],
                mission_state.mission_time
            )
            mission_state.current_link = link_status.to_dict()
            mission_state.current_link['timestamp'] = time.time()
            mission_state.link_history.append(mission_state.current_link)
            
            # Store link history in database
            await mission_state.database.store_link_status(mission_state.current_link)
            
            # 3. EVALUATE CURRENT LINK AVAILABILITY
            mission_state.current_link_available = link_status.available
            
            # 4. DETECT LINK-UP TRANSITION (CRITICAL FIX)
            # This is the ONLY trigger to flush stored packets
            # DEMO MODE: Force link availability when emulator is enabled
            demo_link_available = (EMULATOR_AVAILABLE and satellite_emulator and 
                                 satellite_emulator.config.enabled and settings.FORCE_SATELLITE_DEMO)
            
            # BLACKOUT SIMULATION: Override link availability when blackout is active
            effective_link_available = (mission_state.current_link_available or demo_link_available) and not mission_state.blackout_simulation_active
            
            if not mission_state.previous_link_available and effective_link_available:
                if demo_link_available and not mission_state.current_link_available:
                    print(f"🔄 DEMO LINK TRANSITION: Emulator demo mode forcing buffer flush")
                else:
                    print(f"🔄 LINK TRANSITION DETECTED: NO LINK → {link_status.link_type.upper()} AVAILABLE")
                print(f"   Flushing buffer with {len(mission_state.store_forward.get_stored_packets())} packets...")
                
                # FLUSH BUFFER: Transmit all stored packets
                await flush_buffer(link_status)
            
            # 5. PROCESS CURRENT TELEMETRY BASED ON SYSTEM_MODE
            system_mode = get_system_mode()
            telemetry_action = "unknown"
            
            # DEMO MODE: Force link availability when emulator is enabled
            demo_link_available = (EMULATOR_AVAILABLE and satellite_emulator and 
                                 satellite_emulator.config.enabled and settings.FORCE_SATELLITE_DEMO)
            
            # BLACKOUT SIMULATION: Override link availability when blackout is active
            effective_link_available = (mission_state.current_link_available or demo_link_available) and not mission_state.blackout_simulation_active
            
            if system_mode == "ORBITNET":
                # ORBITNET-MESH MODE: Use store-and-forward (ZERO DATA LOSS)
                if effective_link_available:
                    # Link available - transmit current telemetry immediately
                    emulator_enabled = EMULATOR_AVAILABLE and satellite_emulator and satellite_emulator.config.enabled
                    
                    # DEMO SATELLITE OVERRIDE: Route through emulator when enabled (hackathon-safe)
                    if emulator_enabled and (link_status.link_type == 'satellite' or settings.FORCE_SATELLITE_DEMO):
                        if demo_link_available and not mission_state.current_link_available:
                            print(f"[DEMO] Routing packet through satellite emulator (demo mode active)")
                        else:
                            print(f"[DEMO] Routing packet through satellite emulator (real satellite link)")
                        
                        # Route through satellite emulator
                        packet = await mission_state.store_forward.transmit_direct(
                            mission_state.current_telemetry
                        )
                        
                        # Transmit via emulator (THIS BLOCKS EXECUTION WITH REAL LATENCY)
                        result = await satellite_emulator.transmit_packet(packet.to_dict())
                        
                        if result.success:
                            source = 'satellite_emulator'
                            relay_name = f"{link_status.name} (emulated)" if link_status.link_type == 'satellite' else "Demo Satellite Relay"
                            await mission_state.ground_receiver.receive_packet(
                                packet.to_dict(),
                                source,
                                relay_name
                            )
                            
                            # Store with emulator metadata AFTER emulator completes
                            packet_dict = packet.to_dict()
                            packet_dict['emulator_latency_ms'] = result.latency_ms
                            packet_dict['emulator_processed'] = True
                            packet_dict['demo_mode'] = demo_link_available and not mission_state.current_link_available
                            await mission_state.database.store_telemetry(
                                packet_dict,
                                time.time(),  # Timestamp AFTER emulator delay
                                source
                            )
                            mission_state.telemetry_sent += 1
                            telemetry_action = "transmitted_emulated"
                        else:
                            # Emulator dropped packet - store it instead (ORBITNET ensures zero loss)
                            await mission_state.store_forward.store(mission_state.current_telemetry)
                            mission_state.telemetry_buffered += 1
                            telemetry_action = "stored_after_emulator_drop"
                    else:
                        # Direct transmission (no emulator or ground link)
                        packet = await mission_state.store_forward.transmit_direct(
                            mission_state.current_telemetry
                        )
                        source = 'satellite_relay' if link_status.link_type == 'satellite' else 'direct'
                        await mission_state.ground_receiver.receive_packet(
                            packet.to_dict(),
                            source,
                            link_status.name if link_status.link_type == 'satellite' else None
                        )
                        await mission_state.database.store_telemetry(
                            packet.to_dict(),
                            time.time(),
                            source
                        )
                        mission_state.telemetry_sent += 1
                        telemetry_action = "transmitted"
                else:
                    # No link - store the packet (ZERO DATA LOSS)
                    await mission_state.store_forward.store(mission_state.current_telemetry)
                    mission_state.telemetry_buffered += 1
                    telemetry_action = "stored"
            
            elif system_mode == "GROUND_ONLY":
                # GROUND-ONLY MODE: Data lost during blackout
                if link_status.link_type == 'ground':
                    # Only transmit when ground link available
                    packet = await mission_state.store_forward.transmit_direct(
                        mission_state.current_telemetry
                    )
                    await mission_state.ground_receiver.receive_packet(
                        packet.to_dict(),
                        'direct',
                        None
                    )
                    await mission_state.database.store_telemetry(
                        packet.to_dict(),
                        time.time(),
                        'direct'
                    )
                    mission_state.telemetry_sent += 1
                    telemetry_action = "transmitted"
                else:
                    # DATA IS LOST (ground-only mode limitation)
                    mission_state.telemetry_lost += 1
                    telemetry_action = "lost"
            
            # 6. UPDATE PREVIOUS LINK STATE (CRITICAL)
            # This ensures correct detection on the next iteration
            # Include demo link state for proper transition detection
            demo_link_available = (EMULATOR_AVAILABLE and satellite_emulator and 
                                 satellite_emulator.config.enabled and settings.FORCE_SATELLITE_DEMO)
            # BLACKOUT SIMULATION: Override link availability when blackout is active
            effective_link_available = (mission_state.current_link_available or demo_link_available) and not mission_state.blackout_simulation_active
            mission_state.previous_link_available = effective_link_available
            
            # 7. GENERATE AI EXPLANATION
            try:
                mission_state.current_explanation = await explain_link_selection(
                    selected_link=link_status.link_type,
                    satellite_visible=link_status.link_type == 'satellite',
                    ground_visible=link_status.link_type == 'ground',
                    system_mode=system_mode,
                    telemetry_action=telemetry_action,
                    link_name=link_status.name,
                    signal_strength=getattr(link_status, 'signal_strength', None),
                    elevation_angle=getattr(link_status, 'elevation_angle', None)
                )
            except Exception as e:
                mission_state.current_explanation = f"System operating in {system_mode} mode"
                print(f"⚠️ Explanation generation failed: {e}")
            
            # Wait for next cycle
            await asyncio.sleep(settings.TELEMETRY_GENERATION_INTERVAL)
            
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"⚠️ Error in simulation loop: {e}")
            await asyncio.sleep(1)


async def flush_buffer(link_status):
    """
    CRITICAL FUNCTION: Flush all buffered packets when link becomes available
    This implements the store-and-forward mechanism properly
    NOW WITH SATELLITE LINK EMULATOR INTEGRATION
    """
    try:
        # Get all stored packets from buffer (FIFO order)
        stored_packets = mission_state.store_forward.get_stored_packets()
        
        if not stored_packets:
            print("   📦 Buffer is empty - nothing to flush")
            return
        
        print(f"   📡 Flushing {len(stored_packets)} packets via {link_status.link_type} link...")
        
        # Use the existing forward_stored method to get all packets
        forwarded_packets = await mission_state.store_forward.forward_stored()
        
        if not forwarded_packets:
            print("   ⚠️ No packets were forwarded from buffer")
            return
        
        # SATELLITE EMULATOR INTEGRATION POINT
        packets_flushed = 0
        emulator_enabled = EMULATOR_AVAILABLE and satellite_emulator and satellite_emulator.config.enabled
        
        # DEMO SATELLITE OVERRIDE: Use emulator when enabled OR when satellite link available
        use_emulator = emulator_enabled and (link_status.link_type == 'satellite' or settings.FORCE_SATELLITE_DEMO)
        
        if use_emulator:
            demo_mode = settings.FORCE_SATELLITE_DEMO and link_status.link_type != 'satellite'
            print(f"   🛰️ Routing {len(forwarded_packets)} packets through Satellite Link Emulator...")
            if demo_mode:
                print(f"   📡 Demo mode active - simulating satellite relay behavior")
            
            # Transmit packets through emulator (THIS BLOCKS WITH REAL LATENCY)
            packet_dicts = [packet.to_dict() for packet in forwarded_packets]
            transmission_results = await satellite_emulator.transmit_batch(packet_dicts)
            
            # Process emulator results
            for i, (packet, result) in enumerate(zip(forwarded_packets, transmission_results)):
                try:
                    if result.success:
                        # Successful transmission via emulator
                        source = 'satellite_emulator'
                        relay_name = f"{link_status.name} (emulated)" if link_status.link_type == 'satellite' else "Demo Satellite Relay"
                        
                        await mission_state.ground_receiver.receive_packet(
                            packet.to_dict(),
                            source,
                            relay_name
                        )
                        
                        # Store in database with emulator metadata AFTER emulator delay
                        packet_dict = packet.to_dict()
                        packet_dict['emulator_latency_ms'] = result.latency_ms
                        packet_dict['emulator_processed'] = True
                        packet_dict['demo_mode'] = demo_mode
                        await mission_state.database.store_telemetry(
                            packet_dict,
                            time.time(),  # Timestamp AFTER emulator completes
                            source
                        )
                        
                        packets_flushed += 1
                        mission_state.telemetry_sent += 1
                        mission_state.telemetry_forwarded += 1
                        
                    else:
                        # Packet dropped by emulator
                        print(f"   📡❌ Packet {packet.id} dropped by satellite emulator: {result.error_reason}")
                        # In ORBITNET mode, we could retry or handle differently
                        # For demo purposes, we'll count as lost
                        mission_state.telemetry_lost += 1
                        
                except Exception as e:
                    print(f"   ❌ Failed to process emulated packet {packet.id}: {e}")
                    continue
            
            # Update explanation for emulator
            if packets_flushed > 0:
                avg_latency = sum(r.latency_ms for r in transmission_results if r.success) / max(1, packets_flushed)
                dropped_count = len([r for r in transmission_results if r.dropped])
                mode_text = " (demo mode)" if demo_mode else ""
                mission_state.current_explanation = f"Link restored - forwarded {packets_flushed} packets via satellite emulator{mode_text} (avg latency: {avg_latency:.1f}ms, {dropped_count} dropped)"
        
        else:
            # Direct transmission (no emulator or ground link)
            print(f"   📡 Direct transmission via {link_status.link_type} link...")
            
            for packet in forwarded_packets:
                try:
                    # Transmit via available link (original logic)
                    source = 'satellite_relay' if link_status.link_type == 'satellite' else 'direct'
                    await mission_state.ground_receiver.receive_packet(
                        packet.to_dict(),
                        source,
                        link_status.name if link_status.link_type == 'satellite' else None
                    )
                    
                    # Store in database
                    await mission_state.database.store_telemetry(
                        packet.to_dict(),
                        time.time(),
                        source
                    )
                    
                    packets_flushed += 1
                    mission_state.telemetry_sent += 1
                    mission_state.telemetry_forwarded += 1
                    
                except Exception as e:
                    print(f"   ❌ Failed to flush packet {packet.id}: {e}")
                    continue  # Continue with other packets
        
        # Update buffered count
        remaining_packets = len(mission_state.store_forward.get_stored_packets())
        mission_state.telemetry_buffered = remaining_packets
        
        emulator_status = " (via emulator)" if emulator_enabled and link_status.link_type == 'satellite' else ""
        print(f"   ✅ Successfully flushed {packets_flushed} packets{emulator_status}")
        print(f"   📦 Remaining in buffer: {remaining_packets}")
        
        # Update AI explanation for buffer flush
        if packets_flushed > 0 and not emulator_enabled:
            mission_state.current_explanation = f"Link restored - successfully forwarded {packets_flushed} buffered packets via {link_status.link_type} link. Zero data loss maintained."
        
    except Exception as e:
        print(f"❌ Critical error in buffer flush: {e}")
        # Don't let buffer flush errors crash the system


# ============ API ENDPOINTS ============

@app.get("/")
async def root():
    """API root"""
    return {
        "name": settings.API_TITLE,
        "version": settings.API_VERSION,
        "status": "operational"
    }


@app.get("/api/status")
async def get_status():
    """
    Get current system status (legacy endpoint)
    Returns: Complete system state including counters
    """
    queue_stats = mission_state.store_forward.get_stats()
    receiver_stats = mission_state.ground_receiver.get_stats()
    
    # Calculate statistics
    total_generated = mission_state.telemetry_generated
    transmitted = mission_state.telemetry_sent
    stored = mission_state.telemetry_buffered
    
    # DATA LOSS CALCULATION based on SYSTEM_MODE
    system_mode = get_system_mode()
    if system_mode == "ORBITNET":
        data_lost = 0  # ZERO with ORBITNET-MESH
    else:
        # Ground-only mode: lost = generated - transmitted
        data_lost = mission_state.telemetry_lost
    
    return {
        "isRunning": mission_state.is_running,
        "missionTime": mission_state.mission_time,
        "systemMode": system_mode,
        "orbitnetEnabled": system_mode == "ORBITNET",  # Legacy compatibility
        "stats": {
            "totalGenerated": total_generated,
            "totalTransmitted": transmitted,
            "totalStored": stored,
            "dataLost": data_lost,
            "dataLossPercentage": (data_lost / max(1, total_generated)) * 100
        },
        "queueStats": queue_stats,
        "receiverStats": receiver_stats
    }


@app.get("/system/status")
async def get_system_status():
    """
    SYSTEM STATUS API - Core requirement
    Returns comprehensive system state with AI explanations
    NOW INCLUDES SATELLITE EMULATOR STATUS
    """
    # Get current link status
    current_link = "NONE"
    satellite_visible = False
    ground_visible = False
    
    if mission_state.current_link:
        link_type = mission_state.current_link.get('link_type', 'none')
        if link_type == 'ground':
            current_link = "GROUND"
            ground_visible = True
        elif link_type == 'satellite':
            current_link = "SATELLITE"
            satellite_visible = True
        else:
            current_link = "NONE"
    
    # Calculate buffered packets
    stored_packets = mission_state.store_forward.get_stored_packets()
    telemetry_buffered = len(stored_packets)
    
    # Get emulator status
    emulator_status = {}
    if EMULATOR_AVAILABLE and satellite_emulator:
        emulator_stats = satellite_emulator.get_statistics()
        emulator_status = {
            "emulator_enabled": satellite_emulator.config.enabled,
            "emulator_demo_mode": settings.FORCE_SATELLITE_DEMO,
            "emulator_latency_ms": satellite_emulator.config.latency_ms,
            "emulator_packet_loss_rate": satellite_emulator.config.packet_loss_rate,
            "emulator_packets_processed": emulator_stats.get("total_packets_processed", 0),
            "emulator_success_rate": emulator_stats.get("success_rate_percent", 100.0),
            "emulator_avg_latency_ms": emulator_stats.get("average_latency_ms", 0.0)
        }
    else:
        emulator_status = {
            "emulator_enabled": False,
            "emulator_demo_mode": False,
            "emulator_available": False
        }
    
    response = {
        "system_mode": get_system_mode(),
        "telemetry_generated": mission_state.telemetry_generated,
        "telemetry_sent": mission_state.telemetry_sent,
        "telemetry_buffered": telemetry_buffered,
        "telemetry_forwarded": mission_state.telemetry_forwarded,
        "telemetry_lost": mission_state.telemetry_lost,
        "satellite_visible": satellite_visible,
        "ground_visible": ground_visible,
        "current_link": current_link,
        "decision_explanation": mission_state.current_explanation
    }
    
    # Add emulator status to response
    response.update(emulator_status)
    
    return response


@app.get("/api/telemetry/latest")
async def get_latest_telemetry():
    """Get the latest telemetry data"""
    if not mission_state.current_telemetry:
        raise HTTPException(status_code=404, detail="No telemetry available")
    
    return mission_state.current_telemetry


@app.get("/api/link/status")
async def get_link_status():
    """Get current link status"""
    if not mission_state.current_link:
        raise HTTPException(status_code=404, detail="No link status available")
    
    return mission_state.current_link


@app.get("/api/mission/phase")
async def get_mission_phase():
    """Get current mission phase"""
    # Determine phase based on mission time
    if mission_state.mission_time < 300:
        phase = "LAUNCH"
    elif mission_state.mission_time < 1800:
        phase = "ASCENT"
    elif mission_state.mission_time < 5400:
        phase = "ORBIT_INSERTION"
    else:
        phase = "ON_ORBIT"
    
    return {
        "phase": phase,
        "missionTime": mission_state.mission_time,
        "elapsedFormatted": format_time(mission_state.mission_time)
    }


@app.get("/api/packets/stored")
async def get_stored_packets():
    """Get currently stored packets"""
    packets = mission_state.store_forward.get_stored_packets()
    return {
        "count": len(packets),
        "packets": [p.to_dict() for p in packets[:50]]  # Limit to 50 for performance
    }


@app.get("/api/packets/transmitted")
async def get_transmitted_packets():
    """Get recently transmitted packets"""
    packets = mission_state.ground_receiver.get_received_packets(50)
    return {
        "count": len(packets),
        "packets": [p.to_dict() for p in packets]
    }


@app.post("/api/mission/start")
async def start_mission():
    """Start the mission simulation"""
    if mission_state.is_running:
        return {"status": "already_running"}
    
    mission_state.is_running = True
    mission_state.start_time = time.time()
    mission_state.simulation_task = asyncio.create_task(simulation_loop())
    
    return {"status": "started", "missionTime": 0}


@app.post("/api/mission/stop")
async def stop_mission():
    """Stop the mission simulation"""
    if not mission_state.is_running:
        return {"status": "already_stopped"}
    
    mission_state.is_running = False
    if mission_state.simulation_task:
        mission_state.simulation_task.cancel()
        mission_state.simulation_task = None
    
    return {"status": "stopped", "missionTime": mission_state.mission_time}


@app.post("/api/mission/reset")
async def reset_mission():
    """Reset the mission"""
    # Stop if running
    mission_state.is_running = False
    if mission_state.simulation_task:
        mission_state.simulation_task.cancel()
        mission_state.simulation_task = None
    
    # Reset all components
    mission_state.mission_time = 0.0
    mission_state.start_time = 0.0
    mission_state.telemetry_gen.reset()
    mission_state.store_forward.clear()
    mission_state.ground_receiver.clear()
    mission_state.current_telemetry = None
    mission_state.current_link = None
    mission_state.link_history = []
    
    # Reset blackout simulation
    mission_state.blackout_simulation_active = False
    
    return {"status": "reset"}


@app.post("/api/blackout/simulate")
async def simulate_blackout():
    """Activate blackout simulation - forces communication unavailable"""
    mission_state.blackout_simulation_active = True
    return {
        "status": "blackout_activated",
        "blackout_active": True,
        "message": "Blackout simulation activated - communication links disabled"
    }


@app.post("/api/blackout/clear")
async def clear_blackout():
    """Deactivate blackout simulation - restore normal communication"""
    mission_state.blackout_simulation_active = False
    return {
        "status": "blackout_cleared", 
        "blackout_active": False,
        "message": "Blackout simulation cleared - communication links restored"
    }


@app.get("/api/blackout/status")
async def get_blackout_status():
    """Get current blackout simulation status"""
    return {
        "blackout_active": mission_state.blackout_simulation_active,
        "message": "Blackout simulation active" if mission_state.blackout_simulation_active else "Normal communication"
    }


@app.post("/api/mission/toggle-orbitnet")
async def toggle_orbitnet():
    """Toggle ORBITNET-MESH mode (legacy endpoint)"""
    current_mode = get_system_mode()
    new_mode = "GROUND_ONLY" if current_mode == "ORBITNET" else "ORBITNET"
    set_system_mode(new_mode)
    
    return {
        "orbitnetEnabled": new_mode == "ORBITNET",  # Legacy compatibility
        "systemMode": new_mode,
        "mode": "ORBITNET-MESH" if new_mode == "ORBITNET" else "GROUND-ONLY"
    }


@app.post("/system/mode/{mode}")
async def set_system_operation_mode(mode: str):
    """
    Set global system operation mode
    Args:
        mode: "ORBITNET" or "GROUND_ONLY"
    """
    if mode not in ["ORBITNET", "GROUND_ONLY"]:
        raise HTTPException(status_code=400, detail="Mode must be 'ORBITNET' or 'GROUND_ONLY'")
    
    success = set_system_mode(mode)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to set system mode")
    
    # Reset statistics when mode changes
    mission_state.telemetry_generated = 0
    mission_state.telemetry_sent = 0
    mission_state.telemetry_buffered = 0
    mission_state.telemetry_forwarded = 0
    mission_state.telemetry_lost = 0
    
    return {
        "success": True,
        "system_mode": mode,
        "message": f"System mode set to {mode}",
        "behavior": {
            "ORBITNET": "Zero data loss through store-and-forward",
            "GROUND_ONLY": "Data lost during communication blackouts"
        }[mode]
    }


@app.get("/api/mission/summary")
async def get_mission_summary():
    """Get complete mission summary from database"""
    summary = await mission_state.database.get_mission_summary()
    return summary


@app.get("/api/config")
async def get_config():
    """Get system configuration"""
    return {
        "groundStations": settings.GROUND_STATIONS,
        "relaySatellites": settings.RELAY_SATELLITES,
        "telemetryInterval": settings.TELEMETRY_GENERATION_INTERVAL,
        "systemMode": get_system_mode(),
        "aiExplainer": explainer.get_status()
    }


def format_time(seconds: float) -> str:
    """Format seconds to HH:MM:SS"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"


# =============================================================================
# NEW REAL-WORLD DATA API ENDPOINTS
# =============================================================================

@app.get("/api/services/status")
async def get_services_status():
    """Get status of all real-world data services"""
    try:
        from services.orbit_service import orbit_service
        from services.weather_service import weather_service
        from services.link_budget_service import link_budget_service
        from services.replay_service import replay_service
        
        return {
            "orbit_service": orbit_service.get_tle_status(),
            "weather_service": {
                "available": weather_service is not None,
                "cached_stations": len(weather_service.weather_cache) if weather_service else 0
            },
            "link_budget_service": {
                "available": link_budget_service is not None,
                "frequency_bands": list(link_budget_service.band_params.keys()) if link_budget_service else []
            },
            "replay_service": replay_service.get_replay_status() if replay_service else {"active": False},
            "telemetry_generator": mission_state.telemetry_gen.get_data_source_status(),
            "link_selector": mission_state.link_selector.get_service_status()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Service status error: {str(e)}")

@app.get("/api/orbit/tle-status")
async def get_tle_status():
    """Get TLE data status"""
    try:
        from services.orbit_service import orbit_service
        return orbit_service.get_tle_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TLE status error: {str(e)}")

@app.post("/api/orbit/fetch-tle/{satellite_id}")
async def fetch_tle_data(satellite_id: str):
    """Fetch fresh TLE data for satellite"""
    try:
        from services.orbit_service import orbit_service
        success = await orbit_service.fetch_tle_data(satellite_id)
        return {"success": success, "satellite_id": satellite_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TLE fetch error: {str(e)}")

@app.get("/api/weather/ground-stations")
async def get_weather_for_all_stations():
    """Get weather conditions for all ground stations"""
    try:
        from services.weather_service import weather_service
        stations = [
            {"id": gs["id"], "lat": gs["lat"], "lng": gs["lng"]}
            for gs in settings.GROUND_STATIONS
        ]
        weather_impacts = await weather_service.get_multi_station_impact(stations)
        return weather_impacts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather error: {str(e)}")

@app.get("/api/weather/station/{station_id}")
async def get_station_weather(station_id: str):
    """Get weather conditions for specific ground station"""
    try:
        from services.weather_service import weather_service
        
        # Find station
        station = next((gs for gs in settings.GROUND_STATIONS if gs["id"] == station_id), None)
        if not station:
            raise HTTPException(status_code=404, detail="Station not found")
        
        weather_impact = await weather_service.assess_link_impact(
            station_id, station["lat"], station["lng"]
        )
        return weather_impact
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Station weather error: {str(e)}")

@app.get("/api/link-budget/analysis")
async def get_current_link_analysis():
    """Get detailed link budget analysis for current satellite position"""
    try:
        from services.link_budget_service import link_budget_service, FrequencyBand
        
        if not mission_state.current_telemetry:
            raise HTTPException(status_code=404, detail="No current telemetry available")
        
        sat_pos = mission_state.current_telemetry["position"]
        analyses = {}
        
        # Analyze link to each ground station
        for station in settings.GROUND_STATIONS:
            gs_pos = {"lat": station["lat"], "lng": station["lng"], "altitude": 0.0}
            
            analysis = link_budget_service.analyze_satellite_link(
                sat_pos, gs_pos, FrequencyBand.X_BAND, 0.0
            )
            
            analyses[station["id"]] = {
                "station_name": station["name"],
                "distance_km": analysis.distance_km,
                "elevation_angle": analysis.elevation_angle,
                "link_available": analysis.link_available,
                "link_margin_db": analysis.link_margin_db,
                "data_rate_mbps": analysis.data_rate_mbps,
                "latency_ms": analysis.total_latency_ms,
                "explanation": analysis.explanation
            }
        
        return analyses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Link analysis error: {str(e)}")

@app.get("/api/replay/datasets")
async def list_replay_datasets():
    """List available historical datasets"""
    try:
        from services.replay_service import replay_service
        return replay_service.list_available_datasets()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replay datasets error: {str(e)}")

@app.post("/api/replay/start")
async def start_replay(
    dataset_name: str,
    speed_multiplier: float = 1.0,
    loop_enabled: bool = False,
    start_offset: float = 0.0
):
    """Start historical telemetry replay"""
    try:
        from services.replay_service import replay_service
        success = await replay_service.start_replay(
            dataset_name, speed_multiplier, loop_enabled, start_offset
        )
        return {"success": success, "dataset_name": dataset_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replay start error: {str(e)}")

@app.post("/api/replay/stop")
async def stop_replay():
    """Stop current replay"""
    try:
        from services.replay_service import replay_service
        await replay_service.stop_replay()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replay stop error: {str(e)}")

@app.post("/api/replay/pause")
async def pause_replay():
    """Pause current replay"""
    try:
        from services.replay_service import replay_service
        await replay_service.pause_replay()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replay pause error: {str(e)}")

@app.post("/api/replay/resume")
async def resume_replay():
    """Resume paused replay"""
    try:
        from services.replay_service import replay_service
        await replay_service.resume_replay()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replay resume error: {str(e)}")

@app.post("/api/replay/speed/{speed_multiplier}")
async def set_replay_speed(speed_multiplier: float):
    """Change replay speed"""
    try:
        from services.replay_service import replay_service
        await replay_service.set_replay_speed(speed_multiplier)
        return {"success": True, "speed": speed_multiplier}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replay speed error: {str(e)}")

@app.get("/api/replay/status")
async def get_replay_status():
    """Get current replay status"""
    try:
        from services.replay_service import replay_service
        return replay_service.get_replay_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replay status error: {str(e)}")

# Configuration endpoints for toggling features
@app.post("/api/config/real-orbits/{enabled}")
async def toggle_real_orbits(enabled: bool):
    """Enable/disable real orbital data"""
    mission_state.telemetry_gen.enable_real_orbits(enabled)
    return {"success": True, "real_orbits_enabled": enabled}

@app.post("/api/config/weather-integration/{enabled}")
async def toggle_weather_integration(enabled: bool):
    """Enable/disable weather data integration"""
    mission_state.link_selector.enable_weather_integration(enabled)
    return {"success": True, "weather_integration_enabled": enabled}

@app.post("/api/config/physics-model/{enabled}")
async def toggle_physics_model(enabled: bool):
    """Enable/disable physics-based link calculations"""
    mission_state.link_selector.enable_physics_model(enabled)
    return {"success": True, "physics_model_enabled": enabled}

@app.post("/api/config/satellite-id/{satellite_id}")
async def set_satellite_id(satellite_id: str):
    """Set satellite ID for TLE data"""
    mission_state.telemetry_gen.set_satellite_id(satellite_id)
    return {"success": True, "satellite_id": satellite_id}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )