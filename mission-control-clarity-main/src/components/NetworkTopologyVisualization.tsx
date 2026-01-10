import { useEffect, useState } from 'react';
import { Satellite, Radio, Globe, Zap, Wifi, WifiOff, MapPin, Signal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SystemStatus {
  satellite_visible: boolean;
  ground_visible: boolean;
  current_link: string;
  emulator_enabled?: boolean;
  emulator_demo_mode?: boolean;
}

interface TelemetryData {
  position: {
    lat: number;
    lng: number;
  };
  altitude: number;
}

interface LinkConnection {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  active: boolean;
  strength: number;
  type: 'ground' | 'satellite' | 'relay';
  animated: boolean;
}

interface NetworkNode {
  id: string;
  type: 'satellite' | 'ground_station' | 'relay_satellite' | 'spacecraft';
  position: { x: number; y: number };
  label: string;
  status: 'active' | 'inactive' | 'connecting';
  visible?: boolean;
}

export function NetworkTopologyVisualization() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [connections, setConnections] = useState<LinkConnection[]>([]);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [signalPulse, setSignalPulse] = useState<string | null>(null);

  // Initialize network topology
  useEffect(() => {
    const initialNodes: NetworkNode[] = [
      // Spacecraft (dynamic position)
      {
        id: 'spacecraft',
        type: 'spacecraft',
        position: { x: 200, y: 150 },
        label: 'Spacecraft',
        status: 'active'
      },
      // Ground Stations
      {
        id: 'ground_madrid',
        type: 'ground_station',
        position: { x: 100, y: 300 },
        label: 'Madrid DSN',
        status: 'active'
      },
      {
        id: 'ground_goldstone',
        type: 'ground_station',
        position: { x: 300, y: 320 },
        label: 'Goldstone DSN',
        status: 'active'
      },
      {
        id: 'ground_canberra',
        type: 'ground_station',
        position: { x: 500, y: 300 },
        label: 'Canberra DSN',
        status: 'active'
      },
      // Relay Satellites
      {
        id: 'relay_tdrs_east',
        type: 'relay_satellite',
        position: { x: 150, y: 80 },
        label: 'TDRS East',
        status: 'active'
      },
      {
        id: 'relay_tdrs_west',
        type: 'relay_satellite',
        position: { x: 350, y: 80 },
        label: 'TDRS West',
        status: 'active'
      },
      {
        id: 'relay_artemis',
        type: 'relay_satellite',
        position: { x: 450, y: 100 },
        label: 'Artemis Relay',
        status: 'active'
      }
    ];

    setNodes(initialNodes);
  }, []);

  // Fetch system status and telemetry
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get system status
        const systemResponse = await fetch('http://localhost:8000/system/status');
        if (systemResponse.ok) {
          const systemData = await systemResponse.json();
          setSystemStatus(systemData);
        }

        // Get telemetry for spacecraft position
        const telemetryResponse = await fetch('http://localhost:8000/api/telemetry/latest');
        if (telemetryResponse.ok) {
          const telemetryData = await telemetryResponse.json();
          setTelemetry(telemetryData);
          
          // Update spacecraft position based on telemetry
          updateSpacecraftPosition(telemetryData);
        }
      } catch (error) {
        console.error('Failed to fetch network data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update connections based on system status
  useEffect(() => {
    if (!systemStatus) return;

    const newConnections: LinkConnection[] = [];
    const spacecraftNode = nodes.find(n => n.id === 'spacecraft');
    if (!spacecraftNode) return;

    // Update node visibility based on system status
    setNodes(prev => prev.map(node => {
      if (node.type === 'ground_station') {
        return { ...node, visible: systemStatus.ground_visible };
      }
      if (node.type === 'relay_satellite') {
        return { ...node, visible: systemStatus.satellite_visible };
      }
      return node;
    }));

    // Create connections based on current link
    if (systemStatus.current_link === 'GROUND' && systemStatus.ground_visible) {
      // Direct ground connections
      const groundStations = nodes.filter(n => n.type === 'ground_station');
      groundStations.forEach(station => {
        newConnections.push({
          id: `spacecraft-${station.id}`,
          from: spacecraftNode.position,
          to: station.position,
          active: true,
          strength: 85 + Math.random() * 15,
          type: 'ground',
          animated: true
        });
      });
      
      // Trigger signal pulse
      setSignalPulse('ground');
      setTimeout(() => setSignalPulse(null), 1000);
    }

    if (systemStatus.current_link === 'SATELLITE' && systemStatus.satellite_visible) {
      // Satellite relay connections
      const relayNodes = nodes.filter(n => n.type === 'relay_satellite');
      const activeRelay = relayNodes[Math.floor(Math.random() * relayNodes.length)];
      
      if (activeRelay) {
        // Spacecraft to relay
        newConnections.push({
          id: `spacecraft-${activeRelay.id}`,
          from: spacecraftNode.position,
          to: activeRelay.position,
          active: true,
          strength: 75 + Math.random() * 20,
          type: 'satellite',
          animated: true
        });

        // Relay to ground stations
        const groundStations = nodes.filter(n => n.type === 'ground_station');
        groundStations.forEach(station => {
          newConnections.push({
            id: `${activeRelay.id}-${station.id}`,
            from: activeRelay.position,
            to: station.position,
            active: true,
            strength: 90 + Math.random() * 10,
            type: 'relay',
            animated: true
          });
        });
      }
      
      // Trigger signal pulse
      setSignalPulse('satellite');
      setTimeout(() => setSignalPulse(null), 1000);
    }

    setConnections(newConnections);
  }, [systemStatus, nodes]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setAnimationFrame(prev => prev + 1);
    };

    const interval = setInterval(animate, 100); // 10 FPS
    return () => clearInterval(interval);
  }, []);

  const updateSpacecraftPosition = (telemetryData: TelemetryData) => {
    // Convert lat/lng to screen coordinates (simplified)
    const x = 200 + (telemetryData.position.lng / 180) * 100;
    const y = 150 - (telemetryData.position.lat / 90) * 50;
    
    setNodes(prev => prev.map(node => 
      node.id === 'spacecraft' 
        ? { ...node, position: { x: Math.max(50, Math.min(550, x)), y: Math.max(50, Math.min(350, y)) } }
        : node
    ));
  };

  const getNodeIcon = (node: NetworkNode) => {
    switch (node.type) {
      case 'spacecraft':
        return Satellite;
      case 'ground_station':
        return Radio;
      case 'relay_satellite':
        return Globe;
      default:
        return MapPin;
    }
  };

  const getNodeColor = (node: NetworkNode) => {
    if (node.visible === false) return 'text-muted-foreground';
    
    switch (node.status) {
      case 'active':
        return node.type === 'spacecraft' ? 'text-primary' : 
               node.type === 'ground_station' ? 'text-success' : 'text-blue-500';
      case 'connecting':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!systemStatus) {
    return (
      <div className="card-glow bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-muted-foreground" />
          <h3 className="panel-header">Network Topology</h3>
        </div>
        <div className="text-sm text-muted-foreground">Loading network topology...</div>
      </div>
    );
  }

  return (
    <div className="card-glow bg-card rounded-lg border border-border p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="panel-header">Network Topology</h3>
          <Badge variant={systemStatus.current_link !== 'NONE' ? "default" : "destructive"}>
            {systemStatus.current_link !== 'NONE' ? 'CONNECTED' : 'ISOLATED'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time visualization of spacecraft communication network and link states.
        </p>
      </div>

      {/* Network Visualization */}
      <div className="relative bg-gradient-to-b from-blue-950/20 to-green-950/20 rounded-lg p-6 border border-border/50 min-h-[400px] overflow-hidden">
        {/* Space Background */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Earth representation */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-500/20 to-transparent rounded-b-lg" />
        
        <svg className="absolute inset-0 w-full h-full">
          {/* Connection Lines */}
          {connections.map(connection => (
            <g key={connection.id}>
              {/* Base connection line */}
              <line
                x1={connection.from.x}
                y1={connection.from.y}
                x2={connection.to.x}
                y2={connection.to.y}
                stroke={
                  connection.type === 'ground' ? '#22c55e' :
                  connection.type === 'satellite' ? '#3b82f6' : '#8b5cf6'
                }
                strokeWidth="2"
                opacity={connection.active ? 0.6 : 0.2}
                className="transition-all duration-300"
              />
              
              {/* Animated signal pulse */}
              {connection.animated && connection.active && (
                <circle
                  r="4"
                  fill={
                    connection.type === 'ground' ? '#22c55e' :
                    connection.type === 'satellite' ? '#3b82f6' : '#8b5cf6'
                  }
                  opacity="0.8"
                  className="animate-pulse"
                >
                  <animateMotion
                    dur="2s"
                    repeatCount="indefinite"
                    path={`M ${connection.from.x} ${connection.from.y} L ${connection.to.x} ${connection.to.y}`}
                  />
                </circle>
              )}
              
              {/* Signal strength indicator */}
              <text
                x={(connection.from.x + connection.to.x) / 2}
                y={(connection.from.y + connection.to.y) / 2 - 10}
                fill="currentColor"
                fontSize="10"
                textAnchor="middle"
                className="text-muted-foreground"
              >
                {connection.active ? `${connection.strength.toFixed(0)}%` : ''}
              </text>
            </g>
          ))}
        </svg>

        {/* Network Nodes */}
        {nodes.map(node => {
          const NodeIcon = getNodeIcon(node);
          const nodeColor = getNodeColor(node);
          
          return (
            <div
              key={node.id}
              className="absolute transition-all duration-500 ease-in-out"
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className={cn(
                'flex flex-col items-center p-2 rounded-lg border transition-all duration-300',
                node.visible === false 
                  ? 'bg-muted/20 border-muted/30 opacity-50' 
                  : 'bg-background/80 border-border/50 backdrop-blur-sm',
                node.status === 'active' && node.visible !== false && 'shadow-lg',
                signalPulse === 'ground' && node.type === 'ground_station' && 'scale-110 shadow-green-500/50',
                signalPulse === 'satellite' && node.type === 'relay_satellite' && 'scale-110 shadow-blue-500/50',
                node.type === 'spacecraft' && animationFrame % 60 < 30 && 'scale-105'
              )}>
                <NodeIcon className={cn('w-6 h-6 mb-1', nodeColor)} />
                <div className="text-xs font-medium text-center whitespace-nowrap">
                  {node.label}
                </div>
                
                {/* Status indicator */}
                <div className={cn(
                  'w-2 h-2 rounded-full mt-1',
                  node.visible === false ? 'bg-muted-foreground' :
                  node.status === 'active' ? 'bg-success animate-pulse' :
                  node.status === 'connecting' ? 'bg-warning animate-bounce' : 'bg-muted-foreground'
                )} />
                
                {/* Special indicators */}
                {node.type === 'spacecraft' && telemetry && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {telemetry.altitude.toFixed(0)} km
                  </div>
                )}
                
                {systemStatus.emulator_enabled && node.type === 'relay_satellite' && (
                  <Badge variant="outline" className="text-xs mt-1">
                    🛰️ Emulated
                  </Badge>
                )}
              </div>
            </div>
          );
        })}

        {/* Network Status Overlay */}
        {systemStatus.current_link === 'NONE' && (
          <div className="absolute top-4 right-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-destructive animate-pulse" />
              <div>
                <div className="text-sm font-medium text-destructive">Network Isolated</div>
                <div className="text-xs text-muted-foreground">No communication links available</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Network Statistics */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-secondary/20 rounded-lg border border-border/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-success" />
            <span className="text-sm font-medium">Ground Links</span>
          </div>
          <div className={cn('text-lg font-bold',
            systemStatus.ground_visible ? 'text-success' : 'text-muted-foreground'
          )}>
            {systemStatus.ground_visible ? 'Available' : 'Not Available'}
          </div>
          <div className="text-xs text-muted-foreground">Direct Communication</div>
        </div>

        <div className="text-center p-3 bg-secondary/20 rounded-lg border border-border/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Satellite className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Satellite Relays</span>
          </div>
          <div className={cn('text-lg font-bold',
            systemStatus.satellite_visible ? 'text-primary' : 'text-muted-foreground'
          )}>
            {systemStatus.satellite_visible ? 'Available' : 'Not Available'}
          </div>
          <div className="text-xs text-muted-foreground">Relay Communication</div>
        </div>

        <div className="text-center p-3 bg-secondary/20 rounded-lg border border-border/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Signal className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium">Active Link</span>
          </div>
          <div className={cn('text-lg font-bold',
            systemStatus.current_link === 'GROUND' ? 'text-success' :
            systemStatus.current_link === 'SATELLITE' ? 'text-primary' : 'text-destructive'
          )}>
            {systemStatus.current_link === 'NONE' ? 'None' : systemStatus.current_link}
          </div>
          <div className="text-xs text-muted-foreground">Current Connection</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-success rounded" />
          <span>Ground Link</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-primary rounded" />
          <span>Satellite Link</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-purple-500 rounded" />
          <span>Relay Link</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>Active Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-muted-foreground rounded-full" />
          <span>Inactive Node</span>
        </div>
      </div>
    </div>
  );
}