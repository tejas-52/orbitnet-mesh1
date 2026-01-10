import { useState, useEffect } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemStatus {
  system_mode: string;
  telemetry_generated: number;
  telemetry_sent: number;
  telemetry_buffered: number;
  telemetry_forwarded: number;
  telemetry_lost: number;
  satellite_visible: boolean;
  ground_visible: boolean;
  current_link: string;
  decision_explanation: string;
}

export function AIExplanation() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/status');
        if (response.ok) {
          const data = await response.json();
          setSystemStatus(data);
          setError(null);
        } else {
          setError('Failed to fetch system status');
        }
      } catch (err) {
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchSystemStatus();

    // Poll every 2 seconds for updates
    const interval = setInterval(fetchSystemStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="card-glow bg-card rounded-lg border border-border p-6">
        <h3 className="panel-header mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI System Analysis
        </h3>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading AI analysis...</span>
        </div>
      </div>
    );
  }

  if (error || !systemStatus) {
    return (
      <div className="card-glow bg-card rounded-lg border border-border p-6">
        <h3 className="panel-header mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-destructive" />
          AI System Analysis
        </h3>
        <div className="text-sm text-destructive">
          {error || 'No system status available'}
        </div>
      </div>
    );
  }

  const getLinkStatusColor = (link: string) => {
    switch (link) {
      case 'GROUND':
        return 'text-success';
      case 'SATELLITE':
        return 'text-primary';
      default:
        return 'text-destructive';
    }
  };

  const getModeColor = (mode: string) => {
    return mode === 'ORBITNET' ? 'text-primary' : 'text-warning';
  };

  return (
    <div className="card-glow bg-card rounded-lg border border-border p-6">
      <h3 className="panel-header mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        AI System Analysis
      </h3>

      {/* System Mode and Link Status */}
      <div className="mb-4 p-4 bg-secondary/30 rounded-lg border border-border/50">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">System Mode</div>
            <div className={cn('font-display text-sm font-semibold', getModeColor(systemStatus.system_mode))}>
              {systemStatus.system_mode}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Active Link</div>
            <div className={cn('font-display text-sm font-semibold', getLinkStatusColor(systemStatus.current_link))}>
              {systemStatus.current_link}
            </div>
          </div>
        </div>

        {/* Visibility Indicators */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              systemStatus.satellite_visible ? 'bg-primary' : 'bg-muted-foreground/30'
            )} />
            <span className={systemStatus.satellite_visible ? 'text-primary' : 'text-muted-foreground'}>
              Satellite
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              systemStatus.ground_visible ? 'bg-success' : 'bg-muted-foreground/30'
            )} />
            <span className={systemStatus.ground_visible ? 'text-success' : 'text-muted-foreground'}>
              Ground
            </span>
          </div>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
          <Brain className="w-3 h-3" />
          Gemini AI Explanation
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-sm leading-relaxed text-foreground">
            {systemStatus.decision_explanation}
          </p>
        </div>
      </div>

      {/* Telemetry Statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Generated</div>
          <div className="telemetry-value text-lg">{systemStatus.telemetry_generated}</div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Sent</div>
          <div className="telemetry-value text-lg">{systemStatus.telemetry_sent}</div>
        </div>
        <div className={cn(
          'rounded-lg p-3 border',
          systemStatus.telemetry_buffered > 0 
            ? 'bg-warning/10 border-warning/30' 
            : 'bg-secondary/30 border-border/50'
        )}>
          <div className="text-xs text-muted-foreground mb-1">Buffered</div>
          <div className={cn(
            'text-lg font-mono font-bold',
            systemStatus.telemetry_buffered > 0 ? 'text-warning' : 'telemetry-value'
          )}>
            {systemStatus.telemetry_buffered}
          </div>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Forwarded</div>
          <div className="telemetry-value text-lg">{systemStatus.telemetry_forwarded}</div>
        </div>
      </div>

      {/* Zero Data Loss Indicator */}
      {systemStatus.system_mode === 'ORBITNET' && (
        <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span className="text-sm font-medium text-success">
              Zero Data Loss Mode Active
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Data Loss: {systemStatus.telemetry_lost} packets
          </div>
        </div>
      )}
    </div>
  );
}