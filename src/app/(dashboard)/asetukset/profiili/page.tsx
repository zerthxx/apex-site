import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { maskPhone } from "@/lib/sms";
import { ProfiiliClient } from "./ProfiiliClient";

/**
 * Profile settings. The phone number is deliberately NOT editable here —
 * profiles.phone is the verified recovery phone and Security is its single
 * source of truth (a read-only masked reference links there).
 */
export default async function ProfiiliPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name, last_name, address, postal_code, city, phone, phone_verified",
    )
    .eq("id", user.id)
    .single();

  const meta = user.user_metadata ?? {};

  return (
    <ProfiiliClient
      initial={{
        firstName: profile?.first_name ?? meta.first_name ?? "",
        lastName: profile?.last_name ?? meta.last_name ?? "",
        address: profile?.address ?? meta.address ?? "",
        postalCode: profile?.postal_code ?? meta.postal_code ?? "",
        city: profile?.city ?? meta.city ?? "",
      }}
      email={user.email ?? ""}
      phoneMasked={profile?.phone ? maskPhone(profile.phone) : null}
      phoneVerified={profile?.phone_verified ?? false}
    />
  );
}
