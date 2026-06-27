"use client";

import { useEffect } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function SessionGuard() {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const hasPersist = document.cookie.includes("apex-remember=1");
    const hasTmp = document.cookie.includes("apex-tmp=1");
    if (!hasPersist && !hasTmp) {
      createClient().auth.signOut();
    }
  }, []);
  return null;
}
