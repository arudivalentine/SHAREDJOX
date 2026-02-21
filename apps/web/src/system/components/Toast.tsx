import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'loading';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastId = 0;
const toastListeners: Set<(toast: ToastMessage) => void> = new Set();
const toastRemoveListeners: Set<(id: string) => void> = new Set();

export function showToast(message: string, type: ToastType = 'success', duration = 3000) {
  const id = `toast-${toastId++}`;
  const toast: ToastMessage = { id, message, type, duration };

  toastListeners.forEach((listener) => listener(toast));

  if (duration && duration > 0) {
    setTimeout(() => {
      toastRemoveListeners.forEach((listener) => listener(id));
    }, duration);
  }

  return id;
}

export function removeToast(id: string) {
  toastRemoveListeners.forEach((listener) => listener(id));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleAdd = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);
    };

    const handleRemove = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    toastListeners.add(handleAdd);
    toastRemoveListeners.add(handleRemove);

    return () => {
      toastListeners.delete(handleAdd);
      toastRemoveListeners.delete(handleRemove);
    };
  }, []);

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-violet-500/90',
          border: 'border-violet-400/50',
          icon: '✓',
        };
      case 'error':
        return {
          bg: 'bg-red-500/90',
          border: 'border-red-400/50',
          icon: '✕',
        };
      case 'loading':
        return {
          bg: 'bg-cyan-500/90',
          border: 'border-cyan-400/50',
          icon: '⟳',
        };
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const styles = getStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`mb-3 px-4 py-3 rounded-lg border backdrop-blur-xl ${styles.bg} ${styles.border} text-white font-semibold flex items-center gap-3 pointer-events-auto`}
            >
              {toast.type === 'loading' ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  {styles.icon}
                </motion.span>
              ) : (
                <span>{styles.icon}</span>
              )}
              <span>{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
