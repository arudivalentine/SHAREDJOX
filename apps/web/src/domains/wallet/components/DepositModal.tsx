import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, AnimatedButton } from '../../../system/components';
import { colors, spacing, spring } from '../../../system/tokens';
import { useInitiateDeposit } from '../../../system/api';

interface DepositModalProps {
  onClose: () => void;
}

export function DepositModal({ onClose }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'input' | 'processing' | 'success' | 'error'>('input');
  const [error, setError] = useState<string | null>(null);
  const { mutate: initiateDeposit, isPending } = useInitiateDeposit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10 || numAmount > 10000) {
      setError('Amount must be between $10 and $10,000');
      return;
    }

    setStatus('processing');
    initiateDeposit(
      { amount: numAmount },
      {
        onSuccess: (data) => {
          setStatus('success');
          setTimeout(() => {
            window.open(data.checkoutUrl, '_blank');
            onClose();
          }, 1000);
        },
        onError: (err: any) => {
          setStatus('error');
          setError(err.response?.data?.message || 'Failed to initiate deposit');
        },
      }
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={spring.micro}
          onClick={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: '400px', padding: spacing.lg }}
        >
          <GlassCard glow="cyan">
            {status === 'input' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: colors.text,
                    marginBottom: spacing.lg,
                  }}
                >
                  Deposit Funds
                </h2>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: spacing.lg }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: colors.textSecondary,
                        marginBottom: spacing.sm,
                      }}
                    >
                      Amount (USD)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100.00"
                      min="10"
                      max="10000"
                      step="0.01"
                      required
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        backgroundColor: colors.surface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        color: colors.text,
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '11px',
                        color: colors.textSecondary,
                        marginTop: spacing.sm,
                      }}
                    >
                      Minimum: $10 • Maximum: $10,000
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: spacing.md,
                        backgroundColor: `${colors.error}15`,
                        border: `1px solid ${colors.error}40`,
                        borderRadius: '6px',
                        color: colors.error,
                        fontSize: '12px',
                        marginBottom: spacing.lg,
                      }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      gap: spacing.md,
                    }}
                  >
                    <AnimatedButton
                      type="button"
                      variant="secondary"
                      onClick={onClose}
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </AnimatedButton>
                    <AnimatedButton
                      type="submit"
                      variant="primary"
                      loading={isPending}
                      style={{ flex: 1 }}
                    >
                      Continue
                    </AnimatedButton>
                  </div>
                </form>
              </motion.div>
            )}

            {status === 'processing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: spacing.lg }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: `2px solid ${colors.cyan}40`,
                    borderTop: `2px solid ${colors.cyan}`,
                    borderRadius: '50%',
                    margin: '0 auto',
                    marginBottom: spacing.lg,
                  }}
                />
                <p
                  style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                  }}
                >
                  Preparing checkout...
                </p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={spring.micro}
                style={{ textAlign: 'center' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6 }}
                  style={{
                    fontSize: '48px',
                    marginBottom: spacing.lg,
                  }}
                >
                  ✓
                </motion.div>
                <p
                  style={{
                    fontSize: '14px',
                    color: colors.cyan,
                    fontWeight: 600,
                  }}
                >
                  Redirecting to Stripe...
                </p>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p
                  style={{
                    fontSize: '14px',
                    color: colors.error,
                    fontWeight: 600,
                    marginBottom: spacing.lg,
                  }}
                >
                  {error}
                </p>
                <AnimatedButton
                  variant="primary"
                  onClick={() => setStatus('input')}
                  style={{ width: '100%' }}
                >
                  Try Again
                </AnimatedButton>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
