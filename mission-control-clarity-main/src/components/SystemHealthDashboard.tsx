import { useEffect, useState } from 'react';
import { Activity, Shield, Zap, Database, Satellite, Radio, AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  data_integrity: number;
  communication_reliability: number;
  buffer_efficiency: number;
  emulator_performance?: number;
}

interface SystemMetrics {
  telemetry_generated: number;
  telemetry_sent: number;
  telemetry_buffered: number;
  telemetry_lost: number;
  current_link: string;
  system_mode: string;
  emulator_enabled?: boolean;
}

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
  description: string;
}

export function SystemHealthDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [missionTime, setMissionTime] = useState(0);

  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        // Get system status
        const statusResponse = await fetch('http://localhost:8000/system/status');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setSystemMetrics(statusData);
          
          // Calculate health metrics
          const dataLossRate = statusData.telemetry_generated > 0 
            ? (statusData.telemetry_lost / statusData.telemetry_generated) * 100 
            : 0;
          
          const deliveryRate = statusData.telemetry_generated > 0 
            ? (statusData.telemetry_sent / statusData.telemetry_generated) * 100 
            : 100;
          
          const bufferEfficiency = statusData.telemetry_generated > 0 
            ? Math.max(0, 100 - (statusData.telemetry_buffered / statusData.telemetry_generated) * 100)
            : 100;

          const health: SystemHealth = {
            overall_status: dataLossRate === 0 ? 'healthy' : dataLossRate < 5 ? 'warning' : 'critical',
            uptime: missionTime,
            data_integrity: 100 - dataLossRate,
            communication_reliability: deliveryRate,
            buffer_efficiency: bufferEfficiency,
            emulator_performance: statusData.emulator_enabled ? 95 : undefined
          };
          
          setSystemHealth(health);
          
          // Update performance metrics
          updatePerformanceMetrics(statusData, health);
        }

        // Get mission status
        const missionResponse = await fetch('http://localhost:8000/api/status');
        if (missionResponse.ok) {
          const missionData = await missionResponse.json();
          setIsRunning(missionData.isRunning);
          setMissionTime(missionData.missionTime);
        }

      } catch (error) {
        console.error('Failed to fetch system health:', error);
      }
    };

    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 2000);
    return () => clearInterval(interval);
  }, [missionTime]);

  const updatePerformanceMetrics = (metrics: SystemMetrics, health: SystemHealth) => {
    const newMetrics: PerformanceMetric[] = [
      {
        name: 'Data Integrity',
        value: health.data_integrity,
        target: 100,
        status: health.data_integrity === 100 ? 'good' : health.data_integrity > 95 ? 'warning' : 'critical',
        trend: 'stable',
        icon: Shield,
        color: health.data_integrity === 100 ? 'text-success' : health.data_integrity > 95 ? 'text-warning' : 'text-destructive',
        description: metrics.system_mode === 'ORBITNET' ? 'Zero data loss guaranteed' : 'Data may be lost during blackouts'
      },
      {
        name: 'Communication',
        value: health.communication_reliability,
        target: 90,
        status: health.communication_reliability > 90 ? 'good' : health.communication_reliability > 70 ? 'warning' : 'critical',
        trend: metrics.current_link !== 'NONE' ? 'up' : 'down',
        icon: metrics.current_link === 'GROUND' ? Radio : Satellite,
        color: health.communication_reliability > 90 ? 'text-success' : health.communication_reliability > 70 ? 'text-warning' : 'text-destructive',
        description: `${metrics.current_link !== 'NONE' ? 'Connected via ' + metrics.current_link.toLowerCase() : 'No active connection'}`
      },
      {
        name: 'Buffer Efficiency',
        value: health.buffer_efficiency,
        target: 80,
        status: health.buffer_efficiency > 80 ? 'good' : health.buffer_efficiency > 60 ? 'warning' : 'critical',
        trend: metrics.telemetry_buffered === 0 ? 'up' : 'down',
        icon: Database,
        color: health.buffer_efficiency > 80 ? 'text-success' : health.buffer_efficiency > 60 ? 'text-warning' : 'text-destructive',
        description: `${metrics.telemetry_buffered} packets currently buffered`
      },
      {
        name: 'System Uptime',
        value: Math.min(100, (health.uptime / 3600) * 100), // Convert to percentage of hour
        target: 99,
        status: 'good',
        trend: 'up',
        icon: Activity,
        color: 'text-success',
        description: `Mission running for ${formatTime(health.uptime)}`
      }
    ];

    // Add emulator performance if enabled
    if (health.emulator_performance !== undefined) {
      newMetrics.push({
        name: 'Emulator Performance',
        value: health.emulator_performance,
        target: 90,
        status: health.emulator_performance > 90 ? 'good' : health.emulator_performance > 80 ? 'warning' : 'critical',
        trend: 'stable',
        icon: Zap,
        color: health.emulator_performance > 90 ? 'text-primary' : health.emulator_performance > 80 ? 'text-warning' : 'text-destructive',
        description: 'Satellite link emulation active'
      });
    }

    setPerformanceMetrics(newMetrics);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getOverallStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle2;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Clock;
    }
  };

  if (!systemHealth || !systemMetrics) {
    return (
      <div className="card-glow bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-muted-foreground" />
          <h3 className="panel-header">System Health Dashboard</h3>
        </div>
        <div className="text-sm text-muted-foreground">Loading system health metrics...</div>
      </div>
    );
  }

  const OverallStatusIcon = getOverallStatusIcon(systemHealth.overall_status);

  return (
    <div className="card-glow bg-card rounded-lg border border-border p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="panel-header">System Health Dashboard</h3>
          <Badge variant={systemHealth.overall_status === 'healthy' ? "default" : 
                         systemHealth.overall_status === 'warning' ? "secondary" : "destructive"}>
            {systemHealth.overall_status.toUpperCase()}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time monitoring of system performance and operational health.
        </p>
      </div>

      {/* Overall System Status */}
      <div className={cn(
        'rounded-lg p-4 mb-6 border',
        systemHealth.overall_status === 'healthy' ? 'bg-success/10 border-success/30' :
        systemHealth.overall_status === 'warning' ? 'bg-warning/10 border-warning/30' :
        'bg-destructive/10 border-destructive/30'
      )}>
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-full bg-background/50')}>
            <OverallStatusIcon className={cn('w-8 h-8', getOverallStatusColor(systemHealth.overall_status))} />
          </div>
          <div className="flex-1">
            <div className={cn('text-lg font-bold', getOverallStatusColor(systemHealth.overall_status))}>
              System {systemHealth.overall_status === 'healthy' ? 'Healthy' : 
                     systemHealth.overall_status === 'warning' ? 'Warning' : 'Critical'}
            </div>
            <div className="text-sm text-muted-foreground">
              {systemHealth.overall_status === 'healthy' ? 'All systems operating normally' :
               systemHealth.overall_status === 'warning' ? 'Minor issues detected, monitoring required' :
               'Critical issues require immediate attention'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Mission Time</div>
            <div className="text-lg font-mono text-primary">{formatTime(systemHealth.uptime)}</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {performanceMetrics.map((metric, index) => {
          const MetricIcon = metric.icon;
          
          return (
            <div key={index} className="bg-secondary/20 rounded-lg p-4 border border-border/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MetricIcon className={cn('w-4 h-4', metric.color)} />
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className={cn('w-3 h-3',
                    metric.trend === 'up' ? 'text-success' :
                    metric.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  )} />
                  <Badge variant={
                    metric.status === 'good' ? "default" :
                    metric.status === 'warning' ? "secondary" : "destructive"
                  } className="text-xs">
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current</span>
                  <span className={cn('font-bold', metric.color)}>
                    {metric.value.toFixed(1)}%
                  </span>
                </div>
                
                <Progress 
                  value={metric.value} 
                  className="h-2"
                />
                
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Target: {metric.target}%</span>
                  <span className={cn(
                    metric.value >= metric.target ? 'text-success' : 'text-warning'
                  )}>
                    {metric.value >= metric.target ? '✓' : '⚠'}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2">
                  {metric.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Mode and Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-secondary/20 rounded-lg p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Operation Mode</span>
          </div>
          <div className="space-y-2">
            <div className={cn('text-lg font-bold',
              systemMetrics.system_mode === 'ORBITNET' ? 'text-success' : 'text-warning'
            )}>
              {systemMetrics.system_mode === 'ORBITNET' ? 'ORBITNET-MESH' : 'Ground-Only'}
            </div>
            <div className="text-xs text-muted-foreground">
              {systemMetrics.system_mode === 'ORBITNET' 
                ? 'Zero data loss through store-and-forward buffering'
                : 'Direct ground communication only - data may be lost'
              }
            </div>
            <Badge variant={systemMetrics.system_mode === 'ORBITNET' ? "default" : "secondary"}>
              {systemMetrics.system_mode === 'ORBITNET' ? 'Fault Tolerant' : 'Basic Mode'}
            </Badge>
          </div>
        </div>

        <div className="bg-secondary/20 rounded-lg p-4 border border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Communication Status</span>
          </div>
          <div className="space-y-2">
            <div className={cn('text-lg font-bold',
              systemMetrics.current_link === 'NONE' ? 'text-destructive' :
              systemMetrics.current_link === 'GROUND' ? 'text-success' : 'text-primary'
            )}>
              {systemMetrics.current_link === 'NONE' ? 'Blackout' :
               systemMetrics.current_link === 'GROUND' ? 'Ground Link' : 'Satellite Relay'}
            </div>
            <div className="text-xs text-muted-foreground">
              {systemMetrics.current_link === 'NONE' ? 'No communication links available' :
               systemMetrics.current_link === 'GROUND' ? 'Direct communication with ground stations' :
               'Communication via satellite relay network'}
            </div>
            {systemMetrics.emulator_enabled && (
              <Badge variant="outline" className="text-xs">
                🛰️ Emulator Active
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Data Flow Summary */}
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Data Flow Summary</span>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">{systemMetrics.telemetry_generated}</div>
            <div className="text-xs text-muted-foreground">📊 Generated</div>
          </div>
          <div>
            <div className="text-lg font-bold text-warning">{systemMetrics.telemetry_buffered}</div>
            <div className="text-xs text-muted-foreground">📦 Buffered</div>
          </div>
          <div>
            <div className="text-lg font-bold text-success">{systemMetrics.telemetry_sent}</div>
            <div className="text-xs text-muted-foreground">✅ Delivered</div>
          </div>
          <div>
            <div className="text-lg font-bold text-destructive">{systemMetrics.telemetry_lost}</div>
            <div className="text-xs text-muted-foreground">❌ Lost</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Data Delivery Rate</span>
            <span className={cn('font-medium',
              systemHealth.data_integrity === 100 ? 'text-success' : 'text-warning'
            )}>
              {systemHealth.data_integrity.toFixed(1)}%
            </span>
          </div>
          <Progress value={systemHealth.data_integrity} className="h-2 mt-1" />
        </div>
      </div>

      {/* Mission Status */}
      <div className="mt-4 flex items-center justify-between text-xs pt-4 border-t border-border/50">
        <span className="text-muted-foreground">Mission Status</span>
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', 
            isRunning ? 'bg-success animate-pulse' : 'bg-muted-foreground'
          )} />
          <span className={cn('font-medium',
            isRunning ? 'text-success' : 'text-muted-foreground'
          )}>
            {isRunning ? 'Mission Active' : 'Mission Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
}