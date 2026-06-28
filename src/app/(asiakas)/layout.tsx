import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AsiakasLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  return (
    <>
      <Header />
      <main className="flex flex-col flex-1 pt-16 md:pt-20">{children}</main>
      <Footer />
    </>
  );
}
