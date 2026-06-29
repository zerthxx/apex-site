import { Plug } from "lucide-react";

const INTEGRATIONS = [
  { name: "Stripe", desc: "Maksujen käsittely ja tilaukset", phase: "Phase 6" },
  { name: "Google Calendar", desc: "Kalenteri-integraatio", phase: "Phase 11" },
  { name: "Google Drive", desc: "Pilviasiakirjat", phase: "Phase 11" },
  { name: "Slack", desc: "Tiimi-ilmoitukset", phase: "Phase 11" },
  { name: "GitHub", desc: "Kehitysprojektien linkitys", phase: "Phase 11" },
];

export default function IntegraatiotPage() {
  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-wire">
        <Plug size={15} className="text-ink-ghost shrink-0" />
        <p className="text-xs text-ink-ghost">Integraatiot ovat tulossa pian. Niiden avulla voit yhdistää Apex Siten suosikkityökaluihisi.</p>
      </div>
      {INTEGRATIONS.map((item) => (
        <div key={item.name} className="flex items-center justify-between px-4 py-3 rounded-xl border border-wire/50 bg-surface/30">
          <div>
            <p className="text-sm font-medium text-ink">{item.name}</p>
            <p className="text-xs text-ink-ghost mt-0.5">{item.desc}</p>
          </div>
          <span className="text-xs text-ink-ghost bg-surface border border-wire px-2 py-1 rounded-lg shrink-0">{item.phase}</span>
        </div>
      ))}
    </div>
  );
}
