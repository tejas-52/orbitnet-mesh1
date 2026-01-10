import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Satellite, AlertTriangle, CheckCircle2, Clock, Zap, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GlowingOrb } from '@/components/ui/GlowingOrb';
import { WaveformLine } from '@/components/ui/WaveformLine';

interface LinkStatus {
  link_type: string;
  available: boolean;
  name: string;
  signal_strength?: number;
  elevation_angle?: number;
  timestamp: number;
}

interface SystemStatus {
  satellite_visible: boolean;
  ground_visible: boolean;
  current_link: string;
  emulator_enabled?: boolean;
  emulator_demo_mode?: boolean;
}

export function CommunicationAvailability() {
  const [linkStatus, setLinkStatus] = useState<LinkStatus | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const linkResponse = await fetch('http://localhost:8000/api/link/status');
        if (linkResponse.ok) {
          const linkData = await linkResponse.json();
          setLinkStatus(linkData);
        }

        const systemResponse = await fetch('http://localhost:8000/system/status');
        if (systemResponse.ok) {
          const systemData = await systemResponse.json();
          setSystemStatus(systemData);
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

  const getCommunicationStatus = () => {
    if (!linkStatus || !systemStatus) return null;

    if (systemStatus.current_link === 'NONE') {
      return {
        status: 'blackout',
        icon: AlertTriangle,
        label: 'Communication Blackout',
        description: 'No communication links available',
        color: 'destructive' as const,
      };
    }

    if (systemStatus.current_link === 'GROUND') {
      return {
        status: 'ground',
        icon: Radio,
        label: 'Ground Link Active',
        description: 'Direct communication with ground station',
        color: 'success' as const,
      };
    }

    if (systemStatus.current_link === 'SATELLITE') {
      return {
        status: 'satellite',
        icon: Satellite,
        label: 'Satellite Relay Active',
        description: 'Communication via satellite relay',
        color: 'primary' as const,
      };
    }

    return {
      status: 'partial',
      icon: Clock,
      label: 'Partial Coverage',
      description: 'Limited communication availability',
      color: 'warning' as const,
    };
  };

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-bold text-lg">Communication Status</h3>
        </div>
        <div className="text-sm text-muted-foreground">{error}</div>
      </motion.div>
    );
  }

  if (!linkStatus || !systemStatus) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Radio className="w-5 h-5 text-primary" />
          </motion.div>
          <h3 className="font-bold text-lg">Communication Status</h3>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <motion.div
            className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          Loading communication status...
        </div>
      </motion.div>
    );
  }

  const commStatus = getCommunicationStatus();
  if (!commStatus) return null;

  const StatusIcon = commStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Background gradient based on status */}
      <motion.div 
        className={cn(
          'absolute inset-0 opacity-30',
          commStatus.color === 'success' && 'bg-gradient-to-br from-success/20 to-transparent',
          commStatus.color === 'primary' && 'bg-gradient-to-br from-primary/20 to-transparent',
          commStatus.color === 'warning' && 'bg-gradient-to-br from-warning/20 to-transparent',
          commStatus.color === 'destructive' && 'bg-gradient-to-br from-destructive/20 to-transparent',
        )}
        animate={commStatus.color === 'destructive' ? { opacity: [0.2, 0.4, 0.2] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            animate={commStatus.status !== 'blackout' ? { 
              boxShadow: [
                '0 0 0 0 hsl(var(--primary) / 0)',
                '0 0 20px 5px hsl(var(--primary) / 0.3)',
                '0 0 0 0 hsl(var(--primary) / 0)',
              ]
            } : { scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <GlowingOrb 
              color={commStatus.color} 
              size="md" 
              pulse={commStatus.status !== 'blackout'}
            >
              {commStatus.status === 'blackout' ? (
                <WifiOff className="w-6 h-6 text-destructive" />
              ) : (
                <Wifi className="w-6 h-6 text-current" style={{ color: `hsl(var(--${commStatus.color}))` }} />
              )}
            </GlowingOrb>
          </motion.div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Communication Status</h3>
            <p className="text-xs text-muted-foreground">Real-time link availability</p>
          </div>
        </div>

        {/* Current Status Banner */}
        <motion.div
          layout
          className={cn(
            'rounded-xl p-4 border mb-6 backdrop-blur-sm',
            commStatus.color === 'success' && 'bg-success/10 border-success/30',
            commStatus.color === 'primary' && 'bg-primary/10 border-primary/30',
            commStatus.color === 'warning' && 'bg-warning/10 border-warning/30',
            commStatus.color === 'destructive' && 'bg-destructive/10 border-destructive/30',
          )}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={commStatus.status === 'blackout' ? { 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              className={cn(
                'p-2 rounded-lg',
                commStatus.color === 'success' && 'bg-success/20',
                commStatus.color === 'primary' && 'bg-primary/20',
                commStatus.color === 'warning' && 'bg-warning/20',
                commStatus.color === 'destructive' && 'bg-destructive/20',
              )}
            >
              <StatusIcon className={cn(
                'w-5 h-5',
                commStatus.color === 'success' && 'text-success',
                commStatus.color === 'primary' && 'text-primary',
                commStatus.color === 'warning' && 'text-warning',
                commStatus.color === 'destructive' && 'text-destructive',
              )} />
            </motion.div>
            <div className="flex-1">
              <div className={cn(
                'font-semibold',
                commStatus.color === 'success' && 'text-success',
                commStatus.color === 'primary' && 'text-primary',
                commStatus.color === 'warning' && 'text-warning',
                commStatus.color === 'destructive' && 'text-destructive',
              )}>
                {commStatus.label}
              </div>
              <div className="text-xs text-muted-foreground">{commStatus.description}</div>
            </div>
          </div>

          {/* Signal visualization */}
          <div className="mt-4">
            <WaveformLine 
              active={commStatus.status !== 'blackout'} 
              color={commStatus.color === 'destructive' ? 'destructive' : commStatus.color}
            />
          </div>

          {/* Link Details */}
          <AnimatePresence>
            {linkStatus.available && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-current/10 grid grid-cols-2 gap-3 text-xs"
              >
                <div>
                  <span className="text-muted-foreground">Link Type</span>
                  <div className="font-semibold capitalize">{linkStatus.link_type}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Station</span>
                  <div className="font-semibold">{linkStatus.name}</div>
                </div>
                {linkStatus.signal_strength && (
                  <div>
                    <span className="text-muted-foreground">Signal</span>
                    <div className="font-semibold">{linkStatus.signal_strength.toFixed(1)} dB</div>
                  </div>
                )}
                {linkStatus.elevation_angle && (
                  <div>
                    <span className="text-muted-foreground">Elevation</span>
                    <div className="font-semibold">{linkStatus.elevation_angle.toFixed(1)}°</div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Link Availability Grid */}
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Available Links
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Ground Link */}
            <motion.div 
              className={cn(
                "p-4 rounded-xl border transition-all",
                systemStatus.ground_visible 
                  ? "bg-success/5 border-success/30" 
                  : "bg-secondary/30 border-border/50"
              )}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={systemStatus.ground_visible ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Radio className={cn(
                    'w-5 h-5',
                    systemStatus.ground_visible ? 'text-success' : 'text-muted-foreground'
                  )} />
                </motion.div>
                <span className="text-sm font-medium">Ground</span>
              </div>
              <Badge variant={systemStatus.ground_visible ? "default" : "secondary"} className="text-xs">
                {systemStatus.ground_visible ? '● Online' : '○ Offline'}
              </Badge>
            </motion.div>

            {/* Satellite Relay */}
            <motion.div 
              className={cn(
                "p-4 rounded-xl border transition-all",
                systemStatus.satellite_visible 
                  ? "bg-primary/5 border-primary/30" 
                  : "bg-secondary/30 border-border/50"
              )}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={systemStatus.satellite_visible ? { rotate: 360 } : {}}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <Satellite className={cn(
                    'w-5 h-5',
                    systemStatus.satellite_visible ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </motion.div>
                <span className="text-sm font-medium">Relay</span>
              </div>
              <Badge variant={systemStatus.satellite_visible ? "default" : "secondary"} className="text-xs">
                {systemStatus.satellite_visible ? '● Online' : '○ Offline'}
              </Badge>
            </motion.div>
          </div>
        </div>

        {/* Emulator Status */}
        <AnimatePresence>
          {systemStatus.emulator_enabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Emulator Active</span>
                <Badge variant={systemStatus.emulator_demo_mode ? "default" : "outline"} className="text-xs ml-auto">
                  {systemStatus.emulator_demo_mode ? 'DEMO' : 'PHYSICS'}
                </Badge>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
