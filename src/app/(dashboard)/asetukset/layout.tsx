import { AsetuksetTabs } from "./AsetuksetTabs";

export const metadata = { title: "Asetukset — Apex Site" };

export default function AsetuksetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Asetukset</h1>
        <p className="text-sm text-ink-ghost mt-1">Hallinnoi tiliäsi ja tietojasi</p>
      </div>
      <AsetuksetTabs />
      <div className="bg-elevated border border-wire rounded-2xl p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
