"use client";

import { useEffect } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function SessionGuard() {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const hasRemember = localStorage.getItem("apex-remember") === "1";
    const hasSession = sessionStorage.getItem("apex-session") === "1";
    if (!hasRemember && !hasSession) {
      createClient().auth.signOut();
    }
  }, []);
  return null;
}
