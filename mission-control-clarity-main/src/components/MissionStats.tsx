import { MissionStats as MissionStatsType } from '@/lib/simulation';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, Satellite, Radio, WifiOff, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MissionStatsProps {
  stats: MissionStatsType;
  orbitnetEnabled: boolean;
}

interface EmulatorStats {
  emulator_enabled: boolean;
  emulator_demo_mode: boolean;
  emulator_packets_processed: number;
  emulator_success_rate: number;
  emulator_avg_latency_ms: number;
}

export function MissionStats({ stats, orbitnetEnabled }: MissionStatsProps) {
  const [emulatorStats, setEmulatorStats] = useState<EmulatorStats | null>(null);

  // Fetch emulator statistics
  useEffect(() => {
    const fetchEmulatorStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/status');
        if (response.ok) {
          const data = await response.json();
          setEmulatorStats({
            emulator_enabled: data.emulator_enabled || false,
            emulator_demo_mode: data.emulator_demo_mode || false,
            emulator_packets_processed: data.emulator_packets_processed || 0,
            emulator_success_rate: data.emulator_success_rate || 0,
            emulator_avg_latency_ms: data.emulator_avg_latency_ms || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch emulator stats:', error);
      }
    };

    fetchEmulatorStats();
    const interval = setInterval(fetchEmulatorStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const dataLossGroundOnly = orbitnetEnabled ? stats.blackoutTime : stats.dataLossRate;
  const dataLossWithMesh = orbitnetEnabled ? 0 : stats.dataLossRate;

  return (
    <div className="card-glow bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="panel-header">Mission Statistics</h3>
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-medium',
          orbitnetEnabled 
            ? 'bg-success/20 text-success border border-success/30' 
            : 'bg-muted text-muted-foreground border border-border'
        )}>
          ORBITNET-MESH {orbitnetEnabled ? 'ACTIVE' : 'DISABLED'}
        </div>
      </div>

      {/* Zero Data Loss Indicator */}
      <div className={cn(
        'rounded-lg p-4 mb-6 flex items-center gap-4',
        orbitnetEnabled && stats.storedPackets === 0
          ? 'bg-success/10 border border-success/30'
          : stats.storedPackets > 0
          ? 'bg-warning/10 border border-warning/30'
          : 'bg-destructive/10 border border-destructive/30'
      )}>
        {orbitnetEnabled && stats.storedPackets === 0 ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-success" />
            <div>
              <div className="font-display text-success">ZERO DATA LOSS</div>
              <div className="text-xs text-muted-foreground">
                All telemetry packets successfully transmitted or forwarded
              </div>
            </div>
          </>
        ) : stats.storedPackets > 0 ? (
          <>
            <Clock className="w-8 h-8 text-warning" />
            <div>
              <div className="font-display text-warning">DATA BUFFERED</div>
              <div className="text-xs text-muted-foreground">
                {stats.storedPackets} packets awaiting transmission
              </div>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-8 h-8 text-destructive" />
            <div>
              <div className="font-display text-destructive">DATA AT RISK</div>
              <div className="text-xs text-muted-foreground">
                No relay available - ORBITNET-MESH disabled
              </div>
            </div>
          </>
        )}
      </div>

      {/* Comparison Charts */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">Ground-Only Mode</span>
            <span className="text-destructive font-mono">{dataLossGroundOnly.toFixed(1)}% blackout</span>
          </div>
          <div className="h-3 bg-background/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-destructive/50 transition-all duration-500"
              style={{ width: `${100 - dataLossGroundOnly}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">ORBITNET-MESH Mode</span>
            <span className="text-success font-mono">{dataLossWithMesh.toFixed(1)}% loss</span>
          </div>
          <div className="h-3 bg-background/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-success transition-all duration-500"
              style={{ width: `${100 - dataLossWithMesh}%` }}
            />
          </div>
        </div>
      </div>

      {/* Link Distribution */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Link Type Distribution</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-success/10 rounded-lg p-3 text-center border border-success/20">
            <Radio className="w-5 h-5 text-success mx-auto mb-1" />
            <div className="font-mono text-success text-lg">{stats.groundLinkTime.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Ground</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20">
            <Satellite className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="font-mono text-primary text-lg">{stats.satelliteLinkTime.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Satellite</div>
          </div>
          <div className="bg-destructive/10 rounded-lg p-3 text-center border border-destructive/20">
            <WifiOff className="w-5 h-5 text-destructive mx-auto mb-1" />
            <div className="font-mono text-destructive text-lg">{stats.blackoutTime.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Blackout</div>
          </div>
        </div>
      </div>

      {/* Packet Summary with Meaning Labels */}
      <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="telemetry-value text-2xl">{stats.totalPackets}</div>
          <div className="text-xs text-muted-foreground">
            📊 Total Data Packets Generated
          </div>
        </div>
        <div>
          <div className="telemetry-value text-2xl">
            {emulatorStats?.emulator_enabled && emulatorStats.emulator_avg_latency_ms > 0
              ? emulatorStats.emulator_avg_latency_ms.toFixed(0)
              : stats.averageLatency.toFixed(0)}ms
          </div>
          <div className="text-xs text-muted-foreground">
            ⏱️ Communication Delay
            {emulatorStats?.emulator_enabled && (
              <span className="text-warning ml-1">(Emulated)</span>
            )}
          </div>
        </div>
      </div>

      {/* Emulator Statistics */}
      {emulatorStats?.emulator_enabled && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Satellite Emulator
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20">
              <div className="font-mono text-primary text-lg">
                {emulatorStats.emulator_packets_processed}
              </div>
              <div className="text-xs text-muted-foreground">
                🛰️ Packets Processed (Emulated)
              </div>
            </div>
            <div className="bg-success/10 rounded-lg p-3 text-center border border-success/20">
              <div className="font-mono text-success text-lg">
                {emulatorStats.emulator_success_rate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                ✅ Transmission Success Rate
              </div>
            </div>
            <div className="bg-warning/10 rounded-lg p-3 text-center border border-warning/20">
              <div className="font-mono text-warning text-lg">
                {emulatorStats.emulator_avg_latency_ms.toFixed(0)}ms
              </div>
              <div className="text-xs text-muted-foreground">
                ⏱️ Satellite Communication Delay
              </div>
            </div>
          </div>
          {emulatorStats.emulator_demo_mode && (
            <div className="mt-2 text-xs text-center text-muted-foreground">
              * Demo mode active - emulating satellite behavior
            </div>
          )}
        </div>
      )}
    </div>
  );
}
