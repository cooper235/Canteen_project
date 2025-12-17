'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

type ToastContextType = {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getToastConfig = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle size={24} />,
          bgGradient: 'from-green-500 to-emerald-500',
          borderColor: 'border-green-400',
        };
      case 'error':
        return {
          icon: <XCircle size={24} />,
          bgGradient: 'from-red-500 to-rose-500',
          borderColor: 'border-red-400',
        };
      case 'info':
        return {
          icon: <Info size={24} />,
          bgGradient: 'from-blue-500 to-cyan-500',
          borderColor: 'border-blue-400',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container - Top Right - Portal-like positioning */}
      <div className="fixed top-4 right-4 space-y-3 pointer-events-none" style={{ zIndex: 99999 }}>
        <AnimatePresence>
          {toasts.map((toast) => {
            const config = getToastConfig(toast.type);
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`relative flex items-center gap-3 px-5 py-4 rounded-xl bg-gradient-to-r ${config.bgGradient} text-white shadow-2xl border ${config.borderColor} min-w-[320px] max-w-md backdrop-blur-sm overflow-hidden group pointer-events-auto`}
              >
                {/* Progress Bar */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 4, ease: 'linear' }}
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left"
                />

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="flex-shrink-0"
                >
                  {config.icon}
                </motion.div>

                {/* Message */}
                <div className="flex-1 font-medium">{toast.message}</div>

                {/* Close Button */}
                <motion.button
                  onClick={() => removeToast(toast.id)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={18} />
                </motion.button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
