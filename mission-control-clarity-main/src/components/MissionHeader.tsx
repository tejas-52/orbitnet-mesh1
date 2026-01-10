import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Rocket, Play, Pause, RotateCcw, Satellite, Orbit, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface MissionHeaderProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  missionTime: number;
  orbitnetEnabled: boolean;
  onToggleOrbitnet: () => void;
}

export function MissionHeader({
  isRunning,
  onToggleRunning,
  onReset,
  missionTime,
  orbitnetEnabled,
  onToggleOrbitnet,
}: MissionHeaderProps) {
  const formatMissionTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `T+${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="bg-gradient-to-b from-card/95 via-card/90 to-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="relative">
              {/* Orbital ring */}
              <motion.div
                className="absolute inset-0 w-14 h-14 -m-1"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full" />
                <motion.div 
                  className="absolute w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50"
                  style={{ top: '50%', left: '-4px', marginTop: '-4px' }}
                />
              </motion.div>
              
              <motion.div 
                className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center overflow-hidden"
                animate={isRunning ? { 
                  boxShadow: [
                    '0 0 20px 0 hsl(var(--primary) / 0.3)',
                    '0 0 40px 5px hsl(var(--primary) / 0.5)',
                    '0 0 20px 0 hsl(var(--primary) / 0.3)',
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Satellite className="w-6 h-6 text-primary" />
                </motion.div>
              </motion.div>
              
              {/* Status indicator */}
              <motion.div 
                className={cn(
                  "absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card",
                  isRunning ? "bg-success" : "bg-muted-foreground"
                )}
                animate={isRunning ? {
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 0 0 hsl(var(--success) / 0.5)',
                    '0 0 0 6px hsl(var(--success) / 0)',
                    '0 0 0 0 hsl(var(--success) / 0.5)',
                  ]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            
            <div>
              <motion.h1 
                className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-2"
                animate={{ opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="bg-gradient-to-r from-primary via-primary to-cyan-400 bg-clip-text text-transparent">
                  ORBITNET-MESH
                </span>
              </motion.h1>
              <p className="text-xs text-muted-foreground">
                Space Transportation Communication Relay
              </p>
            </div>
          </motion.div>

          {/* Mission Timer */}
          <div className="hidden md:flex items-center gap-6">
            <motion.div 
              className="text-center relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1 justify-center">
                <motion.div
                  animate={isRunning ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                />
                Mission Elapsed Time
              </div>
              <motion.div 
                className="font-mono text-3xl text-primary font-bold tracking-wider relative"
                animate={isRunning ? {
                  textShadow: [
                    '0 0 10px hsl(var(--primary) / 0.3)',
                    '0 0 20px hsl(var(--primary) / 0.5)',
                    '0 0 10px hsl(var(--primary) / 0.3)',
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {formatMissionTime(missionTime)}
              </motion.div>
            </motion.div>

            {/* ORBITNET Toggle */}
            <motion.div 
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 border transition-all duration-300",
                orbitnetEnabled 
                  ? "bg-primary/10 border-primary/30" 
                  : "bg-secondary/50 border-border"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={orbitnetEnabled ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Radio className={cn(
                    'w-4 h-4',
                    orbitnetEnabled ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </motion.div>
                <span className={cn(
                  'text-xs font-semibold uppercase tracking-wide',
                  orbitnetEnabled ? 'text-primary' : 'text-muted-foreground'
                )}>
                  MESH
                </span>
              </div>
              <Switch
                checked={orbitnetEnabled}
                onCheckedChange={onToggleOrbitnet}
                className="data-[state=checked]:bg-primary"
              />
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onToggleRunning}
                className={cn(
                  'relative overflow-hidden gap-2 px-5 py-2.5 rounded-xl font-semibold',
                  'border transition-all duration-300',
                  isRunning 
                    ? 'bg-success/10 border-success/30 text-success hover:bg-success/20' 
                    : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                )}
              >
                {/* Animated background */}
                {isRunning && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-success/10 via-success/20 to-success/10"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start
                    </>
                  )}
                </span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onReset}
                variant="outline"
                className="border-border hover:bg-secondary rounded-xl"
              >
                <motion.div
                  whileHover={{ rotate: -180 }}
                  transition={{ duration: 0.3 }}
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Mission Info */}
        <motion.div 
          className="md:hidden mt-4 flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="font-mono text-xl text-primary font-bold">
            {formatMissionTime(missionTime)}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs font-semibold',
              orbitnetEnabled ? 'text-primary' : 'text-muted-foreground'
            )}>
              MESH
            </span>
            <Switch
              checked={orbitnetEnabled}
              onCheckedChange={onToggleOrbitnet}
              className="data-[state=checked]:bg-primary scale-90"
            />
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
