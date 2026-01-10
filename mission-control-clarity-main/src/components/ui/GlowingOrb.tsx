import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlowingOrbProps {
  children: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pulse?: boolean;
  className?: string;
}

export function GlowingOrb({ 
  children, 
  color = 'primary', 
  size = 'md',
  pulse = false,
  className 
}: GlowingOrbProps) {
  const colors = {
    primary: 'from-primary/30 to-primary/5 border-primary/50 shadow-primary/30',
    success: 'from-success/30 to-success/5 border-success/50 shadow-success/30',
    warning: 'from-warning/30 to-warning/5 border-warning/50 shadow-warning/30',
    destructive: 'from-destructive/30 to-destructive/5 border-destructive/50 shadow-destructive/30',
  };

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  };

  return (
    <motion.div
      animate={pulse ? {
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 20px 0px hsl(var(--primary) / 0.2)',
          '0 0 40px 10px hsl(var(--primary) / 0.4)',
          '0 0 20px 0px hsl(var(--primary) / 0.2)',
        ]
      } : {}}
      transition={pulse ? {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
      className={cn(
        'rounded-full bg-gradient-to-br border-2 flex items-center justify-center',
        'shadow-lg backdrop-blur-sm',
        colors[color],
        sizes[size],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
