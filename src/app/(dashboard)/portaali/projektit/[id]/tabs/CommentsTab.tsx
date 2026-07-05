"use client";

import { Trash2, Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { Comment } from "../types";

export function CommentsTab({
  commentsLoaded,
  comments,
  canModerate,
  onDeleteComment,
  newComment,
  onNewCommentChange,
  onSendComment,
  sending,
  commentsEndRef,
}: {
  commentsLoaded: boolean;
  comments: Comment[];
  canModerate: boolean;
  onDeleteComment: (id: string) => void;
  newComment: string;
  onNewCommentChange: (v: string) => void;
  onSendComment: (e: React.FormEvent) => void;
  sending: boolean;
  commentsEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
        {!commentsLoaded ? (
          <div className="py-10 text-center text-sm text-ink-ghost">
            Ladataan...
          </div>
        ) : comments.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Ei vielä kommentteja"
            description="Aloita kirjoittamalla ensimmäinen!"
          />
        ) : (
          <div className="divide-y divide-wire/50 max-h-[500px] overflow-y-auto">
            {comments.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "px-5 py-4 flex gap-3 group",
                  c.is_own && "bg-copper/3",
                )}
              >
                <div className="w-8 h-8 rounded-full bg-copper/10 border border-copper/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-copper text-xs font-bold">
                    {c.author_name[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold text-ink">
                      {c.author_name}
                    </span>
                    {c.is_own && (
                      <span className="text-[10px] text-ink-ghost">(sinä)</span>
                    )}
                    <span className="text-[10px] text-ink-ghost ml-auto">
                      {new Date(c.created_at).toLocaleString("fi-FI", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {canModerate && (
                      <button
                        onClick={() => onDeleteComment(c.id)}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 rounded text-ink-ghost hover:text-bad transition-all"
                        title="Poista kommentti"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-ink whitespace-pre-wrap break-words">
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={onSendComment}
        className="bg-elevated border border-wire rounded-xl p-4 flex flex-col gap-3"
      >
        <label className="text-xs font-medium text-ink-dim">
          Kirjoita viesti
        </label>
        <textarea
          value={newComment}
          onChange={(e) => onNewCommentChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSendComment(e);
          }}
          placeholder="Kirjoita kommentti tai kysymys projektiisi liittyen..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors resize-y"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-ink-ghost">
            Ctrl+Enter lähettää
          </span>
          <button
            type="submit"
            disabled={sending || !newComment.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-copper text-[#0A0C10] text-sm font-semibold hover:bg-copper/90 disabled:opacity-50 transition-colors"
          >
            <Send size={13} />
            {sending ? "Lähetetään..." : "Lähetä"}
          </button>
        </div>
      </form>
    </div>
  );
}
