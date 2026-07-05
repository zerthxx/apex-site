"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastMessage } from "@/lib/types";

/* ── Context ─────────────────────────────────────────────────────────────── */

interface ToastContextValue {
  toast: (msg: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ── Provider ────────────────────────────────────────────────────────────── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (msg: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const duration = msg.duration ?? 4500;
      setToasts((prev) => [...prev.slice(-4), { ...msg, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/* ── Single toast ────────────────────────────────────────────────────────── */

const icons = {
  success: <CheckCircle2 size={18} className="text-ok shrink-0" />,
  error: <XCircle size={18} className="text-bad shrink-0" />,
  info: <Info size={18} className="text-teal-brand shrink-0" />,
};

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-modal",
        "bg-elevated border-wire w-[340px] max-w-[90vw]",
      )}
    >
      {icons[t.variant]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink leading-snug">{t.title}</p>
        {t.description && (
          <p className="text-xs text-ink-dim mt-0.5">{t.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(t.id)}
        className="text-ink-ghost hover:text-ink transition-colors shrink-0"
        aria-label="Sulje ilmoitus"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
