"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [crispOpen, setCrispOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hei! 👋 Olen Apex Siten AI-assistentti. Miten voin auttaa sinua tänään?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const crispListenerRegistered = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function openCrisp() {
    setOpen(false);
    setCrispOpen(true);
    if (typeof window === "undefined" || !(window as any).$crisp) return;
    const crisp = (window as any).$crisp;
    crisp.push(["do", "chat:show"]);
    crisp.push(["do", "chat:open"]);
    if (!crispListenerRegistered.current) {
      crispListenerRegistered.current = true;
      crisp.push(["on", "chat:closed", () => {
        setCrispOpen(false);
        crisp.push(["do", "chat:hide"]);
      }]);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!res.ok) { setMessages(m => [...m, { role: "assistant", content: "Pahoittelen, jokin meni pieleen. Kokeile Live-tuki -nappia." }]); return; }
      const data = await res.json();
      const reply: string = data.reply ?? "Pahoittelen, jokin meni pieleen.";
      if (reply.startsWith("[HANDOFF]")) {
        const displayText = reply.replace("[HANDOFF]", "").trim();
        setMessages(m => [...m, {
          role: "assistant",
          content: displayText || "Yhdistän sinut nyt live-tukeen — odota hetki! 👋",
        }]);
        setTimeout(openCrisp, 1500);
      } else {
        setMessages(m => [...m, { role: "assistant", content: reply }]);
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Pahoittelen, yhteysvirhe. Kokeile Live-tuki -nappia." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[340px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl border border-wire bg-elevated shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-surface border-b border-wire">
            <div className="w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center">
              <Bot size={16} className="text-copper" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Apex AI</p>
              <p className="text-[10px] text-green-400">● Online</p>
            </div>
            <button onClick={openCrisp} className="px-2.5 py-1 rounded-lg bg-copper text-[#0A0C10] text-[10px] font-semibold hover:bg-copper-light transition-colors whitespace-nowrap">
              Live-tuki
            </button>
            <button onClick={() => setOpen(false)} className="text-ink-ghost hover:text-ink transition-colors ml-1">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
            <button
              onClick={openCrisp}
              className="w-full py-2 rounded-xl border border-copper/40 text-copper text-xs font-semibold hover:bg-copper/10 transition-colors flex items-center justify-center gap-1.5"
            >
              💬 Aloita live-chat tiimin kanssa
            </button>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-copper text-[#0A0C10] rounded-br-sm"
                    : "bg-surface text-ink-dim rounded-bl-sm border border-wire"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface border border-wire px-3 py-2 rounded-xl rounded-bl-sm flex items-center gap-1.5">
                  <Loader2 size={13} className="text-copper animate-spin" />
                  <span className="text-xs text-ink-ghost">Kirjoittaa...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-wire flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Kirjoita viesti..."
                className="flex-1 px-3 py-2 text-sm rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost focus:outline-none focus:border-copper/50 transition-colors"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-copper flex items-center justify-center hover:bg-copper-light transition-colors disabled:opacity-50"
              >
                <Send size={14} className="text-[#0A0C10]" />
              </button>
            </div>
        </div>
      )}

      {/* Toggle button — hidden while Crisp is open */}
      {!crispOpen && (
        <button
          onClick={() => setOpen(v => !v)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-copper hover:bg-copper-light shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
          aria-label="Avaa chat"
        >
          {open ? <X size={22} className="text-[#0A0C10]" /> : <MessageCircle size={22} className="text-[#0A0C10]" />}
        </button>
      )}
    </>
  );
}
