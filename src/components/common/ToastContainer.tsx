import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-teal-600 flex-shrink-0" />
        };

        const borders = {
          success: 'border-emerald-200 bg-white/95 text-slate-800 shadow-lg',
          error: 'border-rose-200 bg-white/95 text-slate-800 shadow-lg',
          warning: 'border-amber-200 bg-white/95 text-slate-800 shadow-lg',
          info: 'border-teal-200 bg-white/95 text-slate-800 shadow-lg'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-card transition-all duration-300 transform translate-y-0 ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <p className="text-sm font-medium flex-1 text-slate-800 leading-snug">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
