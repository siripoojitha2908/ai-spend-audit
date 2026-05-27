'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type Toast = { id: string; title?: string; message: string; type?: 'success' | 'error' | 'info' };

// eslint-disable-next-line no-unused-vars
type ToastPush = (toast: Omit<Toast, 'id'>) => void;
const ToastContext = createContext<{ push: ToastPush } | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((s) => [...s, { id, ...t }]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm rounded-lg p-3 shadow-lg ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-slate-700'} text-white`}>
            {t.title ? <div className="font-semibold">{t.title}</div> : null}
            <div className="text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
