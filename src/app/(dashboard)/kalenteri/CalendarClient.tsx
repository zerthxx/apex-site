"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, List, Grid } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalEvent {
  id: string;
  title: string;
  description?: string | null;
  start_at: string;
  end_at?: string | null;
  all_day: boolean;
  type: string;
}

const TYPE_LABELS: Record<string, string> = {
  meeting: "Tapaaminen", deadline: "Deadline", milestone: "Virstanpylväs", reminder: "Muistutus",
};
const TYPE_COLORS: Record<string, string> = {
  meeting: "bg-copper/15 text-copper border-copper/30",
  deadline: "bg-bad/15 text-bad border-bad/30",
  milestone: "bg-teal-400/15 text-teal-400 border-teal-400/30",
  reminder: "bg-ok/15 text-ok border-ok/30",
};
const TYPE_DOT: Record<string, string> = {
  meeting: "bg-copper", deadline: "bg-bad", milestone: "bg-teal-400", reminder: "bg-ok",
};

function NewEventModal({ onClose, onCreated, defaultDate }: { onClose: () => void; onCreated: (e: CalEvent) => void; defaultDate?: string }) {
  const toLocalDate = (d: Date) => d.toISOString().slice(0, 10);
  const toLocalDatetime = (d: Date) => d.toISOString().slice(0, 16);
  const now = new Date();
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "meeting",
    start_at: defaultDate ? `${defaultDate}T09:00` : toLocalDatetime(now),
    end_at: defaultDate ? `${defaultDate}T10:00` : toLocalDatetime(new Date(now.getTime() + 3600000)),
    all_day: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { setError("Otsikko vaaditaan"); return; }
    setSaving(true);
    const payload = {
      ...form,
      start_at: form.all_day ? `${form.start_at.slice(0, 10)}T00:00:00Z` : new Date(form.start_at).toISOString(),
      end_at: form.all_day ? null : new Date(form.end_at).toISOString(),
    };
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onCreated(data.event);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Uusi tapahtuma</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={17} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Otsikko *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Tyyppi</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-ghost cursor-pointer">
            <input type="checkbox" checked={form.all_day} onChange={(e) => setForm({ ...form, all_day: e.target.checked })} className="accent-copper" />
            Koko päivä
          </label>
          {!form.all_day ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-ink-ghost mb-1">Alkaa</label>
                <input type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                  className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-ink-ghost mb-1">Päättyy</label>
                <input type="datetime-local" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })}
                  className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Päivämäärä</label>
              <input type="date" value={form.start_at.slice(0, 10)} onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
          )}
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Kuvaus</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors resize-none" />
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">Peruuta</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "..." : "Luo tapahtuma"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const WEEKDAYS = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];
const MONTHS_FI = ["Tammikuu","Helmikuu","Maaliskuu","Huhtikuu","Toukokuu","Kesäkuu","Heinäkuu","Elokuu","Syyskuu","Lokakuu","Marraskuu","Joulukuu"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday-based
  const days: (number | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export function CalendarClient({ initial }: { initial: CalEvent[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState(initial);
  const [view, setView] = useState<"month"|"list">("month");
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const days = getMonthDays(year, month);
  const eventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.start_at.slice(0, 10) === dateStr);
  };

  const todayStr = now.toISOString().slice(0, 10);
  const sortedEvents = [...events].sort((a, b) => a.start_at.localeCompare(b.start_at));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-surface text-ink-ghost hover:text-ink transition-colors"><ChevronLeft size={17} /></button>
          <h2 className="text-base font-semibold text-ink min-w-[180px] text-center">{MONTHS_FI[month]} {year}</h2>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-surface text-ink-ghost hover:text-ink transition-colors"><ChevronRight size={17} /></button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface border border-wire rounded-lg overflow-hidden">
            <button onClick={() => setView("month")} className={cn("p-2 transition-colors", view === "month" ? "bg-copper text-white" : "text-ink-ghost hover:text-ink")}><Grid size={15} /></button>
            <button onClick={() => setView("list")} className={cn("p-2 transition-colors", view === "list" ? "bg-copper text-white" : "text-ink-ghost hover:text-ink")}><List size={15} /></button>
          </div>
          <button onClick={() => { setSelectedDate(undefined); setShowModal(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors">
            <Plus size={15} />Uusi
          </button>
        </div>
      </div>

      {view === "month" ? (
        <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-wire">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-ink-ghost uppercase tracking-wider">{d}</div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const dateStr = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
              const dayEvents = day ? eventsForDay(day) : [];
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[80px] p-1.5 border-r border-b border-wire/50 last:border-r-0 cursor-pointer hover:bg-surface/30 transition-colors",
                    !day && "opacity-0 pointer-events-none",
                    i % 7 === 6 && "border-r-0"
                  )}
                  onClick={() => { if (day && dateStr) { setSelectedDate(dateStr); setShowModal(true); } }}
                >
                  <div className={cn(
                    "w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full mb-1",
                    isToday ? "bg-copper text-white" : "text-ink-dim"
                  )}>
                    {day}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div key={e.id} className={cn("text-[10px] px-1 py-0.5 rounded truncate border", TYPE_COLORS[e.type])}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-ink-ghost px-1">+{dayEvents.length - 2}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedEvents.length === 0 ? (
            <div className="bg-elevated border border-wire rounded-xl py-16 text-center text-sm text-ink-ghost">Ei tapahtumia</div>
          ) : sortedEvents.map((e) => (
            <div key={e.id} className="flex items-start gap-3 p-4 bg-elevated border border-wire rounded-xl">
              <div className={cn("w-1 self-stretch rounded-full shrink-0", TYPE_DOT[e.type] ?? "bg-ink-ghost")} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{e.title}</p>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border shrink-0", TYPE_COLORS[e.type])}>
                    {TYPE_LABELS[e.type]}
                  </span>
                </div>
                {e.description && <p className="text-xs text-ink-ghost mt-1">{e.description}</p>}
                <p className="text-xs text-ink-ghost mt-1.5">
                  {e.all_day
                    ? new Date(e.start_at).toLocaleDateString("fi-FI")
                    : new Date(e.start_at).toLocaleString("fi-FI", { dateStyle: "short", timeStyle: "short" })}
                  {e.end_at && !e.all_day && ` – ${new Date(e.end_at).toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NewEventModal
          onClose={() => setShowModal(false)}
          onCreated={(e) => setEvents((prev) => [e, ...prev])}
          defaultDate={selectedDate}
        />
      )}
    </div>
  );
}
