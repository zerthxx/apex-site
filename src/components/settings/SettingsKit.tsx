"use client";

import { AlertCircle, CheckCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared primitives for the Settings area — every /asetukset page composes
 * these so spacing, cards, buttons, banners and empty states stay identical.
 */

export const settingsInputClass =
  "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors";

export function SettingsSection({
  icon: Icon,
  title,
  description,
  badge,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-surface/50 border border-wire p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        {Icon && (
          <span className="mt-0.5 text-copper shrink-0">
            <Icon size={16} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            {badge}
          </div>
          {description && (
            <p className="text-xs text-ink-ghost mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

export function SettingsField({
  label,
  htmlFor,
  error,
  helper,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string | null;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs font-medium text-ink-dim">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          <AlertCircle size={11} className="shrink-0" />
          {error}
        </p>
      ) : (
        helper && <p className="text-[11px] text-ink-ghost">{helper}</p>
      )}
    </div>
  );
}

export function StatusBanner({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm",
        type === "success"
          ? "bg-green-500/10 border border-green-500/20 text-green-400"
          : "bg-red-500/10 border border-red-500/20 text-red-400",
      )}
    >
      {type === "success" ? (
        <CheckCircle size={15} className="shrink-0" />
      ) : (
        <AlertCircle size={15} className="shrink-0" />
      )}
      {message}
    </div>
  );
}

export function SettingsButton({
  variant = "primary",
  loading = false,
  loadingLabel,
  className,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  loadingLabel?: string;
}) {
  const styles = {
    primary: "bg-copper text-[#0A0C10] font-semibold hover:bg-copper-light",
    secondary:
      "bg-surface border border-wire text-ink font-medium hover:border-copper/40",
    danger:
      "border border-red-500/30 text-red-400 font-medium hover:bg-red-500/5",
  }[variant];

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "px-4 py-3 rounded-xl text-sm transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed",
        styles,
        className,
      )}
    >
      {loading ? (loadingLabel ?? "Tallennetaan...") : children}
    </button>
  );
}

export function ComingSoonBadge({
  label = "Tulossa pian",
}: {
  label?: string;
}) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-copper/10 text-copper border border-copper/20">
      {label}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center rounded-xl border border-dashed border-wire">
      <Icon size={28} className="text-ink-ghost opacity-50" />
      <p className="text-sm font-medium text-ink-dim">{title}</p>
      {description && (
        <p className="text-xs text-ink-ghost max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
        checked ? "bg-copper" : "bg-wire",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base/90 backdrop-blur-sm p-6">
      <div className="max-w-md w-full rounded-2xl bg-surface border border-wire p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          {description && (
            <p className="text-xs text-ink-ghost mt-1.5">{description}</p>
          )}
        </div>
        {children}
        <div className="flex gap-2">
          <SettingsButton
            variant={danger ? "danger" : "primary"}
            loading={loading}
            loadingLabel="Suoritetaan..."
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmLabel}
          </SettingsButton>
          <SettingsButton
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Peruuta
          </SettingsButton>
        </div>
      </div>
    </div>
  );
}
