import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FileText, FolderOpen, Receipt, MessageSquare, Paperclip, ArrowRight } from "lucide-react";

export default async function PortaaliPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const modules = [
    {
      href: "/portaali/tarjoukset",
      icon: <FileText size={24} />,
      label: "Tarjoukset",
      description: "Näe saamasi tarjoukset ja niiden tilat.",
      accent: "text-copper bg-copper/10 border-copper/20",
      status: "Tulossa",
    },
    {
      href: "/portaali/projektit",
      icon: <FolderOpen size={24} />,
      label: "Projektit",
      description: "Seuraa projektisi etenemistä reaaliajassa.",
      accent: "text-teal-400 bg-teal-400/10 border-teal-400/20",
      status: "Tulossa",
    },
    {
      href: "/portaali/laskut",
      icon: <Receipt size={24} />,
      label: "Laskut",
      description: "Selaa laskuja ja seuraa maksutilaa.",
      accent: "text-ok bg-ok/10 border-ok/20",
      status: "Tulossa",
    },
    {
      href: "/portaali/viestit",
      icon: <MessageSquare size={24} />,
      label: "Viestit",
      description: "Viesti suoraan tiimimme kanssa.",
      accent: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      status: "Tulossa",
    },
    {
      href: "/portaali/tiedostot",
      icon: <Paperclip size={24} />,
      label: "Tiedostot",
      description: "Jaa ja lataa projektiin liittyviä tiedostoja.",
      accent: "text-ink-dim bg-surface border-wire",
      status: "Tulossa",
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-ink">Asiakasportaali</h1>
        <p className="text-sm text-ink-dim mt-1">
          Seuraa projektejasi, tarjouksiasi ja viestejä yhdessä paikassa.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="flex items-start gap-4 p-5 rounded-xl border border-wire bg-elevated hover:border-wire-bold hover:bg-surface/50 transition-all duration-150 group"
          >
            <span className={`flex items-center justify-center w-11 h-11 rounded-xl border shrink-0 ${m.accent}`}>
              {m.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-ink text-sm">{m.label}</p>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-surface border border-wire text-ink-ghost leading-none shrink-0">
                  {m.status}
                </span>
              </div>
              <p className="text-xs text-ink-dim mt-1 leading-relaxed">{m.description}</p>
            </div>
            <ArrowRight size={14} className="text-ink-ghost group-hover:text-copper transition-colors shrink-0 mt-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
