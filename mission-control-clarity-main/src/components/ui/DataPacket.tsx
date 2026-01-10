import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DataPacketProps {
  progress: number; // 0-100
  status: 'generating' | 'buffering' | 'transmitting' | 'delivered' | 'lost';
  id: string;
}

export function DataPacket({ progress, status, id }: DataPacketProps) {
  const statusColors = {
    generating: 'bg-primary shadow-primary/50',
    buffering: 'bg-warning shadow-warning/50',
    transmitting: 'bg-success shadow-success/50',
    delivered: 'bg-success shadow-success/50',
    lost: 'bg-destructive shadow-destructive/50',
  };

  return (
    <motion.div
      layoutId={id}
      className={cn(
        'w-3 h-3 rounded-full shadow-lg',
        statusColors[status]
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: `${progress}%`,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    />
  );
}
