import { useEffect, useState } from 'react';
import { Satellite, Radio, Shield, Settings, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SystemStatus {
  system_mode: string;
  telemetry_generated: number;
  telemetry_sent: number;
  telemetry_buffered: number;
  telemetry_lost: number;
  satellite_visible: boolean;
  ground_visible: boolean;
  current_link: string;
  decision_explanation: string;
  emulator_enabled?: boolean;
  emulator_demo_mode?: boolean;
}

interface MissionStatus {
  isRunning: boolean;
  missionTime: number;
}

export function MissionSummaryBar() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [missionStatus, setMissionStatus] = useState<MissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch system status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Get system status
        const systemResponse = await fetch('http://localhost:8000/system/status');
        if (systemResponse.ok) {
          const systemData = await systemResponse.json();
          setSystemStatus(systemData);
        }

        // Get mission status
        const missionResponse = await fetch('http://localhost:8000/api/status');
        if (missionResponse.ok) {
          const missionData = await missionResponse.json();
          setMissionStatus({
            isRunning: missionData.isRunning,
            missionTime: missionData.missionTime
          });
        }

        setError(null);
      } catch (err) {
        setError('Connection lost');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="sticky top-0 z-50 bg-destructive/10 border-b border-destructive/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">System Offline</span>
            <span className="text-xs">•</span>
            <span className="text-xs">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!systemStatus || !missionStatus) {
    return (
      <div className="sticky top-0 z-50 bg-card/80 border-b border-border backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
            <span className="text-sm">Loading mission status...</span>
          </div>
        </div>
      </div>
    );
  }

  // Determine mission status
  const getMissionStatus = () => {
    if (!missionStatus.isRunning) {
      return { icon: AlertTriangle, label: 'STOPPED', color: 'text-muted-foreground', bg: 'bg-muted' };
    }
    return { icon: Satellite, label: 'RUNNING', color: 'text-success', bg: 'bg-success/10' };
  };

  // Determine communication status
  const getCommunicationStatus = () => {
    if (systemStatus.current_link === 'NONE') {
      return { icon: AlertTriangle, label: 'BLACKOUT', color: 'text-warning', bg: 'bg-warning/10' };
    }
    if (systemStatus.current_link === 'GROUND') {
      return { icon: Radio, label: 'GROUND LINK', color: 'text-success', bg: 'bg-success/10' };
    }
    if (systemStatus.current_link === 'SATELLITE') {
      return { icon: Satellite, label: 'SATELLITE RELAY', color: 'text-primary', bg: 'bg-primary/10' };
    }
    return { icon: Radio, label: 'PARTIAL', color: 'text-warning', bg: 'bg-warning/10' };
  };

  // Determine data safety status
  const getDataSafetyStatus = () => {
    const dataLossRate = systemStatus.telemetry_lost / Math.max(1, systemStatus.telemetry_generated) * 100;
    
    if (systemStatus.system_mode === 'ORBITNET' || dataLossRate === 0) {
      return { icon: Shield, label: '100% SAFE', color: 'text-success', bg: 'bg-success/10' };
    }
    if (dataLossRate < 5) {
      return { icon: AlertTriangle, label: 'MOSTLY SAFE', color: 'text-warning', bg: 'bg-warning/10' };
    }
    return { icon: AlertTriangle, label: 'DATA AT RISK', color: 'text-destructive', bg: 'bg-destructive/10' };
  };

  // Determine system mode
  const getSystemMode = () => {
    if (systemStatus.system_mode === 'ORBITNET') {
      return { icon: CheckCircle2, label: 'ORBITNET (Zero Data Loss)', color: 'text-success', bg: 'bg-success/10' };
    }
    return { icon: Settings, label: 'GROUND-ONLY', color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  const missionInfo = getMissionStatus();
  const commInfo = getCommunicationStatus();
  const safetyInfo = getDataSafetyStatus();
  const modeInfo = getSystemMode();

  const MissionIcon = missionInfo.icon;
  const CommIcon = commInfo.icon;
  const SafetyIcon = safetyInfo.icon;
  const ModeIcon = modeInfo.icon;

  return (
    <div className="sticky top-0 z-50 bg-card/95 border-b border-border backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        {/* Main Status Row */}
        <div className="flex flex-wrap items-center gap-6 mb-2">
          {/* Mission Status */}
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-full', missionInfo.bg)}>
              <MissionIcon className={cn('w-4 h-4', missionInfo.color)} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Mission:</span>
              <span className={cn('ml-2 font-medium', missionInfo.color)}>{missionInfo.label}</span>
            </div>
          </div>

          {/* Communication Status */}
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-full', commInfo.bg)}>
              <CommIcon className={cn('w-4 h-4', commInfo.color)} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Communication:</span>
              <span className={cn('ml-2 font-medium', commInfo.color)}>{commInfo.label}</span>
            </div>
          </div>

          {/* Data Safety */}
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-full', safetyInfo.bg)}>
              <SafetyIcon className={cn('w-4 h-4', safetyInfo.color)} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Data Safety:</span>
              <span className={cn('ml-2 font-medium', safetyInfo.color)}>{safetyInfo.label}</span>
            </div>
          </div>

          {/* System Mode */}
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-full', modeInfo.bg)}>
              <ModeIcon className={cn('w-4 h-4', modeInfo.color)} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Mode:</span>
              <span className={cn('ml-2 font-medium', modeInfo.color)}>{modeInfo.label}</span>
            </div>
          </div>

          {/* Emulator Badge */}
          {systemStatus.emulator_enabled && (
            <Badge variant={systemStatus.emulator_demo_mode ? "default" : "outline"} className="text-xs">
              🛰️ EMULATOR {systemStatus.emulator_demo_mode ? 'DEMO' : 'PHYSICS'}
            </Badge>
          )}
        </div>

        {/* Explanation Text */}
        <div className="text-xs text-muted-foreground">
          {systemStatus.system_mode === 'ORBITNET' 
            ? "This system ensures no telemetry is lost even during communication blackouts."
            : "Ground-only mode - data may be lost during communication blackouts."
          }
          {systemStatus.telemetry_buffered > 0 && (
            <span className="ml-2 text-warning">
              • {systemStatus.telemetry_buffered} packets safely stored, awaiting transmission
            </span>
          )}
        </div>
      </div>
    </div>
  );
}