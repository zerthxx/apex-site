import type { SupabaseClient } from "@supabase/supabase-js";

export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  event_type: string,
  event_data: Record<string, unknown> = {}
) {
  await supabase.from("activity_logs").insert({ user_id: userId, event_type, event_data });
}
