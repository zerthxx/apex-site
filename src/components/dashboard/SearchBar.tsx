"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Building2, Briefcase, FolderOpen, FileText, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  category: string;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  customers:  <Building2 size={13} />,
  companies:  <Briefcase size={13} />,
  projects:   <FolderOpen size={13} />,
  quotes:     <FileText size={13} />,
  files:      <Paperclip size={13} />,
};

const CATEGORY_LABELS: Record<string, string> = {
  customers:  "Asiakkaat",
  companies:  "Yritykset",
  projects:   "Projektit",
  quotes:     "Tarjoukset",
  files:      "Tiedostot",
};

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelected(0);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? []);
        setSelected(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) {
      router.push(results[selected].href);
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-surface border border-wire text-ink-ghost text-sm hover:border-wire-bold hover:text-ink transition-all duration-150"
      >
        <Search size={13} />
        <span>Haku</span>
        <kbd className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-elevated border border-wire font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg mx-4 bg-elevated border border-wire rounded-xl shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-wire">
          <Search size={16} className="text-ink-ghost shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Hae asiakkaita, projekteja, tarjouksia..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-ghost outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-ink-ghost hover:text-ink">
              <X size={15} />
            </button>
          )}
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-wire text-ink-ghost font-mono">Esc</kbd>
        </div>

        {/* Results */}
        {query && (
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-sm text-ink-ghost">Haetaan...</div>
            ) : results.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-sm text-ink-ghost">
                Ei tuloksia haulle &ldquo;{query}&rdquo;
              </div>
            ) : (
              (() => {
                const categories = [...new Set(results.map((r) => r.category))];
                return categories.map((cat) => (
                  <div key={cat}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-ghost px-4 pt-3 pb-1">
                      {CATEGORY_LABELS[cat] ?? cat}
                    </p>
                    {results
                      .filter((r) => r.category === cat)
                      .map((r, i) => {
                        const globalIdx = results.indexOf(r);
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => { router.push(r.href); setOpen(false); }}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                              globalIdx === selected ? "bg-copper/10" : "hover:bg-surface"
                            )}
                          >
                            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-surface border border-wire text-ink-ghost shrink-0">
                              {CATEGORY_ICONS[cat]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-ink truncate">{r.title}</p>
                              {r.subtitle && <p className="text-xs text-ink-ghost truncate">{r.subtitle}</p>}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                ));
              })()
            )}
          </div>
        )}

        {!query && (
          <div className="py-6 text-center text-sm text-ink-ghost">
            Kirjoita hakusana...
          </div>
        )}
      </div>
    </div>
  );
}
