'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

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

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container - Top Center */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[99999] space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-6 py-4 rounded-lg animate-slide-in-down min-w-[320px] max-w-md border-2"
            style={{
              backgroundColor: toast.type === 'success' ? '#16a34a' : toast.type === 'error' ? '#dc2626' : '#2563eb',
              borderColor: toast.type === 'success' ? '#15803d' : toast.type === 'error' ? '#b91c1c' : '#1d4ed8',
              color: '#ffffff',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' && (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <span className="text-2xl" style={{ color: '#16a34a' }}>✓</span>
                </div>
              )}
              {toast.type === 'error' && (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <span className="text-2xl" style={{ color: '#dc2626' }}>✗</span>
                </div>
              )}
              {toast.type === 'info' && (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <span className="text-2xl" style={{ color: '#2563eb' }}>ℹ</span>
                </div>
              )}
            </div>
            <span className="font-semibold text-base flex-1" style={{ color: '#ffffff' }}>
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Close notification"
              style={{ color: '#ffffff' }}
            >
              <span className="text-lg font-bold">✕</span>
            </button>
          </div>
        ))}
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
