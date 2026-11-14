import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const dismissToast = useStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-20 right-4 z-50 flex flex-col gap-2 sm:right-6"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'error'
            ? AlertCircle
            : toast.type === 'info'
              ? Info
              : CheckCircle2;
        const accent =
          toast.type === 'error'
            ? 'bg-[#ba1a1a] text-white'
            : 'bg-[#282C3F] text-white';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-2.5 rounded px-4 py-3 text-sm font-medium shadow-[0_8px_24px_rgba(40,44,63,0.18)] ${accent}`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="ml-2 rounded p-0.5 opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
