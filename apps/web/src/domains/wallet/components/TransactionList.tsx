import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SkeletonScreen } from '../../../system/components';
import { colors, spacing } from '../../../system/tokens';
import { useGetTransactionHistory, getTransactionHistory, TransactionDTO } from '../../../system/api';

export function TransactionList() {
  const { data: initialTransactions, isLoading } = useGetTransactionHistory();
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (initialTransactions) {
      setTransactions(initialTransactions);
      setHasMore(initialTransactions.length >= 50);
    }
  }, [initialTransactions]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const newTransactions = await getTransactionHistory(50, transactions.length);
      setTransactions((prev) => [...prev, ...newTransactions]);
      setHasMore(newTransactions.length >= 50);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.cyan;
      case 'pending':
        return colors.warning || '#FFA500';
      case 'failed':
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'deposit' ? '↓' : '↑';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const groupedTransactions = transactions.reduce(
    (acc, tx) => {
      const date = formatDate(tx.createdAt);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(tx);
      return acc;
    },
    {} as Record<string, TransactionDTO[]>
  );

  if (isLoading) {
    return <SkeletonScreen lines={5} />;
  }

  if (transactions.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: spacing.xl,
          color: colors.textSecondary,
        }}
      >
        <p style={{ fontSize: '14px' }}>No transactions yet</p>
      </div>
    );
  }

  return (
    <div>
      {Object.entries(groupedTransactions).map(([date, txs]) => (
        <div key={date}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: spacing.lg,
              marginBottom: spacing.md,
            }}
          >
            {date}
          </p>

          {txs.map((tx, idx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: spacing.md,
                backgroundColor: colors.surface,
                borderRadius: '6px',
                marginBottom: spacing.sm,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: `${getStatusColor(tx.status)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getStatusColor(tx.status),
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  {getTypeIcon(tx.type)}
                </div>

                <div>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.text,
                      textTransform: 'capitalize',
                      marginBottom: '2px',
                    }}
                  >
                    {tx.type}
                  </p>
                  <p
                    style={{
                      fontSize: '11px',
                      color: colors.textSecondary,
                    }}
                  >
                    {new Date(tx.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text,
                    marginBottom: '2px',
                  }}
                >
                  {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                </p>
                <p
                  style={{
                    fontSize: '11px',
                    color: getStatusColor(tx.status),
                    textTransform: 'capitalize',
                  }}
                >
                  {tx.status}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ))}

      {hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={loadMore}
          disabled={isLoadingMore}
          style={{
            width: '100%',
            padding: spacing.lg,
            marginTop: spacing.lg,
            backgroundColor: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            color: colors.cyan,
            fontSize: '14px',
            fontWeight: 600,
            cursor: isLoadingMore ? 'not-allowed' : 'pointer',
            opacity: isLoadingMore ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </motion.button>
      )}
    </div>
  );
}
