"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button red and the notice box more severe — use for
   * irreversible actions like permanent delete, not routine moves-to-trash. */
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Vahvista",
  cancelLabel = "Peruuta",
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Virhe");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-ghost hover:text-ink"
            aria-label="Sulje"
          >
            <X size={17} />
          </button>
        </div>
        <div
          className={cn(
            "flex items-start gap-3 mb-5 p-3 rounded-lg border",
            danger
              ? "bg-bad/10 border-bad/20"
              : "bg-copper/10 border-copper/20",
          )}
        >
          <AlertTriangle
            size={16}
            className={cn(
              "mt-0.5 shrink-0",
              danger ? "text-bad" : "text-copper",
            )}
          />
          <p className={cn("text-xs", danger ? "text-bad" : "text-ink-dim")}>
            {message}
          </p>
        </div>
        {error && <p className="text-xs text-bad mb-3">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink hover:border-wire-bold transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
              danger
                ? "bg-bad text-white hover:bg-bad/90"
                : "bg-copper text-white hover:bg-copper/90",
            )}
          >
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
