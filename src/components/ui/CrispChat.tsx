"use client";

import { useEffect } from "react";

export function CrispChat() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    const s = document.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    document.head.appendChild(s);
    // hide Crisp's own button — we open it via our AI chatbot handoff
    (window as any).$crisp.push(["on", "session:loaded", () => {
      (window as any).$crisp.push(["do", "chat:hide"]);
    }]);
  }, []);
  return null;
}
