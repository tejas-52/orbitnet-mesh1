import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Package, Send, AlertTriangle, CheckCircle2, Database, Zap, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { GlowingOrb } from '@/components/ui/GlowingOrb';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface SystemStatus {
  system_mode: string;
  telemetry_generated: number;
  telemetry_sent: number;
  telemetry_buffered: number;
  telemetry_lost: number;
  current_link: string;
}

export function DataHandlingSafety() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
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

  const getDataSafetyStatus = () => {
    if (!systemStatus) return null;

    const totalGenerated = systemStatus.telemetry_generated;
    const dataLossRate = totalGenerated > 0 ? (systemStatus.telemetry_lost / totalGenerated) * 100 : 0;
    const deliveryRate = totalGenerated > 0 ? (systemStatus.telemetry_sent / totalGenerated) * 100 : 0;

    if (systemStatus.system_mode === 'ORBITNET') {
      return {
        status: 'protected',
        icon: Shield,
        label: '100% Data Protection',
        description: 'Zero data loss guaranteed by ORBITNET-MESH',
        color: 'success' as const,
        dataLossRate: 0,
        deliveryRate: deliveryRate
      };
    }

    if (dataLossRate === 0) {
      return {
        status: 'safe',
        icon: CheckCircle2,
        label: 'All Data Safe',
        description: 'No data loss detected',
        color: 'success' as const,
        dataLossRate: 0,
        deliveryRate: deliveryRate
      };
    }

    if (dataLossRate < 5) {
      return {
        status: 'warning',
        icon: AlertTriangle,
        label: 'Minor Data Loss',
        description: 'Some data loss detected',
        color: 'warning' as const,
        dataLossRate: dataLossRate,
        deliveryRate: deliveryRate
      };
    }

    return {
      status: 'danger',
      icon: AlertTriangle,
      label: 'Data at Risk',
      description: 'Significant data loss occurring',
      color: 'destructive' as const,
      dataLossRate: dataLossRate,
      deliveryRate: deliveryRate
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
          <Package className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-bold text-lg">Data Safety</h3>
        </div>
        <div className="text-sm text-muted-foreground">{error}</div>
      </motion.div>
    );
  }

  if (!systemStatus) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Shield className="w-5 h-5 text-primary" />
          </motion.div>
          <h3 className="font-bold text-lg">Data Safety</h3>
        </div>
        <div className="text-sm text-muted-foreground">Loading data safety status...</div>
      </motion.div>
    );
  }

  const safetyStatus = getDataSafetyStatus();
  if (!safetyStatus) return null;

  const StatusIcon = safetyStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Animated background */}
      <motion.div
        className={cn(
          'absolute inset-0 opacity-20',
          safetyStatus.color === 'success' && 'bg-gradient-to-br from-success/30 to-transparent',
          safetyStatus.color === 'warning' && 'bg-gradient-to-br from-warning/30 to-transparent',
          safetyStatus.color === 'destructive' && 'bg-gradient-to-br from-destructive/30 to-transparent',
        )}
      />

      {/* Shield pattern */}
      {safetyStatus.status === 'protected' && (
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5l20 10v15c0 13.255-8.972 24.903-20 30-11.028-5.097-20-16.745-20-30V15L30 5z' fill='none' stroke='%2322c55e' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
          animate={{ opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={safetyStatus.status === 'protected' ? {
                boxShadow: [
                  '0 0 0 0 hsl(var(--success) / 0)',
                  '0 0 30px 10px hsl(var(--success) / 0.3)',
                  '0 0 0 0 hsl(var(--success) / 0)',
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <GlowingOrb color={safetyStatus.color} size="md" pulse={safetyStatus.status === 'protected'}>
                <Shield className={cn(
                  'w-6 h-6',
                  safetyStatus.color === 'success' && 'text-success',
                  safetyStatus.color === 'warning' && 'text-warning',
                  safetyStatus.color === 'destructive' && 'text-destructive',
                )} />
              </GlowingOrb>
            </motion.div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Data Protection</h3>
              <p className="text-xs text-muted-foreground">Store-and-forward system status</p>
            </div>
          </div>
          <Badge 
            variant={safetyStatus.status === 'protected' ? 'default' : 'outline'}
            className={cn(
              'px-3 py-1',
              safetyStatus.color === 'success' && 'bg-success/20 text-success border-success/30',
              safetyStatus.color === 'warning' && 'bg-warning/20 text-warning border-warning/30',
              safetyStatus.color === 'destructive' && 'bg-destructive/20 text-destructive border-destructive/30',
            )}
          >
            {systemStatus.system_mode}
          </Badge>
        </div>

        {/* Safety Status Banner */}
        <motion.div
          layout
          className={cn(
            'rounded-xl p-4 border mb-6',
            safetyStatus.color === 'success' && 'bg-success/10 border-success/30',
            safetyStatus.color === 'warning' && 'bg-warning/10 border-warning/30',
            safetyStatus.color === 'destructive' && 'bg-destructive/10 border-destructive/30',
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={safetyStatus.status === 'protected' ? { rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                'p-2 rounded-lg',
                safetyStatus.color === 'success' && 'bg-success/20',
                safetyStatus.color === 'warning' && 'bg-warning/20',
                safetyStatus.color === 'destructive' && 'bg-destructive/20',
              )}
            >
              <StatusIcon className={cn(
                'w-5 h-5',
                safetyStatus.color === 'success' && 'text-success',
                safetyStatus.color === 'warning' && 'text-warning',
                safetyStatus.color === 'destructive' && 'text-destructive',
              )} />
            </motion.div>
            <div>
              <div className={cn(
                'font-semibold',
                safetyStatus.color === 'success' && 'text-success',
                safetyStatus.color === 'warning' && 'text-warning',
                safetyStatus.color === 'destructive' && 'text-destructive',
              )}>
                {safetyStatus.label}
              </div>
              <div className="text-xs text-muted-foreground">{safetyStatus.description}</div>
            </div>
          </div>

          {/* Delivery Rate Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Delivery Rate
              </span>
              <span className={cn(
                'font-semibold',
                safetyStatus.color === 'success' && 'text-success',
                safetyStatus.color === 'warning' && 'text-warning',
                safetyStatus.color === 'destructive' && 'text-destructive',
              )}>
                {safetyStatus.deliveryRate.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  safetyStatus.color === 'success' && 'bg-success',
                  safetyStatus.color === 'warning' && 'bg-warning',
                  safetyStatus.color === 'destructive' && 'bg-destructive',
                )}
                initial={{ width: 0 }}
                animate={{ width: `${safetyStatus.deliveryRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { 
              icon: Database, 
              label: 'Generated', 
              value: systemStatus.telemetry_generated, 
              color: 'primary',
              desc: 'Total packets created'
            },
            { 
              icon: Send, 
              label: 'Delivered', 
              value: systemStatus.telemetry_sent, 
              color: 'success',
              desc: 'Sent to ground'
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              whileHover={{ scale: 1.02 }}
              className="bg-secondary/30 rounded-xl p-4 border border-border/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={cn(
                  'w-4 h-4',
                  stat.color === 'primary' && 'text-primary',
                  stat.color === 'success' && 'text-success',
                )} />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
              <div className={cn(
                'text-2xl font-bold font-mono',
                stat.color === 'primary' && 'text-primary',
                stat.color === 'success' && 'text-success',
              )}>
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stat.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Buffer Status */}
        <motion.div
          className={cn(
            'rounded-xl p-4 border',
            systemStatus.telemetry_buffered > 0 
              ? 'bg-warning/10 border-warning/30' 
              : 'bg-primary/5 border-primary/20'
          )}
          animate={systemStatus.telemetry_buffered > 0 ? { scale: [1, 1.01, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Package className={cn(
              'w-5 h-5',
              systemStatus.telemetry_buffered > 0 ? 'text-warning' : 'text-primary'
            )} />
            <span className="text-sm font-semibold">Store-and-Forward Buffer</span>
            <Badge 
              variant={systemStatus.telemetry_buffered > 0 ? "default" : "secondary"}
              className={systemStatus.telemetry_buffered > 0 ? 'bg-warning/20 text-warning border-warning/30' : ''}
            >
              {systemStatus.telemetry_buffered > 0 ? 'Active' : 'Standby'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Packets Buffered</div>
              <motion.div 
                className={cn(
                  'text-2xl font-bold font-mono',
                  systemStatus.telemetry_buffered > 0 ? 'text-warning' : 'text-primary'
                )}
                animate={systemStatus.telemetry_buffered > 0 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <AnimatedCounter value={systemStatus.telemetry_buffered} />
              </motion.div>
              <div className="text-xs text-muted-foreground mt-1">
                📦 Stored safely during blackout
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Data Lost</div>
              <div className={cn(
                'text-2xl font-bold font-mono',
                systemStatus.telemetry_lost === 0 ? 'text-success' : 'text-destructive'
              )}>
                <AnimatedCounter value={systemStatus.telemetry_lost} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {systemStatus.system_mode === 'ORBITNET' 
                  ? '🛡️ Zero loss guaranteed' 
                  : systemStatus.telemetry_lost === 0 
                    ? '✅ No losses' 
                    : '⚠️ Lost during blackouts'
                }
              </div>
            </div>
          </div>
        </motion.div>

        {/* Connection Status Footer */}
        <motion.div 
          className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-xs text-muted-foreground">Current Link</span>
          <div className="flex items-center gap-2">
            <motion.div
              className={cn(
                'w-2 h-2 rounded-full',
                systemStatus.current_link === 'NONE' ? 'bg-destructive' : 'bg-success'
              )}
              animate={systemStatus.current_link === 'NONE' ? { scale: [1, 1.3, 1] } : { opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className={cn(
              'text-xs font-semibold',
              systemStatus.current_link === 'NONE' ? 'text-destructive' : 'text-success'
            )}>
              {systemStatus.current_link === 'NONE' ? 'Buffering Data' : 'Transmitting'}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
