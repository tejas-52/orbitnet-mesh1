import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Cpu, 
  Shield, 
  Satellite, 
  Radio, 
  CheckCircle,
  AlertTriangle,
  Zap,
  ArrowRight,
  FileText,
  Image,
  Code,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface DataFlowPipelineProps {
  isRunning: boolean;
  communicationAvailable: boolean;
  orbitnetEnabled: boolean;
  storedPackets: number;
  transmittedPackets: number;
  totalPackets: number;
  lostPackets: number;
  telemetry?: any;
}

interface PayloadPacket {
  id: string;
  filename: string;
  type: string;
  size: number;
  stage: 'source' | 'processing' | 'buffer' | 'transmission' | 'ground';
  progress: number;
}

export const DataFlowPipeline = ({ 
  isRunning,
  communicationAvailable,
  orbitnetEnabled,
  storedPackets,
  transmittedPackets,
  totalPackets,
  lostPackets,
  telemetry
}: DataFlowPipelineProps) => {
  
  // Generate sample payload packets for visualization
  const generateSamplePackets = (): PayloadPacket[] => {
    const sampleFiles = [
      { name: 'thermal_map_001.json', type: 'json', icon: Code },
      { name: 'earth_observation.png', type: 'image', icon: Image },
      { name: 'mission_telemetry.txt', type: 'text', icon: FileText },
      { name: 'sensor_data.bin', type: 'binary', icon: Database },
      { name: 'system_health.log', type: 'log', icon: Activity }
    ];
    
    return sampleFiles.map((file, i) => ({
      id: `packet_${i}`,
      filename: file.name,
      type: file.type,
      size: Math.floor(Math.random() * 500) + 100,
      stage: ['source', 'processing', 'buffer', 'transmission', 'ground'][Math.floor(Math.random() * 5)] as any,
      progress: Math.random() * 100
    }));
  };

  const packets = generateSamplePackets();

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'json': return Code;
      case 'image': return Image;
      case 'text': return FileText;
      case 'binary': return Database;
      case 'log': return Activity;
      default: return FileText;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'source': return 'text-cyan-400';
      case 'processing': return 'text-blue-400';
      case 'buffer': return 'text-orange-400';
      case 'transmission': return 'text-green-400';
      case 'ground': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="card-glow bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-primary/20 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          ORBITNET-MESH Data Flow Pipeline
          <Badge variant="outline" className="text-xs">
            {isRunning ? '🔄 ACTIVE' : '⏸️ PAUSED'}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time visualization of payload files flowing through the satellite communication system
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Pipeline Stages */}
        <div className="relative">
          {/* Background Pipeline */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full transform -translate-y-1/2 opacity-50" />
          
          {/* Active Flow Line */}
          {isRunning && (
            <motion.div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-green-400 rounded-full transform -translate-y-1/2"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Pipeline Stages */}
          <div className="relative flex justify-between items-center py-8">
            
            {/* Stage 1: Payload Source */}
            <motion.div
              className="flex flex-col items-center z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-3 ${
                  isRunning ? 'border-cyan-400 bg-cyan-400/20' : 'border-gray-500 bg-gray-500/20'
                }`}
                animate={isRunning ? {
                  scale: [1, 1.1, 1],
                  boxShadow: ['0 0 0 0 rgba(34, 211, 238, 0.4)', '0 0 0 10px rgba(34, 211, 238, 0)', '0 0 0 0 rgba(34, 211, 238, 0)']
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Database className={`w-8 h-8 ${isRunning ? 'text-cyan-400' : 'text-gray-500'}`} />
              </motion.div>
              <div className="text-center">
                <div className="font-semibold text-sm text-white">Payload Source</div>
                <div className="text-xs text-muted-foreground">Scientific Data</div>
                <div className="text-xs font-mono text-cyan-400 mt-1">
                  <AnimatedCounter value={totalPackets} />
                </div>
              </div>
            </motion.div>

            {/* Flow Arrow 1 */}
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ArrowRight className={`w-6 h-6 ${isRunning ? 'text-cyan-400' : 'text-gray-500'}`} />
            </motion.div>

            {/* Stage 2: Onboard Processing */}
            <motion.div
              className="flex flex-col items-center z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-3 ${
                  isRunning ? 'border-blue-400 bg-blue-400/20' : 'border-gray-500 bg-gray-500/20'
                }`}
                animate={isRunning ? {
                  rotate: [0, 360]
                } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Cpu className={`w-8 h-8 ${isRunning ? 'text-blue-400' : 'text-gray-500'}`} />
              </motion.div>
              <div className="text-center">
                <div className="font-semibold text-sm text-white">Processing</div>
                <div className="text-xs text-muted-foreground">Compression & Encoding</div>
                <div className="text-xs font-mono text-blue-400 mt-1">
                  {isRunning ? 'ACTIVE' : 'IDLE'}
                </div>
              </div>
            </motion.div>

            {/* Flow Arrow 2 */}
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <ArrowRight className={`w-6 h-6 ${isRunning ? 'text-blue-400' : 'text-gray-500'}`} />
            </motion.div>

            {/* Stage 3: Smart Buffer */}
            <motion.div
              className="flex flex-col items-center z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-3 ${
                  orbitnetEnabled 
                    ? (storedPackets > 0 ? 'border-orange-400 bg-orange-400/20' : 'border-green-400 bg-green-400/20')
                    : 'border-red-400 bg-red-400/20'
                }`}
                animate={storedPackets > 0 ? {
                  scale: [1, 1.05, 1]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Shield className={`w-8 h-8 ${
                  orbitnetEnabled 
                    ? (storedPackets > 0 ? 'text-orange-400' : 'text-green-400')
                    : 'text-red-400'
                }`} />
              </motion.div>
              <div className="text-center">
                <div className="font-semibold text-sm text-white">Smart Buffer</div>
                <div className="text-xs text-muted-foreground">
                  {orbitnetEnabled ? 'ORBITNET Protected' : 'Unprotected'}
                </div>
                <div className="text-xs font-mono text-orange-400 mt-1">
                  <AnimatedCounter value={storedPackets} />
                </div>
              </div>
            </motion.div>

            {/* Flow Arrow 3 */}
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <ArrowRight className={`w-6 h-6 ${
                communicationAvailable ? 'text-green-400' : 'text-gray-500'
              }`} />
            </motion.div>

            {/* Stage 4: Satellite Link */}
            <motion.div
              className="flex flex-col items-center z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-3 ${
                  communicationAvailable 
                    ? 'border-green-400 bg-green-400/20' 
                    : 'border-red-400 bg-red-400/20'
                }`}
                animate={communicationAvailable && isRunning ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Satellite className={`w-8 h-8 ${
                  communicationAvailable ? 'text-green-400' : 'text-red-400'
                }`} />
              </motion.div>
              <div className="text-center">
                <div className="font-semibold text-sm text-white">Satellite Link</div>
                <div className="text-xs text-muted-foreground">
                  {communicationAvailable ? 'CONNECTED' : 'BLACKOUT'}
                </div>
                <div className="text-xs font-mono text-green-400 mt-1">
                  {communicationAvailable ? 'TRANSMITTING' : 'WAITING'}
                </div>
              </div>
            </motion.div>

            {/* Flow Arrow 4 */}
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <ArrowRight className={`w-6 h-6 ${
                communicationAvailable ? 'text-green-400' : 'text-gray-500'
              }`} />
            </motion.div>

            {/* Stage 5: Ground Station */}
            <motion.div
              className="flex flex-col items-center z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-3 ${
                  communicationAvailable 
                    ? 'border-emerald-400 bg-emerald-400/20' 
                    : 'border-gray-500 bg-gray-500/20'
                }`}
                animate={communicationAvailable && isRunning ? {
                  boxShadow: ['0 0 0 0 rgba(52, 211, 153, 0.4)', '0 0 0 15px rgba(52, 211, 153, 0)', '0 0 0 0 rgba(52, 211, 153, 0)']
                } : {}}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Radio className={`w-8 h-8 ${
                  communicationAvailable ? 'text-emerald-400' : 'text-gray-500'
                }`} />
              </motion.div>
              <div className="text-center">
                <div className="font-semibold text-sm text-white">Ground Station</div>
                <div className="text-xs text-muted-foreground">Mission Control</div>
                <div className="text-xs font-mono text-emerald-400 mt-1">
                  <AnimatedCounter value={transmittedPackets} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Flowing Packets Visualization */}
        <div className="mt-8 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Payload Stream
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {packets.slice(0, 6).map((packet, index) => {
                const IconComponent = getFileIcon(packet.type);
                return (
                  <motion.div
                    key={packet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800/50 border border-slate-600 rounded-lg p-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${getStageColor(packet.stage)} bg-current/10`}>
                        <IconComponent className={`w-4 h-4 ${getStageColor(packet.stage)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">
                          {packet.filename}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {packet.size}KB • {packet.type.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-slate-700 rounded-full h-1">
                            <motion.div
                              className={`h-1 rounded-full bg-gradient-to-r from-cyan-400 to-green-400`}
                              initial={{ width: 0 }}
                              animate={{ width: `${packet.progress}%` }}
                              transition={{ duration: 2, ease: "easeOut" }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(packet.progress)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-cyan-400">
              <AnimatedCounter value={totalPackets} />
            </div>
            <div className="text-xs text-muted-foreground">Total Payloads</div>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">
              <AnimatedCounter value={transmittedPackets} />
            </div>
            <div className="text-xs text-muted-foreground">Delivered</div>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-400">
              <AnimatedCounter value={storedPackets} />
            </div>
            <div className="text-xs text-muted-foreground">Protected</div>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">
              <AnimatedCounter value={lostPackets} />
            </div>
            <div className="text-xs text-muted-foreground">Lost</div>
          </div>
        </div>

        {/* Current Status Banner */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                orbitnetEnabled ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {orbitnetEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <div className="font-semibold text-sm">
                  {orbitnetEnabled ? 'ORBITNET-MESH Active' : 'Standard Mode'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {orbitnetEnabled 
                    ? 'Zero data loss protection enabled - all payloads secured'
                    : 'Data may be lost during communication blackouts'
                  }
                </div>
              </div>
            </div>
            <Badge variant={orbitnetEnabled ? "default" : "destructive"} className="text-xs">
              {orbitnetEnabled ? 'PROTECTED' : 'AT RISK'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};