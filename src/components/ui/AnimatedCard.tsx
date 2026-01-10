import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  glowColor?: 'primary' | 'success' | 'warning' | 'destructive';
  delay?: number;
}

export function AnimatedCard({ 
  children, 
  className, 
  glowColor = 'primary',
  delay = 0,
  ...props 
}: AnimatedCardProps) {
  const glowColors = {
    primary: 'hover:shadow-primary/20 hover:border-primary/40',
    success: 'hover:shadow-success/20 hover:border-success/40',
    warning: 'hover:shadow-warning/20 hover:border-warning/40',
    destructive: 'hover:shadow-destructive/20 hover:border-destructive/40',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.23, 1, 0.32, 1]
      }}
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      className={cn(
        'bg-card rounded-xl border border-border p-6',
        'transition-all duration-300',
        'shadow-lg shadow-background/50',
        'hover:shadow-xl',
        glowColors[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
