import { motion } from 'framer-motion';
import { 
  Satellite, 
  Radio, 
  Database, 
  Activity, 
  Zap, 
  CheckCircle,
  ArrowRight,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface MissionControlPanelProps {
  isRunning: boolean;
  communicationAvailable: boolean;
  orbitnetEnabled: boolean;
  storedPackets: number;
  transmittedPackets: number;
  totalPackets: number;
  lostPackets: number;
  telemetry?: any;
  isBlackoutMode?: boolean;
}

export const MissionControlPanel = ({ 
  isRunning,
  communicationAvailable,
  orbitnetEnabled,
  storedPackets,
  transmittedPackets,
  totalPackets,
  lostPackets,
  telemetry,
  isBlackoutMode = false
}: MissionControlPanelProps) => {
  // Override communication availability if in blackout mode
  const effectiveCommunicationAvailable = communicationAvailable && !isBlackoutMode;
  
  return (
    <Card className="card-glow bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Mission Control Dashboard
          <Badge variant="outline" className="text-xs">
            {isRunning ? '🟢 LIVE' : '🔴 OFFLINE'}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Unified view of satellite simulation, communication workflow, data flow, and ground infrastructure
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Live Satellite Simulation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Satellite className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Live Satellite Simulation</h3>
            </div>
            
            <div className="relative w-full h-48 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg border border-border/50 overflow-hidden">
              {/* Space background with stars */}
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-60"
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
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-green-400 border border-blue-300/50"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white/80" />
                  </div>
                </motion.div>
              </div>

              {/* Orbital path */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-32 border border-dashed border-primary/30 rounded-full" />
              </div>

              {/* Satellite with orbital animation */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  animate={isRunning ? { rotate: 360 } : {}}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32"
                >
                  <motion.div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    animate={isRunning ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className={`p-2 rounded border ${
                      effectiveCommunicationAvailable 
                        ? 'bg-green-500/20 border-green-500/50' 
                        : 'bg-red-500/20 border-red-500/50'
                    }`}>
                      <Satellite className={`w-4 h-4 ${
                        effectiveCommunicationAvailable ? 'text-green-400' : 'text-red-400'
                      }`} />
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Ground Station */}
              <div className="absolute bottom-2 right-2">
                <div className={`p-1.5 rounded border ${
                  effectiveCommunicationAvailable 
                    ? 'bg-green-500/20 border-green-500/50' 
                    : 'bg-gray-500/20 border-gray-500/50'
                }`}>
                  <Radio className={`w-3 h-3 ${
                    effectiveCommunicationAvailable ? 'text-green-400' : 'text-gray-400'
                  }`} />
                </div>
              </div>

              {/* Status overlay */}
              <div className="absolute top-2 left-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                  effectiveCommunicationAvailable 
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    effectiveCommunicationAvailable ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`} />
                  {effectiveCommunicationAvailable ? 'LINK UP' : isBlackoutMode ? 'BLACKOUT SIM' : 'BLACKOUT'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Communication Workflow */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Communication Workflow</h3>
            </div>
            
            <div className="space-y-3">
              {/* Workflow Steps */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Satellite className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium">Satellite</span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                    effectiveCommunicationAvailable 
                      ? 'bg-green-500/20 border-green-500/30' 
                      : 'bg-orange-500/20 border-orange-500/30'
                  }`}>
                    <Radio className={`w-4 h-4 ${
                      effectiveCommunicationAvailable ? 'text-green-400' : 'text-orange-400'
                    }`} />
                  </div>
                  <span className="text-xs font-medium">Link Check</span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-muted-foreground rotate-90" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                    effectiveCommunicationAvailable 
                      ? 'bg-green-500/20 border-green-500/30' 
                      : 'bg-blue-500/20 border-blue-500/30'
                  }`}>
                    {effectiveCommunicationAvailable ? (
                      <Zap className="w-4 h-4 text-green-400" />
                    ) : (
                      <Database className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <span className="text-xs font-medium">
                    {effectiveCommunicationAvailable ? 'Transmit' : 'Buffer'}
                  </span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                    effectiveCommunicationAvailable 
                      ? 'bg-green-500/20 border-green-500/30' 
                      : 'bg-gray-500/20 border-gray-500/30'
                  }`}>
                    <CheckCircle className={`w-4 h-4 ${
                      effectiveCommunicationAvailable ? 'text-green-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <span className="text-xs font-medium">Ground</span>
                </div>
              </div>

              {/* Current Status */}
              <div className="mt-4 p-3 bg-secondary/20 rounded border border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Current Decision:</div>
                <div className={`text-sm font-medium ${
                  effectiveCommunicationAvailable ? 'text-green-400' : 
                  orbitnetEnabled ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {effectiveCommunicationAvailable 
                    ? `${orbitnetEnabled ? 'ORBITNET-MESH' : 'GROUND-ONLY'}: Direct transmission to ground station`
                    : orbitnetEnabled 
                      ? 'ORBITNET-MESH: Buffering data for later transmission (zero loss)'
                      : 'GROUND-ONLY: Data lost permanently during blackout'
                  }
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {effectiveCommunicationAvailable 
                    ? 'Real-time data delivery to mission control - no data loss'
                    : orbitnetEnabled 
                      ? 'Smart store-and-forward ensures no data is ever lost'
                      : 'Traditional systems cannot buffer - data disappears forever'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* 3. Data Flow Visualization */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Data Flow Visualization</h3>
            </div>
            
            {/* Professional Data Flow Panel - Matching the provided design */}
            <div className="relative bg-slate-900 rounded-lg border border-slate-700 p-6 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-lg font-semibold text-white">DATA FLOW VISUALIZATION</h4>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  communicationAvailable 
                    ? 'bg-cyan-400 text-slate-900' 
                    : 'bg-red-500 text-white'
                }`}>
                  {communicationAvailable ? 'CONNECTED' : 'DISCONNECTED'}
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-slate-400 text-sm mb-8">
                Real-time visualization of data flowing through the ORBITNET-MESH system.
              </p>

              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
              </div>

              {/* Data Flow Components */}
              <div className="relative z-10 flex items-center justify-center gap-8 py-8">
                
                {/* Payload Source */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="bg-slate-800 border border-cyan-400/50 rounded-lg p-6 mb-4 min-w-[160px]">
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-cyan-400/20 rounded border border-cyan-400/50 flex items-center justify-center">
                          <Database className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-cyan-400 rounded"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold mb-1">Payload Source</div>
                      <div className="text-cyan-400 text-sm">Scientific Data</div>
                    </div>
                  </div>
                  <div className="text-cyan-400 font-mono text-lg">
                    <AnimatedCounter value={totalPackets || 12728} />
                    <span className="text-slate-400 text-sm ml-1">packets</span>
                  </div>
                  
                  {/* Show current payload file being transmitted */}
                  {telemetry?.actual_payload && (
                    <div className="mt-2 p-2 bg-slate-700/50 rounded border border-cyan-400/30 max-w-[160px]">
                      <div className="text-xs text-cyan-400 font-medium truncate">
                        📄 {telemetry.actual_payload.filename}
                      </div>
                      <div className="text-xs text-slate-400">
                        {telemetry.actual_payload.type?.toUpperCase()} • {Math.round(telemetry.actual_payload.size_bytes / 1024)}KB
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Flow Arrow 1 */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center"
                >
                  <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-slate-600" />
                  <div className="w-0 h-0 border-l-4 border-l-cyan-400 border-t-2 border-b-2 border-t-transparent border-b-transparent" />
                  
                  {/* Animated payload packets */}
                  {isRunning && (
                    <motion.div
                      className="absolute w-3 h-3 bg-cyan-400 rounded-full flex items-center justify-center"
                      animate={{
                        x: [-20, 40],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <div className="w-1 h-1 bg-white rounded-full" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Onboard Buffer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 mb-4 min-w-[160px]">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-8 bg-slate-700 rounded border border-slate-500 relative">
                        <div className="absolute top-1 left-1 right-1 h-1 bg-slate-500 rounded" />
                        <div className="absolute top-3 left-1 right-1 h-1 bg-slate-500 rounded" />
                        <div className="absolute bottom-1 left-1 right-1 h-1 bg-slate-500 rounded" />
                        
                        {/* Show buffer activity when storing packets */}
                        {storedPackets > 0 && (
                          <motion.div
                            className="absolute inset-0 bg-blue-400/20 rounded"
                            animate={{
                              opacity: [0.2, 0.6, 0.2]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold mb-1">Onboard Buffer</div>
                      <div className="text-slate-400 text-sm">
                        {storedPackets > 0 ? 'Storing Payloads' : 'Ready'}
                      </div>
                    </div>
                  </div>
                  <div className="text-white font-mono text-lg">
                    <AnimatedCounter value={storedPackets || 0} />
                    <span className="text-slate-400 text-sm ml-1">PACKETS</span>
                  </div>
                  
                  {/* Show what's in the buffer */}
                  {storedPackets > 0 && (
                    <div className="mt-2 p-2 bg-slate-700/50 rounded border border-blue-400/30 max-w-[160px]">
                      <div className="text-xs text-blue-400 font-medium">
                        📦 Buffering Mode Active
                      </div>
                      <div className="text-xs text-slate-400">
                        Protecting {storedPackets} payload{storedPackets !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Flow Arrow 2 */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center"
                >
                  <div className={`w-12 h-0.5 bg-gradient-to-r ${
                    communicationAvailable 
                      ? 'from-cyan-400 to-green-400' 
                      : 'from-slate-600 to-slate-600'
                  }`} />
                  <div className={`w-0 h-0 border-l-4 border-t-2 border-b-2 border-t-transparent border-b-transparent ${
                    communicationAvailable 
                      ? 'border-l-green-400' 
                      : 'border-l-slate-600'
                  }`} />
                  
                  {/* Animated payload packets */}
                  {isRunning && communicationAvailable && (
                    <motion.div
                      className="absolute w-3 h-3 bg-green-400 rounded-full flex items-center justify-center"
                      animate={{
                        x: [-20, 40],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 0.5
                      }}
                    >
                      <div className="w-1 h-1 bg-white rounded-full" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Link/Satellite */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col items-center"
                >
                  <div className={`border rounded-lg p-6 mb-4 min-w-[160px] ${
                    communicationAvailable 
                      ? 'bg-slate-800 border-cyan-400/50' 
                      : 'bg-slate-800 border-slate-600'
                  }`}>
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-8 h-8 rounded border flex items-center justify-center ${
                        communicationAvailable 
                          ? 'bg-cyan-400/20 border-cyan-400/50' 
                          : 'bg-slate-700 border-slate-500'
                      }`}>
                        <div className={`w-4 h-4 border-2 rounded transform rotate-45 ${
                          communicationAvailable 
                            ? 'border-cyan-400' 
                            : 'border-slate-500'
                        }`} />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold mb-1">Link</div>
                      <div className={`text-sm ${
                        communicationAvailable ? 'text-cyan-400' : 'text-slate-400'
                      }`}>
                        {communicationAvailable ? 'SATELLITE' : 'OFFLINE'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Dots */}
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          communicationAvailable ? 'bg-cyan-400' : 'bg-slate-600'
                        }`}
                        animate={communicationAvailable ? {
                          opacity: [0.3, 1, 0.3]
                        } : {}}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Status Bar */}
              <div className="mt-8 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="text-slate-400">Payload Generation: Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      orbitnetEnabled ? 'bg-green-400 animate-pulse' : 'bg-orange-400'
                    }`} />
                    <span className="text-slate-400">
                      Buffer: {orbitnetEnabled ? 'Protected' : 'At Risk'}
                    </span>
                  </div>
                  {telemetry?.actual_payload && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-slate-400">
                        Current: {telemetry.actual_payload.filename}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-slate-500 font-mono text-xs">
                  ORBITNET-MESH v1.0
                </div>
              </div>
            </div>

            {/* Quick Stats Below */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-center">
                <div className="text-lg font-bold text-blue-400">
                  <AnimatedCounter value={totalPackets} />
                </div>
                <div className="text-xs text-muted-foreground">Payloads Generated</div>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-center">
                <div className="text-lg font-bold text-green-400">
                  <AnimatedCounter value={transmittedPackets} />
                </div>
                <div className="text-xs text-muted-foreground">Transmitted</div>
              </div>
              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded text-center">
                <div className="text-lg font-bold text-orange-400">
                  <AnimatedCounter value={storedPackets} />
                </div>
                <div className="text-xs text-muted-foreground">Buffered Safely</div>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-center">
                <div className="text-lg font-bold text-red-400">
                  <AnimatedCounter value={lostPackets} />
                </div>
                <div className="text-xs text-muted-foreground">Lost</div>
              </div>
            </div>
          </div>

          {/* 4. Ground Station and Satellite Visualization */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Ground Station & Satellite</h3>
            </div>
            
            <div className="relative bg-slate-800 rounded-lg border border-slate-600 p-4 h-48">
              {/* Space background */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg">
                {/* Stars */}
                {[...Array(15)].map((_, i) => (
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

              {/* Ground Station (Bottom Left) */}
              <div className="absolute bottom-4 left-4">
                <motion.div
                  animate={communicationAvailable ? {
                    scale: [1, 1.05, 1],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex flex-col items-center"
                >
                  <div className={`p-3 rounded-lg border-2 ${
                    communicationAvailable 
                      ? 'bg-green-500/20 border-green-500/50' 
                      : 'bg-gray-500/20 border-gray-500/50'
                  } backdrop-blur-sm`}>
                    <Radio className={`w-6 h-6 ${
                      communicationAvailable ? 'text-green-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-xs text-center mt-2">
                    <div className="text-white font-medium">Ground Station</div>
                    <div className={`text-xs ${
                      communicationAvailable ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {communicationAvailable ? 'RECEIVING' : 'STANDBY'}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Satellite (Top Right) */}
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={isRunning ? {
                    rotate: [0, 360],
                  } : {}}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="flex flex-col items-center"
                >
                  <div className={`p-3 rounded-lg border-2 ${
                    communicationAvailable 
                      ? 'bg-cyan-400/20 border-cyan-400/50' 
                      : 'bg-red-500/20 border-red-500/50'
                  } backdrop-blur-sm`}>
                    <Satellite className={`w-6 h-6 ${
                      communicationAvailable ? 'text-cyan-400' : 'text-red-400'
                    }`} />
                  </div>
                  <div className="text-xs text-center mt-2">
                    <div className="text-white font-medium">Satellite</div>
                    <div className={`text-xs ${
                      communicationAvailable ? 'text-cyan-400' : 'text-red-400'
                    }`}>
                      {communicationAvailable ? 'TRANSMITTING' : 'BLACKOUT'}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Communication Link */}
              {communicationAvailable && isRunning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Signal Line */}
                  <svg
                    width="200"
                    height="120"
                    className="absolute"
                    style={{ 
                      left: '50%', 
                      top: '50%', 
                      transform: 'translate(-50%, -50%) rotate(-30deg)' 
                    }}
                  >
                    <motion.line
                      x1="20"
                      y1="100"
                      x2="180"
                      y2="20"
                      stroke="rgb(34, 197, 94)"
                      strokeWidth="2"
                      strokeDasharray="8,4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </svg>
                  
                  {/* Signal Pulses */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-green-400 rounded-full"
                      style={{
                        left: '25%',
                        top: '75%'
                      }}
                      animate={{
                        x: [0, 120],
                        y: [0, -80],
                        opacity: [1, 0.5, 0],
                        scale: [1, 0.5, 0.2]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Earth (Center Bottom) */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-green-400 border-2 border-blue-300/50 shadow-lg"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white/80" />
                  </div>
                </motion.div>
              </div>

              {/* Status Indicators */}
              <div className="absolute top-2 left-2 space-y-1">
                <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
                  communicationAvailable 
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    communicationAvailable ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`} />
                  Link: {communicationAvailable ? 'ACTIVE' : 'DOWN'}
                </div>
                
                <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
                  orbitnetEnabled 
                    ? 'bg-primary/20 text-primary'
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    orbitnetEnabled ? 'bg-primary animate-pulse' : 'bg-orange-400'
                  }`} />
                  Mode: {orbitnetEnabled ? 'MESH' : 'DIRECT'}
                </div>
              </div>
            </div>

            {/* Infrastructure Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-secondary/20 rounded border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-medium">Ground Station</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={communicationAvailable ? 'text-green-400' : 'text-gray-400'}>
                      {communicationAvailable ? 'Online' : 'Standby'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Signal:</span>
                    <span className={communicationAvailable ? 'text-green-400' : 'text-gray-400'}>
                      {communicationAvailable ? '98%' : '0%'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-secondary/20 rounded border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Satellite className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs font-medium">Satellite</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={isRunning ? 'text-cyan-400' : 'text-gray-400'}>
                      {isRunning ? 'Active' : 'Idle'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Orbit:</span>
                    <span className="text-cyan-400">LEO 550km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Mode Indicator */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                orbitnetEnabled ? 'bg-primary/20' : 'bg-orange-500/20'
              }`}>
                <Satellite className={`w-4 h-4 ${
                  orbitnetEnabled ? 'text-primary' : 'text-orange-400'
                }`} />
              </div>
              <div>
                <div className="font-semibold text-sm">
                  System Mode: {orbitnetEnabled ? 'ORBITNET-MESH' : 'GROUND-ONLY'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {orbitnetEnabled 
                    ? 'Smart buffering active - zero data loss protection'
                    : 'Traditional mode - data may be lost during blackouts'
                  }
                </div>
              </div>
            </div>
            <Badge variant={orbitnetEnabled ? "default" : "secondary"} className="text-xs">
              {orbitnetEnabled ? 'PROTECTED' : 'AT RISK'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};