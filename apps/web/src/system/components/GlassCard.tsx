import { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { colors, spacing } from '../tokens';

interface GlassCardProps extends MotionProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  glow?: 'cyan' | 'violet' | 'none';
}

export function GlassCard({
  children,
  className = '',
  interactive = false,
  glow = 'none',
  ...motionProps
}: GlassCardProps) {
  const glowColor = glow === 'cyan' ? colors.cyan : glow === 'violet' ? colors.violet : 'transparent';

  return (
    <motion.div
      className={`rounded-lg backdrop-blur-xl ${className}`}
      style={{
        backgroundColor: `rgba(26, 26, 46, 0.5)`,
        border: `1px solid ${colors.border}`,
        padding: spacing.lg,
        boxShadow: glow !== 'none' ? `0 0 20px ${glowColor}20` : 'none',
      }}
      whileHover={interactive ? { boxShadow: `0 0 30px ${glowColor}40` } : {}}
      transition={{ duration: 0.3 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
