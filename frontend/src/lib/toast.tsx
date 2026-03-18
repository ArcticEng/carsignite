'use client';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }

const ToastContext = createContext<{ toast: (msg: string, type?: 'success' | 'error' | 'info') => void }>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const colors = { success: 'bg-green-500', error: 'bg-ci-red', info: 'bg-bg-3 border border-glass-border' };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`${colors[t.type]} text-white px-5 py-3.5 rounded-xl text-sm font-medium animate-fade-up backdrop-blur-2xl max-w-[360px] shadow-lg`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
