import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, AnimatedButton, SkeletonScreen } from '../../../system/components';
import { colors, spacing, spring } from '../../../system/tokens';
import { useGetWallet } from '../../../system/api';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';
import { TransactionList } from '../components/TransactionList';

export function WalletPage() {
  const { data: wallet, isLoading, error } = useGetWallet();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet?.currency || 'USD',
    }).format(amount);
  };

  return (
    <div
      style={{
        padding: spacing.lg,
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.default}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: colors.text,
            marginBottom: spacing.xl,
          }}
        >
          Wallet
        </h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: spacing.lg,
              backgroundColor: `${colors.error}15`,
              border: `1px solid ${colors.error}40`,
              borderRadius: '8px',
              color: colors.error,
              marginBottom: spacing.lg,
            }}
          >
            Failed to load wallet. Please try again.
          </motion.div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: spacing.lg,
            marginBottom: spacing.xl,
          }}
        >
          <GlassCard glow="cyan">
            {isLoading ? (
              <SkeletonScreen lines={2} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    marginBottom: spacing.sm,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Total Balance
                </p>
                <p
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: colors.cyan,
                  }}
                >
                  {wallet ? formatCurrency(wallet.balance) : '$0.00'}
                </p>
              </motion.div>
            )}
          </GlassCard>

          <GlassCard glow="none">
            {isLoading ? (
              <SkeletonScreen lines={2} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    marginBottom: spacing.sm,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Available
                </p>
                <p
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: colors.text,
                  }}
                >
                  {wallet ? formatCurrency(wallet.availableBalance) : '$0.00'}
                </p>
              </motion.div>
            )}
          </GlassCard>

          <GlassCard glow="none">
            {isLoading ? (
              <SkeletonScreen lines={2} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    marginBottom: spacing.sm,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Pending
                </p>
                <p
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: colors.warning || '#FFA500',
                  }}
                >
                  {wallet ? formatCurrency(wallet.pendingBalance) : '$0.00'}
                </p>
              </motion.div>
            )}
          </GlassCard>
        </div>

        <div
          style={{
            display: 'flex',
            gap: spacing.md,
            marginBottom: spacing.xl,
          }}
        >
          <AnimatedButton
            variant="primary"
            onClick={() => setShowDepositModal(true)}
            disabled={isLoading}
          >
            Deposit
          </AnimatedButton>
          <AnimatedButton
            variant="secondary"
            onClick={() => setShowWithdrawModal(true)}
            disabled={isLoading || !wallet || wallet.availableBalance < 10}
          >
            Withdraw
          </AnimatedButton>
        </div>

        <GlassCard glow="none">
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: colors.text,
              marginBottom: spacing.lg,
            }}
          >
            Transaction History
          </h2>
          <TransactionList />
        </GlassCard>
      </motion.div>

      {showDepositModal && (
        <DepositModal onClose={() => setShowDepositModal(false)} />
      )}

      {showWithdrawModal && (
        <WithdrawModal onClose={() => setShowWithdrawModal(false)} />
      )}
    </div>
  );
}
