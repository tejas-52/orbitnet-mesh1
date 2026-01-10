import { motion } from 'framer-motion';
import { Satellite, Radio, Database, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkflowDiagramProps {
  communicationAvailable: boolean;
  orbitnetEnabled: boolean;
  storedPackets: number;
  transmittedPackets: number;
}

export const WorkflowDiagram = ({ 
  communicationAvailable, 
  orbitnetEnabled, 
  storedPackets, 
  transmittedPackets 
}: WorkflowDiagramProps) => {
  const steps = [
    {
      id: 'satellite',
      icon: Satellite,
      title: 'Satellite',
      description: 'Generates data packets',
      status: 'active'
    },
    {
      id: 'linkcheck',
      icon: Radio,
      title: 'Link Check',
      description: 'Communication available?',
      status: communicationAvailable ? 'success' : 'warning'
    },
    {
      id: 'decision',
      icon: communicationAvailable ? Send : (orbitnetEnabled ? Database : AlertCircle),
      title: communicationAvailable ? 'Transmit' : (orbitnetEnabled ? 'Buffer' : 'Lost'),
      description: communicationAvailable 
        ? 'Send to ground' 
        : orbitnetEnabled 
          ? 'Store for later' 
          : 'Data lost',
      status: communicationAvailable 
        ? 'success' 
        : orbitnetEnabled 
          ? 'buffering' 
          : 'error'
    },
    {
      id: 'ground',
      icon: CheckCircle,
      title: 'Ground Station',
      description: communicationAvailable ? 'Data received safely' : (orbitnetEnabled ? 'Waiting for transmission' : 'No data received'),
      status: communicationAvailable ? 'success' : 'waiting'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'warning': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'buffering': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'waiting': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-primary bg-primary/20 border-primary/30';
    }
  };

  const getArrowColor = (fromIndex: number) => {
    if (fromIndex === 1) { // Link check to decision
      return communicationAvailable ? 'border-green-400' : 'border-orange-400';
    }
    if (fromIndex === 2) { // Decision to ground
      return communicationAvailable ? 'border-green-400' : 'border-gray-400';
    }
    return 'border-primary';
  };

  return (
    <Card className="card-glow bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          Communication Workflow
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Shows how data is handled during communication availability and blackouts
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Workflow Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative">
                {/* Step Circle */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mb-3 ${getStatusColor(step.status)}`}
                >
                  <step.icon className="w-8 h-8" />
                </motion.div>

                {/* Step Info */}
                <div className="text-center">
                  <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground max-w-20">{step.description}</p>
                </div>

                {/* Arrow to next step */}
                {index < steps.length - 1 && (
                  <div className="absolute top-8 left-full w-12 flex items-center justify-center">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.2 + 0.3 }}
                      className={`h-0 border-t-2 border-dashed w-8 ${getArrowColor(index)}`}
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.2 + 0.5 }}
                      className={`w-0 h-0 border-l-4 border-t-2 border-b-2 border-t-transparent border-b-transparent ml-1 ${
                        getArrowColor(index).replace('border-', 'border-l-')
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Status Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/20 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Buffered Packets</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">{storedPackets}</div>
              <p className="text-xs text-muted-foreground">Waiting for transmission</p>
            </div>

            <div className="p-4 bg-secondary/20 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Transmitted</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{transmittedPackets}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </div>
          </div>

          {/* Current Mode Indicator */}
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${orbitnetEnabled ? 'bg-primary animate-pulse' : 'bg-orange-400'}`} />
              <span className="text-sm font-medium">
                Current Mode: {orbitnetEnabled ? 'ORBITNET-MESH' : 'GROUND-ONLY'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {orbitnetEnabled 
                ? 'Smart buffering active - zero data loss guaranteed' 
                : communicationAvailable
                  ? 'Direct transmission mode - data transmitted in real-time'
                  : 'Traditional mode - data lost during blackouts (no buffering capability)'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};