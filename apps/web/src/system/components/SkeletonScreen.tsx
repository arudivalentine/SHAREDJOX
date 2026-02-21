import { motion } from 'framer-motion';
import { colors, spacing } from '../tokens';

interface SkeletonScreenProps {
  lines?: number;
  variant?: 'text' | 'card' | 'avatar';
  className?: string;
}

const shimmerGradient = `linear-gradient(
  90deg,
  ${colors.surfaceLight} 0%,
  ${colors.surface} 50%,
  ${colors.surfaceLight} 100%
)`;

export function SkeletonScreen({ lines = 3, variant = 'text', className = '' }: SkeletonScreenProps) {
  if (variant === 'avatar') {
    return (
      <motion.div
        className={`rounded-full ${className}`}
        style={{
          width: '48px',
          height: '48px',
          background: shimmerGradient,
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        className={`rounded-lg p-${spacing.lg} ${className}`}
        style={{
          background: shimmerGradient,
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div style={{ height: '200px' }} />
      </motion.div>
    );
  }

  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded"
          style={{
            height: i === lines - 1 ? '12px' : '16px',
            marginBottom: i === lines - 1 ? 0 : spacing.md,
            background: shimmerGradient,
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}
