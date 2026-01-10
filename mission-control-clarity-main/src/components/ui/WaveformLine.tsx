import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WaveformLineProps {
  active?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function WaveformLine({ 
  active = true, 
  color = 'primary',
  className 
}: WaveformLineProps) {
  const colors = {
    primary: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    destructive: 'stroke-destructive',
  };

  return (
    <div className={cn('h-8 w-full overflow-hidden', className)}>
      <svg
        viewBox="0 0 200 30"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {active ? (
          <motion.path
            d="M0,15 Q25,5 50,15 T100,15 T150,15 T200,15"
            fill="none"
            className={cn('stroke-2', colors[color])}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: [0.3, 0.8, 0.3],
              d: [
                "M0,15 Q25,5 50,15 T100,15 T150,15 T200,15",
                "M0,15 Q25,25 50,15 T100,15 T150,15 T200,15",
                "M0,15 Q25,5 50,15 T100,15 T150,15 T200,15",
              ]
            }}
            transition={{
              pathLength: { duration: 1, ease: "easeOut" },
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              d: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        ) : (
          <motion.line
            x1="0"
            y1="15"
            x2="200"
            y2="15"
            className="stroke-muted-foreground/30 stroke-2"
            strokeDasharray="5,5"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </svg>
    </div>
  );
}
