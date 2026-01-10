import { LinkStatus } from '@/lib/simulation';
import { Satellite, Radio, WifiOff, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

interface LinkStatusPanelProps {
  linkStatus: LinkStatus | null;
  storedPackets: number;
  transmittedPackets: number;
}

interface EmulatorStatus {
  emulator_enabled: boolean;
  emulator_demo_mode: boolean;
  emulator_avg_latency_ms: number;
}

export function LinkStatusPanel({ linkStatus, storedPackets, transmittedPackets }: LinkStatusPanelProps) {
  const [emulatorStatus, setEmulatorStatus] = useState<EmulatorStatus | null>(null);

  // Fetch emulator status
  useEffect(() => {
    const fetchEmulatorStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/status');
        if (response.ok) {
          const data = await response.json();
          setEmulatorStatus({
            emulator_enabled: data.emulator_enabled || false,
            emulator_demo_mode: data.emulator_demo_mode || false,
            emulator_avg_latency_ms: data.emulator_avg_latency_ms || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch emulator status:', error);
      }
    };

    fetchEmulatorStatus();
    const interval = setInterval(fetchEmulatorStatus, 2000);
    return () => clearInterval(interval);
  }, []);
  const getStatusConfig = () => {
    if (!linkStatus) {
      return {
        icon: WifiOff,
        label: 'Initializing...',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        indicatorClass: 'status-blackout',
      };
    }

    switch (linkStatus.type) {
      case 'ground':
        return {
          icon: Radio,
          label: 'Ground Station',
          color: 'text-success',
          bgColor: 'bg-success/10',
          indicatorClass: 'status-connected',
        };
      case 'satellite':
        return {
          icon: Satellite,
          label: 'Satellite Relay',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          indicatorClass: 'status-connected',
        };
      default:
        return {
          icon: WifiOff,
          label: 'No Link',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          indicatorClass: 'status-blackout',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="card-glow bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="panel-header">Communication Link</h3>
        {emulatorStatus?.emulator_enabled && (
          <Badge variant={emulatorStatus.emulator_demo_mode ? "default" : "outline"} className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            EMULATOR
          </Badge>
        )}
      </div>

      {/* Main Status Display */}
      <div className={cn('rounded-lg p-6 mb-6', config.bgColor)}>
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-full', config.bgColor, 'border border-current/20')}>
            <Icon className={cn('w-8 h-8', config.color)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className={cn('status-indicator', config.indicatorClass)} />
              <span className={cn('font-display text-lg', config.color)}>
                {config.label}
              </span>
            </div>
            {linkStatus && (
              <div className="text-sm text-muted-foreground mt-1">
                {linkStatus.name}
              </div>
            )}
          </div>
        </div>

        {linkStatus?.available && (
          <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Signal Strength</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-background/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${linkStatus.signalStrength}%` }}
                  />
                </div>
                <span className="telemetry-value text-sm">
                  {linkStatus.signalStrength.toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Latency</div>
              <div className="telemetry-value text-lg">
                {emulatorStatus?.emulator_enabled && emulatorStatus.emulator_avg_latency_ms > 0 
                  ? emulatorStatus.emulator_avg_latency_ms.toFixed(0)
                  : linkStatus.latency.toFixed(0)}
                <span className="text-xs text-muted-foreground ml-1">ms</span>
                {emulatorStatus?.emulator_enabled && (
                  <span className="text-xs text-warning ml-1">(emulated)</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Flow Visualization */}
      <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Data Flow</span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-2">
              <span className="font-display text-primary text-lg font-bold">SC</span>
            </div>
            <span className="text-xs text-muted-foreground">Spacecraft</span>
          </div>

          <div className="flex-1 relative h-2 bg-background/50 rounded-full overflow-hidden">
            {linkStatus?.available && (
              <div className="absolute inset-0 data-stream" />
            )}
            <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          </div>

          <div className="text-center">
            <div className={cn(
              'w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-2',
              linkStatus?.type === 'ground' ? 'bg-success/10 border-success/30' :
              linkStatus?.type === 'satellite' ? 'bg-primary/10 border-primary/30' :
              'bg-destructive/10 border-destructive/30'
            )}>
              <Icon className={cn('w-6 h-6', config.color)} />
            </div>
            <span className="text-xs text-muted-foreground">
              {linkStatus?.type === 'ground' ? 'Ground' : 
               linkStatus?.type === 'satellite' ? 'Relay' : 'N/A'}
            </span>
          </div>

          <div className="flex-1 relative h-2 bg-background/50 rounded-full overflow-hidden">
            {linkStatus?.available && (
              <div className="absolute inset-0 data-stream" style={{ animationDelay: '0.5s' }} />
            )}
            <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-2">
              <span className="font-display text-success text-lg font-bold">MCC</span>
            </div>
            <span className="text-xs text-muted-foreground">Control</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-secondary/30 rounded-lg p-3 border border-border/50 text-center">
          <div className="telemetry-value text-2xl">{transmittedPackets}</div>
          <div className="text-xs text-muted-foreground">Transmitted</div>
        </div>
        <div className={cn(
          'rounded-lg p-3 border text-center',
          storedPackets > 0 ? 'bg-warning/10 border-warning/30' : 'bg-secondary/30 border-border/50'
        )}>
          <div className={cn('text-2xl font-mono font-bold', storedPackets > 0 ? 'text-warning' : 'telemetry-value')}>
            {storedPackets}
          </div>
          <div className="text-xs text-muted-foreground">Stored (Buffer)</div>
        </div>
      </div>
    </div>
  );
}
