"use client";

import { Trash2 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { CustomerNote } from "../types";

export function NotesTab({
  quickNote,
  onQuickNoteChange,
  onSaveQuickNote,
  saving,
  notesLoaded,
  notes,
  newNoteBody,
  onNewNoteBodyChange,
  onAddNote,
  savingNote,
  onDeleteNote,
}: {
  quickNote: string;
  onQuickNoteChange: (v: string) => void;
  onSaveQuickNote: () => void;
  saving: boolean;
  notesLoaded: boolean;
  notes: CustomerNote[];
  newNoteBody: string;
  onNewNoteBodyChange: (v: string) => void;
  onAddNote: () => void;
  savingNote: boolean;
  onDeleteNote: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="bg-elevated border border-wire rounded-xl p-5">
        <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider mb-3">
          Pikamuistiinpano
        </h2>
        <textarea
          value={quickNote}
          onChange={(e) => onQuickNoteChange(e.target.value)}
          rows={3}
          className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors resize-none"
        />
        <button
          onClick={onSaveQuickNote}
          disabled={saving}
          className="mt-2 px-3 py-1.5 bg-copper text-white rounded-lg text-xs font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Tallennetaan..." : "Tallenna"}
        </button>
      </div>

      <div className="bg-elevated border border-wire rounded-xl p-5">
        <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider mb-3">
          Muistiinpanohistoria
        </h2>
        <div className="flex gap-2 mb-4">
          <input
            value={newNoteBody}
            onChange={(e) => onNewNoteBodyChange(e.target.value)}
            placeholder="Kirjoita uusi muistiinpano..."
            onKeyDown={(e) => {
              if (e.key === "Enter") onAddNote();
            }}
            className="flex-1 bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors"
          />
          <button
            onClick={onAddNote}
            disabled={savingNote}
            className="px-3 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors"
          >
            Lisää
          </button>
        </div>
        {!notesLoaded ? (
          <p className="text-sm text-ink-ghost py-4 text-center">Ladataan...</p>
        ) : notes.length === 0 ? (
          <EmptyState title="Ei muistiinpanoja vielä" />
        ) : (
          <div className="flex flex-col divide-y divide-wire/50">
            {notes.map((n) => (
              <div
                key={n.id}
                className="py-3 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-sm text-ink whitespace-pre-wrap">
                    {n.body}
                  </p>
                  <p className="text-xs text-ink-ghost mt-1">
                    {new Date(n.created_at).toLocaleString("fi-FI")}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteNote(n.id)}
                  className="text-ink-ghost hover:text-bad transition-colors shrink-0 mt-0.5"
                  aria-label="Poista muistiinpano"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
