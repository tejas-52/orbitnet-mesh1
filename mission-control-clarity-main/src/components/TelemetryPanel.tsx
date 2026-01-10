import { TelemetryData } from '@/lib/simulation';
import { Gauge, Thermometer, Fuel, Battery, Navigation, Signal, Satellite, Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

interface TelemetryPanelProps {
  telemetry: TelemetryData | null;
}

interface EmulatorInfo {
  emulator_enabled: boolean;
  emulator_demo_mode: boolean;
  emulator_latency_ms: number;
  emulator_packets_processed: number;
  emulator_avg_latency_ms: number;
}

export function TelemetryPanel({ telemetry }: TelemetryPanelProps) {
  const [emulatorInfo, setEmulatorInfo] = useState<EmulatorInfo | null>(null);

  // Fetch emulator info from system status
  useEffect(() => {
    const fetchEmulatorInfo = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/status');
        if (response.ok) {
          const data = await response.json();
          setEmulatorInfo({
            emulator_enabled: data.emulator_enabled || false,
            emulator_demo_mode: data.emulator_demo_mode || false,
            emulator_latency_ms: data.emulator_latency_ms || 0,
            emulator_packets_processed: data.emulator_packets_processed || 0,
            emulator_avg_latency_ms: data.emulator_avg_latency_ms || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch emulator info:', error);
      }
    };

    fetchEmulatorInfo();
    const interval = setInterval(fetchEmulatorInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!telemetry) {
    return (
      <div className="card-glow bg-card rounded-lg border border-border p-6">
        <h3 className="panel-header mb-4">Spacecraft Telemetry</h3>
        <div className="text-muted-foreground text-sm">Awaiting telemetry data...</div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Altitude',
      value: telemetry.altitude.toFixed(1),
      unit: 'km',
      icon: Gauge,
      color: 'text-primary',
    },
    {
      label: 'Velocity',
      value: telemetry.velocity.toFixed(2),
      unit: 'km/s',
      icon: Navigation,
      color: 'text-primary',
    },
    {
      label: 'Temperature',
      value: telemetry.temperature.toFixed(1),
      unit: '°C',
      icon: Thermometer,
      color: telemetry.temperature > 40 ? 'text-warning' : 'text-success',
    },
    {
      label: 'Fuel Level',
      value: telemetry.fuelLevel.toFixed(1),
      unit: '%',
      icon: Fuel,
      color: telemetry.fuelLevel < 20 ? 'text-destructive' : 'text-success',
    },
    {
      label: 'Battery',
      value: telemetry.batteryLevel.toFixed(1),
      unit: '%',
      icon: Battery,
      color: telemetry.batteryLevel < 30 ? 'text-warning' : 'text-success',
    },
    {
      label: 'Signal',
      value: telemetry.signalStrength.toFixed(0),
      unit: '%',
      icon: Signal,
      color: telemetry.signalStrength < 50 ? 'text-warning' : 'text-primary',
    },
  ];

  return (
    <div className="card-glow bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="panel-header">Spacecraft Telemetry</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {new Date(telemetry.timestamp).toISOString().slice(11, 23)}
          </span>
          {emulatorInfo?.emulator_enabled && (
            <Badge variant={emulatorInfo.emulator_demo_mode ? "default" : "outline"} className="text-xs">
              <Satellite className="w-3 h-3 mr-1" />
              {emulatorInfo.emulator_demo_mode ? "EMULATED" : "PHYSICS"}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-secondary/30 rounded-lg p-4 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {metric.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`telemetry-value text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </span>
              <span className="text-xs text-muted-foreground">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Pitch</div>
            <div className="telemetry-value text-sm">
              {telemetry.orientation.pitch.toFixed(2)}°
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Yaw</div>
            <div className="telemetry-value text-sm">
              {telemetry.orientation.yaw.toFixed(2)}°
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Roll</div>
            <div className="telemetry-value text-sm">
              {telemetry.orientation.roll.toFixed(2)}°
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Position</span>
          <span className="font-mono text-primary">
            {telemetry.position.lat.toFixed(2)}°, {telemetry.position.lng.toFixed(2)}°
          </span>
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span className="text-muted-foreground">Packet ID</span>
          <span className="font-mono text-primary/70">{telemetry.dataPacketId}</span>
        </div>
        
        {/* Emulator Status */}
        {emulatorInfo?.emulator_enabled && (
          <>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-muted-foreground">Link Latency</span>
              <span className="font-mono text-warning">
                {emulatorInfo.emulator_avg_latency_ms > 0 
                  ? `${emulatorInfo.emulator_avg_latency_ms.toFixed(0)}ms` 
                  : `${emulatorInfo.emulator_latency_ms}ms`}
              </span>
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-muted-foreground">Packets Processed</span>
              <span className="font-mono text-success">
                {emulatorInfo.emulator_packets_processed}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
