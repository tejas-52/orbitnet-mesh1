import { TelemetryData } from '@/lib/simulation';
import { motion, AnimatePresence } from 'framer-motion';
import { Satellite, Navigation, Thermometer, Fuel, Battery, MapPin, Clock, Orbit, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { GlowingOrb } from '@/components/ui/GlowingOrb';

interface SatelliteMissionStateProps {
  telemetry: TelemetryData | null;
  isRunning: boolean;
  missionTime: number;
}

interface EmulatorInfo {
  emulator_enabled: boolean;
  emulator_demo_mode: boolean;
  emulator_packets_processed: number;
}

export function SatelliteMissionState({ telemetry, isRunning, missionTime }: SatelliteMissionStateProps) {
  const [emulatorInfo, setEmulatorInfo] = useState<EmulatorInfo | null>(null);

  useEffect(() => {
    const fetchEmulatorInfo = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/status');
        if (response.ok) {
          const data = await response.json();
          setEmulatorInfo({
            emulator_enabled: data.emulator_enabled || false,
            emulator_demo_mode: data.emulator_demo_mode || false,
            emulator_packets_processed: data.emulator_packets_processed || 0,
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getHealthColor = (value: number, thresholds: { warning: number; danger: number; inverse?: boolean }) => {
    if (thresholds.inverse) {
      if (value > thresholds.danger) return 'destructive';
      if (value > thresholds.warning) return 'warning';
      return 'success';
    }
    if (value < thresholds.danger) return 'destructive';
    if (value < thresholds.warning) return 'warning';
    return 'success';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={isRunning ? { rotate: 360 } : {}}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <GlowingOrb color="primary" size="md" pulse={isRunning}>
                <Satellite className="w-6 h-6 text-primary" />
              </GlowingOrb>
            </motion.div>
            <div>
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                Satellite Status
                {emulatorInfo?.emulator_enabled && (
                  <Badge variant={emulatorInfo.emulator_demo_mode ? "default" : "outline"} className="text-xs">
                    {emulatorInfo.emulator_demo_mode ? "DEMO" : "PHYSICS"}
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">Live position and health metrics</p>
            </div>
          </div>
          
          <motion.div
            animate={isRunning ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Badge 
              variant={isRunning ? "default" : "secondary"}
              className={cn(
                "px-3 py-1",
                isRunning && "bg-success/20 text-success border-success/30"
              )}
            >
              <motion.div
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: isRunning ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))' }}
                animate={isRunning ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
              {isRunning ? "ACTIVE" : "STANDBY"}
            </Badge>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {!telemetry ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mx-auto mb-4 flex items-center justify-center"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ rotate: { duration: 3, repeat: Infinity, ease: "linear" }, scale: { duration: 1.5, repeat: Infinity } }}
              >
                <Satellite className="w-8 h-8 text-primary/50" />
              </motion.div>
              <div className="text-sm text-muted-foreground">Awaiting satellite telemetry...</div>
            </motion.div>
          ) : (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Mission Status */}
              <motion.div 
                className="bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-xl p-4 border border-border/50"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Mission Status</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Mission Time</div>
                    <motion.div 
                      className="font-mono text-2xl text-primary font-bold"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {formatTime(missionTime)}
                    </motion.div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Data Packets</div>
                    <div className="font-mono text-2xl text-success font-bold">
                      <AnimatedCounter value={emulatorInfo?.emulator_packets_processed || 0} />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Position & Navigation */}
              <motion.div 
                className="bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-xl p-4 border border-border/50"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Position & Navigation</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="text-xs text-muted-foreground mb-1">Altitude</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-primary font-mono">
                        <AnimatedCounter value={telemetry.altitude} decimals={1} />
                      </span>
                      <span className="text-xs text-muted-foreground">km</span>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-xs text-muted-foreground mb-1">Velocity</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-primary font-mono">
                        <AnimatedCounter value={telemetry.velocity} decimals={2} />
                      </span>
                      <span className="text-xs text-muted-foreground">km/s</span>
                    </div>
                  </motion.div>
                </div>
                <motion.div 
                  className="mt-3 pt-3 border-t border-border/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-xs text-muted-foreground mb-1">Coordinates</div>
                  <div className="font-mono text-sm text-primary bg-primary/5 rounded-lg px-3 py-2 inline-block">
                    {telemetry.position.lat.toFixed(4)}°, {telemetry.position.lng.toFixed(4)}°
                  </div>
                </motion.div>
              </motion.div>

              {/* Satellite Health */}
              <motion.div 
                className="bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-xl p-4 border border-border/50"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold">Satellite Health</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { 
                      icon: Thermometer, 
                      label: 'Temperature', 
                      value: telemetry.temperature, 
                      unit: '°C',
                      color: getHealthColor(telemetry.temperature, { warning: 35, danger: 45, inverse: true })
                    },
                    { 
                      icon: Fuel, 
                      label: 'Fuel', 
                      value: telemetry.fuelLevel, 
                      unit: '%',
                      color: getHealthColor(telemetry.fuelLevel, { warning: 30, danger: 15 })
                    },
                    { 
                      icon: Battery, 
                      label: 'Battery', 
                      value: telemetry.batteryLevel, 
                      unit: '%',
                      color: getHealthColor(telemetry.batteryLevel, { warning: 40, danger: 20 })
                    },
                  ].map((item, i) => (
                    <motion.div 
                      key={item.label}
                      className="text-center p-3 rounded-lg bg-background/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        animate={item.color === 'destructive' ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <item.icon className={cn(
                          'w-6 h-6 mx-auto mb-2',
                          item.color === 'success' && 'text-success',
                          item.color === 'warning' && 'text-warning',
                          item.color === 'destructive' && 'text-destructive'
                        )} />
                      </motion.div>
                      <div className={cn(
                        'text-lg font-bold font-mono',
                        item.color === 'success' && 'text-success',
                        item.color === 'warning' && 'text-warning',
                        item.color === 'destructive' && 'text-destructive'
                      )}>
                        <AnimatedCounter value={item.value} decimals={1} suffix={item.unit} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Attitude Control */}
              <motion.div 
                className="bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-xl p-4 border border-border/50"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Attitude Control</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Pitch', value: telemetry.orientation.pitch },
                    { label: 'Yaw', value: telemetry.orientation.yaw },
                    { label: 'Roll', value: telemetry.orientation.roll },
                  ].map((axis, i) => (
                    <motion.div
                      key={axis.label}
                      className="p-3 rounded-lg bg-background/50"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <div className="text-xs text-muted-foreground mb-1">{axis.label}</div>
                      <div className="text-sm font-mono font-bold text-primary">
                        <AnimatedCounter value={axis.value} decimals={2} suffix="°" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Packet Info */}
              <motion.div 
                className="pt-3 border-t border-border/50 flex justify-between text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-muted-foreground">Packet ID</span>
                <span className="font-mono text-primary/70">{telemetry.dataPacketId}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
