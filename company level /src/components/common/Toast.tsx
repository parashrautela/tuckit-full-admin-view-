import React from 'react';
import { useRealtime } from '@/context/RealtimeContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useRealtime();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let borderClass = 'border-neutral-200 bg-neutral-0';
        let Icon = Info;
        let iconColor = 'text-info-500';

        if (toast.type === 'success') {
          borderClass = 'border-success-100 bg-success-50';
          Icon = CheckCircle2;
          iconColor = 'text-success-500';
        } else if (toast.type === 'error') {
          borderClass = 'border-error-100 bg-error-50';
          Icon = AlertCircle;
          iconColor = 'text-error-500';
        } else if (toast.type === 'warning') {
          borderClass = 'border-warning-100 bg-warning-50';
          Icon = AlertTriangle;
          iconColor = 'text-warning-500';
        } else if (toast.type === 'info') {
          borderClass = 'border-info-100 bg-info-50';
          Icon = Info;
          iconColor = 'text-info-500';
        }

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg border shadow-md transition-all animate-in slide-in-from-bottom-2 duration-200 text-xs",
              borderClass
            )}
          >
            <Icon className={cn("size-4 shrink-0 mt-0.5", iconColor)} />
            <div className="flex-1 font-medium leading-relaxed text-neutral-800">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
