import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, AnimatedButton } from '../../../system/components';
import { colors, spacing, spring } from '../../../system/tokens';
import { useMagicLink } from '../hooks/useMagicLink';

export function LoginPage() {
  const { email, setEmail, isLoading, error, linkSent, sendLink } = useMagicLink();
  const [emailInput, setEmailInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmail(emailInput);
    await sendLink();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        padding: spacing.lg,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.default}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <GlassCard glow="cyan">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: colors.text,
                marginBottom: spacing.md,
              }}
            >
              SharedJox
            </h1>

            <p
              style={{
                fontSize: '14px',
                color: colors.textSecondary,
                marginBottom: spacing.xl,
              }}
            >
              Sign in with your email to get started
            </p>

            {!linkSent ? (
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@example.com"
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

                <AnimatedButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  style={{ width: '100%' }}
                >
                  Send Magic Link
                </AnimatedButton>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={spring.micro}
              >
                <div
                  style={{
                    padding: spacing.lg,
                    backgroundColor: `${colors.cyan}10`,
                    border: `1px solid ${colors.cyan}40`,
                    borderRadius: '6px',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      color: colors.cyan,
                      fontWeight: 600,
                      marginBottom: spacing.sm,
                    }}
                  >
                    ✓ Link sent
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: colors.textSecondary,
                    }}
                  >
                    Check your email for the magic link. It expires in 24 hours.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
