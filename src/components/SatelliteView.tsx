import { motion } from 'framer-motion';
import { Satellite, Radio, Globe, Zap, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SatelliteViewProps {
  isRunning: boolean;
  communicationAvailable: boolean;
  orbitnetEnabled: boolean;
}

export const SatelliteView = ({ 
  isRunning, 
  communicationAvailable, 
  orbitnetEnabled 
}: SatelliteViewProps) => {
  return (
    <Card className="card-glow bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Satellite className="w-5 h-5 text-primary" />
          Live Satellite Orbit Simulation
          <Badge variant="outline" className="text-xs">
            {isRunning ? '🟢 LIVE' : '🔴 STOPPED'}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Shows satellite position and communication availability in real-time
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-80 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg border border-border/50 overflow-hidden">
          {/* Space background with stars */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Earth (center) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-green-400 border-2 border-blue-300/50 shadow-lg"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center">
                <Globe className="w-8 h-8 text-white/80" />
              </div>
            </motion.div>
          </div>

          {/* Orbital path */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-60 h-60 border border-dashed border-primary/30 rounded-full" />
          </div>

          {/* Satellite with orbital animation */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={isRunning ? { rotate: 360 } : {}}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-60 h-60"
            >
              <motion.div
                className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                animate={isRunning ? {
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className={`p-3 rounded-lg border-2 ${
                  communicationAvailable 
                    ? 'bg-green-500/20 border-green-500/50' 
                    : 'bg-red-500/20 border-red-500/50'
                } backdrop-blur-sm`}>
                  <Satellite className={`w-6 h-6 ${
                    communicationAvailable ? 'text-green-400' : 'text-red-400'
                  }`} />
                </div>
                
                {/* Satellite communication status indicator */}
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                    isRunning 
                      ? (communicationAvailable ? 'bg-green-400' : 'bg-red-400')
                      : 'bg-gray-400'
                  }`}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Ground Station */}
          <div className="absolute bottom-4 right-4">
            <motion.div
              animate={communicationAvailable ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`p-3 rounded-lg border-2 ${
                communicationAvailable 
                  ? 'bg-green-500/20 border-green-500/50' 
                  : 'bg-gray-500/20 border-gray-500/50'
              } backdrop-blur-sm`}
            >
              <Radio className={`w-5 h-5 ${
                communicationAvailable ? 'text-green-400' : 'text-gray-400'
              }`} />
            </motion.div>
            <div className="text-xs text-center mt-1 text-muted-foreground">
              Ground Station
            </div>
          </div>

          {/* Communication Signal - signal line animation */}
          {communicationAvailable && isRunning && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-60 h-60"
              >
                <motion.div
                  className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Signal line from satellite to ground */}
                  <svg
                    width="200"
                    height="200"
                    className="absolute top-6 left-3"
                    style={{ transform: 'rotate(45deg)' }}
                  >
                    <motion.line
                      x1="0"
                      y1="0"
                      x2="140"
                      y2="140"
                      stroke="rgb(34, 197, 94)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </svg>
                  
                  {/* Signal pulses */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-3 left-3 w-2 h-2 bg-green-400 rounded-full"
                      animate={{
                        x: [0, 100],
                        y: [0, 100],
                        opacity: [1, 0],
                        scale: [1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </div>
          )}

          {/* Status overlay */}
          <div className="absolute top-4 left-4 space-y-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              isRunning 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`} />
              {isRunning ? 'MISSION ACTIVE' : 'MISSION STOPPED'}
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              communicationAvailable 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {communicationAvailable ? (
                <>
                  <Zap className="w-3 h-3" />
                  LINK ACTIVE
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  COMMUNICATION BLACKOUT
                </>
              )}
            </div>

            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              orbitnetEnabled 
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                orbitnetEnabled ? 'bg-primary animate-pulse' : 'bg-orange-400'
              }`} />
              {orbitnetEnabled ? 'ORBITNET-MESH' : 'GROUND-ONLY'}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full" />
              <span className="text-muted-foreground">Earth (Ground Station)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-muted-foreground">Satellite (Orbiting)</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              <span className="text-muted-foreground">Communication Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <span className="text-muted-foreground">Communication Blackout</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};