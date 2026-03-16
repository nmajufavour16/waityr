'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowUpCircle, X } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  subtext?: string;
  type?: 'leapfrog' | 'info';
}

interface ToastItemProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [leaving, setLeaving] = useState(false);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 260);
  }, [toast.id, onRemove]);

  useEffect(() => {
    const t = setTimeout(dismiss, 5000);
    return () => clearTimeout(t);
  }, [dismiss]);

  return (
    <div
      className={`glass-card rounded-xl px-4 py-3.5 flex items-start gap-3 min-w-[280px] max-w-[340px] cursor-pointer select-none ${
        leaving ? 'toast-out' : 'toast-in'
      }`}
      onClick={dismiss}
    >
      <div className="w-7 h-7 rounded-lg bg-[#0D9488]/10 flex items-center justify-center shrink-0 mt-0.5">
        <ArrowUpCircle className="w-3.5 h-3.5 text-[#0D9488]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0A0A0A] leading-snug">{toast.message}</p>
        {toast.subtext && (
          <p className="text-xs text-[#6B7280] mt-0.5 leading-snug">{toast.subtext}</p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors shrink-0 mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Hook
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
