import { useEffect, useState } from 'react';
import { Satellite, Radio, Database, Send, Package, Zap, AlertTriangle, CheckCircle2, ArrowRight, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SystemStatus {
  system_mode: string;
  telemetry_generated: number;
  telemetry_sent: number;
  telemetry_buffered: number;
  telemetry_lost: number;
  current_link: string;
  satellite_visible: boolean;
  ground_visible: boolean;
  emulator_enabled?: boolean;
  emulator_demo_mode?: boolean;
}

interface DataPacket {
  id: string;
  timestamp: number;
  stage: 'generating' | 'buffering' | 'transmitting' | 'delivered' | 'lost';
  position: { x: number; y: number };
  targetPosition: { x: number; y: number };
  linkType?: string;
}

export function DataFlowVisualization() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [dataPackets, setDataPackets] = useState<DataPacket[]>([]);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [lastTelemetryCount, setLastTelemetryCount] = useState(0);
  const [connectionPulse, setConnectionPulse] = useState(false);

  // Fetch system status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/status');
        if (response.ok) {
          const data = await response.json();
          setSystemStatus(data);
          
          // Detect new telemetry generation
          if (data.telemetry_generated > lastTelemetryCount) {
            generateNewPacket();
            setLastTelemetryCount(data.telemetry_generated);
          }
        }
      } catch (error) {
        console.error('Failed to fetch system status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [lastTelemetryCount]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setAnimationFrame(prev => prev + 1);
      updatePacketPositions();
    };

    const interval = setInterval(animate, 50); // 20 FPS
    return () => clearInterval(interval);
  }, []);

  // Connection pulse effect
  useEffect(() => {
    if (systemStatus?.current_link !== 'NONE') {
      setConnectionPulse(true);
      const timeout = setTimeout(() => setConnectionPulse(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [systemStatus?.current_link]);

  const generateNewPacket = () => {
    const newPacket: DataPacket = {
      id: `packet-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      stage: 'generating',
      position: { x: 50, y: 200 }, // Start at satellite
      targetPosition: { x: 200, y: 200 }, // Move to buffer
    };
    
    setDataPackets(prev => [...prev.slice(-10), newPacket]); // Keep last 10 packets
  };

  const updatePacketPositions = () => {
    setDataPackets(prev => prev.map(packet => {
      const age = Date.now() - packet.timestamp;
      let newStage = packet.stage;
      let newPosition = { ...packet.position };
      let newTarget = { ...packet.targetPosition };

      // Animate packet movement based on system state
      if (systemStatus) {
        switch (packet.stage) {
          case 'generating':
            // Move from satellite to buffer
            if (age > 500) {
              newStage = 'buffering';
              newTarget = { x: 350, y: 200 }; // Buffer position
            }
            break;

          case 'buffering':
            // Stay in buffer or move to transmission
            if (systemStatus.current_link !== 'NONE' && age > 1000) {
              newStage = 'transmitting';
              newTarget = { x: 500, y: 200 }; // Link position
            }
            break;

          case 'transmitting':
            // Move through link to ground
            if (age > 2000) {
              newStage = 'delivered';
              newTarget = { x: 650, y: 200 }; // Ground position
            }
            break;

          case 'delivered':
            // Fade out after delivery
            if (age > 3000) {
              return null; // Remove packet
            }
            break;
        }
      }

      // Smooth movement animation
      const speed = 0.1;
      newPosition.x += (newTarget.x - newPosition.x) * speed;
      newPosition.y += (newTarget.y - newPosition.y) * speed;

      return {
        ...packet,
        stage: newStage,
        position: newPosition,
        targetPosition: newTarget,
      };
    }).filter(Boolean) as DataPacket[]);
  };

  const getConnectionStatus = () => {
    if (!systemStatus) return { status: 'unknown', color: 'text-muted-foreground', icon: WifiOff };
    
    switch (systemStatus.current_link) {
      case 'GROUND':
        return { status: 'ground', color: 'text-success', icon: Radio };
      case 'SATELLITE':
        return { status: 'satellite', color: 'text-primary', icon: Satellite };
      default:
        return { status: 'blackout', color: 'text-destructive', icon: WifiOff };
    }
  };

  const connectionStatus = getConnectionStatus();
  const ConnectionIcon = connectionStatus.icon;

  if (!systemStatus) {
    return (
      <div className="card-glow bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-muted-foreground" />
          <h3 className="panel-header">Data Flow Visualization</h3>
        </div>
        <div className="text-sm text-muted-foreground">Loading data flow...</div>
      </div>
    );
  }

  return (
    <div className="card-glow bg-card rounded-lg border border-border p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="panel-header">Data Flow Visualization</h3>
          <Badge variant={systemStatus.current_link !== 'NONE' ? "default" : "destructive"}>
            {systemStatus.current_link !== 'NONE' ? 'CONNECTED' : 'BLACKOUT'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time visualization of data flowing through the ORBITNET-MESH system.
        </p>
      </div>

      {/* Main Visualization Area */}
      <div className="relative bg-secondary/20 rounded-lg p-6 border border-border/50 min-h-[300px] overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* System Components */}
        <div className="relative z-10">
          {/* Satellite (Data Source) */}
          <div className="absolute" style={{ left: '30px', top: '180px' }}>
            <div className={cn(
              'flex flex-col items-center p-3 rounded-lg border transition-all duration-300',
              'bg-primary/10 border-primary/30',
              animationFrame % 40 < 20 ? 'scale-105' : 'scale-100'
            )}>
              <Satellite className="w-8 h-8 text-primary mb-2" />
              <div className="text-xs font-medium text-center">Satellite</div>
              <div className="text-xs text-muted-foreground">Data Source</div>
              <Badge variant="outline" className="text-xs mt-1">
                {systemStatus.telemetry_generated} packets
              </Badge>
            </div>
          </div>

          {/* Store-and-Forward Buffer */}
          <div className="absolute" style={{ left: '180px', top: '180px' }}>
            <div className={cn(
              'flex flex-col items-center p-3 rounded-lg border transition-all duration-300',
              systemStatus.telemetry_buffered > 0 
                ? 'bg-warning/10 border-warning/30 animate-pulse' 
                : 'bg-secondary/30 border-border/50'
            )}>
              <Database className={cn('w-8 h-8 mb-2',
                systemStatus.telemetry_buffered > 0 ? 'text-warning' : 'text-muted-foreground'
              )} />
              <div className="text-xs font-medium text-center">Buffer</div>
              <div className="text-xs text-muted-foreground">Store & Forward</div>
              <Badge variant={systemStatus.telemetry_buffered > 0 ? "default" : "secondary"} className="text-xs mt-1">
                {systemStatus.telemetry_buffered} stored
              </Badge>
            </div>
          </div>

          {/* Communication Link */}
          <div className="absolute" style={{ left: '330px', top: '180px' }}>
            <div className={cn(
              'flex flex-col items-center p-3 rounded-lg border transition-all duration-300',
              systemStatus.current_link !== 'NONE' 
                ? connectionStatus.color.includes('success') 
                  ? 'bg-success/10 border-success/30'
                  : 'bg-primary/10 border-primary/30'
                : 'bg-destructive/10 border-destructive/30',
              connectionPulse && systemStatus.current_link !== 'NONE' ? 'scale-110 shadow-lg' : 'scale-100'
            )}>
              <ConnectionIcon className={cn('w-8 h-8 mb-2', connectionStatus.color)} />
              <div className="text-xs font-medium text-center">
                {systemStatus.current_link === 'GROUND' ? 'Ground Link' :
                 systemStatus.current_link === 'SATELLITE' ? 'Satellite Relay' : 'No Link'}
              </div>
              <div className="text-xs text-muted-foreground">Communication</div>
              {systemStatus.emulator_enabled && (
                <Badge variant="outline" className="text-xs mt-1">
                  🛰️ Emulated
                </Badge>
              )}
            </div>
          </div>

          {/* Ground Receiver */}
          <div className="absolute" style={{ left: '480px', top: '180px' }}>
            <div className={cn(
              'flex flex-col items-center p-3 rounded-lg border transition-all duration-300',
              'bg-success/10 border-success/30'
            )}>
              <Radio className="w-8 h-8 text-success mb-2" />
              <div className="text-xs font-medium text-center">Ground</div>
              <div className="text-xs text-muted-foreground">Receiver</div>
              <Badge variant="default" className="text-xs mt-1">
                {systemStatus.telemetry_sent} received
              </Badge>
            </div>
          </div>

          {/* Data Flow Arrows */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Satellite to Buffer */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
              </marker>
            </defs>
            
            <line x1="120" y1="210" x2="170" y2="210" 
                  stroke="currentColor" strokeWidth="2" 
                  markerEnd="url(#arrowhead)"
                  className={cn('transition-all duration-300',
                    animationFrame % 60 < 30 ? 'opacity-100' : 'opacity-50'
                  )} />
            
            {/* Buffer to Link */}
            <line x1="270" y1="210" x2="320" y2="210" 
                  stroke="currentColor" strokeWidth="2" 
                  markerEnd="url(#arrowhead)"
                  className={cn('transition-all duration-300',
                    systemStatus.current_link !== 'NONE' && animationFrame % 40 < 20 
                      ? 'opacity-100 stroke-primary' : 'opacity-30'
                  )} />
            
            {/* Link to Ground */}
            <line x1="420" y1="210" x2="470" y2="210" 
                  stroke="currentColor" strokeWidth="2" 
                  markerEnd="url(#arrowhead)"
                  className={cn('transition-all duration-300',
                    systemStatus.current_link !== 'NONE' && animationFrame % 30 < 15 
                      ? 'opacity-100 stroke-success' : 'opacity-30'
                  )} />
          </svg>

          {/* Animated Data Packets */}
          {dataPackets.map(packet => (
            <div
              key={packet.id}
              className="absolute transition-all duration-100 ease-linear"
              style={{
                left: `${packet.position.x}px`,
                top: `${packet.position.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className={cn(
                'w-4 h-4 rounded-full border-2 transition-all duration-200',
                packet.stage === 'generating' && 'bg-primary border-primary animate-pulse',
                packet.stage === 'buffering' && 'bg-warning border-warning',
                packet.stage === 'transmitting' && 'bg-blue-500 border-blue-500 animate-bounce',
                packet.stage === 'delivered' && 'bg-success border-success scale-125',
                packet.stage === 'lost' && 'bg-destructive border-destructive'
              )} />
            </div>
          ))}
        </div>

        {/* Connection Status Overlay */}
        {systemStatus.current_link === 'NONE' && (
          <div className="absolute inset-0 bg-destructive/5 flex items-center justify-center rounded-lg">
            <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <WifiOff className="w-12 h-12 text-destructive mx-auto mb-2 animate-pulse" />
              <div className="text-sm font-medium text-destructive">Communication Blackout</div>
              <div className="text-xs text-muted-foreground mt-1">
                Data is being safely stored in buffer
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded border border-border/30">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <span className="text-xs">Generating</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded border border-border/30">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-xs">Buffering</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded border border-border/30">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" />
          <span className="text-xs">Transmitting</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded border border-border/30">
          <div className="w-3 h-3 rounded-full bg-success scale-125" />
          <span className="text-xs">Delivered</span>
        </div>
      </div>

      {/* System Mode Explanation */}
      <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {systemStatus.system_mode === 'ORBITNET' ? 'ORBITNET-MESH Active' : 'Ground-Only Mode'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {systemStatus.system_mode === 'ORBITNET' 
            ? "Data flows through store-and-forward buffer ensuring zero loss during blackouts. Packets wait safely until communication is restored."
            : "Data is transmitted only when ground links are available. Packets may be lost during communication blackouts."
          }
        </div>
      </div>

      {/* Real-time Statistics */}
      <div className="mt-4 grid grid-cols-4 gap-3 text-center">
        <div>
          <div className="text-lg font-bold text-primary">{systemStatus.telemetry_generated}</div>
          <div className="text-xs text-muted-foreground">📊 Generated</div>
        </div>
        <div>
          <div className="text-lg font-bold text-warning">{systemStatus.telemetry_buffered}</div>
          <div className="text-xs text-muted-foreground">📦 Buffered</div>
        </div>
        <div>
          <div className="text-lg font-bold text-success">{systemStatus.telemetry_sent}</div>
          <div className="text-xs text-muted-foreground">✅ Delivered</div>
        </div>
        <div>
          <div className="text-lg font-bold text-destructive">{systemStatus.telemetry_lost}</div>
          <div className="text-xs text-muted-foreground">❌ Lost</div>
        </div>
      </div>
    </div>
  );
}