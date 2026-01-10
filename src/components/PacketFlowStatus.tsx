import { motion } from 'framer-motion';
import { Package, Send, Database, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface PacketFlowStatusProps {
  totalPackets: number;
  storedPackets: number;
  transmittedPackets: number;
  lostPackets: number;
  isTransmitting: boolean;
}

export const PacketFlowStatus = ({ 
  totalPackets, 
  storedPackets, 
  transmittedPackets, 
  lostPackets,
  isTransmitting 
}: PacketFlowStatusProps) => {
  const metrics = [
    {
      icon: Package,
      label: 'Generated',
      value: totalPackets,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      description: 'Total packets created'
    },
    {
      icon: Send,
      label: 'Transmitted',
      value: transmittedPackets,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      description: 'Successfully sent to ground',
      animate: isTransmitting
    },
    {
      icon: Database,
      label: 'Buffered',
      value: storedPackets,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      description: 'Waiting for transmission',
      animate: storedPackets > 0
    },
    {
      icon: AlertCircle,
      label: 'Lost',
      value: lostPackets,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      description: 'Data permanently lost'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`${metric.bgColor} border ${metric.borderColor} relative overflow-hidden`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={metric.animate ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: metric.animate ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className={`p-2 rounded-lg ${metric.bgColor} border ${metric.borderColor}`}
                >
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </motion.div>
                
                <div className="flex-1">
                  <div className={`text-2xl font-bold ${metric.color}`}>
                    <AnimatedCounter value={metric.value} />
                  </div>
                  <div className="text-xs font-medium text-foreground">{metric.label}</div>
                  <div className="text-xs text-muted-foreground">{metric.description}</div>
                </div>
              </div>

              {/* Animated packet icons for active states */}
              {metric.animate && (
                <div className="absolute top-2 right-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: [0, 20, 40],
                        y: [0, -10, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut"
                      }}
                      className={`absolute w-2 h-2 rounded-full ${metric.color.replace('text-', 'bg-')}`}
                    />
                  ))}
                </div>
              )}

              {/* Progress bar for buffered packets */}
              {metric.label === 'Buffered' && storedPackets > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-secondary/30 rounded-full h-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((storedPackets / Math.max(totalPackets, 1)) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-orange-400 h-1 rounded-full"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Buffer: {Math.round((storedPackets / Math.max(totalPackets, 1)) * 100)}%
                  </div>
                </div>
              )}

              {/* Success rate for transmitted packets */}
              {metric.label === 'Transmitted' && totalPackets > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-secondary/30 rounded-full h-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(transmittedPackets / totalPackets) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-green-400 h-1 rounded-full"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Success: {Math.round((transmittedPackets / totalPackets) * 100)}%
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};