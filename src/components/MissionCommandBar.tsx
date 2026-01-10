import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  Satellite, 
  Radio, 
  CheckCircle, 
  XCircle,
  Clock,
  Zap,
  WifiOff,
  AlertTriangle
} from 'lucide-react';

interface MissionCommandBarProps {
  isRunning: boolean;
  orbitnetEnabled: boolean;
  communicationAvailable: boolean;
  storedPackets: number;
  dataLossRate: number;
  blackoutActive: boolean;
  onToggleBlackout: () => void;
}

export const MissionCommandBar = ({ 
  isRunning, 
  orbitnetEnabled, 
  communicationAvailable, 
  storedPackets,
  dataLossRate,
  blackoutActive,
  onToggleBlackout
}: MissionCommandBarProps) => {
  
  const getDataSafetyStatus = () => {
    if (dataLossRate === 0) return { status: 'SAFE', color: 'green', icon: CheckCircle };
    if (storedPackets > 0) return { status: 'BUFFERING', color: 'amber', icon: Clock };
    if (dataLossRate > 10) return { status: 'LOST', color: 'red', icon: XCircle };
    return { status: 'SAFE', color: 'green', icon: CheckCircle };
  };

  const dataSafety = getDataSafetyStatus();

  const commandCards = [
    {
      title: 'Mission State',
      value: isRunning ? 'RUNNING' : 'STOPPED',
      icon: Rocket,
      color: isRunning ? 'green' : 'gray',
      pulse: isRunning
    },
    {
      title: 'System Mode',
      value: orbitnetEnabled ? 'ORBITNET' : 'GROUND-ONLY',
      icon: Satellite,
      color: orbitnetEnabled ? 'blue' : 'orange',
      pulse: false
    },
    {
      title: 'Communication',
      value: communicationAvailable ? 'CONNECTED' : (blackoutActive ? 'BLACKOUT SIM' : 'BLACKOUT'),
      icon: communicationAvailable ? Radio : WifiOff,
      color: communicationAvailable ? 'green' : 'red',
      pulse: communicationAvailable
    },
    {
      title: 'Data Safety',
      value: dataSafety.status,
      icon: dataSafety.icon,
      color: dataSafety.color,
      pulse: dataSafety.status === 'BUFFERING'
    }
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Mission Command Center</h2>
        <Badge variant="outline" className="text-xs">LIVE</Badge>
        <Badge variant={blackoutActive ? "destructive" : "secondary"} className="text-xs">
          {blackoutActive ? "BLACKOUT ACTIVE" : "NORMAL"}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {commandCards.map((card, index) => {
          const IconComponent = card.icon;
          
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`
                relative overflow-hidden border-2 transition-all duration-300
                ${card.color === 'green' ? 'border-green-500/30 bg-green-500/5' : ''}
                ${card.color === 'blue' ? 'border-primary/30 bg-primary/5' : ''}
                ${card.color === 'orange' ? 'border-orange-500/30 bg-orange-500/5' : ''}
                ${card.color === 'red' ? 'border-red-500/30 bg-red-500/5' : ''}
                ${card.color === 'amber' ? 'border-amber-500/30 bg-amber-500/5' : ''}
                ${card.color === 'gray' ? 'border-gray-500/30 bg-gray-500/5' : ''}
              `}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground font-medium">
                      {card.title}
                    </span>
                    <div className={`
                      p-1.5 rounded-full
                      ${card.color === 'green' ? 'bg-green-500/20' : ''}
                      ${card.color === 'blue' ? 'bg-primary/20' : ''}
                      ${card.color === 'orange' ? 'bg-orange-500/20' : ''}
                      ${card.color === 'red' ? 'bg-red-500/20' : ''}
                      ${card.color === 'amber' ? 'bg-amber-500/20' : ''}
                      ${card.color === 'gray' ? 'bg-gray-500/20' : ''}
                    `}>
                      <IconComponent className={`
                        w-4 h-4
                        ${card.color === 'green' ? 'text-green-500' : ''}
                        ${card.color === 'blue' ? 'text-primary' : ''}
                        ${card.color === 'orange' ? 'text-orange-500' : ''}
                        ${card.color === 'red' ? 'text-red-500' : ''}
                        ${card.color === 'amber' ? 'text-amber-500' : ''}
                        ${card.color === 'gray' ? 'text-gray-500' : ''}
                      `} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {card.pulse && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`
                          w-2 h-2 rounded-full
                          ${card.color === 'green' ? 'bg-green-500' : ''}
                          ${card.color === 'blue' ? 'bg-primary' : ''}
                          ${card.color === 'amber' ? 'bg-amber-500' : ''}
                        `}
                      />
                    )}
                    <span className={`
                      text-lg font-bold
                      ${card.color === 'green' ? 'text-green-500' : ''}
                      ${card.color === 'blue' ? 'text-primary' : ''}
                      ${card.color === 'orange' ? 'text-orange-500' : ''}
                      ${card.color === 'red' ? 'text-red-500' : ''}
                      ${card.color === 'amber' ? 'text-amber-500' : ''}
                      ${card.color === 'gray' ? 'text-gray-500' : ''}
                    `}>
                      {card.value}
                    </span>
                  </div>
                </CardContent>
                
                {card.pulse && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`
                      absolute inset-0 pointer-events-none
                      ${card.color === 'green' ? 'bg-green-500/10' : ''}
                      ${card.color === 'blue' ? 'bg-primary/10' : ''}
                      ${card.color === 'amber' ? 'bg-amber-500/10' : ''}
                    `}
                  />
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Blackout Button - Simplified Structure */}
      <div className="flex justify-center mt-6 relative z-50">
        <button
          onClick={() => {
            console.log('🔴 BLACKOUT BUTTON CLICKED - Current state:', blackoutActive, '→ New state:', !blackoutActive);
            onToggleBlackout();
          }}
          className={`
            px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 relative
            cursor-pointer hover:scale-105 active:scale-95
            ${blackoutActive 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse border-2 border-red-400 shadow-lg shadow-red-500/50' 
              : 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500/20 hover:text-orange-400 bg-transparent hover:shadow-lg hover:shadow-orange-500/30'
            }
          `}
          style={{ 
            cursor: 'pointer', 
            pointerEvents: 'auto',
            zIndex: 1000,
            position: 'relative'
          }}
        >
          <div className="flex items-center justify-center gap-2">
            {blackoutActive ? (
              <>
                <WifiOff className="w-5 h-5" />
                EXIT BLACKOUT SIMULATION
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                SIMULATE BLACKOUT
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};