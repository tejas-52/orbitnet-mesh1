"""
Satellite Link Emulator Module
Software-only satellite communication emulation for hackathon demonstration
"""

from .satellite_link_emulator import (
    SatelliteLinkEmulator,
    EmulatorConfig,
    TransmissionResult,
    satellite_emulator,
    get_emulator,
    configure_emulator
)

__all__ = [
    'SatelliteLinkEmulator',
    'EmulatorConfig', 
    'TransmissionResult',
    'satellite_emulator',
    'get_emulator',
    'configure_emulator'
]