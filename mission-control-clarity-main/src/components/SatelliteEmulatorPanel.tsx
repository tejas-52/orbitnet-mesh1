import { useState, useEffect } from 'react';
import { Satellite, Settings, Zap, Clock, TrendingDown, BarChart3, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmulatorStatus {
  enabled: boolean;
  configuration: {
    enabled: boolean;
    latency_ms: number;
    packet_loss_rate: number;
    bandwidth_kbps: number;
    jitter_ms: number;
  };
  statistics: {
    emulator_enabled: boolean;
    total_packets_processed: number;
    packets_transmitted: number;
    packets_dropped: number;
    success_rate_percent: number;
    average_latency_ms: number;
    configured_latency_ms: number;
    configured_loss_rate: number;
    bandwidth_kbps: number;
    recent_transmissions: number;
  };
  queue_size: number;
  is_transmitting: boolean;
}

interface DemoMode {
  demo_mode_enabled: boolean;
  explanation: string;
}

const DEMO_CONFIGS = {
  low_earth_orbit: {
    name: "LEO Satellite",
    description: "Low Earth Orbit (150ms latency)",
    latency_ms: 150,
    packet_loss_rate: 0.02,
    bandwidth_kbps: 1024,
    jitter_ms: 30
  },
  geostationary: {
    name: "GEO Satellite", 
    description: "Geostationary Orbit (600ms latency)",
    latency_ms: 600,
    packet_loss_rate: 0.01,
    bandwidth_kbps: 512,
    jitter_ms: 100
  },
  deep_space: {
    name: "Deep Space",
    description: "Deep Space Mission (1500ms latency)",
    latency_ms: 1500,
    packet_loss_rate: 0.10,
    bandwidth_kbps: 128,
    jitter_ms: 200
  },
  ideal: {
    name: "Ideal Link",
    description: "Perfect conditions (50ms latency)",
    latency_ms: 50,
    packet_loss_rate: 0.0,
    bandwidth_kbps: 2048,
    jitter_ms: 5
  },
  challenging: {
    name: "Challenging",
    description: "Poor conditions (400ms latency, 15% loss)",
    latency_ms: 400,
    packet_loss_rate: 0.15,
    bandwidth_kbps: 256,
    jitter_ms: 150
  }
};

export function SatelliteEmulatorPanel() {
  const [emulatorStatus, setEmulatorStatus] = useState<EmulatorStatus | null>(null);
  const [demoMode, setDemoMode] = useState<DemoMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch emulator status
  const fetchEmulatorStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/emulator/status');
      if (response.ok) {
        const data = await response.json();
        setEmulatorStatus(data);
        setError(null);
      } else {
        setError('Failed to fetch emulator status');
      }
    } catch (err) {
      setError('Emulator not available');
    }
  };

  // Fetch demo mode status
  const fetchDemoMode = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/emulator/demo-mode');
      if (response.ok) {
        const data = await response.json();
        setDemoMode(data);
      }
    } catch (err) {
      console.error('Failed to fetch demo mode:', err);
    }
  };

  // Toggle emulator on/off
  const toggleEmulator = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/emulator/toggle', {
        method: 'POST'
      });
      if (response.ok) {
        await fetchEmulatorStatus();
      }
    } catch (err) {
      setError('Failed to toggle emulator');
    }
    setIsLoading(false);
  };

  // Toggle demo mode
  const toggleDemoMode = async () => {
    if (!demoMode) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/emulator/demo-mode/${!demoMode.demo_mode_enabled}`, {
        method: 'POST'
      });
      if (response.ok) {
        await fetchDemoMode();
      }
    } catch (err) {
      setError('Failed to toggle demo mode');
    }
    setIsLoading(false);
  };

  // Apply demo configuration
  const applyDemoConfig = async (configName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/emulator/apply-demo-config/${configName}`, {
        method: 'POST'
      });
      if (response.ok) {
        await fetchEmulatorStatus();
      }
    } catch (err) {
      setError('Failed to apply configuration');
    }
    setIsLoading(false);
  };

  // Configure emulator manually
  const configureEmulator = async (config: Partial<EmulatorStatus['configuration']>) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/emulator/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (response.ok) {
        await fetchEmulatorStatus();
      }
    } catch (err) {
      setError('Failed to configure emulator');
    }
    setIsLoading(false);
  };

  // Reset statistics
  const resetStatistics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/emulator/reset', {
        method: 'POST'
      });
      if (response.ok) {
        await fetchEmulatorStatus();
      }
    } catch (err) {
      setError('Failed to reset statistics');
    }
    setIsLoading(false);
  };

  // Poll for updates
  useEffect(() => {
    fetchEmulatorStatus();
    fetchDemoMode();
    
    const interval = setInterval(() => {
      fetchEmulatorStatus();
      fetchDemoMode();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="card-glow bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Satellite className="w-5 h-5 text-muted-foreground" />
          <h3 className="panel-header">Satellite Link Emulator</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {error}
        </div>
      </div>
    );
  }

  if (!emulatorStatus || !demoMode) {
    return (
      <div className="card-glow bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Satellite className="w-5 h-5 text-muted-foreground" />
          <h3 className="panel-header">Satellite Link Emulator</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Loading emulator status...
        </div>
      </div>
    );
  }

  const config = emulatorStatus.configuration;
  const stats = emulatorStatus.statistics;

  return (
    <div className="card-glow bg-card rounded-lg border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Satellite className="w-5 h-5 text-primary" />
          <h3 className="panel-header">Satellite Link Emulator</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={emulatorStatus.enabled ? "default" : "secondary"}>
            {emulatorStatus.enabled ? "ACTIVE" : "INACTIVE"}
          </Badge>
          <Badge variant={demoMode.demo_mode_enabled ? "default" : "outline"}>
            {demoMode.demo_mode_enabled ? "DEMO" : "PHYSICS"}
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <div className="space-y-6">
        {/* Main Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Emulator Power
            </label>
            <Button
              onClick={toggleEmulator}
              disabled={isLoading}
              variant={emulatorStatus.enabled ? "destructive" : "default"}
              size="sm"
              className="w-full"
            >
              {emulatorStatus.enabled ? (
                <>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Disable
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Enable
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Demo Mode
            </label>
            <Button
              onClick={toggleDemoMode}
              disabled={isLoading}
              variant={demoMode.demo_mode_enabled ? "default" : "outline"}
              size="sm"
              className="w-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              {demoMode.demo_mode_enabled ? "Demo ON" : "Physics"}
            </Button>
          </div>
        </div>

        {/* Quick Configurations */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Quick Configurations
          </label>
          <Select onValueChange={applyDemoConfig} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select satellite type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DEMO_CONFIGS).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center justify-between w-full">
                    <span>{config.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {config.latency_ms}ms
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Latency
              </span>
            </div>
            <div className="text-lg font-bold text-primary">
              {config.latency_ms}ms
            </div>
            <div className="text-xs text-muted-foreground">
              ±{config.jitter_ms}ms jitter
            </div>
          </div>

          <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Packet Loss
              </span>
            </div>
            <div className="text-lg font-bold text-warning">
              {(config.packet_loss_rate * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {config.bandwidth_kbps} Kbps
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Transmission Statistics
            </span>
            <Button
              onClick={resetStatistics}
              disabled={isLoading}
              variant="ghost"
              size="sm"
            >
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {stats.total_packets_processed}
              </div>
              <div className="text-xs text-muted-foreground">Processed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success">
                {stats.success_rate_percent.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Success</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {stats.average_latency_ms.toFixed(0)}ms
              </div>
              <div className="text-xs text-muted-foreground">Avg Latency</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-sm font-medium text-success">
                {stats.packets_transmitted}
              </div>
              <div className="text-xs text-muted-foreground">Transmitted</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-destructive">
                {stats.packets_dropped}
              </div>
              <div className="text-xs text-muted-foreground">Dropped</div>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {demoMode.demo_mode_enabled ? "Demo Mode Active" : "Physics Mode Active"}
            </span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                emulatorStatus.enabled ? 'bg-success animate-pulse' : 'bg-muted-foreground'
              }`} />
              <span className="text-muted-foreground">
                {emulatorStatus.enabled ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}