import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { Satellite, Radio, Database, WifiOff, CheckCircle2, AlertCircle, RefreshCw, Send, Zap, ArrowRight, Shield, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowingOrb } from '@/components/ui/GlowingOrb';
import { WaveformLine } from '@/components/ui/WaveformLine';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface SystemStatus {
  system_mode: string;
  current_link: string;
  telemetry_generated: number;
  telemetry_sent: number;
  telemetry_buffered: number;
  telemetry_lost: number;
  satellite_visible: boolean;
  ground_visible: boolean;
}

interface DataPacket {
  id: number;
  x: number;
  stage: 'generating' | 'to-buffer' | 'buffered' | 'transmitting' | 'delivered';
  color: string;
}

export function AnimatedDataFlowExplainer() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [showScenario, setShowScenario] = useState<'normal' | 'blackout' | 'recovery'>('normal');
  const [dataPackets, setDataPackets] = useState<DataPacket[]>([]);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const packetIdRef = useRef(0);
  const controls = useAnimationControls();

  // Fetch system status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/system/status');
        if (response.ok) {
          const data = await response.json();
          setSystemStatus(data);
          
          if (data.current_link === 'NONE') {
            setShowScenario('blackout');
          } else if (data.telemetry_buffered > 0) {
            setShowScenario('recovery');
          } else {
            setShowScenario('normal');
          }
        }
      } catch (error) {
        console.error('Failed to fetch system status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate data packets
  useEffect(() => {
    const generatePacket = () => {
      const newPacket: DataPacket = {
        id: packetIdRef.current++,
        x: 0,
        stage: 'generating',
        color: 'primary'
      };
      setDataPackets(prev => [...prev.slice(-8), newPacket]);
    };

    const interval = setInterval(generatePacket, 1500);
    return () => clearInterval(interval);
  }, []);

  // Animate packets
  useEffect(() => {
    const movePackets = () => {
      setDataPackets(prev => prev.map(packet => {
        let newX = packet.x;
        let newStage = packet.stage;
        let newColor = packet.color;

        if (showScenario === 'blackout') {
          if (packet.x < 40) {
            newX = packet.x + 2;
            newStage = 'to-buffer';
            newColor = 'warning';
          } else {
            newX = 40;
            newStage = 'buffered';
            newColor = 'warning';
          }
        } else if (showScenario === 'recovery') {
          newX = packet.x + 3;
          if (newX < 40) {
            newStage = 'to-buffer';
            newColor = 'warning';
          } else {
            newStage = 'transmitting';
            newColor = 'success';
          }
        } else {
          newX = packet.x + 2.5;
          if (newX < 35) {
            newStage = 'to-buffer';
            newColor = 'primary';
          } else if (newX < 70) {
            newStage = 'transmitting';
            newColor = 'success';
          } else {
            newStage = 'delivered';
            newColor = 'success';
          }
        }

        return { ...packet, x: Math.min(newX, 100), stage: newStage, color: newColor };
      }).filter(p => p.x < 100));
    };

    const interval = setInterval(movePackets, 80);
    return () => clearInterval(interval);
  }, [showScenario]);

  // Pulse effect
  useEffect(() => {
    const pulse = setInterval(() => {
      setPulseIntensity(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(pulse);
  }, []);

  const isConnected = showScenario !== 'blackout';

  const scenarioConfig = {
    normal: {
      title: 'Real-Time Data Transfer',
      subtitle: 'All systems nominal',
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'success' as const,
      bgClass: 'from-success/20 via-success/5 to-transparent',
      borderClass: 'border-success/30',
    },
    blackout: {
      title: 'Communication Blackout',
      subtitle: 'Data protection active',
      icon: <Shield className="w-5 h-5" />,
      color: 'warning' as const,
      bgClass: 'from-destructive/20 via-warning/10 to-transparent',
      borderClass: 'border-destructive/30',
    },
    recovery: {
      title: 'Recovery Mode',
      subtitle: 'Transmitting buffered data',
      icon: <RefreshCw className="w-5 h-5 animate-spin" />,
      color: 'primary' as const,
      bgClass: 'from-primary/20 via-success/10 to-transparent',
      borderClass: 'border-primary/30',
    },
  };

  const config = scenarioConfig[showScenario];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Animated background gradient */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-50 transition-all duration-1000',
        config.bgClass
      )} />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="epic-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#epic-grid)" />
        </svg>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <GlowingOrb color="primary" size="lg" pulse>
                <Send className="w-8 h-8 text-primary" />
              </GlowingOrb>
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">
                Data Flow Visualization
              </h3>
              <p className="text-sm text-muted-foreground">
                Watch how your data travels safely through space
              </p>
            </div>
          </div>

          {/* Scenario buttons */}
          <div className="flex gap-2">
            {(['normal', 'blackout', 'recovery'] as const).map((scenario) => (
              <motion.button
                key={scenario}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowScenario(scenario)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300',
                  'border backdrop-blur-sm',
                  showScenario === scenario
                    ? scenario === 'normal'
                      ? 'bg-success/20 border-success text-success shadow-lg shadow-success/20'
                      : scenario === 'blackout'
                        ? 'bg-destructive/20 border-destructive text-destructive shadow-lg shadow-destructive/20'
                        : 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/20'
                    : 'bg-secondary/30 border-border text-muted-foreground hover:bg-secondary/50'
                )}
              >
                {scenario === 'normal' && '✅ Normal'}
                {scenario === 'blackout' && '⚠️ Blackout'}
                {scenario === 'recovery' && '🔄 Recovery'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Status Banner */}
        <motion.div
          layout
          className={cn(
            'rounded-xl p-4 border mb-8 backdrop-blur-sm',
            config.borderClass,
            config.bgClass
          )}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={showScenario === 'blackout' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              className={cn(
                'p-2 rounded-lg',
                showScenario === 'normal' && 'bg-success/20 text-success',
                showScenario === 'blackout' && 'bg-destructive/20 text-destructive',
                showScenario === 'recovery' && 'bg-primary/20 text-primary'
              )}
            >
              {config.icon}
            </motion.div>
            <div>
              <div className="font-semibold text-foreground">{config.title}</div>
              <div className="text-sm text-muted-foreground">{config.subtitle}</div>
            </div>
          </div>
        </motion.div>

        {/* Main Flow Visualization */}
        <div className="relative bg-gradient-to-r from-secondary/40 via-secondary/20 to-secondary/40 rounded-2xl p-8 border border-border/50 overflow-hidden min-h-[280px]">
          {/* Background scan line effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative z-10 flex items-center justify-between gap-2 lg:gap-6">
            {/* Node 1: Satellite */}
            <motion.div 
              className="flex flex-col items-center flex-shrink-0"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <GlowingOrb color="primary" size="xl" pulse>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Satellite className="w-10 h-10 text-primary" />
                </motion.div>
              </GlowingOrb>
              <div className="mt-4 text-center">
                <div className="font-semibold text-sm">Satellite</div>
                <div className="text-xs text-muted-foreground">Data Source</div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mt-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30"
              >
                <span className="text-xs font-mono text-primary">
                  <AnimatedCounter value={systemStatus?.telemetry_generated || 0} /> gen
                </span>
              </motion.div>
            </motion.div>

            {/* Connection 1: Satellite to Buffer */}
            <div className="flex-1 relative h-24 min-w-[60px]">
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
                <WaveformLine active={true} color="primary" />
              </div>
              
              {/* Animated packets */}
              <AnimatePresence mode="popLayout">
                {dataPackets.filter(p => p.x < 40).map((packet) => (
                  <motion.div
                    key={packet.id}
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full',
                      'shadow-lg z-10',
                      packet.color === 'primary' && 'bg-primary shadow-primary/50',
                      packet.color === 'warning' && 'bg-warning shadow-warning/50',
                      packet.color === 'success' && 'bg-success shadow-success/50'
                    )}
                    style={{ left: `${(packet.x / 40) * 100}%` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: 1,
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      scale: { duration: 0.5, repeat: Infinity },
                    }}
                  >
                    <div className="absolute inset-0 rounded-full animate-ping bg-inherit opacity-30" />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute right-0 top-1/2 -translate-y-1/2"
              >
                <ArrowRight className="w-5 h-5 text-primary" />
              </motion.div>
            </div>

            {/* Node 2: Buffer */}
            <motion.div 
              className="flex flex-col items-center flex-shrink-0"
              animate={showScenario === 'blackout' ? { 
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 0 0 hsl(var(--warning) / 0)',
                  '0 0 30px 10px hsl(var(--warning) / 0.3)',
                  '0 0 0 0 hsl(var(--warning) / 0)',
                ]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <GlowingOrb 
                color={showScenario === 'blackout' || (systemStatus?.telemetry_buffered || 0) > 0 ? 'warning' : 'primary'} 
                size="xl" 
                pulse={showScenario === 'blackout'}
              >
                <Database className={cn(
                  'w-10 h-10 transition-colors',
                  showScenario === 'blackout' || (systemStatus?.telemetry_buffered || 0) > 0 
                    ? 'text-warning' 
                    : 'text-primary'
                )} />
              </GlowingOrb>
              <div className="mt-4 text-center">
                <div className="font-semibold text-sm">Safe Buffer</div>
                <div className="text-xs text-muted-foreground">Store & Forward</div>
              </div>
              <motion.div
                animate={showScenario === 'blackout' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
                className={cn(
                  'mt-2 px-3 py-1 rounded-full border',
                  showScenario === 'blackout' || (systemStatus?.telemetry_buffered || 0) > 0
                    ? 'bg-warning/20 border-warning/30'
                    : 'bg-secondary/30 border-border'
                )}
              >
                <span className={cn(
                  'text-xs font-mono',
                  showScenario === 'blackout' || (systemStatus?.telemetry_buffered || 0) > 0
                    ? 'text-warning'
                    : 'text-muted-foreground'
                )}>
                  <AnimatedCounter value={systemStatus?.telemetry_buffered || 0} /> stored
                </span>
              </motion.div>
            </motion.div>

            {/* Connection 2: Buffer to Ground */}
            <div className="flex-1 relative h-24 min-w-[60px]">
              {showScenario === 'blackout' ? (
                <>
                  {/* Broken connection */}
                  <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
                    <motion.div 
                      className="h-1 bg-destructive/30"
                      style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, hsl(var(--destructive)) 10px, hsl(var(--destructive)) 20px)' }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>
                  
                  {/* X mark */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="w-12 h-12 rounded-full bg-destructive/20 border-2 border-destructive/50 flex items-center justify-center backdrop-blur-sm">
                      <WifiOff className="w-6 h-6 text-destructive" />
                    </div>
                  </motion.div>
                </>
              ) : (
                <>
                  <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
                    <WaveformLine active={true} color="success" />
                  </div>
                  
                  {/* Animated packets */}
                  <AnimatePresence mode="popLayout">
                    {dataPackets.filter(p => p.x >= 40 && p.x < 100).map((packet) => (
                      <motion.div
                        key={packet.id}
                        className={cn(
                          'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full',
                          'bg-success shadow-lg shadow-success/50 z-10'
                        )}
                        style={{ left: `${((packet.x - 40) / 60) * 100}%` }}
                        initial={{ scale: 0.5 }}
                        animate={{ 
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          scale: { duration: 0.4, repeat: Infinity },
                        }}
                      >
                        <div className="absolute inset-0 rounded-full animate-ping bg-success opacity-30" />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                  >
                    <ArrowRight className="w-5 h-5 text-success" />
                  </motion.div>
                </>
              )}
            </div>

            {/* Node 3: Ground Control */}
            <motion.div 
              className="flex flex-col items-center flex-shrink-0"
              animate={isConnected ? { y: [0, -3, 0] } : { opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <GlowingOrb 
                color={isConnected ? 'success' : 'destructive'} 
                size="xl"
                pulse={isConnected}
              >
                <Radio className={cn(
                  'w-10 h-10 transition-colors',
                  isConnected ? 'text-success' : 'text-muted-foreground'
                )} />
              </GlowingOrb>
              <div className="mt-4 text-center">
                <div className="font-semibold text-sm">Ground Control</div>
                <div className="text-xs text-muted-foreground">Mission Center</div>
              </div>
              <motion.div
                animate={isConnected ? {} : { opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className={cn(
                  'mt-2 px-3 py-1 rounded-full border',
                  isConnected
                    ? 'bg-success/20 border-success/30'
                    : 'bg-muted/20 border-border'
                )}
              >
                <span className={cn(
                  'text-xs font-mono',
                  isConnected ? 'text-success' : 'text-muted-foreground'
                )}>
                  <AnimatedCounter value={systemStatus?.telemetry_sent || 0} /> recv
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Status overlay */}
          <AnimatePresence>
            {showScenario === 'blackout' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/20 border border-destructive/30 backdrop-blur-sm">
                  <AlertCircle className="w-4 h-4 text-destructive animate-pulse" />
                  <span className="text-xs font-semibold text-destructive">
                    Link interrupted — Data protected in buffer
                  </span>
                </div>
              </motion.div>
            )}
            {showScenario === 'recovery' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 border border-success/30 backdrop-blur-sm">
                  <RefreshCw className="w-4 h-4 text-success animate-spin" />
                  <span className="text-xs font-semibold text-success">
                    Connection restored — Transmitting buffered data
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Generated', value: systemStatus?.telemetry_generated || 0, icon: Zap, color: 'primary' },
            { label: 'Buffered', value: systemStatus?.telemetry_buffered || 0, icon: Package, color: (systemStatus?.telemetry_buffered || 0) > 0 ? 'warning' : 'muted' },
            { label: 'Delivered', value: systemStatus?.telemetry_sent || 0, icon: CheckCircle2, color: 'success' },
            { label: 'Lost', value: systemStatus?.telemetry_lost || 0, icon: AlertCircle, color: (systemStatus?.telemetry_lost || 0) > 0 ? 'destructive' : 'muted' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={cn(
                'p-4 rounded-xl border backdrop-blur-sm transition-all',
                'bg-secondary/30 border-border/50 hover:border-border'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={cn(
                  'w-4 h-4',
                  stat.color === 'primary' && 'text-primary',
                  stat.color === 'success' && 'text-success',
                  stat.color === 'warning' && 'text-warning',
                  stat.color === 'destructive' && 'text-destructive',
                  stat.color === 'muted' && 'text-muted-foreground',
                )} />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
              <div className={cn(
                'text-2xl font-bold font-mono',
                stat.color === 'primary' && 'text-primary',
                stat.color === 'success' && 'text-success',
                stat.color === 'warning' && 'text-warning',
                stat.color === 'destructive' && 'text-destructive',
                stat.color === 'muted' && 'text-muted-foreground',
              )}>
                <AnimatedCounter value={stat.value} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Explanation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          {[
            {
              step: 1,
              title: 'Data Collection',
              desc: 'Satellite sensors continuously gather telemetry data',
              active: true,
              color: 'primary'
            },
            {
              step: 2,
              title: 'Smart Buffer',
              desc: showScenario === 'blackout' 
                ? '🛡️ Actively storing data during blackout!'
                : 'Data stored safely if connection is lost',
              active: showScenario === 'blackout',
              color: 'warning'
            },
            {
              step: 3,
              title: 'Ground Delivery',
              desc: 'Mission control receives all data intact',
              active: showScenario !== 'blackout',
              color: 'success'
            },
          ].map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={cn(
                'p-4 rounded-xl border transition-all duration-300',
              step.active
                    ? step.color === 'primary'
                      ? 'bg-primary/10 border-primary/30'
                      : step.color === 'warning'
                        ? 'bg-warning/10 border-warning/30 ring-2 ring-warning/20'
                        : step.color === 'success'
                          ? 'bg-success/10 border-success/30'
                          : 'bg-secondary/20 border-border/50'
                  : 'bg-secondary/20 border-border/50'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                  step.active
                    ? step.color === 'primary'
                      ? 'bg-primary/20 text-primary'
                      : step.color === 'warning'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-success/20 text-success'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {step.step}
                </div>
                <span className="font-semibold text-sm">{step.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
