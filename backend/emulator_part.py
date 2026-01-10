
# =============================================================================
# SATELLITE LINK EMULATOR API ENDPOINTS
# =============================================================================

@app.get("/api/emulator/status")
async def get_emulator_status():
    """Get satellite link emulator status and statistics"""
    if not EMULATOR_AVAILABLE or not satellite_emulator:
        raise HTTPException(status_code=503, detail="Satellite emulator not available")
    
    return satellite_emulator.get_status()


@app.get("/api/emulator/statistics")
async def get_emulator_statistics():
    """Get detailed emulator transmission statistics"""
    if not EMULATOR_AVAILABLE or not satellite_emulator:
        raise HTTPException(status_code=503, detail="Satellite emulator not available")
    
    return satellite_emulator.get_statistics()


@app.get("/api/emulator/transmissions")
async def get_recent_transmissions(limit: int = 50):
    """Get recent transmission results from emulator"""
    if not EMULATOR_AVAILABLE or not satellite_emulator:
        raise HTTPException(status_code=503, detail="Satellite emulator not available")
    
    return {
        "transmissions": satellite_emulator.get_recent_transmissions(limit),
        "total_count": len(satellite_emulator.transmission_history)
    }


@app.post("/api/emulator/configure")
async def configure_satellite_emulator(
    enabled: bool = True,
    latency_ms: int = 300,
    packet_loss_rate: float = 0.05,
    bandwidth_kbps: int = 512,
    jitter_ms: int = 50
):
    """
    Configure satellite link emulator parameters
    
    Args:
        enabled: Enable/disable emulator
        latency_ms: Satellite communication latency (100-2000ms)
        packet_loss_rate: Packet loss probability (0.0-0.5)
        bandwidth_kbps: Bandwidth limit (64-2048 Kbps)
        jitter_ms: Latency variation (0-200ms)
    """
    if not EMULATOR_AVAILABLE:
        raise HTTPException(status_code=503, detail="Satellite emulator not available")
    
    # Validate parameters
    if not (100 <= latency_ms <= 2000):
        raise HTTPException(status_code=400, detail="Latency must be between 100-2000ms")
    if not (0.0 <= packet_loss_rate <= 0.5):
        raise HTTPException(status_code=400, detail="Packet loss rate must be between 0.0-0.5")
    if not (64 <= bandwidth_kbps <= 2048):
        raise HTTPException(status_code=400, detail="Bandwidth must be between 64-2048 Kbps")
    if not (0 <= jitter_ms <= 200):
        raise HTTPException(status_code=400, detail="Jitter must be between 0-200ms")
    
    try:
        from emulator.satellite_link_emulator import configure_emulator
        result = configure_emulator(
            enabled=enabled,
            latency_ms=latency_ms,
            packet_loss_rate=packet_loss_rate,
            bandwidth_kbps=bandwidth_kbps,
            jitter_ms=jitter_ms
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")


@app.post("/api/emulator/toggle")
async def toggle_emulator():
    """Toggle satellite emulator on/off"""
    if not EMULATOR_AVAILABLE or not satellite_emulator:
        raise HTTPException(status_code=503, detail="Satellite emulator not available")
    
    current_enabled = satellite_emulator.config.enabled
    new_enabled = not current_enabled
    
    try:
        from emulator.satellite_link_emulator import configure_emulator
        result = configure_emulator(enabled=new_enabled)
        
        return {
            "success": True,
            "emulator_enabled": new_enabled,
            "message": f"Satellite emulator {'enabled' if new_enabled else 'disabled'}",
            "impact": {
                "enabled": "Packets will experience realistic satellite latency and potential loss",
                "disabled": "Packets will be transmitted directly without emulation"
            }[new_enabled]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Toggle error: {str(e)}")


@app.post("/api/emulator/reset")
async def reset_emulator_statistics():
    """Reset emulator transmission statistics"""
    if not EMULATOR_AVAILABLE or not satellite_emulator:
        raise HTTPException(status_code=503, detail="Satellite emulator not available")
    
    satellite_emulator.reset_statistics()
    return {
        "success": True,
        "message": "Emulator statistics reset"
    }


@app.get("/api/emulator/demo-config")
async def get_demo_configurations():
    """Get predefined emulator configurations for demonstration"""
    return {
        "configurations": {
            "low_earth_orbit": {
                "name": "Low Earth Orbit (LEO)",
                "description": "Typical LEO satellite communication",
                "latency_ms": 150,
                "packet_loss_rate": 0.02,
                "bandwidth_kbps": 1024,
                "jitter_ms": 30
            },
            "geostationary": {
                "name": "Geostationary Orbit (GEO)",
                "description": "High latency geostationary satellite",
                "latency_ms": 600,
                "packet_loss_rate": 0.01,
                "bandwidth_kbps": 512,
                "jitter_ms": 100
            },
            "deep_space": {
                "name": "Deep Space Communication",
                "description": "Extreme latency for deep space missions",
                "latency_ms": 1500,
                "packet_loss_rate": 0.10,
                "bandwidth_kbps": 128,
                "jitter_ms": 200
            },
            "ideal": {
                "name": "Ideal Link",
                "description": "Perfect communication for comparison",
                "latency_ms": 50,
                "packet_loss_rate": 0.0,
                "bandwidth_kbps": 2048,
                "jitter_ms": 5
            },
            "challenging": {
                "name": "Challenging Conditions",
                "description": "Poor weather/interference conditions",
                "latency_ms": 400,
                "packet_loss_rate": 0.15,
                "bandwidth_kbps": 256,
                "jitter_ms": 150
            }
        }
    }


@app.post("/api/emulator/apply-demo-config/{config_name}")
async def apply_demo_configuration(config_name: str):
    """Apply a predefined demonstration configuration"""
    if not EMULATOR_AVAILABLE:
        raise HTTPException(status_code=503, detail="Satellite emulator not available")
    
    # Get demo configurations
    demo_configs = (await get_demo_configurations())["configurations"]
    
    if config_name not in demo_configs:
        available = list(demo_configs.keys())
        raise HTTPException(
            status_code=404, 
            detail=f"Configuration '{config_name}' not found. Available: {available}"
        )
    
    config = demo_configs[config_name]
    
    try:
        from emulator.satellite_link_emulator import configure_emulator
        result = configure_emulator(
            enabled=True,
            latency_ms=config["latency_ms"],
            packet_loss_rate=config["packet_loss_rate"],
            bandwidth_kbps=config["bandwidth_kbps"],
            jitter_ms=config["jitter_ms"]
        )
        
        return {
            "success": True,
            "applied_configuration": config_name,
            "description": config["description"],
            "parameters": {
                "latency_ms": config["latency_ms"],
                "packet_loss_rate": config["packet_loss_rate"],
                "bandwidth_kbps": config["bandwidth_kbps"],
                "jitter_ms": config["jitter_ms"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")


@app.post("/api/emulator/demo-mode/{enabled}")
async def toggle_demo_mode(enabled: bool):
    """Toggle satellite demo override mode"""
    try:
        # Update the global setting
        settings.FORCE_SATELLITE_DEMO = enabled
        
        return {
            "success": True,
            "demo_mode_enabled": enabled,
            "message": f"Demo satellite override {'enabled' if enabled else 'disabled'}",
            "explanation": {
                True: "Emulator will process packets even without real satellite links (demo mode)",
                False: "Emulator only processes packets when real satellite links are available (physics mode)"
            }[enabled]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demo mode toggle error: {str(e)}")


@app.get("/api/emulator/demo-mode")
async def get_demo_mode():
    """Get current demo mode status"""
    return {
        "demo_mode_enabled": settings.FORCE_SATELLITE_DEMO,
        "explanation": "Demo mode forces packets through emulator even without real satellite links"
    }
