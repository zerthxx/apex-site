"use client";

import { passwordStrengthScore } from "@/lib/passwordPolicy";

/** Shared strength bar — same scoring the server enforces (score ≥ 3/5). */
export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const score = passwordStrengthScore(password);
  const label =
    score <= 1
      ? "Heikko"
      : score <= 2
        ? "Kohtalainen"
        : score <= 3
          ? "Hyvä"
          : "Vahva";
  const color =
    score <= 1
      ? "bg-red-500"
      : score <= 2
        ? "bg-orange-400"
        : score <= 3
          ? "bg-yellow-400"
          : "bg-green-500";

  return (
    <div className="mt-1.5 flex flex-col gap-1">
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors duration-200 ${
              i <= score ? color : "bg-wire"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-ink-ghost">{label}</span>
    </div>
  );
}
