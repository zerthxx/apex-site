import { Plug } from "lucide-react";
import { ComingSoonBadge } from "@/components/settings/SettingsKit";

// Customer-facing availability labels only — internal roadmap phases stay
// out of the product UI.
const INTEGRATIONS = [
  {
    name: "Stripe",
    desc: "Maksujen käsittely ja tilaukset",
    status: "Tulossa pian",
  },
  {
    name: "Google Calendar",
    desc: "Kalenteri-integraatio",
    status: "Suunnitteilla",
  },
  { name: "Google Drive", desc: "Pilviasiakirjat", status: "Suunnitteilla" },
  { name: "Slack", desc: "Tiimi-ilmoitukset", status: "Suunnitteilla" },
  {
    name: "GitHub",
    desc: "Kehitysprojektien linkitys",
    status: "Suunnitteilla",
  },
];

export default function IntegraatiotPage() {
  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-wire">
        <Plug size={15} className="text-copper shrink-0" />
        <p className="text-xs text-ink-ghost">
          Integraatioiden avulla yhdistät Apex Siten suosikkityökaluihisi.
          Ensimmäiset integraatiot julkaistaan pian — ilmoitamme sähköpostitse,
          kun ne ovat käytettävissä.
        </p>
      </div>
      {INTEGRATIONS.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-wire/50 bg-surface/30"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{item.name}</p>
            <p className="text-xs text-ink-ghost mt-0.5">{item.desc}</p>
          </div>
          <ComingSoonBadge label={item.status} />
        </div>
      ))}
    </div>
  );
}
