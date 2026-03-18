'use client';
import { useState, useCallback } from 'react';

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return { toasts, toast };
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-5 py-3 rounded-xl text-sm font-medium backdrop-blur-xl animate-fade-up max-w-[360px] ${
          t.type === 'success' ? 'bg-ci-green/90 text-white shadow-[0_4px_30px_rgba(34,204,110,0.3)]' :
          t.type === 'error' ? 'bg-ci-red/90 text-white shadow-[0_4px_30px_rgba(230,57,70,0.3)]' :
          'bg-bg-3 border border-glass-border text-white shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
        }`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function prizeImg(name: string, url?: string | null): string {
  if (url?.trim()) return url.trim();
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(name.replace(/ /g, ','))},luxury,premium`;
}

export function countdown() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const diff = end.getTime() - now.getTime();
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000) };
}
