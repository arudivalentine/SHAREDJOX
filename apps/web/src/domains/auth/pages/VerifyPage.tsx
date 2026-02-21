import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard, SkeletonScreen } from '../../../system/components';
import { colors, spacing, spring } from '../../../system/tokens';
import { useMagicLink } from '../hooks/useMagicLink';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyToken, isLoading, error } = useMagicLink();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      return;
    }

    verifyToken(token)
      .then((apiToken) => {
        localStorage.setItem('auth_token', apiToken);
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 1500);
      })
      .catch(() => {
        setStatus('error');
      });
  }, [searchParams, verifyToken, navigate]);

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
        <GlassCard glow={status === 'success' ? 'cyan' : 'none'}>
          {status === 'verifying' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  marginBottom: spacing.lg,
                }}
              >
                Verifying your link...
              </p>
              <SkeletonScreen lines={2} />
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
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.cyan,
                  marginBottom: spacing.sm,
                }}
              >
                Verified
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: colors.textSecondary,
                }}
              >
                Redirecting to dashboard...
              </p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring.micro}
              style={{ textAlign: 'center' }}
            >
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.error,
                  marginBottom: spacing.sm,
                }}
              >
                Verification Failed
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: colors.textSecondary,
                  marginBottom: spacing.lg,
                }}
              >
                {error || 'Invalid or expired link. Please try again.'}
              </p>
              <a
                href="/login"
                style={{
                  color: colors.cyan,
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Back to login
              </a>
            </motion.div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
