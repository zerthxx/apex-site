import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Durable, Postgres-backed rate limiting (rate_limit_events, migration 015).
 * Unlike the old in-memory Map in /api/otp/send, this survives restarts and
 * works across multiple server instances.
 *
 * Buckets are free-form strings, e.g. `otp-send:user@example.com` or
 * `recovery-start:ip:1.2.3.4`.
 */
export async function checkRateLimit(
  admin: SupabaseClient,
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();

  // Opportunistic cleanup keeps the table small; cheap via (bucket, created_at) index.
  await admin
    .from("rate_limit_events")
    .delete()
    .eq("bucket", bucket)
    .lt("created_at", since);

  const { count, error } = await admin
    .from("rate_limit_events")
    .select("*", { count: "exact", head: true })
    .eq("bucket", bucket)
    .gte("created_at", since);

  // Fail closed: if the limiter itself is broken we refuse rather than allow
  // unlimited attempts against security-critical endpoints.
  if (error) return false;
  if ((count ?? 0) >= limit) return false;

  const { error: insertError } = await admin
    .from("rate_limit_events")
    .insert({ bucket });
  if (insertError) return false;

  return true;
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: "Liian monta yritystä. Yritä hetken kuluttua uudelleen." },
    { status: 429 },
  );
}
