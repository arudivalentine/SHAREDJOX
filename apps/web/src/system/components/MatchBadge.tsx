import { motion } from 'framer-motion';
import { colors, spacing, spring } from '../tokens';

interface MatchBadgeProps {
  percentage: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showExplainer?: boolean;
  explainerText?: string;
}

const sizeConfig = {
  sm: { radius: 24, fontSize: '12px', padding: `${spacing.xs} ${spacing.sm}` },
  md: { radius: 32, fontSize: '14px', padding: `${spacing.sm} ${spacing.md}` },
  lg: { radius: 40, fontSize: '16px', padding: `${spacing.md} ${spacing.lg}` },
};

function getMatchColor(percentage: number): string {
  if (percentage >= 85) return colors.cyan;
  if (percentage >= 70) return colors.violet;
  if (percentage >= 50) return colors.warning;
  return colors.error;
}

export function MatchBadge({
  percentage,
  label,
  size = 'md',
  showExplainer = false,
  explainerText,
}: MatchBadgeProps) {
  const config = sizeConfig[size];
  const matchColor = getMatchColor(percentage);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={spring.micro}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: spacing.sm,
          padding: config.padding,
          borderRadius: config.radius,
          backgroundColor: `${matchColor}15`,
          border: `1px solid ${matchColor}40`,
          position: 'relative',
        }}
      >
        <motion.div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: matchColor,
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <span
          style={{
            fontSize: config.fontSize,
            fontWeight: 600,
            color: matchColor,
          }}
        >
          {percentage}%
        </span>

        {label && (
          <span
            style={{
              fontSize: config.fontSize,
              color: colors.textSecondary,
              marginLeft: spacing.xs,
            }}
          >
            {label}
          </span>
        )}

        {showExplainer && explainerText && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              bottom: '-40px',
              left: 0,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              padding: spacing.sm,
              fontSize: '12px',
              color: colors.textSecondary,
              whiteSpace: 'nowrap',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            {explainerText}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
