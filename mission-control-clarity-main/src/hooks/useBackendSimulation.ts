import { useState, useEffect, useCallback } from 'react';
import { TelemetryData, LinkStatus, DataPacket, MissionStats } from '@/lib/simulation';

interface BackendSimulationState {
  isRunning: boolean;
  missionTime: number;
  orbitnetEnabled: boolean;
  telemetry: TelemetryData | null;
  linkStatus: LinkStatus | null;
  storedPackets: DataPacket[];
  transmittedPackets: DataPacket[];
  stats: MissionStats;
  apiError: string | null;
}

const defaultStats: MissionStats = {
  totalPackets: 0,
  storedPackets: 0,
  transmittedPackets: 0,
  forwardedPackets: 0,
  lostPackets: 0,
  groundLinkTime: 0,
  satelliteLinkTime: 0,
  blackoutTime: 0,
  dataLossRate: 0,
  averageLatency: 0,
};

export function useBackendSimulation() {
  const [state, setState] = useState<BackendSimulationState>({
    isRunning: false,
    missionTime: 0,
    orbitnetEnabled: true,
    telemetry: null,
    linkStatus: null,
    storedPackets: [],
    transmittedPackets: [],
    stats: defaultStats,
    apiError: null,
  });

  // Fetch status from backend
  const fetchStatus = useCallback(async () => {
    try {
      // Fetch mission status
      const statusResponse = await fetch('http://localhost:8000/api/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setState(prev => ({
          ...prev,
          isRunning: statusData.isRunning,
          missionTime: statusData.missionTime,
          apiError: null,
        }));
      }

      // Fetch telemetry
      const telemetryResponse = await fetch('http://localhost:8000/api/telemetry/latest');
      if (telemetryResponse.ok) {
        const telemetryData = await telemetryResponse.json();
        setState(prev => ({ ...prev, telemetry: telemetryData }));
      }

      // Fetch link status
      const linkResponse = await fetch('http://localhost:8000/api/link/status');
      if (linkResponse.ok) {
        const linkData = await linkResponse.json();
        setState(prev => ({
          ...prev,
          linkStatus: {
            type: linkData.link_type?.toLowerCase() || 'none',
            available: linkData.available,
            name: linkData.name || 'Unknown',
            signalStrength: linkData.signal_strength || 0,
            latency: linkData.latency || 0,
          },
        }));
      }

      // Fetch stored packets
      const packetsResponse = await fetch('http://localhost:8000/api/packets/stored');
      if (packetsResponse.ok) {
        const packetsData = await packetsResponse.json();
        setState(prev => ({
          ...prev,
          storedPackets: packetsData.packets || [],
        }));
      }

      // Fetch system status for stats
      const systemResponse = await fetch('http://localhost:8000/system/status');
      if (systemResponse.ok) {
        const systemData = await systemResponse.json();
        setState(prev => ({
          ...prev,
          orbitnetEnabled: systemData.system_mode === 'ORBITNET',
          stats: {
            totalPackets: systemData.telemetry_generated || 0,
            storedPackets: systemData.telemetry_buffered || 0,
            transmittedPackets: systemData.telemetry_sent || 0,
            forwardedPackets: systemData.telemetry_forwarded || 0,
            lostPackets: systemData.telemetry_lost || 0,
            groundLinkTime: calculateLinkPercentage(systemData, 'ground'),
            satelliteLinkTime: calculateLinkPercentage(systemData, 'satellite'),
            blackoutTime: calculateLinkPercentage(systemData, 'blackout'),
            dataLossRate: calculateDataLossRate(systemData),
            averageLatency: systemData.average_latency || 0,
          },
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        apiError: 'Unable to connect to backend server',
      }));
    }
  }, []);

  // Toggle mission running state
  const toggleRunning = useCallback(async () => {
    try {
      const endpoint = state.isRunning ? 'stop' : 'start';
      const response = await fetch(`http://localhost:8000/api/mission/${endpoint}`, {
        method: 'POST',
      });
      if (response.ok) {
        setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
      }
    } catch (error) {
      console.error('Failed to toggle mission:', error);
    }
  }, [state.isRunning]);

  // Toggle ORBITNET mode
  const toggleOrbitnet = useCallback(async () => {
    try {
      const newMode = state.orbitnetEnabled ? 'GROUND_ONLY' : 'ORBITNET';
      const response = await fetch(`http://localhost:8000/api/mode/${newMode}`, {
        method: 'POST',
      });
      if (response.ok) {
        setState(prev => ({ ...prev, orbitnetEnabled: !prev.orbitnetEnabled }));
      }
    } catch (error) {
      console.error('Failed to toggle ORBITNET:', error);
    }
  }, [state.orbitnetEnabled]);

  // Reset mission
  const reset = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/mission/reset', {
        method: 'POST',
      });
      if (response.ok) {
        setState(prev => ({
          ...prev,
          missionTime: 0,
          storedPackets: [],
          transmittedPackets: [],
          stats: defaultStats,
        }));
      }
    } catch (error) {
      console.error('Failed to reset mission:', error);
    }
  }, []);

  // Poll for updates
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    ...state,
    toggleRunning,
    toggleOrbitnet,
    reset,
  };
}

// Helper functions
function calculateLinkPercentage(systemData: any, linkType: string): number {
  const total = (systemData.ground_time || 0) + (systemData.satellite_time || 0) + (systemData.blackout_time || 0);
  if (total === 0) return 0;

  switch (linkType) {
    case 'ground':
      return ((systemData.ground_time || 0) / total) * 100;
    case 'satellite':
      return ((systemData.satellite_time || 0) / total) * 100;
    case 'blackout':
      return ((systemData.blackout_time || 0) / total) * 100;
    default:
      return 0;
  }
}

function calculateDataLossRate(systemData: any): number {
  const total = systemData.telemetry_generated || 0;
  const lost = systemData.telemetry_lost || 0;
  if (total === 0) return 0;
  return (lost / total) * 100;
}
