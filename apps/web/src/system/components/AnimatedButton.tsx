import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { colors, spacing, spring } from '../tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  primary: {
    bg: colors.cyan,
    text: colors.background,
    border: colors.cyan,
  },
  secondary: {
    bg: colors.violet,
    text: colors.text,
    border: colors.violet,
  },
  ghost: {
    bg: 'transparent',
    text: colors.cyan,
    border: colors.cyan,
  },
  danger: {
    bg: colors.error,
    text: colors.text,
    border: colors.error,
  },
};

const sizeStyles: Record<ButtonSize, { padding: string; fontSize: string }> = {
  sm: { padding: `${spacing.sm} ${spacing.md}`, fontSize: '12px' },
  md: { padding: `${spacing.md} ${spacing.lg}`, fontSize: '14px' },
  lg: { padding: `${spacing.lg} ${spacing.xl}`, fontSize: '16px' },
};

export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}: AnimatedButtonProps) {
  const style = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative font-medium rounded-lg transition-all ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={spring.micro}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'inline-block', marginRight: '8px' }}
        >
          ⟳
        </motion.div>
      ) : null}
      {children}
    </motion.button>
  );
}
