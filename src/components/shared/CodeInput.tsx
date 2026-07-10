"use client";

import { useRef } from "react";

/**
 * 6-digit verification code input: six boxes, auto-advance, backspace to the
 * previous box, full-code paste support. Used by every verification flow.
 */
export function CodeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, 6));
  }

  function handleChange(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setDigit(index, "");
      return;
    }
    if (cleaned.length > 1) {
      // Paste: fill from this box forward.
      const next = digits.slice();
      for (let i = 0; i < cleaned.length && index + i < 6; i++) {
        next[index + i] = cleaned[i];
      }
      onChange(next.join("").slice(0, 6));
      refs.current[Math.min(index + cleaned.length, 5)]?.focus();
      return;
    }
    setDigit(index, cleaned);
    if (index < 5) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={6}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl bg-surface border border-wire text-ink focus:outline-none focus:border-copper/60 transition-colors disabled:opacity-50"
          aria-label={`Numero ${i + 1}`}
        />
      ))}
    </div>
  );
}
